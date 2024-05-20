import { useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import "./style.css"
import { useStorage } from "@plasmohq/storage/hook"
import Toggle from "./components/toggle"

// process.env.ANTHROPIC_TOKEN

function IndexPopup() {

  const [hideYoutubeSidebar, setHideYoutubeSidebar] = useStorage("hideYoutubeSidebar", (v) => v === undefined ? false: v)

  const [wordsAndWeightsDict, setWordsAndWeightsDict] = useStorage("wordsAndWeightsDict", (v) => v === undefined ? {} : v)

  const [summaryOutput, setSummaryOutput] = useStorage("summaryOutput", (v) => v === undefined ? "" : v)

  const [sentimentInput, setSentimentInput] = useStorage("sentimentInput", (v) => v === undefined ? "" : v)

  const [currentURL, setCurrentURL] = useStorage("currentURL", (v) => v === undefined ? "" : v)

  const [hideYoutubeThumbnail, setHideYoutubeThumbnail] = useStorage("hideYoutubeThumbnail", (v) => v === undefined ? false: v)
  const [hideYoutubeViews, setHideYoutubeViews] = useStorage("hideYoutubeViews", (v) => v === undefined ? false: v)
  const [hideYoutubeSubscribers, setHideYoutubeSubscribers] = useStorage("hideYoutubeSubscribers", (v) => v === undefined ? false: v)
  const [hideYoutubeShorts, setHideYoutubeShorts] = useStorage("hideYoutubeShorts", (v) => v === undefined ? false: v)
  const [hideYoutubeComments, setHideYoutubeComments] = useStorage("hideYoutubeComments", (v) => v === undefined ? false: v)


  const makeAnthropicRequest = async (input: string) => {
    const resp = await sendToBackground({
      name: "sentimentGenerator",
      body: {
        input: input
      }
    })

    console.log(resp)
  }

  const analyzeTranscript = async () => {

    const resp = await sendToBackground({
      name: "transcriptAnalyzer",
    })

    console.log(resp)

    setSummaryOutput(resp.response)
  }

  return (
    <div className="p-8 w-[400px] h-[600px] font-sans">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">DestimulAI</h1>
        <p className="text-lg">Intelligently Block Stimulating Content</p>
      </div>
      <hr className="mb-1 opacity-20" />
      <div className="p-2 rounded-md mb-2 flex flex-col gap-1">
        <h2 className="text-md font-extrabold">Toggle to hide stimulating content:</h2>
        <p className="text-xs text-gray-500">These settings will be saved and applied on youtube</p>
      </div>
      <div className="mb-5 flex gap-3 flex-row bg-neutral-800 p-3 rounded-md">
        <div className="flex gap-3 flex-col">
          <Toggle title="Sidebar" checked={hideYoutubeSidebar} changeValue={setHideYoutubeSidebar} />
          <Toggle title="Thumbnails" checked={hideYoutubeThumbnail} changeValue={setHideYoutubeThumbnail} />
          <Toggle title="Views" checked={hideYoutubeViews} changeValue={setHideYoutubeViews} />
        </div>
        <div className="flex gap-3 flex-col">
          <Toggle title="Comments" checked={hideYoutubeComments} changeValue={setHideYoutubeComments} />
          <Toggle title="Subscriber Counts" checked={hideYoutubeSubscribers} changeValue={setHideYoutubeSubscribers} />
          <Toggle title="Shorts" checked={hideYoutubeShorts} changeValue={setHideYoutubeShorts} />
        </div>
      </div>
      <hr className="mb-1 opacity-20" />
      <div className="p-2 rounded-md mb-2 flex flex-col gap-1">
        <h2 className="text-md font-extrabold">Describe what content you want to see and hope to achieve on youtube:</h2>
        <p className="text-xs text-gray-500">Video transcripts and titles will be analyzed to prioritize relevant content and make sure your goals are met</p>
      </div>
      <textarea
        className="w-full h-[100px] mb-2 rounded-md bg-neutral-800 px-4 py-2"
        placeholder="I want to see videos about U.S. history and want to avoid videos about video games. I am studying for my test in the civil war."
        value={sentimentInput}
        onChange={(event) => setSentimentInput(event.target.value)}
      ></textarea>
      <button
        className="w-full px-4 py-2 mb-5 text-white bg-blue-500 rounded-md"
        onClick={() => makeAnthropicRequest(sentimentInput)}
      >
        Prompt AI
      </button>
      <hr className="mb-3 opacity-20" />
      {/*<h2 className="text-xs">Current URL:{currentURL}</h2>*/}
      <div className="mb-2 flex gap-3 flex-rol p-2 rounded-md">
        <h1 className="text-lg font-bold">This video is:</h1>
        {summaryOutput ? summaryOutput.relevant ? <p className="text-lg text-green-500">Relevant</p> : <p className="text-lg text-red-500">Not Relevant</p> : <p className="text-lg text-gray-500">Not Analyzed</p>}
      </div>
      <p className="mb-3 text-xs p-2 text-gray-300">{summaryOutput ? summaryOutput.description : "The video has not been analyzed yet"}</p>
      <button className="w-full px-4 py-2 mb-5 text-white bg-blue-500 rounded-md" onClick={analyzeTranscript}>Analyze Video Transcript</button>
      <hr className="mb-3 opacity-20" />
      <h2 className="text-lg font-bold">Summary Output</h2>
      <div className="overflow-y-scroll h-[200px]">
        <pre>{JSON.stringify(summaryOutput, null, 2)}</pre>
      </div>
      {/* display the words and weights dictionary in a scrollable div */}
      <h2 className="text-lg font-bold">Dictionary</h2>
      <div className="h-[200px] overflow-y-scroll">
        <pre>{JSON.stringify(wordsAndWeightsDict, null, 2)}</pre>
      </div>

      {/*<p className="text-xs text-gray-500">Powered by <a href="https://plasmo.com" className="underline">Plasmo</a></p>*/}

    </div>
  )
}

export default IndexPopup
