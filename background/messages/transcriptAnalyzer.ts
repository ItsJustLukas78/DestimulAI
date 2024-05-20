import type { PlasmoMessaging } from "@plasmohq/messaging"
import type {TranscriptResponse } from 'youtube-transcript';
import { YoutubeTranscript } from 'youtube-transcript';

import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from "@google/generative-ai"
import {Storage} from "~node_modules/@plasmohq/storage";

const googleGenerativeAI = new GoogleGenerativeAI(process.env['PLASMO_PUBLIC_GEMINI_API_KEY']);

const model = googleGenerativeAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});


const generationConfig = {
  temperature: 0.2,
  maxOutputTokens: 1000,
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

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

  const prompt = await storage.get("sentimentInput") as string
  const youtubeURL = await storage.get("currentURL") as string

  const urlsToAnalysis = await storage.get("urlsToAnalysis") as { [key: string]: { relevant: boolean, description: string } }

  if (urlsToAnalysis[youtubeURL]) {
    res.send({
      response: urlsToAnalysis[youtubeURL]
    })
    return
  }

  let finalText = ""

  try {
    const videoTranscriptResponse: TranscriptResponse[] = await YoutubeTranscript.fetchTranscript(youtubeURL)

    videoTranscriptResponse.map((transcript) => {
      finalText += transcript.text + " "
    })
  } catch (e) {
    res.send({
      response: {
        relevant: false,
        description: "No video transcript found"
      }
    })
  }

  if (finalText.length === 0) {
    res.send({
      response: {
        relevant: false,
        description: "No video transcript found"
      }
    })
  }

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });

  const formattedPrompt = XMLPromptTemplate.replace("{{USER_PREFERENCES}}", prompt).replace("{{VIDEO_TRANSCRIPT}}", finalText)

  console.log({formattedPrompt})

  const result = await chatSession.sendMessageStream(formattedPrompt);

  console.log("result: ", result)

  let rawOutput = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    rawOutput += chunkText;
  }

  // get result from rawOutput using result tag
  const resultStart = rawOutput.indexOf("<result>")
  const resultEnd = rawOutput.indexOf("</result>")
  const resultText = rawOutput.substring(resultStart + "<result>".length, resultEnd)

  console.log(resultStart, resultEnd)

  console.log(resultText)

  const resultJSON = JSON.parse(resultText)

  urlsToAnalysis[youtubeURL] = resultJSON

  await storage.set("urlsToAnalysis", urlsToAnalysis)

  res.send({
    response: resultJSON
  })

}

export default handler


const XMLPromptTemplate = `
Here is some information about a user's content preferences and goals when watching YouTube videos:

<user_preferences>
{{USER_PREFERENCES}}
</user_preferences>

And here is the transcript of a YouTube video the user is considering watching:

<video_transcript>
{{VIDEO_TRANSCRIPT}}
</video_transcript>

Please analyze the video transcript to determine if it aligns with the user's preferences and goals.

In <scratchpad></scratchpad> tags, go through this step-by-step reasoning process:
1. Identify the key topics, themes, and content warnings in the video based on the transcript.
2. Compare those to the user's preferences on what they do and don't want to see.
3. Assess how well the video content matches up with the user's stated goals.
4. Make a final determination on if this video is relevant and appropriate for the user.


Then, output a JSON object with two fields:
- "relevant": a boolean (true/false) indicating if the video is relevant and appropriate for this user
- "description": a few sentences summarizing your reasoning and analysis of the video's relevance

Format your output like this (including the outer <result> tags):

<result>
{
  "relevant": <true or false>,
  "description": "<your description here>"
}
</result>

Focus on giving an honest assessment and recommendation to the user, based on the information provided about their preferences and goals. Avoid recommending videos that contain content they don't want to see.

Your entire response should be in JSON format inside <result> tags. Do not add any other explanatory text or notes outside the JSON object.
`