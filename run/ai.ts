import { AiClient } from "../utils/ai/index"

(async () => {
    const ai = new AiClient()
    await ai.GenerateModel("jra", "beta1")
})()