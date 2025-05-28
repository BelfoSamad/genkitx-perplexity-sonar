![Firebase Genkit + Anthropic AI](https://github.com/BelfoSamad/genkitx-perplexity-sonar/blob/master/assets/genkitx-perplexity-sonar.png?raw=true)

<h1 align="center">Firebase Genkit <> Sonar AI Plugin</h1>

<h4 align="center">Perplexity's Sonar API Community Plugin for Google Firebase Genkit</h4>

<div align="center">
   <img alt="Github lerna version" src="https://img.shields.io/github/lerna-json/v/BelfoSamad/genkitx-perplexity-sonar?label=version">
   <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/genkitx-perplexity-sonar">
   <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/BelfoSamad?style=social">
   <img alt="GitHub License" src="https://img.shields.io/github/license/BelfoSamad/genkitx-perplexity-sonar">
   <img alt="Static Badge" src="https://img.shields.io/badge/yes-a?label=maintained">
</div>

<div align="center">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/BelfoSamad/genkitx-perplexity-sonar?color=blue">
   <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues-pr/BelfoSamad/genkitx-perplexity-sonar?color=blue">
   <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/BelfoSamad/genkitx-perplexity-sonar">
</div>

`genkitx-perplexity-sonar` is a community plugin for using Perplexity's Sonar API and all its supported models with [Firebase Genkit](https://github.com/firebase/genkit).

This Genkit plugin allows to use Perplexity's Sonar API models through their official APIs.

## Supported models

The plugin supports the most recent Sonar models:
**sonar**, **sonar-pro**, **sonar-reasoning**, **sonar-reasoning-pro**, and **sonar-deep-research**.

## Installation

Install the plugin in your project with your favorite package manager:

- `npm install `
- `yarn add `

## Usage

### Initialize

```typescript
import { genkit } from 'genkit';
import { perplexitySonar, sonar } from '';

const ai = genkit({
  plugins: [perplexitySonar({ apiKey: process.env.PERPLEXITY_SONAR_API_KEY })],
});
```

### Basic examples

The simplest way to generate text is by using the `generate` method:

```typescript
const response = await ai.generate({
  model: sonar, // model imported from 
  prompt: 'Tell me a joke.',
});

console.log(response.text);
```

### Configurations

You can check the official documentations [Here](https://docs.perplexity.ai/home) for more details about the API.

```typescript
const response = await ai.generate({
    model: sonar, // model imported from 
    prompt: 'Tell me a joke.',
    config: {
        // check https://docs.perplexity.ai/guides/search-domain-filters for more details
        allowed_search_domain_filter: ["https://www.domain1.com", "domain2.com"], // allowed domain names, https:// and www are removed automatically
        denied_search_domain_filter: ["domain3.con", "domain4.com"], // denied list, it will automatically add - before the domain name
        // check https://docs.perplexity.ai/guides/date-range-filter-guide for more details
        search_before_date_filter: new Date(),
        search_after_date_filter: new Date(),
        search_recency_filter: "month",
        // check https://docs.perplexity.ai/guides/search-context-size-guide for more details
        search_context_size: "low",
        // check https://docs.perplexity.ai/guides/user-location-filter-guide for more etails
        user_location: {
            country: "DZ",
            latitude: 12.2,
            longitude: 12.2,
        },
        // other configurarions
        results_with_images: false,
        results_with_related_questions: false,
    }
});
```


## Contributing

Want to contribute to the project? That's awesome! Head over to our [Contribution Guidelines](CONTRIBUTING.md).

## Need support?

> \[!NOTE\]\
> This repository depends on Google's Firebase Genkit. For issues and questions related to Genkit, please refer to instructions available in [Genkit's repository](https://github.com/firebase/genkit).

Reach out by opening a discussion on [Github Discussions](https://github.com/BelfoSamad/genkitx-openai/discussions).

## License

This project is licensed under the [Apache 2.0 License](https://github.com/BelfoSamad/genkitx-perplexity-sonar/blob/main/LICENSE).
