import iconv from "iconv-lite"
import { JSDOM } from "jsdom"

import fs from "fs"
import path from "path"

import { errorHandling } from "../utils/error"

type raceOption = {
    name?: string
    races?: string[]
}

type uma_info = {
    rank: number
    waku: string
    umaban: number
    horse: string
    age: string
    weight: string
    jockey: string
    time: string
    margin: string
    h_weight: number
    h_weight_zougen: number
    f_time: string
    trainer: string
    pop: string
    corner: number[]
}

type race_json = {
    title: string
    url: string
    horse: uma_info[]
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
                    const jra_data = await this.jra_race_result(race)
                    if (jra_data) {
                        const { pathname } = new URL(race)
                        fs.writeFileSync(path.join(__dirname, `../db/jra/${pathname.replace("/", "").replaceAll("/", "-")}.json`), JSON.stringify(jra_data, null, "\t"))
                    }
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
            if (!age.textContent) {
                return null
            }
            if (!weight) {
                return null
            }
            if (!weight.textContent) {
                return null
            }
            if (!jockey) {
                return null
            }
            if (!jockey.textContent) {
                return null
            }
            if (!time) {
                return null
            }
            if (!time.textContent) {
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
            if (!f_time.textContent) {
                return null
            }
            if (!trainer) {
                return null
            }
            if (!trainer.textContent) {
                return null
            }
            if (!pop) {
                return null
            }
            if (!pop.textContent) {
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
            } satisfies uma_info

            return info
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
    async jra_race_result(url: string) {
        try {
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
            const title = dom.window.document.querySelector("#race_result > div > table > caption > div.race_header > div > div.race_title > div > div.txt > h2 > span > span.race_name")
            const trs = dom.window.document.querySelectorAll("#race_result > div > table > tbody > tr")
    
            if (!title) {
                return null
            }
            if (!title.childNodes[0].textContent) {
                return null
            }
    
            let race_data = {
                title: title.childNodes[0].textContent,
                url: url,
                horse: []
            } as race_json
    
            for (let tr of trs) {
                const info = await this.jra_get_info(tr)
    
                if (info) {
                    race_data.horse.push(info)
                }
            }
            return race_data
        } catch (error) {
            errorHandling(error)
            return null
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