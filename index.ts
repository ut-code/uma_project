import { ScrapingClient } from "./utils/scraping/index"
import { AiClient } from "./utils/ai/index"

class MAIN {
    scraping: ScrapingClient
    ai: AiClient

    constructor() {
        this.scraping = new ScrapingClient()
        this.ai = new AiClient()
    }
}

new MAIN()