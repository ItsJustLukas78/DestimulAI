import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// import Anthropic from '@anthropic-ai/sdk';
//
// const anthropic = new Anthropic({
//   apiKey: process.env['PLASMO_PUBLIC_ANTHROPIC_API_KEY'],
// });

// import OpenAI from "openai";

// const openai = new OpenAI({
//     apiKey: process.env['PLASMO_PUBLIC_OPENAI_API_KEY'],
// });

import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from "@google/generative-ai"

const googleGenerativeAI = new GoogleGenerativeAI(process.env['PLASMO_PUBLIC_GEMINI_API_KEY']);

const model = googleGenerativeAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "You are an AI assistant that helps users sort content by determining the sentiment of the content. " +
    "You will only output a valid JSON Javascript dictionary in the form of {\"word\": \"weight\"} where " +
    "the word is a string while the weight is a decimal between -1.0 and 1.0. 1.0 representing words desired" +
    " content will likely contain, and -1.0 representing words that content the user does not want to see likely " +
    "contains. If the user specifies what content they DO want to see, generate matching words with positive " +
    "weights. If the user specifies what content they DO NOT want to see, generate matching words with " +
    "negative weights. Weights closer to 0.0 should be used for less impactful or relevant words." +
    " Prioritize only matching content the user mentioned. For example, if the user " +
    "wants to see content related to \"dogs,\" generate words like \"dog,\" \"puppy,\" \"canine\" with positive weights. " +
    "If the user does not want to see content related to \"politics,\" generate words like \"politics,\" " +
    "\"election,\" \"government\" with negative weights. Provide a comprehensive list of words that is at least " +
    "200 words long, so that analysis can be done on a large span of varying content, such as youtube videos that " +
    "have short titles. Try to generate short words that are likely to be perfectly matched programmatically " +
    "when comparing content strings. Do not generate duplicate words. You will NEVER engage in conversation. You MUST only output a valid dictionary, " +
    "not any other text. Your output will ALWAYS start with { and end with } without any quotations on the ends " +
    "so that it can be parsed properly."
});


const generationConfig = {
  temperature: 0.2,
  maxOutputTokens: 3000,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { input } = req.body

  // const response = await anthropic.messages.create({
  //   model: "claude-3-opus-20240229",
  //   max_tokens: 2000,
  //   temperature: 0.2,
  //   system:
  //         "You are an AI assistant that produces a list of words and weights in order to determine " +
  //         "how content should be sorted, so that desired content will be promoted while irrelevant content is hidden. " +
  //         "You will only output a valid JSON Javascript dictionary in the form of {\"word\": \"weight\"} where the word is a string while the weight is a decimal " +
  //         "1.0 representing words desired content will likely contain, and -1.0 representing words that content the user does not want to see likely contains." +
  //         "If the user only specifies what content they DO want to see, just generate matching words with positive weights. " +
  //         "If the user only specifies what content they DO NOT want to see, just generate matching words with negative weights. " +
  //         "Prioritize only matching content the user mentioned. Provide a long list of words, ideally 200 words or more, so that " +
  //         "analysis can be done on a large span of varying content, such as youtube videos that have short titles" +
  //         "You will NEVER engage in conversation. You MUST only output a valid dictionary, not any other text. " +
  //         "Your output will ALWAYS start with { and end with } without any quotations on the ends so that it can be parsed properly. " +
  //         "The following messages are the user's request:",
  //   messages: [
  //     {
  //       role: "user",
  //       content: input
  //     }
  //   ]
  // },)
  //
  // const chatCompletion = await openai.chat.completions.create({
  //   messages: [
  //     { role: "system", content: "You are an AI assistant that helps users sort content by determining the " +
  //         "sentiment of the content. You will only output a valid JSON Javascript dictionary in the form of " +
  //         "{\"word\": \"weight\"} where the word is a string while the weight is a decimal " +
  //         "1.0 representing words desired content will likely contain, and -1.0 representing " +
  //         "words that content the user does not want to see likely contains." + "If the user specifies " +
  //         "what content they DO want to see, generate matching words with positive weights. " + "If the user " +
  //         "specifies what content they DO NOT want to see, generate matching words with negative weights. " +
  //         "Prioritize only matching content the user mentioned. Provide a long list of words that are, ideally 200 words or more, " +
  //         "so that analysis can be done on a large span of varying content, such as youtube videos that have short titles" +
  //         "Try to generate short words that are likely to be perfectly matched programmatically when comparing content strings. " +
  //         "You will NEVER engage in conversation. You MUST only output a valid dictionary, not any other text. " +
  //         "Your output will ALWAYS start with { and end with } without any quotations on the ends so that it can be parsed properly. "
  //     },
  //     { role: "user", content: "The user has made the following request: " + input }
  //   ],
  //   model: "gpt-4o",
  //   max_tokens: 2000,
  //   temperature: 0.2,
  // });


  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });

  // const result = await chatSession.sendMessage("The user has made the following request: " + input);
  // console.log(result.response.text());

  const result = await chatSession.sendMessageStream("The user has made the following request: " + input);

  let text = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    text += chunkText;
  }

  if (text[text.length - 1] !== "}") {
    const lastCommaIndex = text.lastIndexOf(",");
    text = text.slice(0, lastCommaIndex) + "}";
  }

  const wordsAndWeightsDict = JSON.parse(text);

  // modify storage to store the words and weights dictionary
  await storage.set("wordsAndWeightsDict", wordsAndWeightsDict);

  res.send({
    success: true,
  })
}

export default handler


