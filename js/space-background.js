/**
 * 3D Celestial Space Background Engine
 * Depth-projected starfield with transient constellation vectors,
 * 3D perspective physics, shooting stars, and theme responsiveness.
 */

(function () {
    'use strict';

    let canvas = null;
    let ctx = null;
    let container = null;
    let animId = null;
    let isRunning = false;

    // Simulation constants
    const STAR_COUNT = 150;
    const MAX_Z = 1200;
    const FOCAL_LENGTH = 450;
    const CONSTELLATION_MAX_DIST = 160;
    const CONSTELLATION_MAX_DZ = 110;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Parallax & Camera state
    let targetCamX = 0;
    let targetCamY = 0;
    let camX = 0;
    let camY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    // Color scheme
    let theme = 'dark';
    let starColor = '#ffffff';
    let lineColor = '#ffffff';

    // Stars & Meteors
    const stars = [];
    const meteors = [];
    let nextMeteorTime = Date.now() + 4000 + Math.random() * 6000;

    class Star {
        constructor(randomizeZ = true) {
            this.reset(randomizeZ);
        }

        reset(randomizeZ = false) {
            this.x = (Math.random() - 0.5) * width * 2.2;
            this.y = (Math.random() - 0.5) * height * 2.2;
            this.z = randomizeZ ? (10 + Math.random() * (MAX_Z - 10)) : MAX_Z;
            this.baseSize = Math.random() < 0.08 ? 3.0 : (Math.random() < 0.30 ? 2.2 : 1.4);
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = 0.03 + Math.random() * 0.04;
            this.speed = 1.2 + Math.random() * 1.5; // Boosted relative velocity
            this.hasSpikes = Math.random() < 0.06;
            this.screenX = 0;
            this.screenY = 0;
            this.projectedSize = 0;
            this.alpha = 0;
            this.visible = false;
        }

        update() {
            this.z -= this.speed;
            if (this.z <= 10) {
                this.reset(false);
            }
            this.twinklePhase += this.twinkleSpeed;

            // 3D Perspective Projection
            const scale = FOCAL_LENGTH / this.z;
            const depthFactor = 1 - (this.z / MAX_Z);

            this.screenX = (width / 2) + (this.x + camX * depthFactor * 1.6) * scale;
            this.screenY = (height / 2) + (this.y + (camY + scrollY * 0.2) * depthFactor * 1.6) * scale;
            this.projectedSize = Math.max(0.9, Math.min(4.5, this.baseSize * scale * 1.6));

            const twinkle = 0.8 + 0.2 * Math.sin(this.twinklePhase);
            this.alpha = Math.max(0.20, Math.min(1.0, (0.35 + depthFactor * 0.70) * twinkle));

            this.visible = (
                this.screenX >= -15 &&
                this.screenX <= width + 15 &&
                this.screenY >= -15 &&
                this.screenY <= height + 15 &&
                this.z > 10
            );
        }

        draw(ctx) {
            if (!this.visible || this.alpha <= 0.02) return;

            // Soft radial glow for nearby bright stars
            if (this.z < MAX_Z * 0.45 && this.projectedSize > 1.8) {
                const glowRad = this.projectedSize * 2.8;
                ctx.globalAlpha = this.alpha * 0.3;
                ctx.fillStyle = starColor;
                ctx.beginPath();
                ctx.arc(this.screenX, this.screenY, glowRad, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = starColor;

            ctx.beginPath();
            ctx.arc(this.screenX, this.screenY, this.projectedSize, 0, Math.PI * 2);
            ctx.fill();

            // 4-point diffraction cross spikes for dominant anchor stars
            if (this.hasSpikes && this.z < MAX_Z * 0.5) {
                const spikeLen = this.projectedSize * 3.8;
                ctx.lineWidth = 1.0;
                ctx.strokeStyle = starColor;
                ctx.beginPath();
                ctx.moveTo(this.screenX - spikeLen, this.screenY);
                ctx.lineTo(this.screenX + spikeLen, this.screenY);
                ctx.moveTo(this.screenX, this.screenY - spikeLen);
                ctx.lineTo(this.screenX, this.screenY + spikeLen);
                ctx.stroke();
            }
        }
    }

    class Meteor {
        constructor() {
            this.reset();
        }

        reset() {
            this.active = true;
            this.x = Math.random() * width * 1.2 - width * 0.1;
            this.y = Math.random() * height * 0.4;
            this.length = 80 + Math.random() * 120;
            this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 deg diagonal
            this.speed = 12 + Math.random() * 8;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.life = 1.0;
            this.decay = 0.015 + Math.random() * 0.015;
        }

        update() {
            if (!this.active) return;
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            if (this.life <= 0 || this.x > width + 100 || this.y > height + 100) {
                this.active = false;
            }
        }

        draw(ctx) {
            if (!this.active || this.life <= 0) return;

            const tailX = this.x - Math.cos(this.angle) * (this.length * this.life);
            const tailY = this.y - Math.sin(this.angle) * (this.length * this.life);

            const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, starColor);

            ctx.globalAlpha = Math.min(0.85, this.life);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
    }

    function updateColors() {
        theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (theme === 'dark') {
            starColor = '#ffffff';
            lineColor = '#ffffff';
        } else {
            starColor = '#111111';
            lineColor = '#222222';
        }
    }

    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star(true));
        }
    }

    function resize() {
        if (!canvas || !container) return;
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
    }

    function drawConstellationVectors() {
        const count = stars.length;
        ctx.lineWidth = 1.05;

        for (let i = 0; i < count; i++) {
            const s1 = stars[i];
            if (!s1.visible) continue;

            // Connect to at most 2 nearby neighbors to keep vectors minimal & clean
            let connections = 0;

            for (let j = i + 1; j < count; j++) {
                if (connections >= 2) break;
                const s2 = stars[j];
                if (!s2.visible) continue;

                const dz = Math.abs(s1.z - s2.z);
                if (dz > CONSTELLATION_MAX_DZ) continue;

                const dx = s1.x - s2.x;
                const dy = s1.y - s2.y;
                const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist3D < CONSTELLATION_MAX_DIST) {
                    const distFactor = 1 - (dist3D / CONSTELLATION_MAX_DIST);
                    const depthFactor = 1 - ((s1.z + s2.z) / (2 * MAX_Z));
                    const lineAlpha = distFactor * depthFactor * 0.45;

                    if (lineAlpha > 0.02) {
                        ctx.globalAlpha = lineAlpha;
                        ctx.strokeStyle = lineColor;
                        ctx.beginPath();
                        ctx.moveTo(s1.screenX, s1.screenY);
                        ctx.lineTo(s2.screenX, s2.screenY);
                        ctx.stroke();
                        connections++;
                    }
                }
            }
        }
    }

    function loop() {
        if (!isRunning) return;

        ctx.clearRect(0, 0, width, height);

        // Smooth camera and scroll lerp
        camX += (targetCamX - camX) * 0.08;
        camY += (targetCamY - camY) * 0.08;
        scrollY += (targetScrollY - scrollY) * 0.1;

        // Update all stars
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
        }

        // Draw transient constellation lines first (behind star nodes)
        drawConstellationVectors();

        // Draw stars
        for (let i = 0; i < stars.length; i++) {
            stars[i].draw(ctx);
        }

        // Spawn and update meteors
        const now = Date.now();
        if (now > nextMeteorTime) {
            meteors.push(new Meteor());
            nextMeteorTime = now + 9000 + Math.random() * 12000;
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.update();
            m.draw(ctx);
            if (!m.active) {
                meteors.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1.0;
        animId = requestAnimationFrame(loop);
    }

    function init() {
        container = document.getElementById('space-background') || document.getElementById('particles-background');
        if (!container) return;

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Create canvas
        container.innerHTML = '';
        canvas = document.createElement('canvas');
        canvas.id = 'space-canvas';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';

        container.appendChild(canvas);
        ctx = canvas.getContext('2d');

        updateColors();
        resize();
        initStars();

        // Theme Mutation Observer
        const themeObserver = new MutationObserver(() => {
            updateColors();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Window resize listener
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 100);
        }, { passive: true });

        // Mouse Parallax listener
        window.addEventListener('mousemove', (e) => {
            const normX = (e.clientX / window.innerWidth) - 0.5;
            const normY = (e.clientY / window.innerHeight) - 0.5;
            targetCamX = -normX * 80;
            targetCamY = -normY * 60;
        }, { passive: true });

        // Scroll Parallax listener
        window.addEventListener('scroll', () => {
            targetScrollY = window.scrollY || window.pageYOffset || 0;
        }, { passive: true });

        // Visibility API: pause when tab hidden to save 100% battery/CPU
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animId) cancelAnimationFrame(animId);
                isRunning = false;
            } else if (!prefersReducedMotion) {
                isRunning = true;
                animId = requestAnimationFrame(loop);
            }
        });

        if (prefersReducedMotion) {
            // Render single crisp static frame for accessibility
            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
            }
            drawConstellationVectors();
            for (let i = 0; i < stars.length; i++) {
                stars[i].draw(ctx);
            }
        } else {
            isRunning = true;
            animId = requestAnimationFrame(loop);
        }

        console.log('🌌 3D Celestial Space Background initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
