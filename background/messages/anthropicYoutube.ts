import type { PlasmoMessaging } from "@plasmohq/messaging"
import Anthropic from '@anthropic-ai/sdk';
import { YoutubeTranscript } from 'youtube-transcript';

const anthropic = new Anthropic({
  apiKey: process.env['PLASMO_PUBLIC_ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

  const { input } = req.body

  let finalText = ""

  const videoTranscriptResponse = (await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=mMv6OSuitWw')).map((transcript) => {
    finalText += transcript.text + " "
  })

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 2048,
    temperature: 0.2,
    system:
          "You are an AI assistant that helps users summarize or ask about content of youtube videos from their transcripts",
    messages: [
      {
        role: "user",
        content: "Here is the Video Transcript: /n" + finalText + "/n" + "The user has made the following request: /n" + input
      }
    ]
  },)


  res.send({
    response: response,
  })

}
export default handler


