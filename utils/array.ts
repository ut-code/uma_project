
function getRandomElements<T>(arr: T[], num: number): T[] {
    let result: T[] = []

    if (arr.length < num) {
        return arr
    }

    for (let i = 0; i < num; i++) {
        let element = arr[Math.floor(Math.random() * (arr.length))]
        while (result.includes(element)) {
            element = arr[Math.floor(Math.random() * (arr.length))]
        }
        result.push(element)
    }

    return result
}

const Deduplication = <T>(arr: T[]): T[] => Array.from(new Set(arr))

export {
    getRandomElements,
    Deduplication,
}