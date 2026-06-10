"use strict";

const canvas = document.getElementById("fireworksCanvas");
const context = canvas.getContext("2d");
const fireButton = document.getElementById("fireButton");

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let fireworks = [];
let particles = [];

const colors = [
    "#ff0043",
    "#14fc56",
    "#1e7fff",
    "#e60aff",
    "#ffbf36",
    "#ffffff",
    "#00ddff",
    "#ff5ca8",
    "#ff7b00"
];

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomColor() {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}

function calculateDistance(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

class Firework {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;

        this.startX = startX;
        this.startY = startY;

        this.targetX = targetX;
        this.targetY = targetY;

        this.distanceToTarget = calculateDistance(
            startX,
            startY,
            targetX,
            targetY
        );

        this.distanceTraveled = 0;

        this.coordinates = [];

        for (let index = 0; index < 4; index += 1) {
            this.coordinates.push([this.x, this.y]);
        }

        this.angle = Math.atan2(
            targetY - startY,
            targetX - startX
        );

        this.speed = 3;
        this.acceleration = 1.045;

        this.brightness = random(55, 85);
        this.color = randomColor();
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;

        const velocityX = Math.cos(this.angle) * this.speed;
        const velocityY = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = calculateDistance(
            this.startX,
            this.startY,
            this.x + velocityX,
            this.y + velocityY
        );

        if (this.distanceTraveled >= this.distanceToTarget) {
            createExplosion(
                this.targetX,
                this.targetY,
                this.color
            );

            fireworks.splice(index, 1);
            return;
        }

        this.x += velocityX;
        this.y += velocityY;
    }

    draw() {
        context.beginPath();

        const lastCoordinate =
            this.coordinates[this.coordinates.length - 1];

        context.moveTo(
            lastCoordinate[0],
            lastCoordinate[1]
        );

        context.lineTo(this.x, this.y);

        context.strokeStyle = this.color;

        context.shadowBlur = 12;
        context.shadowColor = this.color;

        context.lineWidth = 2;
        context.stroke();

        context.shadowBlur = 0;

        context.beginPath();

        context.arc(
            this.targetX,
            this.targetY,
            2,
            0,
            Math.PI * 2
        );

        context.strokeStyle =
            `hsla(0, 100%, ${this.brightness}%, 0.3)`;

        context.stroke();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;

        this.coordinates = [];

        for (let index = 0; index < 6; index += 1) {
            this.coordinates.push([this.x, this.y]);
        }

        this.angle = random(0, Math.PI * 2);
        this.speed = random(2, 11);

        this.friction = 0.96;
        this.gravity = 0.12;

        this.color =
            Math.random() > 0.18
                ? color
                : randomColor();

        this.alpha = 1;
        this.decay = random(0.012, 0.025);

        this.brightness = random(55, 90);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;

        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        context.beginPath();

        const lastCoordinate =
            this.coordinates[this.coordinates.length - 1];

        context.moveTo(
            lastCoordinate[0],
            lastCoordinate[1]
        );

        context.lineTo(this.x, this.y);

        context.strokeStyle = this.hexToRgba(
            this.color,
            this.alpha
        );

        context.lineWidth = 1.6;

        context.shadowBlur = 10;
        context.shadowColor = this.color;

        context.stroke();

        context.shadowBlur = 0;
    }

    hexToRgba(hexColor, alpha) {
        const cleanHex = hexColor.replace("#", "");

        const red = parseInt(cleanHex.substring(0, 2), 16);
        const green = parseInt(cleanHex.substring(2, 4), 16);
        const blue = parseInt(cleanHex.substring(4, 6), 16);

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
}

function createExplosion(x, y, color = randomColor()) {
    const particleCount = Math.floor(random(70, 115));

    for (let index = 0; index < particleCount; index += 1) {
        particles.push(
            new Particle(x, y, color)
        );
    }
}

function launchFirework(targetX, targetY) {
    const startX = random(
        canvasWidth * 0.2,
        canvasWidth * 0.8
    );

    const startY = canvasHeight + 10;

    fireworks.push(
        new Firework(
            startX,
            startY,
            targetX,
            targetY
        )
    );
}

function launchRandomFirework() {
    const targetX = random(
        canvasWidth * 0.12,
        canvasWidth * 0.88
    );

    const targetY = random(
        canvasHeight * 0.08,
        canvasHeight * 0.57
    );

    launchFirework(targetX, targetY);
}

function launchFireworkGroup() {
    const amount = Math.floor(random(2, 5));

    for (let index = 0; index < amount; index += 1) {
        window.setTimeout(() => {
            launchRandomFirework();
        }, index * 180);
    }
}

function animate() {
    window.requestAnimationFrame(animate);

    context.globalCompositeOperation = "destination-out";

    context.fillStyle = "rgba(0, 0, 0, 0.18)";

    context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    context.globalCompositeOperation = "lighter";

    for (
        let index = fireworks.length - 1;
        index >= 0;
        index -= 1
    ) {
        fireworks[index].draw();
        fireworks[index].update(index);
    }

    for (
        let index = particles.length - 1;
        index >= 0;
        index -= 1
    ) {
        particles[index].draw();
        particles[index].update(index);
    }
}

canvas.addEventListener("pointerdown", (event) => {
    launchFirework(
        event.clientX,
        event.clientY
    );
});

fireButton.addEventListener("click", (event) => {
    event.stopPropagation();
    launchFireworkGroup();
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();

/* Pháo hoa lúc mới mở trang */
window.setTimeout(() => {
    launchFireworkGroup();
}, 500);

window.setTimeout(() => {
    launchFireworkGroup();
}, 1600);

window.setTimeout(() => {
    launchFireworkGroup();
}, 2800);

/* Tự động bắn pháo hoa liên tục */
window.setInterval(() => {
    launchRandomFirework();

    if (Math.random() > 0.65) {
        window.setTimeout(() => {
            launchRandomFirework();
        }, 250);
    }
}, 1200);
