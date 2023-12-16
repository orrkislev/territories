function boublePainter(b) {
    this.clr = choose(bubblePallete)
    this.fillerType = choose(['points', 'lines', 'grid', 'dotgrid', 'fullShadow', 'fullLight'])
    if (random() > patternChance) this.fillerType = null
    this.withSpots = random() < 0.2
    this.withBubbles = random() < bubblyChance
    this.withX = random() < 0.2

    this.shape = () => {
        beginShape()
        for (let i = 0; i < b.length; i += 1) {
            const pos = b.getPointAt(i)
            vertex(pos.x, pos.y)
        }
        endShape()
    }

    this.startMask = () => {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(b.firstSegment.point.x, b.firstSegment.point.y)
        b.along(loc => ctx.lineTo(loc.point.x, loc.point.y))
        ctx.closePath()
        ctx.clip()

        gr.clear()
        gr_ctx = gr.drawingContext
        gr_ctx.save()
        gr_ctx.beginPath()
        gr_ctx.moveTo(b.firstSegment.point.x, b.firstSegment.point.y)
        b.along(loc => gr_ctx.lineTo(loc.point.x, loc.point.y))
        gr_ctx.closePath()
        gr_ctx.clip()
    }
    this.endMask = () => {
        ctx.restore()
        ctx.fillStyle = this.clr
        ctx.strokeStyle = '#000'
    }

    this.drawShadow = () => {
        noStroke()

        if (shadow_fill > 0 && this.fillerType != 'fullLight' && this.fillerType != 'fullShadow') {
            fill(0, shadow_fill * 255)
            this.shape()
        }

        stroke(0)
        if (shadow_type == 1) {
            const pnts = b.poissonFill(SCL(4), pos => line(pos.x, pos.y, pos.x, pos.y))
            pnts.forEach(p => gr.line(p.x, p.y, p.x, p.y))
        } else if (shadow_type == 2) {
            strokeWeight(SCL(4))
            const pnts1 = b.poissonFill(SCL(6), pos => line(pos.x, pos.y, pos.x, pos.y))
            gr.strokeWeight(SCL(4))
            pnts1.forEach(p => gr.line(p.x, p.y, p.x, p.y))
            strokeWeight(SCL(6))
            const pnts2 = b.poissonFill(SCL(16), pos => line(pos.x, pos.y, pos.x, pos.y))
            gr.strokeWeight(SCL(6))
            pnts2.forEach(p => gr.line(p.x, p.y, p.x, p.y))
            gr.strokeWeight(SCL(2))
        } else if (shadow_type == 3) {
            for (let y = -width - random(SCL(40)); y < height; y += SCL(6))    line(0, y, width, y + width)
            for (let y = -width - random(SCL(40)); y < height; y += SCL(6)) gr.line(0, y, width, y + width)
        }
    }

    this.drawOutline = () => {
        stroke(0)
        strokeWeight(SCL(6))
        b.along(loc => {
            if (withThickOutline) {
                if (b.contains(loc.point.add(loc.normal)) && b.contains(loc.point.subtract(loc.normal)))
                     strokeWeight(noise(loc.offset / 15) / 2)
                else strokeWeight(noise(loc.offset / 150) * SCL(10) + 1)
            }
            line(loc.point.x, loc.point.y, loc.point.x, loc.point.y)
        }, 0, null, .3)
        strokeWeight(SCL(2))
    }

    this.drawLight = () => {
        if (this.fillerType == 'fullShadow') return
        ctx.fillStyle = this.clr
        noStroke()
        beginShape()
        b.along(loc => {
            const n = noise(loc.point.x / SCL(40), loc.point.y / SCL(40))
            curveVertex(loc.point.x - SCL(ridgeDir.x) * n, loc.point.y - SCL(ridgeDir.y) * n)
        })
        endShape()

        if (this.withSpots) {
            let clr = color(this.clr)

            clr = color(red(clr) * .9, green(clr) * .9, blue(clr) * .9)

            fill(clr)
            for (let i = 0; i < SCL(b.area) / 20; i++) {
                const x = random(b.bounds.left, b.bounds.right)
                const y = random(b.bounds.top, b.bounds.bottom)
                c(x, y, SCL(random(8, 40)))
            }
        }

        gr_ctx.restore()
        if (this.fillerType != 'fullLight') {
            gr.blendMode(REMOVE)
            gr.beginShape()
            b.along(loc => {
                const n = noise(loc.point.x / SCL(40), loc.point.y / SCL(40))
                gr.curveVertex(loc.point.x + SCL(ridgeDir.x) * n, loc.point.y + SCL(ridgeDir.y) * n)
            })
            gr.endShape()
            gr.blendMode(BLEND)
        }
        // if (withLight) image(gr, 0, 0)
        image(gr, 0, 0)
    }

    this.drawInnerLines = () => {
        stroke(0)
        strokeWeight(SCL(2))
        noFill()
        beginShape()
        const s = b.length * random()
        b.along(loc => {
            const pos = loc.point.add(loc.normal.multiply(-SCL(12)))
            curveVertex(pos.x, pos.y)
        }, s, s + SCL(random(40, 200)), SCL(5))
        endShape()

        if (this.withX){
            let x = random(b.bounds.left, b.bounds.right)
            let y = random(b.bounds.top, b.bounds.bottom)
            while (!b.contains(p(x, y))) {
                x = random(b.bounds.left, b.bounds.right)
                y = random(b.bounds.top, b.bounds.bottom)
            }
            stroke(0)
            push()
            translate(x, y)
            for (let i=0;i<4;i++){
                rotate(random(30,50))
                line(0,SCL(10),0,-SCL(10))
            }
            pop()
        }
    }

    this.drawSprinkles = () => {
        if (!this.fillerType) return
        if (this.fillerType == 'fullShadow' || this.fillerType == 'fullLight') return

        stroke(0)
        const fillerSize = SCL(random(2, 10))
        strokeWeight(SCL(2))

        if (this.fillerType == 'grid') {
            for (let x = -height; x < width; x += fillerSize * 5) line(x, 0, x + SCL(800), height)
            for (let y = 0; y < height; y += fillerSize * 5) line(0, y, width, y)
        } else if (this.fillerType == 'dotgrid') {
            for (let x = 0; x < width; x += fillerSize * 5) {
                for (let y = 0; y < height; y += fillerSize * 5) {
                    line(x, y, x, y)
                }
            }
        } else {
            b.poissonFill(SCL(random(10, 30)), pos => {
                if (this.fillerType == 'points') {
                    // strokeWeight(fillerSize)
                    line(pos.x, pos.y, pos.x, pos.y)
                } else {
                    const pos2 = pos.add(pointFromAngle(random(360)).multiply(fillerSize))
                    line(pos.x, pos.y, pos2.x, pos2.y)
                }
            })
        }
    }

    this.drawBubbly = () => {
        if (!this.withBubbles) return
        if (withThickOutline) strokeWeight(SCL(3))
        for (let i = 0; i < SCL(b.length) / 50; i++) {
            const loc = b.getLocationAt(random(b.length))
            const pos = loc.point.add(loc.normal.multiply(-random(SCL(20))))
            fill(this.clr)
            noStroke()
            const r = SCL(random(10, 30))
            c(pos.x, pos.y, r)
            stroke(0)
            noFill()
            push()
            translate(pos.x, pos.y)
            const angle = loc.tangent.angle
            rotate(angle)
            arc(0, 0, r, r, 120, 420)
            pop()
        }
        strokeWeight(SCL(2))
    }
}