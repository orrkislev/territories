async function phase1() {
    poles = []
    poles = Array(sumPoles).fill(0).map(_ => {
        const pos = p(
            random(WIDTH),
            random(HEIGHT * (obstacleComp == 'top' ? .5 : 1)))


        let pole
        if (obstacleType == 'circle')
            pole = new paper.Path.Circle(pos, random(20, 100)).rotate(random(360))
        if (obstacleType == 'rect')
            pole = new paper.Path.Rectangle(pos, random(20, 100)).rotate(random(360))
        if (obstacleType == 'line')
            pole = new paper.Path.Rectangle(pos, 20, -HEIGHT).rotate(random(-10, 10))
        if (wonkyObstacles) pole.wonky()
        return pole
    })

    // ------------------------ make boubles ------------------------
    // --------------------------------------------------------------
    const boubleSize = map(sumBoubles, 10, 50, 100, 25)
    for (let i = 0; i < sumBoubles; i++) {
        const pos = p(random(border, WIDTH - border), random(border, HEIGHT - border))
        if (boubles.some(b => b.contains(pos)) || poles.some(p => p.contains(pos))) {
            i--
            continue
        }
        const bouble = Bouble.fromPath(new Path.Circle(pos, 10).rotate(random(360)))
        bouble.setTargetArea(boubleSize * 1000 * random(.5, 1.5))
    }

    rebuildDistance = 30

    // ------------------------ simulate boubles ------------------------
    // ------------------------------------------------------------------
    for (let i = 0; i < 120; i++) {
        if (i >= 60 + border_exact * 60) border--
        const start = Date.now()
        boubles.forEach(b => b.update())
        boubles.sort(_ => random(1) - .5)
        if (i % 10 == 0) rebuildDistance = max(8, rebuildDistance - 2)
        if (Date.now() - start > 100) break
        await timeout()
    }

    // ------------------------ expand and simplify boubles ------------------
    // -----------------------------------------------------------------------
    // boubles.forEach(b => {
    //     b.segments.forEach(s => {
    //         s.point = s.point.add(s.location.normal.multiply(1))
    //     })
    // })
    // boubles.forEach(b => b.simplify(1))

    // ------------------------ show p5 ----------------------------
    // -------------------------------------------------------------
    paper.project.activeLayer.children.forEach(c => c.scale(PS))
    paper.project.activeLayer.children.forEach(c => c.position = c.position.multiply(PS))
    p5Canvas.elt.style.display = 'block';
    paperCanvas.style.display = 'none';


}

function tryToMove(obj, point, vector, neighbors = []) {
    const newPoint = point.add(vector)
    if (isCircle) {
        if (newPoint.getDistance(new Point(WIDTH / 2, HEIGHT / 2)) > WIDTH / 2 - border) return 0
    } else {
        if (newPoint.x < border || newPoint.x > WIDTH - border ||
            newPoint.y < border || newPoint.y > HEIGHT - border) {
            return 0
        }
    }
    for (child of neighbors) {
        if (child !== obj && child.contains(newPoint)) {
            if (child.contains(point)) return -1
            else return 0
        }
    }
    return 1
}
