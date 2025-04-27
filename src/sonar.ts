import {
    Message as GenkitMessage,
    GenerateRequest,
    GenerateResponseData,
    GenerationCommonConfigSchema,
    Genkit, MessageData,
    ModelReference,
    z, Part, Role,
} from 'genkit';
import {CandidateData, modelRef} from 'genkit/model';
import type {ModelAction} from 'genkit/model';
import {
    FINISH_REASON_MAP,
    SonarChoice,
    SonarImageMessage,
    SonarMessageType,
    SonarRequestBody,
    SonarResponseBody,
    SonarTextMessage
} from "./types";
import axios from "axios";

export const PerplexitySonarConfigSchema = GenerationCommonConfigSchema.extend({
    search_domain_filter: z.array(z.string()).optional(),
    search_before_date_filter: z.string().optional(),
    search_after_date_filter: z.string().optional(),
    search_recency_filter: z.enum(['day', 'month', 'year']).optional(),
    search_context_size: z.enum(['low', 'medium', 'high']).optional(),
});

export const PerplexitySonarResponseSchema = GenerationCommonConfigSchema.extend({
   citations: z.array(z.string()).optional()
});

export const sonar = modelRef({
    name: 'perplexity/sonar',
    info: {
        label: 'Perplexity - Sonar',
        supports: {
            multiturn: true,
            tools: false,
            media: true,
            systemRole: true,
            output: ['text', 'json']
        }
    },
    configSchema: PerplexitySonarConfigSchema
});

export const sonarPro = modelRef({
    name: 'perplexity/sonar-pro',
    info: {
        label: 'Perplexity - Sonar Pro',
        supports: {
            multiturn: true,
            tools: false,
            media: true,
            systemRole: true,
            output: ['text', 'json']
        }
    },
    configSchema: PerplexitySonarConfigSchema,
});

export const sonarReasoning = modelRef({
    name: 'perplexity/sonar-reasoning',
    info: {
        label: 'Perplexity - Sonar Reasoning',
        supports: {
            multiturn: true,
            tools: false,
            media: true,
            systemRole: true,
            output: ['text', 'json']
        }
    },
    configSchema: PerplexitySonarConfigSchema,
});

export const sonarReasoningPro = modelRef({
    name: 'perplexity/sonar-reasoning-pro',
    info: {
        label: 'Perplexity - Sonar Reasoning Pro',
        supports: {
            multiturn: true,
            tools: false,
            media: true,
            systemRole: true,
            output: ['text', 'json']
        }
    },
    configSchema: PerplexitySonarConfigSchema,
});

export const sonarDeepResearch = modelRef({
    name: 'perplexity/sonar-deep-research',
    info: {
        label: 'Perplexity - Sonar Deep Research',
        supports: {
            multiturn: true,
            tools: true,
            media: true,
            systemRole: true,
            output: ['text', 'json']
        }
    },
    configSchema: PerplexitySonarConfigSchema,
});

export const SUPPORTED_PERPLEXITY_SONAR_MODELS: Record<string, ModelReference<typeof PerplexitySonarConfigSchema>> = {
    'sonar': sonar,
    'sonar-pro': sonarPro,
    'sonar-reasoning': sonarReasoning,
    'sonar-reasoning-pro': sonarReasoningPro,
    'sonar-deep-research': sonarDeepResearch
};

/**
 * Converts a Genkit message role to a Sonar role.
 *
 * @param role - The Genkit message role.
 * @returns The converted Sonar role. Note - the Sonar API does not declare an explicit type for this.
 * @throws {Error} If the role doesn't map to a Sonar role.
 */
export function toSonarRole(role: Role): string {
    switch (role) {
        case 'user':
            return 'user';
        case 'model':
            return 'assistant';
        case 'system':
            return 'system'
        default:
            throw new Error(`role ${role} doesn't map to a Sonar role.`);
    }
}

/**
 * Transforms a Genkit part into a corresponding Sonar part.
 *
 * @param part - The Genkit part to be transformed.
 * @returns The equivalent Sonar part.
 */
export function toSonarTextAndMedia(part: Part): SonarTextMessage | SonarImageMessage {
    if (part.text) {
        return {
            type: 'text',
            text: part.text
        };
    }

    if (part.media) {
        return {
            type: 'image_url',
            image_url: {url: part.media.url}
        }
    }

    throw Error(`Unsupported genkit part fields encountered for current message role: ${JSON.stringify(part)}.`);
}

/**
 * Transforms a Genkit message into a corresponding Sonar message.
 *
 * @param messages - The Genkit messages to be transformed.
 * @returns The equivalent Sonar messages.
 */
export function toSonarMessages(messages: MessageData[]) {
    const sonarMessages: SonarMessageType[] = [];
    for (const message of messages) {
        const msg = new GenkitMessage(message);
        const role = toSonarRole(message.role);

        if (role === 'system') sonarMessages.push({role: 'system', content: msg.text || ''})
        else sonarMessages.push({role: role, content: msg.content.map(toSonarTextAndMedia)})
    }

    return sonarMessages;
}

/**
 * Transforms a Genkit request into a corresponding Sonar request.
 *
 * @param modelName - The name of the model to be transformed.
 * @param request - The Genkit request to be transformed.
 * @returns The equivalent Sonar request.
 */
export function toSonarRequestBody(modelName: string, request: GenerateRequest<typeof PerplexitySonarConfigSchema>): SonarRequestBody {
    const model = SUPPORTED_PERPLEXITY_SONAR_MODELS[modelName];
    if (!model) throw new Error(`Unsupported model: ${modelName}`);

    const response_type = request.output?.format || 'text';
    let response_format: any;
    if (response_type === 'json' && model.info?.supports?.output?.includes('json')) {
        response_format = {
            type: 'json_object',
            json_object: {schema: request.output?.schema?.toString() || '{}'}
        };
    } else if (response_type === 'text' && model.info?.supports?.output?.includes('text')) {
        response_format = {type: 'text'}
    } else throw new Error(`${response_type} format is not supported for ${modelName} currently`);

    const body: SonarRequestBody = {
        model: modelName,
        messages: toSonarMessages(request.messages),
        max_tokens: request.config?.maxOutputTokens,
        temperature: request.config?.temperature ?? 0.2,
        top_p: request.config?.topP ?? 0.9,
        top_k: request.config?.topK ?? 0,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: request.config?.search_domain_filter ?? [],
        web_search_options: {
            search_context_size: request.config?.search_context_size ?? 'low'
        },
        search_before_date_filter: request.config?.search_before_date_filter ?? '',
        search_after_date_filter: request.config?.search_after_date_filter ?? '',
        search_recency_filter: request.config?.search_recency_filter ?? '',
        response_format: response_format,
        stream: false // NOTE: CURRENTLY STREAMING IS NOT SUPPORTED
    }

    for (const key in body) {
        if (!body[key] || (Array.isArray(body[key]) && !body[key].length))
            delete body[key];
    }
    return body;
}

/**
 * Transforms a Sonar choice into a Genkit candidate.
 *
 * @param choice - The Sonar choice to be transformed.
 * @param jsonMode - Whether the response is in JSON mode.
 * @returns The equivalent Genkit candidate.
 */
function fromSonarChoice(choice: SonarChoice, jsonMode = false): CandidateData {
    return {
        index: choice.index,
        finishReason: FINISH_REASON_MAP[choice.finish_reason] || 'unknown',
        message: {
            role: 'model',
            content: [jsonMode
                ? {data: JSON.parse(choice.message.content || '{}')}
                : {text: choice.message.content || ''},
            ],
        },
        custom: {},
    };
}

/**
 * Defines a Sonar model.
 *
 * @param ai - Genkit Model.
 * @param name - The name of the model.
 * @param apiKey - The Sonar API Key.
 * @returns The model.
 */
export function sonarModel(
    ai: Genkit,
    name: string,
    apiKey: string
): ModelAction<typeof GenerationCommonConfigSchema> {
    const model = SUPPORTED_PERPLEXITY_SONAR_MODELS[name];
    if (!model) throw new Error(`Unsupported model: ${name}`);
    const modelId = `perplexity/${name}`;

    return ai.defineModel(
        {
            name: modelId,
            ...model.info,
            configSchema: model.configSchema,
        },
        async (request: GenerateRequest<typeof PerplexitySonarConfigSchema>): Promise<GenerateResponseData> => {
            const response = (await axios.post<SonarResponseBody>('https://api.perplexity.ai/chat/completions',
                toSonarRequestBody(name, request),
                {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`,}}
            )).data;
            return {
                candidates: response.choices.map(c => {
                    return fromSonarChoice(c, request.output?.format === 'json')
                }),
                usage: {totalTokens: response.usage.total_tokens},
                custom: response,
            };
        }
    );
}
