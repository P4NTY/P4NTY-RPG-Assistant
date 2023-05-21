require('dotenv').config();
// const axios = require('axios');
// const https = require('https');
const { Configuration, OpenAIApi } = require("openai");

const model = 'text-davinci-003';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function modOpenAi (phrase) {
    return await openai.createModeration({
        input: phrase,
    });
}

async function aiQuest (persona, prompt, tokens = 100, temp = 0.7 ) {
    return await openai.createCompletion({
        model: model,
        prompt: `${persona} \n###\n ${prompt} \n###\n`,
        max_tokens: tokens,
        temperature: temp,
    });
}

module.exports =  { aiQuest };