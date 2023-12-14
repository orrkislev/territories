class PoissonDiscSampler{
    constructor(w, h, r, k = 30) {
        this.w=w;this.h=h;this.r=r;this.k=k
        this.r2 = r * r
        this.cellSize = r / Math.SQRT2
        this.gridWidth = Math.ceil(w / this.cellSize)
        this.gridHeight = Math.ceil(h / this.cellSize)
        this.grid = new Array(this.gridWidth * this.gridHeight)
        this.queue = []
        // this.queue.push(this.samplePoint(w/2,h/2))
    }
    get(sum){
        const points = []
        points.push(this.samplePoint(this.w/2,this.h/2))
        for (let i=0;i<sum;i++){
            const newPoint = this.sample()
            if (newPoint) points.push(newPoint)
        }
        return points
    }
    samplePoint(x, y) {
        const p = v(x, y)
        const i = Math.floor(x / this.cellSize)
        const j = Math.floor(y / this.cellSize)
        this.grid[i + j * this.gridWidth] = p
        this.queue.push(p)
        return p
    }
    sample() {
        // if (!this.queue.length) return this.samplePoint(this.w/2,this.h/2)
        if (!this.queue.length) return null
        while (this.queue.length) {
            const i = Math.floor(random(this.queue.length))
            const s = this.queue[i]
            for (let j = 0; j < this.k; j++) {
                const a = random(360)
                const r = Math.sqrt(random(3) * this.r2 + this.r2)
                const x = s.x + r * cos(a)
                const y = s.y + r * sin(a)
                if (0 <= x && x < this.w && 0 <= y && y < this.h && !this.isNearby(x, y)) {
                    return this.samplePoint(x, y)
                }
            }
            this.queue[i] = this.queue[this.queue.length - 1]
            this.queue.pop()
        }
    }
    isNearby(x, y) {
        const i = Math.floor(x / this.cellSize)
        const j = Math.floor(y / this.cellSize)
        const i0 = Math.max(i - 2, 0)
        const j0 = Math.max(j - 2, 0)
        const i1 = Math.min(i + 3, this.gridWidth)
        const j1 = Math.min(j + 3, this.gridHeight)
        for (let j = j0; j < j1; j++) {
            const o = j * this.gridWidth
            for (let i = i0; i < i1; i++) {
                const s = this.grid[o + i]
                if (s) {
                    const dx = s.x - x
                    const dy = s.y - y
                    if (dx * dx + dy * dy < this.r2) {
                        return true
                    }
                }
            }
        }
        return false
    }
}
