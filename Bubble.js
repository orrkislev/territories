let boubles = []
class Bouble extends paper.Path {
    constructor() {
        super()
        this.painter = new boublePainter(this)
        this.fillColor = choose(['orange', 'cornflowerblue'])
        this.targetArea = 1000
        boubles.push(this)
    }
    setTargetArea(t) {
        this.targetArea = t
        this.targetRadius = sqrt(t / PI)
    }
    get stress() {
        return (this.targetArea - this.area) / 200
    }
    reshape() {
        const sumSegments = this.length / rebuildDistance
        if (this.segments.length < sumSegments) {
            const newSegments = []
            for (let i = 0; i < sumSegments; i++) {
                const offset = i / sumSegments * this.length
                const loc = this.getLocationAt(offset)
                const pos = loc.point
                const handleIn = loc.tangent.multiply(-1)
                const handleOut = loc.tangent
                newSegments.push(new Segment(pos, handleIn, handleOut))
            }

            for (let i = 0; i < 50; i++) {
                newSegments.push(newSegments.shift())
            }
            this.segments = newSegments
        }
    }
    update() {
        this.reshape()

        const neighbors = paper.project.activeLayer.children.filter(b => b != this && b.bounds.intersects(this.bounds))

        if (abs(this.stress) > 0.1) {
            const force = this.stress / this.segments.filter(s => !s.data || !s.data.stuck).length
            this.segments.forEach((s, segI) => {
                if (s.data && s.data.stuck) return

                let movement = p(0, 0)
                const lastSeg = this.segments[(segI + this.segments.length - 1) % this.segments.length]
                const nextSeg = this.segments[(segI + 1) % this.segments.length]
                const midPoint = lastSeg.point.add(nextSeg.point).divide(2)
                const dirToMid = midPoint.subtract(s.point).normalize(.5)
                movement = movement.add(dirToMid)

                const normal = s.location.normal
                movement = movement.add(normal.multiply(force))

                const moveFactor = tryToMove(this, s.point, movement, neighbors)
                s.point = s.point.add(movement.multiply(moveFactor))

                if (moveFactor != 1) {
                    s.data = { stuck: true }
                }
            })
        }
    }

    poissonFill(distance, func) {
        const sampler = new PoissonDiscSampler(this.bounds.width, this.bounds.height, distance)
        const points = sampler.get(this.area / distance).filter(p => p).map(p => new Point(p.x, p.y).add(this.bounds.topLeft))
        points.forEach(p => func(p))
        return points
    }

    along(func, start = 0, end, step = 1) {
        if (!end) end = this.length
        if (start > end) return this.along(func, end, start, step)
        for (let i = start; i < end; i += step) {
            const loc = this.getLocationAt(i % this.length)
            func(loc)
        }
    }

    static fromPath(path) {
        const bouble = new Bouble()
        bouble.segments = path.segments
        bouble.closePath()
        path.remove()
        return bouble
    }
}