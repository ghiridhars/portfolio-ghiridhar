/**
 * 3D Celestial Space & Astrometry Background Engine
 * Features:
 * 1. 3D Volumetric Perspective Projection Starfield
 * 2. Scroll Warp Velocity & Dynamic Motion Streaks
 * 3. Gravitational Cursor Spacetime Well (Lensing & Vortex)
 * 4. Astrometry Coordinates HUD for Constellation Vectors
 * 5. Monochrome Theme Inversion (Dark/Light) & Tab Power-Saving
 */

(function () {
    'use strict';

    let canvas = null;
    let ctx = null;
    let container = null;
    let animId = null;
    let isRunning = false;

    // Simulation constants
    const STAR_COUNT = 160;
    const MAX_Z = 1200;
    const FOCAL_LENGTH = 460;
    const CONSTELLATION_MAX_DIST = 165;
    const CONSTELLATION_MAX_DZ = 110;
    const MAX_HUD_LABELS = 3; // Keep viewport clean and uncluttered

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
    let lastScrollY = 0;
    let lastScrollTime = Date.now();
    let scrollVelocity = 0;
    let warpFactor = 1.0;

    // Gravitational Spacetime Well state
    const gravityWell = {
        active: false,
        x: 0,
        y: 0,
        strength: 0,
        targetStrength: 0,
        pulses: []
    };

    // Color scheme
    let theme = 'dark';
    let starColor = '#ffffff';
    let lineColor = '#ffffff';
    let hudBgColor = 'rgba(0, 0, 0, 0.75)';

    // Stars & Meteors
    const stars = [];
    const meteors = [];
    let nextMeteorTime = Date.now() + 5000 + Math.random() * 7000;

    // Procedural Astrometry Telemetry Hash
    function generateAstrometryTag(seedA, seedB) {
        const hash = Math.abs(Math.sin(seedA * 12.9898 + seedB * 78.233) * 43758.5453);
        const raH = String(Math.floor((hash * 24) % 24)).padStart(2, '0');
        const raM = String(Math.floor((hash * 1440) % 60)).padStart(2, '0');
        const decSign = hash > 0.5 ? '+' : '-';
        const decD = String(Math.floor((hash * 90) % 90)).padStart(2, '0');
        const decM = String(Math.floor((hash * 5400) % 60)).padStart(2, '0');
        const mag = (1.2 + ((hash * 10) % 3.8)).toFixed(1);
        return `RA ${raH}h ${raM}m · DEC ${decSign}${decD}° ${decM}' · MAG +${mag}`;
    }

    class Star {
        constructor(id, randomizeZ = true) {
            this.id = id;
            this.reset(randomizeZ);
        }

        reset(randomizeZ = false) {
            this.x = (Math.random() - 0.5) * width * 2.2;
            this.y = (Math.random() - 0.5) * height * 2.2;
            this.z = randomizeZ ? (10 + Math.random() * (MAX_Z - 10)) : MAX_Z;
            this.baseSize = Math.random() < 0.08 ? 3.0 : (Math.random() < 0.32 ? 2.2 : 1.4);
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = 0.025 + Math.random() * 0.035;
            this.baseSpeed = 1.3 + Math.random() * 1.5;
            this.speed = this.baseSpeed;
            this.hasSpikes = Math.random() < 0.06;
            
            this.screenX = 0;
            this.screenY = 0;
            this.prevScreenX = 0;
            this.prevScreenY = 0;
            this.projectedSize = 0;
            this.alpha = 0;
            this.visible = false;
            this.streakLength = 0;
        }

        update(effectiveWarp) {
            this.speed = this.baseSpeed * effectiveWarp;
            this.z -= this.speed;

            if (this.z <= 10) {
                this.reset(false);
            }

            this.twinklePhase += this.twinkleSpeed;

            // 3D Perspective Projection
            const scale = FOCAL_LENGTH / this.z;
            const depthFactor = 1 - (this.z / MAX_Z);

            // Gravitational Spacetime Well Influence
            if (gravityWell.strength > 0.01) {
                const curScreenX = (width / 2) + (this.x + camX * depthFactor * 1.6) * scale;
                const curScreenY = (height / 2) + (this.y + (camY + scrollY * 0.2) * depthFactor * 1.6) * scale;
                const dx = gravityWell.x - curScreenX;
                const dy = gravityWell.y - curScreenY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 320 && dist > 8) {
                    const pull = (1 - (dist / 320)) * gravityWell.strength * 4.5;
                    const normX = dx / dist;
                    const normY = dy / dist;
                    
                    // Radial inward attraction + orbital swirl
                    this.x += (normX * pull * 4.0 - normY * pull * 3.5) / scale;
                    this.y += (normY * pull * 4.0 + normX * pull * 3.5) / scale;
                }
            }

            // Save previous screen position for warp motion streaks
            this.prevScreenX = this.screenX;
            this.prevScreenY = this.screenY;

            this.screenX = (width / 2) + (this.x + camX * depthFactor * 1.6) * scale;
            this.screenY = (height / 2) + (this.y + (camY + scrollY * 0.2) * depthFactor * 1.6) * scale;
            this.projectedSize = Math.max(0.9, Math.min(4.8, this.baseSize * scale * 1.6));

            const twinkle = 0.8 + 0.2 * Math.sin(this.twinklePhase);
            this.alpha = Math.max(0.22, Math.min(1.0, (0.35 + depthFactor * 0.70) * twinkle));

            // Calculate motion streak length during warp acceleration
            if (effectiveWarp > 1.3) {
                const warpDx = this.screenX - this.prevScreenX;
                const warpDy = this.screenY - this.prevScreenY;
                this.streakLength = Math.sqrt(warpDx * warpDx + warpDy * warpDy);
            } else {
                this.streakLength = 0;
            }

            this.visible = (
                this.screenX >= -30 &&
                this.screenX <= width + 30 &&
                this.screenY >= -30 &&
                this.screenY <= height + 30 &&
                this.z > 10
            );
        }

        draw(ctx, effectiveWarp) {
            if (!this.visible || this.alpha <= 0.02) return;

            // Render Warp Motion Streak when accelerating
            if (effectiveWarp > 1.3 && this.streakLength > 1.5) {
                const trailX = this.screenX - (this.screenX - (width / 2)) * (0.04 * effectiveWarp);
                const trailY = this.screenY - (this.screenY - (height / 2)) * (0.04 * effectiveWarp);

                const grad = ctx.createLinearGradient(trailX, trailY, this.screenX, this.screenY);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(1, starColor);

                ctx.globalAlpha = Math.min(0.95, this.alpha * 1.2);
                ctx.strokeStyle = grad;
                ctx.lineWidth = Math.max(1.0, this.projectedSize * 0.85);
                ctx.beginPath();
                ctx.moveTo(trailX, trailY);
                ctx.lineTo(this.screenX, this.screenY);
                ctx.stroke();
            }

            // Soft radial glow for nearby bright stars
            if (this.z < MAX_Z * 0.45 && this.projectedSize > 1.8) {
                const glowRad = this.projectedSize * 2.8;
                ctx.globalAlpha = this.alpha * 0.35;
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
            if (this.hasSpikes && this.z < MAX_Z * 0.5 && effectiveWarp < 2.0) {
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
            this.length = 90 + Math.random() * 140;
            this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3;
            this.speed = 14 + Math.random() * 10;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.life = 1.0;
            this.decay = 0.016 + Math.random() * 0.016;
        }

        update() {
            if (!this.active) return;
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            if (this.life <= 0 || this.x > width + 120 || this.y > height + 120) {
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

            ctx.globalAlpha = Math.min(0.9, this.life);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
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
            hudBgColor = 'rgba(10, 10, 10, 0.75)';
        } else {
            starColor = '#111111';
            lineColor = '#222222';
            hudBgColor = 'rgba(255, 255, 255, 0.85)';
        }
    }

    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star(i, true));
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

    // Draw Constellation Vectors & Astrometry Coordinates HUD
    function drawConstellationVectors() {
        const count = stars.length;
        ctx.lineWidth = 1.05;
        let activeHudLabels = 0;

        for (let i = 0; i < count; i++) {
            const s1 = stars[i];
            if (!s1.visible) continue;

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

                        // Render Astrometry Coordinates HUD when vector is prominent
                        if (lineAlpha > 0.16 && activeHudLabels < MAX_HUD_LABELS && warpFactor < 1.6) {
                            const midX = (s1.screenX + s2.screenX) / 2;
                            const midY = (s1.screenY + s2.screenY) / 2;

                            if (midX > 60 && midX < width - 180 && midY > 40 && midY < height - 40) {
                                const tag = generateAstrometryTag(s1.id, s2.id);
                                const textAlpha = Math.min(0.65, (lineAlpha - 0.16) * 3.5);

                                ctx.save();
                                ctx.font = '8.5px "Space Mono", monospace';
                                ctx.textBaseline = 'middle';
                                const textWidth = ctx.measureText(tag).width;

                                // Micro Bracket Box
                                ctx.globalAlpha = textAlpha * 0.4;
                                ctx.fillStyle = hudBgColor;
                                ctx.fillRect(midX + 8, midY - 7, textWidth + 8, 14);

                                ctx.strokeStyle = lineColor;
                                ctx.lineWidth = 0.8;
                                ctx.strokeRect(midX + 8, midY - 7, textWidth + 8, 14);

                                // Coordinates Monospace Text
                                ctx.globalAlpha = textAlpha;
                                ctx.fillStyle = starColor;
                                ctx.fillText(tag, midX + 12, midY + 0.5);
                                ctx.restore();

                                activeHudLabels++;
                            }
                        }
                    }
                }
            }
        }
    }

    // Draw Gravitational Singularity Pulse Waves
    function drawGravityPulses() {
        for (let i = gravityWell.pulses.length - 1; i >= 0; i--) {
            const p = gravityWell.pulses[i];
            p.radius += 4.5;
            p.alpha *= 0.94;

            if (p.alpha <= 0.01 || p.radius >= p.maxRadius) {
                gravityWell.pulses.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Active Spacetime Well Indicator (when mouse held down)
        if (gravityWell.strength > 0.05) {
            ctx.save();
            ctx.globalAlpha = gravityWell.strength * 0.45;
            ctx.strokeStyle = starColor;
            ctx.lineWidth = 1.4;

            // Reticle Target Ring
            ctx.beginPath();
            ctx.arc(gravityWell.x, gravityWell.y, 22 * gravityWell.strength, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Pulsing Event Horizon
            ctx.fillStyle = starColor;
            ctx.globalAlpha = gravityWell.strength * 0.8;
            ctx.beginPath();
            ctx.arc(gravityWell.x, gravityWell.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function loop() {
        if (!isRunning) return;

        ctx.clearRect(0, 0, width, height);

        // Calculate scroll velocity & decay warp factor smoothly
        const now = Date.now();
        const dt = Math.max(1, now - lastScrollTime);
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const dScroll = Math.abs(currentScroll - lastScrollY);
        
        scrollVelocity = (dScroll / dt) * 16.6;
        lastScrollY = currentScroll;
        lastScrollTime = now;

        const targetWarp = 1.0 + Math.min(4.5, scrollVelocity * 0.28);
        warpFactor += (targetWarp - warpFactor) * 0.12;

        // Smooth camera lerp
        camX += (targetCamX - camX) * 0.08;
        camY += (targetCamY - camY) * 0.08;
        scrollY += (targetScrollY - scrollY) * 0.1;

        // Gravity well strength lerp
        gravityWell.strength += (gravityWell.targetStrength - gravityWell.strength) * 0.15;

        // Update all stars with dynamic warp factor
        for (let i = 0; i < stars.length; i++) {
            stars[i].update(warpFactor);
        }

        // Draw transient constellation lines & Astrometry HUD
        drawConstellationVectors();

        // Draw stars and motion streaks
        for (let i = 0; i < stars.length; i++) {
            stars[i].draw(ctx, warpFactor);
        }

        // Draw Gravitational Spacetime Well Pulses
        drawGravityPulses();

        // Spawn and update meteors
        if (now > nextMeteorTime && warpFactor < 1.5) {
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

        // Mouse Parallax & Gravitational Spacetime Well listeners
        window.addEventListener('mousemove', (e) => {
            const normX = (e.clientX / window.innerWidth) - 0.5;
            const normY = (e.clientY / window.innerHeight) - 0.5;
            targetCamX = -normX * 95;
            targetCamY = -normY * 75;

            if (gravityWell.active) {
                gravityWell.x = e.clientX;
                gravityWell.y = e.clientY;
            }
        }, { passive: true });

        // Gravity Singularity Hold-Click Handler (ignores buttons, links, inputs, and nav brand)
        window.addEventListener('pointerdown', (e) => {
            const tag = e.target.tagName.toLowerCase();
            const isInteractive = (
                tag === 'button' ||
                tag === 'a' ||
                tag === 'input' ||
                tag === 'textarea' ||
                tag === 'select' ||
                e.target.closest('button, a, input, textarea, select, .nav-brand, .ambient-hud, .command-palette')
            );

            if (!isInteractive && e.button === 0) {
                gravityWell.active = true;
                gravityWell.x = e.clientX;
                gravityWell.y = e.clientY;
                gravityWell.targetStrength = 1.0;
            }
        });

        const releaseGravity = () => {
            if (gravityWell.active) {
                gravityWell.active = false;
                gravityWell.targetStrength = 0;
                // Emit expanding shockwave pulse ring
                gravityWell.pulses.push({
                    x: gravityWell.x,
                    y: gravityWell.y,
                    radius: 20,
                    maxRadius: 220,
                    alpha: 0.75
                });
            }
        };

        window.addEventListener('pointerup', releaseGravity);
        window.addEventListener('pointercancel', releaseGravity);

        // Scroll Parallax & Scroll Velocity Tracker
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
                stars[i].update(1.0);
            }
            drawConstellationVectors();
            for (let i = 0; i < stars.length; i++) {
                stars[i].draw(ctx, 1.0);
            }
        } else {
            isRunning = true;
            animId = requestAnimationFrame(loop);
        }

        console.log('🌌 3D Celestial Space Suite (Warp · Gravitational Well · Astrometry HUD) initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
