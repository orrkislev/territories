const p = (x, y) => new paper.Point(x, y)
const random = (a = 1, b = 0) => $fx.rand() * (b - a) + a
const resetRandom = () => { $fx.rand.reset(); $fx.randminter.reset(); }
const round_random = (a = 1, b = 0) => Math.floor(random(a, b + 1))
const choose = arr => arr[Math.floor(random(arr.length))]
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))