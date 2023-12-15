const sumBoubles = random() < 0.5 ? random(10, 20) : random(20, 50)
const sumPoles = round_random(20, 100)
const isCircle = random() < 0.15
let border = random(-10, 100) + (isCircle ? 0 : 50)
const startBorder = border
const border_exact = random()

const shadow_type = choose([1, 2, 3]) // 1-3
const shadow_fill = random() < 0.1 ? random() : 0
const patternChance = random()
const bubblyChance = .3

const shadowDir = pointFromAngle(random(180), 15)
const shadowDensity = random(.2, 10)
const withWhiteOutline = random() < 0.5

const withThickOutline = random() < 0.4
const ridgeDir = pointFromAngle(random(180), random(15,90))
const withLight = random() < 0.99

const withSnow = random() < 0.25
const isSpace = isCircle ? (random() < .8) : (random() < .2)
const isPatchwork = random() < .2
const withSpikes = isPatchwork ? false : random() < .2

const obstacleType = isCircle ? 'circle' : choose(['circle', 'circle', 'circle', 'rect', 'rect', 'line'])
const obstacleComp = random() < .2 ? 'top' : 'all'
const wonkyObstacles = random() < .3

const palletes = [['#d4e09b', '#f6f4d2', '#cbdfbd', '#f19c79'],
['#ffa69e', '#faf3dd', '#b8f2e6', '#aed9e0'],
['#219ebc', '#023047', '#ffb703', '#fb8500'],
['#26547c', '#ef476f', '#ffd166', '#06d6a0'],
['#70d6ff', 'lightgrey', '#ff9770', '#ffd670'],
['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c'],
['#606c38', '#283618', '#fefae0', '#dda15e'],
['#e7ecef', '#274c77', '#6096ba', '#a3cef1'],
["#41aa6d", "#262525", "#eaefea"],
["#E4CA18", "#0A2349", "#0168A7"],
]

const bubblePallete = choose(palletes)
const bgColor = bubblePallete.sort(() => random() - .5).pop()


async function setup() {
    const ratio = 3 / 5
    initP5(false, false, ratio)
    initPaper(true, [1000, 1000 / ratio])
    ctx = drawingContext
    await makeImage()
}


async function makeImage() {
    await phase1()
    await phase2()
}


async function phase2() {
    drawBG()

    translate(width / 2, height / 2)
    rotate(contentRotation)
    translate(-width / 2, -height / 2)

    checkForIslands()

    await drawAllBoubles()
}

function checkForIslands() {
    for (let i = 0; i < boubles.length; i++) {
        const b = boubles[i]
        b.isIsland = true
        b.along(loc => {
            if (!b.isIsland) return
            const pos2 = loc.point.add(loc.normal.multiply(SCL(8)))
            if (boubles.some(b2 => b2.contains(pos2))) {
                b.isIsland = false
            }
        }, 0, null, SCL(20))
    }
}



let gr
async function drawAllBoubles() {
    if (!isPatchwork) await shadows_and_outline()

    gr = createGraphics(width, height)
    gr.stroke(255)

    for (const b of boubles) {
        if (!withThickOutline) b.painter.drawOutline()
        b.painter.startMask()
        fill(b.painter.clr)
        noStroke()
        b.painter.shape()
        b.painter.drawShadow()
        b.painter.drawLight()
        b.painter.drawSprinkles()
        b.painter.drawInnerLines()
        b.painter.endMask()
        await timeout(0)
        if (withThickOutline) b.painter.drawOutline()

        if (withSpikes) {
            b.along(loc => {
                if (b.contains(loc.point.add(loc.normal)) && b.contains(loc.point.subtract(loc.normal))) return
                const pos2 = loc.point.add(loc.normal.multiply(-SCL(15)))
                line(loc.point.x, loc.point.y, pos2.x, pos2.y)
            }, 0, null, SCL(15))
        }

        if (isPatchwork) {
            b.along(loc => {
                const pos1 = loc.point.add(loc.normal.multiply(-SCL(6)))
                const offset2 = loc.offset + SCL(10)
                const loc2 = b.getLocationAt(offset2 % b.length)
                const pos2 = loc2.point.add(loc2.normal.multiply(-SCL(6)))
                line(pos1.x, pos1.y, pos2.x, pos2.y)
            }, 0, null, SCL(20))
        }
    }
    
    resetRandom()
    for (const b of boubles) b.painter.drawBubbly()
    if (withSnow) await snow()

    // glitch
    // for (let i = 0; i < 50; i++) {
    //     const y = noise(i * 100) * height
    //     // copy(0, y, width, SCL(3), 0, noise(i * 20) * height, width, SCL(3))
    //     copy(0, y, width, SCL(3), noise(i * 50) * width * 2 - width, y, width, SCL(3))
    // }
}

