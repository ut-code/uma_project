import { ScrapingClient } from "./utils/scraping/index"

class MAIN {
    scraping: ScrapingClient

    constructor() {
        this.scraping = new ScrapingClient()
    }
}

new MAIN()