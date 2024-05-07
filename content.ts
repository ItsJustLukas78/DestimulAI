import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const storage = new Storage()

console.log("AH1")

storage.watch({
  "hideYoutubeSidebar": (c) => {
    removeSidebar(c.newValue)
  },
  "hideYoutubeStats": (c) => {
    removeStats(c.newValue)
  }
})

console.log("AH2")

const removeSidebar = (hideSidebar: boolean) => {
  const elements = document.getElementsByClassName("ytd-watch-next-secondary-results-renderer") as HTMLCollectionOf<HTMLElement>

  if (!elements || elements.length === 0) {
    console.log("Element not found")
  } else {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.opacity = hideSidebar ? "0" : "100"
    }
  }
}

const removeStats = (hideStats: boolean) => {
  const info = document.getElementById( "info")
  const firstElement = info?.firstElementChild as HTMLElement

  if (!firstElement) {
    console.log("Element not found")
    return
  } else {
    firstElement.style.opacity = hideStats ? "0" : "100"
  }
}

const markVideos = (wordsAndWeightsDict: any) => {
  const videos = [...document.querySelectorAll("#content.style-scope.ytd-rich-item-renderer"), ...document.querySelectorAll(".style-scope.ytd-compact-video-renderer")] as HTMLCollectionOf<HTMLElement>

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]

    // get video title by matching elements that have id "video-title"
    const videoTitle = video.querySelector("#video-title") as HTMLElement
    const thumbnail = video.querySelector("#thumbnail") as HTMLElement

    if (videoTitle) {
      const title = videoTitle.textContent
      // const titleList = title.split(" ").map(word => word.toLowerCase())

      // using the wordsAndWeightsDict, determine the sentiment of the title
      const sentiment = Object.entries(wordsAndWeightsDict).reduce((acc, [word, weight] : [string, number]) => {
        if (title.toLowerCase().includes(word.toLowerCase())) {
          return acc + weight
        }
        return acc
      }, 0)

      // Change the color of the video title based on the sentiment
      // -1 is the most green, 0 is white, 1 is most red
      const color = sentiment > 0 ? "green" : sentiment < 0 ? "red" : "nothing"

      if (color !== "nothing") {
        videoTitle.style.color = color
      }

      //if sentiment greater than or equal to 0, grey out the video element
      if (sentiment < 0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(0.3)"
        }
        videoTitle.style.color = "red"
      } else if (sentiment == 0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(0.6)"
        }
        videoTitle.style.color = "grey"
      }


      console.log(title, sentiment)

    }
  }
}

const asyncFunction = async () => {
  const hideYoutubeSidebar = await storage.get("hideYoutubeSidebar") as boolean
  removeSidebar(hideYoutubeSidebar)

  const hideYoutubeStats = await storage.get("hideYoutubeStats") as boolean
  removeStats(hideYoutubeStats)

  const wordsAndWeightsDict = await storage.get("wordsAndWeightsDict") as any
  markVideos(wordsAndWeightsDict)

  const observer = new MutationObserver(mutationList =>
  mutationList.filter(m => m.type === 'childList').forEach(m => {
    m.addedNodes.forEach(async () => {
      const hideYoutubeSidebar = await storage.get("hideYoutubeSidebar") as boolean
      removeSidebar(hideYoutubeSidebar)

      const hideYoutubeStats = await storage.get("hideYoutubeStats") as boolean
      removeStats(hideYoutubeStats)

      const wordsAndWeightsDict = await storage.get("wordsAndWeightsDict") as any
      markVideos(wordsAndWeightsDict)
    })
  }));

  observer.observe(document, {childList: true, subtree: true})
}

asyncFunction()

