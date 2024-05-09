import { useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import "./style.css"
import { useStorage } from "@plasmohq/storage/hook"
import Toggle from "./components/toggle"

// process.env.ANTHROPIC_TOKEN

function IndexPopup() {

  const [hideYoutubeSidebar, setHideYoutubeSidebar] = useStorage("hideYoutubeSidebar", (v) => v === undefined ? false: v)
  const [hideYoutubeStats, setHideYoutubeStats] = useStorage("hideYoutubeStats", (v) => v === undefined ? false : v)

  const [wordsAndWeightsDict, setWordsAndWeightsDict] = useStorage("wordsAndWeightsDict", (v) => v === undefined ? {} : v)

  const [input, setInput] = useState("I want to see videos about computer science, but I particularly don't want to see videos about python")

  const makeAnthropicRequest = async (input: string) => {
    console.log("Making request")
    const resp = await sendToBackground({
      name: "anthropic",
      body: {
        input: input
      }
    })

    console.log({resp})

    if (resp.response.content.length !== 0) {
      const firstResponse = resp.response.content[0]
      console.log(firstResponse)
      setWordsAndWeightsDict(JSON.parse(firstResponse.text))
    }
  }

  return (
    <div className="p-8 w-[400px] h-[600px] font-sans">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">DestimulAI</h1>
        <p className="text-lg">Intelligently Block Stimulating Content</p>
      </div>
      <div className="mb-4 flex gap-3 flex-col">
        {/* Toggle switch hiding youtube sidebar */}
        <Toggle title="Hide Video Statistics" checked={hideYoutubeStats} changeValue={setHideYoutubeStats} />
        {/* Toggle switch hiding youtube video statistics and comments */}
        {/*<label className="inline-flex items-center cursor-pointer">*/}
        {/*  <input type="checkbox" checked={hideYoutubeStats} onChange={(event => setHideYoutubeStats(event.target.checked))} className="sr-only peer"></input>*/}
        {/*    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">*/}
        {/*    </div>*/}
        {/*  <span className="ms-3 text-sm font-medium">Hide Video Statistics</span>*/}
        {/*</label>*/}
      </div>

      <textarea
        className="w-full h-[100px] mb-4 rounded-md bg-neutral-800 p-2"
        placeholder="Enter your input here..."
        value={input}
        onChange={(event) => setInput(event.target.value)}
      ></textarea>

      <button
        className="px-4 py-2 mb-4 text-white bg-blue-500 rounded-md"
        onClick={() => makeAnthropicRequest(input)}
      >
        Submit
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
