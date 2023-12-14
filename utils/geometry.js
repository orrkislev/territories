const pointFromAngle = (angle,s=1) => new paper.Point(1, 0).rotate(angle).multiply(s)

paper.Path.prototype.wonky = function (minVal = -20, maxVal = 20) {
    this.segments.forEach(seg => {
        const offset = seg.location.normal.multiply(random(minVal, maxVal))
        seg.point = seg.point.add(offset)
    })
    return this
}

paper.Path.prototype.rebuild = function (numPoints) {
    const newSegs = []
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const offset = this.length * t
        const loc = this.getLocationAt(offset)
        if (!loc) continue
            const newSeg = this.divideAt(this.length * i / numPoints)
            newSegs.push(newSeg)
    }
    for (let i=this.segments.length-2; i>=1; i--){
        if (!newSegs.includes(this.segments[i])) this.removeSegment(i)
    }
    this.smooth()
    return this
}