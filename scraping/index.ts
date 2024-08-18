import fs from "fs"
import path from "path"

type raceOption = {
    name: string
}

class ScrapingClient {
    constructor() {
    }
    async race(options: raceOption) {
        let response = await fetch(
            `https://db.netkeiba.com/?pid=race_list&x=29&y=10&word=${options.name}`,
            {
                method: "GET",
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
                    "Cache-Control": "no-cache",
                    "user-agent": "Mozilla/5.0",
                }
            }
        )
        let html = await response.text()
    }
}

export {
    ScrapingClient,
    raceOption
}