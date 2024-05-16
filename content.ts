import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import {useStorage} from "~node_modules/@plasmohq/storage/dist/hook";


export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const storage = new Storage()

storage.watch({
  "hideYoutubeSidebar": (c) => {
    removeSidebar(c.newValue)
  },
  "hideYoutubeStats": (c) => {
    removeStats(c.newValue)
  },
  "wordsAndWeightsDict": (c) => {
    markVideos(c.newValue)
  },
  "hideYoutubeThumbnail": (c) => {
    removeYoutubeThumbnail(c.newValue)
  },
  "hideYoutubeViews": (c) => {
    removeYoutubeViews(c.newValue)
  },
  "hideYoutubeSubscribers": (c) => {
    removeYoutubeSubscribers(c.newValue)
  },
  "hideYoutubeShorts": (c) => {
    removeYoutubeShorts(c.newValue)
  },
  "hideYoutubeComments": (c) => {
    removeYoutubeComments(c.newValue)
  }
})

const removeYoutubeThumbnail = async (hideYoutubeThumbnail: boolean) => {
  const thumbnails = document.querySelectorAll("#thumbnail.ytd-thumbnail") as unknown as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < thumbnails.length; i++) {
    thumbnails[i].style.display = hideYoutubeThumbnail ? "none" : "block"
  }
}

const removeYoutubeViews = async (hideYoutubeViews: boolean) => {
  // only blocks that contain the string "views" will be hidden
  const views = [...document.querySelectorAll("span.inline-metadata-item.style-scope.ytd-video-meta-block"), ...document.querySelectorAll("span.bold.style-scope.yt-formatted-string")] as unknown as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < views.length; i++) {
    if (views[i].textContent?.includes("views")) {
      views[i].style.display = hideYoutubeViews ? "none" : "inline"
    }
  }
}

const removeYoutubeSubscribers = async (hideYoutubeSubscribers: boolean) => {
  const subscribers = document.querySelector("#owner-sub-count") as unknown as HTMLElement
  if (subscribers) {
    subscribers.style.display = hideYoutubeSubscribers ? "none" : "-webkit-box"
  }
}

const removeYoutubeShorts = async (hideYoutubeShorts: boolean) => {
  const shorts = [document.querySelector("ytd-reel-shelf-renderer"), ...document.querySelectorAll("#dismissible.style-scope.ytd-rich-shelf-renderer")] as unknown as HTMLCollectionOf<HTMLElement>

  for (let i = 0; i < shorts.length; i++) {
    if (!shorts[i]) {
      continue
    }

    shorts[i].style.display = hideYoutubeShorts ? "none" : "block"
  }
}

const removeSidebar = (hideSidebar: boolean) => {
  const element = document.getElementById("secondary")

  if (element) {
    element.style.opacity = hideSidebar ? "0" : "100"
  }
}

const removeStats = (hideStats: boolean) => {
  const info = document.getElementById( "info")
  const firstElement = info?.firstElementChild as HTMLElement

  if (firstElement) {
    firstElement.style.opacity = hideStats ? "0" : "100"
  }
}

const removeYoutubeComments = async (hideYoutubeComments: boolean) => {
  const comments = document.querySelector("ytd-comments#comments") as unknown as HTMLElement
  if (comments) {
    comments.style.display = hideYoutubeComments ? "none" : "block"
  }
}

const markVideos = (wordsAndWeightsDict: any) => {
  const videoIndexToWeightsDict: { [key: number]: number } = {}

  const videos = [
    ...document.querySelectorAll("#content.style-scope.ytd-rich-item-renderer"),
    ...document.querySelectorAll(".style-scope.ytd-compact-video-renderer"),
    ...document.querySelectorAll("#dismissible.style-scope.ytd-video-renderer"),
    ...document.querySelectorAll(".style-scope.yt-horizontal-list-renderer"),
    ...document.querySelectorAll(".style-scope.ytd-item-section-renderer"),
  ] as unknown as HTMLCollectionOf<HTMLElement>

  const parentElement = document.querySelector("ytd-reel-shelf-renderer");

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]

    // get video title by matching elements that have id "video-title"
    const videoTitle = video.querySelector("#video-title") as HTMLElement
    const thumbnail = video.querySelector("#thumbnail") as HTMLElement

    if (videoTitle) {
      const title = videoTitle.textContent
      // const titleList = title.split(" ").map(word => word.toLowerCase())

      // using the wordsAndWeightsDict, determine the sentiment of the title
      let sentiment: number = 0.0
      sentiment = Object.entries(wordsAndWeightsDict).reduce((acc: number, [word, weight] : [string, number | string]) => {
        if (title.toLowerCase().includes(word.toLowerCase())) {
          if (typeof weight === "string") {
            weight = parseFloat(weight)
          }
          return acc + weight
        }
        return acc
      }, 0.0)

      sentiment = Math.round(sentiment * 10000) / 10000

      // Change the color of the video title based on the sentiment
      // -1 is the most green, 0 is white, 1 is most red
      // const color = sentiment > 0 ? "green" : sentiment < 0 ? "red" : "nothing"
      //
      // if (color !== "nothing") {
      //   videoTitle.style.color = color
      // }
      //
      // //if sentiment greater than or equal to 0, grey out the video element
      // if (sentiment < 0) {
      //   if (thumbnail) {
      //     thumbnail.style.filter = "brightness(0.1)"
      //   }
      //   videoTitle.style.color = "red"
      // } else if (sentiment == 0) {
      //   if (thumbnail) {
      //     thumbnail.style.filter = "brightness(0.3)"
      //     // thumbnail.style.visibility = "hidden"
      //   }
      //   videoTitle.style.color = "grey"
      // }

      if (sentiment <= -1.0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(0.1)"
        }
        videoTitle.style.color = "#cb2211"
      } else if (sentiment < 0.0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(0.2)"
        }
        videoTitle.style.color = "#ea6229"
      } else if (sentiment == 0.0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(0.2)"
        }
        videoTitle.style.color = "grey"
      } else if (sentiment >= 1.0) {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(1.0)"
        }
        videoTitle.style.color = "#00bf00"
      } else {
        if (thumbnail) {
          thumbnail.style.filter = "brightness(1.0)"
        }
        videoTitle.style.color = "#418222"
      }


      // if the video is not a reel ( within ytd-reel-shelf-renderer ) then add the sentiment to the videoIndexToWeightsDict
      if (parentElement && !parentElement.contains(video)) {
        videoIndexToWeightsDict[i] = sentiment
      }
    }
  }

  // // sort videos by their weights then arrange them in order inside of the element with id"contents", placing the  ytd-reel-shelf-renderer at the top
  // const contents = document.querySelector("#contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer")
  // if (contents) {
  //   const sortedIndices = Object.entries(videoIndexToWeightsDict).sort((a, b) => b[1] - a[1]).map(([index, _]) => parseInt(index))
  //   const sortedVideos = Array.from(videos).sort((a, b) => sortedIndices.indexOf(Array.from(videos).indexOf(a)) - sortedIndices.indexOf(Array.from(videos).indexOf(b)))
  //   const reelParent = document.querySelector("ytd-reel-shelf-renderer")
  //
  //   console.log({ contents })
  //
  //   if (reelParent) {
  //     contents.insertBefore(reelParent, contents.firstChild);
  //   }
  //
  //   // Reorder the video elements
  //   sortedVideos.forEach((video, index) => {
  //     if (index === 0) {
  //       // For the first video, move it to the beginning after the reel parent
  //       contents.insertBefore(video, contents.firstChild ? contents.firstChild.nextSibling : null);
  //     } else {
  //       // For subsequent videos, insert them after the previous video
  //       contents.insertBefore(video, sortedVideos[index - 1].nextSibling);
  //     }
  //   });
  // }
}

const applySettings = async () => {
  const hideYoutubeSidebar = await storage.get("hideYoutubeSidebar") as boolean
  removeSidebar(hideYoutubeSidebar)

  const hideYoutubeStats = await storage.get("hideYoutubeStats") as boolean
  removeStats(hideYoutubeStats)

  const wordsAndWeightsDict = await storage.get("wordsAndWeightsDict") as any
  markVideos(wordsAndWeightsDict)

  const hideYoutubeThumbnail = await storage.get("hideYoutubeThumbnail") as boolean
  removeYoutubeThumbnail(hideYoutubeThumbnail)

  const hideYoutubeViews = await storage.get("hideYoutubeViews") as boolean
  removeYoutubeViews(hideYoutubeViews)

  const hideYoutubeSubscribers = await storage.get("hideYoutubeSubscribers") as boolean
  removeYoutubeSubscribers(hideYoutubeSubscribers)

  const hideYoutubeShorts = await storage.get("hideYoutubeShorts") as boolean
  removeYoutubeShorts(hideYoutubeShorts)

  const hideYoutubeComments = await storage.get("hideYoutubeComments") as boolean
  removeYoutubeComments(hideYoutubeComments)
}

const asyncFunction = async () => {
  await applySettings()

  let timeoutId;
  const debounce = (func, delay) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func();
    }, delay);
  };

  const observer = new MutationObserver(mutationList => {
    debounce(() => {
      mutationList.filter(m => m.type === 'childList').forEach(m => {
        m.addedNodes.forEach(async () => {
          await applySettings()
        })
      })
    }, 100)
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  })
}

asyncFunction()

