import "@plasmohq/messaging/background"
import { Storage } from "@plasmohq/storage"


import { startHub } from "@plasmohq/messaging/pub-sub"

console.log(`BGSW - Starting Hub`)
startHub()

const storage = new Storage()

const handler = async () => {
  let queryOptions = {active: true, lastFocusedWindow: true};
  let [tab] = await chrome.tabs.query(queryOptions);
  let url = tab.url;

  await storage.set("currentURL", url)
  const urlsToAnalysis = await storage.get("urlsToAnalysis") as { [key: string]: { relevant: boolean, description: string } }

  if (!urlsToAnalysis) {
    await storage.set("urlsToAnalysis", {})
  } else if (urlsToAnalysis[url]) {
    console.log("URL already analyzed")
    await storage.set("summaryOutput", urlsToAnalysis[url])
    return
  } else {
    console.log("URL not analyzed")
    await storage.set("summaryOutput", "")
  }

  //detect tab switch
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    let [activeTab] = await chrome.tabs.query(queryOptions);
    let url = activeTab.url;
    console.log("GUGU")
    console.log(url)
    await storage.set("currentURL", url)

    const urlsToAnalysis = await storage.get("urlsToAnalysis") as { [key: string]: { relevant: boolean, description: string } }

    console.log({urlsToAnalysis})

    if (urlsToAnalysis[url]) {
      console.log("URL already analyzed")
      await storage.set("summaryOutput", urlsToAnalysis[url])
      return
    } else {
      console.log("URL not analyzed")
      await storage.set("summaryOutput", "")
    }
  });

  //detect url change
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      let url = changeInfo.url;
      console.log("GUGU")
      console.log(url)
      await storage.set("currentURL", url)

      const urlsToAnalysis = await storage.get("urlsToAnalysis") as { [key: string]: { relevant: boolean, description: string } }

      console.log(urlsToAnalysis)

      if (urlsToAnalysis[url]) {
        console.log("URL already analyzed")
        await storage.set("summaryOutput", urlsToAnalysis[url])
        return
      } else {
        console.log("URL not analyzed")
        await storage.set("summaryOutput", "")
      }
    }
  });
}

handler()