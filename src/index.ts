import {genkitPlugin} from "genkit/plugin";
import {Genkit} from "genkit";
import {
    sonarModel,
    sonar,
    sonarPro,
    sonarReasoning,
    sonarReasoningPro,
    sonarDeepResearch,
    SUPPORTED_PERPLEXITY_SONAR_MODELS
} from "./sonar";
import {SonarResponseBody} from "./types";

// Export models for direct access
export {
    SonarResponseBody,
    sonar,
    sonarPro,
    sonarReasoning,
    sonarReasoningPro,
    sonarDeepResearch
};

export interface PluginOptions {
    apiKey?: string;
    // TODO: add additional options supported by the Perplexity Sonar API
}

export const perplexitySonar = (options: PluginOptions) => genkitPlugin('sonar', async (ai: Genkit) => {
    let apiKey = options?.apiKey || process.env.PERPLEXITY_SONAR_API_KEY;
    if (!apiKey) throw new Error('Please pass in the API key or set the PERPLEXITY_SONAR_API_KEY environment variable');

    for (const name of Object.keys(SUPPORTED_PERPLEXITY_SONAR_MODELS)) {
        sonarModel(ai, name, apiKey);
    }
});

export default perplexitySonar;
