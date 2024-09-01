import iconv from "iconv-lite"
import { JSDOM } from "jsdom"

import fs from "fs"
import path from "path"
import { errorHandling } from "../utils/error"

type raceOption = {
    name?: string
    races?: string[]
}

class ScrapingClient {
    constructor() {
    }
    async race(options: raceOption) {
        await this.jra()

        if (options.name) {
            await this.netkeiba(options.name)
        }
    }
    async jra() {
        const base_url = "https://www.jra.go.jp"
        const response = await fetch(
            `${base_url}/datafile/seiseki`,
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
        const data = iconv.decode(Buffer.from(await response.arrayBuffer()), "shift-jis")
        const dom = new JSDOM(data)
        
        for (const a of dom.window.document.getElementsByTagName("a")) {
            if (a.href.startsWith("/datafile/seiseki/replay/20")) {
                const race_url = base_url + a.href
                const race_list = await this.jra_race_list(base_url, race_url)

                for (let race of race_list) {
                    console.log(race)
                    await this.jra_race_result(race)
                }
            }
        }
    }
    async jra_get_info(html: Element) {
        try {
            const rank = html.querySelector(".place")
            const waku = html.querySelector("img")
            const num = html.querySelector(".num")
            const horse = html.querySelector(".horse")
            const age = html.querySelector(".age")
            const weight = html.querySelector(".weight")
            const jockey = html.querySelector(".jockey")
            const time = html.querySelector(".time")
            const margin = html.querySelector(".margin")
            const corner = html.querySelectorAll(".corner_list > ul > li")
            const h_weight = html.querySelector(".h_weight")
            const f_time = html.querySelector(".f_time")
            const trainer = html.querySelector(".trainer")
            const pop = html.querySelector(".pop")
    
            if (!rank) {
                return null
            }
            if (isNaN(Number(rank.textContent))) {
                return null
            }
            if (!waku) {
                return null
            }
            if (!num) {
                return null
            }
            if (isNaN(Number(num.textContent))) {
                return null
            }
            if (!horse) {
                return null
            }
            if (!horse.textContent) {
                return null
            }
            if (!age) {
                return null
            }
            if (!weight) {
                return null
            }
            if (!jockey) {
                return null
            }
            if (!time) {
                return null
            }
            if (!margin) {
                return null
            }
            if (!margin.textContent) {
                return null
            }
            if (!h_weight) {
                return null
            }
            if (!h_weight.childNodes[0].textContent) {
                return null
            }
            if (!h_weight.textContent) {
                return null
            }
            if (!f_time) {
                return null
            }
            if (!trainer) {
                return null
            }
            if (!pop) {
                return null
            }
 
            const span = h_weight.querySelector("span")
            if (!span) {
                return null
            }
            if (!span.textContent) {
                return null
            }

            const corner_list = [] as number[]
            for (const con of corner) {
                if (isNaN(Number(con.textContent))) {
                    return null
                }
                corner_list.push(Number(con.textContent))
            }

            const info = {
                rank: Number(rank.textContent),
                waku: waku.alt,
                umaban: Number(num.textContent),
                horse: horse.textContent.trim(),
                age: age.textContent,
                weight: weight.textContent,
                jockey: jockey.textContent,
                time: time.textContent,
                margin: margin.textContent.replaceAll("\\n", "").trim(),
                h_weight: Number(h_weight.childNodes[0].textContent.trim()),
                h_weight_zougen: Number(span.textContent.replaceAll(/[()]/g, "").trim()),
                f_time: f_time.textContent,
                trainer: trainer.textContent,
                pop: pop.textContent,
                corner: corner_list,
            }
    
            console.log(info)
            return info
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
    async jra_race_result(url: string) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
                "Cache-Control": "no-cache",
                "user-agent": "Mozilla/5.0",
            },
        })
        const data = iconv.decode(Buffer.from(await response.arrayBuffer()), "shift-jis")
        const dom = new JSDOM(data)
        const trs = dom.window.document.querySelectorAll("#race_result > div > table > tbody > tr")

        for (let tr of trs) {
            await this.jra_get_info(tr)
        }
    }
    async jra_race_list(base_url: string, url: string) {
        const url_list = [] as string[]
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
                "Cache-Control": "no-cache",
                "user-agent": "Mozilla/5.0",
            },
        })
        const data = iconv.decode(Buffer.from(await response.arrayBuffer()), "shift-jis")
        const dom = new JSDOM(data)

        for (const a of dom.window.document.getElementsByTagName("a")) {
            if (
                (
                    !url.includes("g1") &&
                    a.href.startsWith("/datafile/seiseki/replay/20") &&
                    !a.href.includes("jyusyo.html")
                ) ||
                (
                    url.includes("g1") &&
                    a.href.startsWith("/datafile/seiseki/g1/") &&
                    !a.href.includes("index.html") &&
                    !a.href.endsWith("g1.html")
                )
            ) {
                url_list.push(base_url + a.href)
            }
        }

        return url_list
    }
    async netkeiba(name: string) {
        //jraの方をスクレイピングするように方針転換したのでこれは使いません
        let response = await fetch(
            `https://db.netkeiba.com/?pid=race_list&word=${name}&x=29&y=10`,
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
        let html = iconv.decode(Buffer.from(await response.arrayBuffer()), "shift_jis")
        console.log(html)
    }
}

export {
    ScrapingClient,
    raceOption
}