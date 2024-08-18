const randomString = (n:number, s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"):string => Array.from(Array(n)).map(() => s[Math.floor(Math.random()*s.length)]).join("")
const randomNumber = (n:number, s = "0123456789"):string => Array.from(Array(n)).map(() => s[Math.floor(Math.random()*s.length)]).join("")

export {
    randomString,
    randomNumber
}