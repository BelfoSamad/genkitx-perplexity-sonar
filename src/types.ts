export type SonarBasicMessage = {
    role: string;
    content: string;
}

export type SonarTextMessage = {
    type: 'text';
    text: string;
}

export type SonarImageMessage = {
    type: 'image_url';
    image_url: { url: string; }
}

export type SonarMessageType = {
    role: string;
    content: string | (SonarTextMessage | SonarImageMessage)[];
}

export type SonarRequestBody = {
    model: string;
    messages: SonarMessageType[];
    max_tokens?: number;
    temperature: number;
    top_p: number;
    top_k: number;
    return_images: boolean;
    return_related_questions: boolean;

    search_domain_filter?: string[];
    web_search_options: {
        search_context_size: string, //low, medium, high
        user_location?: {
            latitude?: number;
            longitude?: number;
            country?: string;
        }
    };
    search_before_date_filter?: string;
    search_after_date_filter?: string;
    search_recency_filter?: string; //day, month, year

    response_format: {
        type: 'json_schema' | 'text';
        json_schema?: { schema: string };
    };
    presence_penalty: number;
    frequency_penalty: number;
    stop_sequences?: string[];
    stream: boolean;
}

export type SonarChoice = {
    index: number;
    message: SonarBasicMessage;
    delta: SonarBasicMessage;
    finish_reason: string;
}

export type SonarResponseBody = {
    id: string;
    model: string;
    created_at: number;
    citations: string[];
    object: string;
    choices: SonarChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        citation_tokens: number;
        num_search_queries: number;
    };
}

export const FINISH_REASON_MAP = {
    stop: 'stop',
    length: 'length',
    tool_calls: 'stop',
    function_call: 'stop',
    content_filter: 'length',
};
