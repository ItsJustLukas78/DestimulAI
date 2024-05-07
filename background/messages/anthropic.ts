import type { PlasmoMessaging } from "@plasmohq/messaging"
import Anthropic from '@anthropic-ai/sdk';

const prompt = `
You are an AI assistant that generates lists of words and weights to help sort and filter content. The weights will be used to promote content that users want to see and hide content they don't want to see.

Here is the user's request for what kind of content they want the word weights optimized for:

<user_request>
{{USER_REQUEST}}
</user_request>

Based on the user's specifications above, generate a JavaScript dictionary of word-weight pairs in the following format:
{"word1": weight1, "word2": weight2, ...}

- The words should be strings and the weights should be decimal numbers between -1.0 and 1.0
- Use positive weights (between 0.0 and 1.0) for words that desired content is likely to contain
- Use negative weights (between -1.0 and 0.0) for words that undesired content is likely to contain
- If the user only described desired content, then just use positive weights
- If the user only described undesired content, then just use negative weights
- Prioritize including words that directly match or are very similar to words the user mentioned
- Generate an extensive list with at least 200 relevant words if possible so the weights can be used to analyze a wide variety of content with short titles/descriptions like YouTube videos

Your output should contain ONLY the JavaScript dictionary, with no other text before or after it. The dictionary must start with an open curly brace { and end with a close curly brace }.
`

const anthropic = new Anthropic({
  apiKey: process.env['PLASMO_PUBLIC_ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { input } = req.body

  // Use the prompt contained in prompt.txt then replace {{USER_REQUEST}} with input
  const hydratedPrompt = prompt.replace("{{USER_REQUEST}}", input)

  console.log(hydratedPrompt)

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 2048,
    temperature: 0.2,
    system:
          "You are an AI assistant that produces a list of words and weights in order to determine " +
          "how content should be sorted, so that desired content will be promoted while irrelevant content is hidden. " +
          "You will only output a dictionary in JSON format in the form of {\"word\": \"weight\"} where the word is a string while the weight is a decimal " +
          "1.0 representing words desired content will likely contain, and -1.0 representing words that content the user does not want to see likely contains." +
          "If the user only specifies what content they DO want to see, just generate matching words with positive weights. " +
          "If the user only specifies what content they DO NOT want to see, just generate matching words with negative weights. " +
          "Prioritize only matching content the user mentioned. Provide a long list of words, ideally 200 words or more, so that " +
          "analysis can be done on a large span of varying content, such as youtube videos that have short titles" +
          "You will NEVER engage in conversation. You MUST only output a valid dictionary, not any other text. " +
          "Your output will ALWAYS start with { and end with } without any quotations on the ends so that it can be parsed properly. The following messages are the user's request:",
    messages: [
      {
        role: "user",
        content: input
      }
    ]
  },)

  res.send({
    response: response,
    hydratedPrompt: hydratedPrompt
  })
}

export default handler