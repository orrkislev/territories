let contentRotation
let poissonPoints = []
function drawBG() {
    const bgClr = color(bgColor)
    background(bgClr)

    if (isSpace) {
        translate(width / 2, height / 2)
        contentRotation = random(-4, 4)
        rotate(contentRotation)
        translate(-width / 2, -height / 2)
        background(0)
        fill(bgClr)
        if (isCircle) c(width / 2, height / 2, width - startBorder * 2)
        else rect(border, border, width - border * 2, height - border * 2)
        resetMatrix()
    }

    // ------------------ poisson ------------------
    // ----------------------------------------------
    const bgsampler = new PoissonDiscSampler(width, height, SCL(20))
    const bgpoints = bgsampler.get(30000)
    poissonPoints = bgpoints
    if (brightness(bgClr) < 50 || isSpace) stroke(255, 50)
    else stroke(0, 50)
    // stroke('#a7c957')
    noFill()
    colorMode(HSB)
    const ang = random(360)
    const arcX = SCL(random(30))
    const arcY = SCL(random(30))
    bgpoints.forEach(p => {
        if (p) {
            push()
            translate(p.x, p.y)
            rotate(random(360))
            arc(0, 0, arcX, arcY, 0, ang)
            pop()
        }
    })
    colorMode(RGB)

    // ------------------ patchwork -----------------
    // ----------------------------------------------
    if (isPatchwork) {
        stroke(0)
        for (let y = 0; y < height; y += SCL(200)) {
            const l = new Path.Line(p(-SCL(200), y), p(width + SCL(200), y)).rebuild(5).wonky()
            for (let i = 0; i < l.length - SCL(20); i += SCL(20)) {
                const p1 = l.getPointAt(i)
                const p2 = l.getPointAt(i + SCL(10))
                line(p1.x, p1.y, p2.x, p2.y)
            }
        }
        for (let x = 0; x < width; x += SCL(200)) {
            const l = new Path.Line(p(x, -SCL(200)), p(x, height + SCL(200))).rebuild(5).wonky()
            for (let i = 0; i < l.length - SCL(20); i += SCL(20)) {
                const p1 = l.getPointAt(i)
                const p2 = l.getPointAt(i + SCL(10))
                line(p1.x, p1.y, p2.x, p2.y)
            }
        }

        for (const b of boubles) {
            b.along(loc => {
                const pos1 = loc.point.add(loc.normal.multiply(SCL(6)))
                const offset2 = loc.offset + SCL(10)
                const loc2 = b.getLocationAt(offset2 % b.length)
                const pos2 = loc2.point.add(loc2.normal.multiply(SCL(6)))
                line(pos1.x, pos1.y, pos2.x, pos2.y)
            }, 0, null, 10)
        }
    }
}


async function shadows_and_outline() {
    if (withWhiteOutline) {
        stroke(255)
        strokeWeight(SCL(20))
        for (const b of boubles) {
            b.along(loc => {
                line(loc.point.x, loc.point.y, loc.point.x, loc.point.y)
            })
            await timeout()
        }
        strokeWeight(SCL(2))
    }

    // ------------------ outline -------------------
    // ----------------------------------------------
    strokeWeight(SCL(2))
    stroke(0)
    for (const b of boubles) {
        b.along(loc => {
            const pos1 = loc.point.add(loc.normal.multiply(SCL(20)))
            const n1 = noise(loc.point.x / SCL(80), loc.point.y / SCL(80))
            if (n1 < 0.5) line(pos1.x, pos1.y, pos1.x, pos1.y)
        }, 0, null, 0.1)
        await timeout()
    }

    // ------------------ shadows -------------------
    // ----------------------------------------------
    strokeWeight(SCL(2))
    stroke(0)
    for (const b of boubles) {
        b.along(loc => {
            line(loc.point.x, loc.point.y, loc.point.x + PS * 2 * shadowDir.x, loc.point.y + PS * 2 * shadowDir.y)
        }, 0, null, SCL(shadowDensity))
        await timeout()
    }
}


async function snow() {
    // ------------------ snow points ----------------------
    // -----------------------------------------------------
    const snowPoints = []
    noStroke()
    for (const b of boubles) {
        b.along(loc => {
            const ang = (loc.tangent.angle + 360) % 360
            if (ang > 50 && ang < 300) return
            const pos = loc.point.add(0, -SCL(20))
            if (boubles.some(b2 => b2.contains(pos))) return
            snowPoints.push([loc.point, SCL(random(6,30))])
        }, 0, null, 5)
    }
    // ------------------ snow draw ------------------------
    // -----------------------------------------------------
    fill(0, 30)
    snowPoints.forEach(sp => c(sp[0].x, sp[0].y + SCL(8), sp[1]))
    fill(0)
    snowPoints.forEach(sp => c(sp[0].x, sp[0].y, sp[1] + SCL(4)))
    fill(255)
    snowPoints.forEach(sp => c(sp[0].x, sp[0].y, sp[1]))
}