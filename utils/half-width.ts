

export namespace half_width {
    export const half_word_object = {
        "１": "1",
        "２": "2",
        "３": "3",
        "４": "4",
        "５": "5",
        "６": "6",
        "７": "7",
        "８": "8",
        "９": "9",
        "０": "0",
        "／": "/",
        "：": ":",
    } as Record<string, string>
    export function replace(content: string) {
        let str = ""
        for (const [key, value] of Object.entries(half_word_object)) {
            str = content.replaceAll(key, value)
        }
        return str
    }
}
