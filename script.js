
class Point {
    constructor(x, y) { this.x = x; this.y = y; }
    add(point) { return new Point(this.x + point.x, this.y + point.y); }
    subtract(point) { return new Point(this.x - point.x, this.y - point.y); }
    multiply(scalar) { return new Point(this.x * scalar, this.y * scalar); }
    dot(point) { return this.x * point.x + this.y * point.y; }
    cross(point) { return this.x * point.y - this.y * point.x; }
    distanceTo(point) { return Math.hypot(this.x - point.x, this.y - point.y); }
    midpoint(point) { return this.add(point).multiply(0.5); }
}

class Circle {
    constructor(x, y, r) { this.x = x; this.y = y; this.r = r; }
    contains(point) {
        const distance = Math.hypot(point.x - this.x, point.y - this.y);
        return distance <= this.r;
    }
}

function circleWithOnePoint(p) {
    return new Circle(p.x, p.y, 0);
}

function cicleWithTwoPoints(p1, p2) {
    const center = p1.midpoint(p2);
    const radius = p1.distanceTo(p2) / 2;
    return new Circle(center.x, center.y, radius);
}

function circleWithThreePoints(p1, p2, p3) {
    const ax = p1.x, ay = p1.y;
    const bx = p2.x, by = p2.y;
    const cx = p3.x, cy = p3.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

    const center = new Point(ux, uy);
    const radius = center.distanceTo(p1);
    return new Circle(center.x, center.y, radius);
}

document.getElementById('input-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const n = parseInt(document.getElementById('points-number').value);
    if (n >= 2 && n <= 10000) {
        generatePoints(n);
        visualizeWelzl();
        updateSlider();
    } else {
        alert('Please enter a valid number between 2 and 100.');
    }
});

let points = [];
let steps = [];
let currentStep = 0;

function generatePoints(n) {
    points = [];
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 600;

    for (let i = 0; i < n; i++) {
        let proportion = 1/3;
        let offset = 1/2 - proportion/2;
        points.push(new Point(
            Math.random() * canvas.width  * proportion + canvas.width * offset,
            Math.random() * canvas.height * proportion + canvas.height * offset
        ));
    }

    drawPoints(ctx);
    steps = welzlAlgorithm(points);
    currentStep = 0;
    updateSlider();
    drawStep(ctx, steps[currentStep]);
}

function drawPoints(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    });
}

function visualizeWelzl() {
    const slider = document.getElementById('step-slider');

    slider.addEventListener('input', function() {
        currentStep = parseInt(slider.value);
        const ctx = document.getElementById('canvas').getContext('2d');
        drawStep(ctx, steps[currentStep]);
        updateStepsCount();
    });
}

function drawStep(ctx, step) {
    drawPoints(ctx);
    if (step.circle) {
        let { x, y, r } = step.circle;
        if (r == 0) {
            r = 3;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function updateSlider() {
    const slider = document.getElementById('step-slider');
    slider.max = steps.length - 1;
    slider.value = currentStep;
    updateStepsCount();
}

function updateStepsCount() {
    document.getElementById('steps-count').textContent = currentStep + 1;
    document.getElementById('total-steps').textContent = steps.length;
}

// Welzl's Algorithm implementation
function welzlAlgorithm(points) {
    points.sort(() => Math.random() - 0.5); // shuffle points
    steps = [];
    let currCircle = circleWithOnePoint(new Point(0, 0));
    for (let i = 0; i < points.length; i++) {
        if (!currCircle.contains(points[i])) {
            currCircle = circleWithOnePoint(points[i]);
            steps.push({ circle: { x: currCircle.x, y: currCircle.y, r: currCircle.r } });
            for (let j = 0; j < i; j++) {
                if (!currCircle.contains(points[j])) {
                    currCircle = cicleWithTwoPoints(points[i], points[j]);
                    steps.push({ circle: { x: currCircle.x, y: currCircle.y, r: currCircle.r } });
                    for (let k = 0; k < j; k++) {
                        if (!currCircle.contains(points[k])) {
                            currCircle = circleWithThreePoints(points[i], points[j], points[k]);
                            steps.push({ circle: { x: currCircle.x, y: currCircle.y, r: currCircle.r } });
                        }
                    }
                }
            }
        }
    }

    console.log(steps);
    return steps;
}


// circle min_circle_cover(vp v){
//     random_shuffle(v.begin(), v.end());
//     circle ans;
//     int n = v.size();
//     for(int i=0;i<n;i++) if(!ans.inside(v[i])){
//         ans = circle(v[i]);
//         for(int j=0;j<i;j++) if(!ans.inside(v[j])){
//             ans = circle(v[i], v[j]);
//             for(int k=0;k<j;k++) if(!ans.inside(v[k])){
//                 ans = circle(v[i], v[j], v[k]);
//             }
//         }
//     }
//     return ans;
// }