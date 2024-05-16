import { useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import "./style.css"
import { useStorage } from "@plasmohq/storage/hook"
import Toggle from "./components/toggle"

// process.env.ANTHROPIC_TOKEN

function IndexPopup() {

  const [hideYoutubeSidebar, setHideYoutubeSidebar] = useStorage("hideYoutubeSidebar", (v) => v === undefined ? false: v)

  const [wordsAndWeightsDict, setWordsAndWeightsDict] = useStorage("wordsAndWeightsDict", (v) => v === undefined ? {} : v)

  // const [input, setInput] = useState("I want to see videos about computer science, but I particularly don't want to see videos about python")
  const [sentimentInput, setSentimentInput] = useStorage("sentimentInput", (v) => v === undefined ? "" : v)

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

  return (
    <div className="p-8 w-[400px] h-[600px] font-sans">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">DestimulAI</h1>
        <p className="text-lg">Intelligently Block Stimulating Content</p>
      </div>
      <hr className="mb-2 opacity-20" />
      <div className="p-2 rounded-md mb-2 flex flex-col gap-1">
        <h2 className="text-md font-extrabold">Toggle to hide stimulating content:</h2>
        <p className="text-xs text-gray-500">These settings will be saved and applied on youtube</p>
      </div>
      <div className="mb-5 flex gap-3 flex-row bg-neutral-800 p-3 rounded-md">
        <div className="flex gap-3 flex-col">
          <Toggle title="Sidebar" checked={hideYoutubeSidebar} changeValue={setHideYoutubeSidebar} />
          <Toggle title="Thumbnails" checked={hideYoutubeThumbnail} changeValue={setHideYoutubeThumbnail} />
          <Toggle title="Views" checked={hideYoutubeViews} changeValue={setHideYoutubeViews} />
          <Toggle title="Subscriber Counts" checked={hideYoutubeSubscribers} changeValue={setHideYoutubeSubscribers} />
          <Toggle title="Shorts" checked={hideYoutubeShorts} changeValue={setHideYoutubeShorts} />
        </div>
        <div className="flex gap-3 flex-col">
          <Toggle title="Comments" checked={hideYoutubeComments} changeValue={setHideYoutubeComments} />


        </div>
      </div>
      <hr className="mb-2 opacity-20" />
      <div className="p-2 rounded-md mb-2 flex flex-col gap-1">
        <h2 className="text-md font-extrabold">Describe what content you want to see:</h2>
        <p className="text-xs text-gray-500">Weighted words will generated to be used for video topic matching</p>
      </div>
      <textarea
        className="w-full h-[100px] mb-2 rounded-md bg-neutral-800 px-4 py-2"
        placeholder="I want to see videos about U.S. history and want to avoid videos about video games."
        value={sentimentInput}
        onChange={(event) => setSentimentInput(event.target.value)}
      ></textarea>
      <button
        className="w-full px-4 py-2 mb-5 text-white bg-blue-500 rounded-md"
        onClick={() => makeAnthropicRequest(sentimentInput)}
      >
        Prompt AI
      </button>
      <hr className="mb-2 opacity-20" />
      <div className="p-2 rounded-md mb-2 flex flex-col gap-1">
        <h2 className="text-md font-extrabold">What do you hope to achieve on youtube?:</h2>
        <p className="text-xs text-gray-500">AI will analyze video transcripts to make sure these goals are being met, and will warn you otherwise</p>
      </div>
      <textarea
        className="w-full h-[100px] mb-2 rounded-md bg-neutral-800 px-4 py-2"
        placeholder="I want to study for my U.S. history exam and want to avoid distractions."
        value={sentimentInput}
        onChange={(event) => setSentimentInput(event.target.value)}
      ></textarea>
      <button
        className="w-full px-4 py-2 mb-4 text-white bg-blue-500 rounded-md"
        onClick={() => makeAnthropicRequest(sentimentInput)}
      >
        Prompt AI
      </button>

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
