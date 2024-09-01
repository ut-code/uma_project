import tf from "@tensorflow/tfjs-node-gpu"

import fs from "fs"
import path from "path"

import { race_json, uma_info } from "../scraping/index"
import { errorHandling } from "../error"

class AiClient {
    constructor() {}
    async GenerateModel(db_name: string, version: string) {
        try {
            const data = this.load_data(db_name)
            if (!data) {
                return null
            }

            const ai_data = this.preprocessData(data)
            if (!ai_data) {
                return null
            }

            const model = this.createModel(ai_data.xs.shape[0])
            await model.fit(ai_data.xs, ai_data.ys, {
                epochs: 100,
                batchSize: 32,
                shuffle: true
            });
            await model.save(`localstorage://model/${version}/model`)
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
    createModel(inputShape: number): tf.Sequential {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] }))
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
        model.add(tf.layers.dense({ units: 1, activation: 'linear' })) // 回帰問題として扱う
    
        model.compile({
            optimizer: "adam",
            loss: "meanSquaredError",
        });
    
        return model
    }
    preprocessData(races: race_json[]) {
        try {
            const xs: number[][] = []
            const ys: number[] = []

            races.forEach(race => {
                race.horse.forEach(horse => {
                    const features: number[] = [
                        horse.h_weight,
                        Number(horse.age),
                    ]

                    xs.push(features)
                    ys.push(horse.rank)
                })
            })

            return {
                xs: tf.tensor2d(xs),
                ys: tf.tensor1d(ys),
            }
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
    load_data(db_name: string) {
        try {
            const result = [] as race_json[]
            const dir = path.join(__dirname, `../../db/${db_name}`)
            const files = fs.readdirSync(dir)
            for (const file of files) {
                if (!fs.statSync(path.join(dir, `./${file}`)).isDirectory() && file.endsWith(".json")) {
                    const data: race_json = JSON.parse(fs.readFileSync(path.join(dir, `./${file}`), "utf-8")) satisfies uma_info
                    result.push(data)
                }
            }

            return result
        } catch (error) {
            errorHandling(error)
            return null
        }
    }
}

export {
    AiClient,
}