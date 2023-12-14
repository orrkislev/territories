function initP5(show = false, webgl = false, ratio) {
    if (ratio){
        if (windowWidth < windowHeight * ratio) {
        p5Canvas = createCanvas(windowWidth, windowWidth / ratio, webgl ? WEBGL : null)
        } else {
        p5Canvas = createCanvas(windowHeight * ratio, windowHeight, webgl ? WEBGL : null)
        }
    } else {
        p5Canvas = createCanvas(windowWidth, windowHeight, webgl ? 'webgl' : 'p2d');
    }
    PS = width / 1000
    SCL = j=>j*PS,v = createVector,c = circle
    noiseSeed(round_random(1000))
    angleMode(DEGREES)
    if (!show) p5Canvas.elt.style.display = 'none'
}

let WIDTH, HEIGHT
function initPaper(show = false, size){
    paperCanvas = document.createElement('canvas');
    if (size) {
        paperCanvas.width = size[0]
        paperCanvas.height = size[1]
    } else {
        paperCanvas.width = width || windowWidth;
        paperCanvas.height = height || windowHeight
    }
    WIDTH = paperCanvas.width
    HEIGHT = paperCanvas.height
    paper.setup(paperCanvas);

    document.querySelector('main').appendChild(paperCanvas);

    paperCanvas.style.display = 'block';
    if (!show) paperCanvas.style.display = 'none';

    paperCanvas.style.width = width + 'px';
    paperCanvas.style.height = height + 'px';

    window.Path = paper.Path,
    window.Circle = paper.Path.Circle,
    window.Rectangle = paper.Path.Rectangle,
    window.Point = paper.Point,
    window.Color = paper.Color,
    window.Group = paper.Group,
    window.CompoundPath = paper.CompoundPath,
    window.Segment = paper.Segment,
    window.Size = paper.Size
}