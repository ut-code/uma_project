import tf from "@tensorflow/tfjs"

import fs from "fs"
import path from "path"

import { uma_info } from "../scraping/index"
import { errorHandling } from "../error"

class AiClient {
    constructor() {}
    load_data(db_name: string) {
        try {
            const dir = path.join(__dirname, `../../db/${db_name}`)
            const files = fs.readdirSync(dir)
            for (const file of files) {
                if (!fs.statSync(path.join(dir, `./${file}`)).isDirectory() && file.endsWith(".json")) {
                    const data: uma_info = JSON.parse(fs.readFileSync(path.join(dir, `./${file}`), "utf-8")) satisfies uma_info
                }
            }
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
}

export {
    AiClient,
}