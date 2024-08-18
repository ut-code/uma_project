//scrapingで実装したい処理をここに書く

import { ScrapingClient } from "../scraping/index"

(async () => {
    const scraping = new ScrapingClient()
    await scraping.race({
        name: "有馬記念"
    })
})()