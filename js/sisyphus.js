// ========================================
// SISYPHUS ANIMATION
// Cubic Bézier hill — flat base, steep middle, visible crest.
// Hover → push.  Click (hold) → push faster.  Mouse leave → roll back.
// ========================================

(function initSisyphus() {
    const container = document.getElementById('sisyphus-container');
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        container.style.display = 'none';
        return;
    }

    // ─── Canvas ────────────────────────────────────────────────────────────────
    let W = container.clientWidth  || 240;
    let H = container.clientHeight || 150;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // ─── Theme ─────────────────────────────────────────────────────────────────
    function getColor() {
        return document.documentElement.getAttribute('data-theme') === 'dark'
            ? '#ffffff' : '#000000';
    }

    // ─── Cubic Bézier hill ─────────────────────────────────────────────────────
    // P3 is kept LOW enough (28% from top) so the figure's head always stays
    // in frame — feet land at ~H*0.25 at the crest, head at ~H*0.06.
    let P0, P1, P2, P3;
    let BOULDER_R, STICK_H;

    function recomputeGeometry() {
        P0 = { x: W * 0.02, y: H * 0.91 };  // base of hill
        P1 = { x: W * 0.22, y: H * 0.88 };  // gentle start → long flat base
        P2 = { x: W * 0.52, y: H * 0.06 };  // steep pull upward
        P3 = { x: W * 0.95, y: H * 0.28 };  // crest — low enough to stay in frame
        BOULDER_R = Math.max(7, Math.round(Math.min(W, H) * 0.080));
        STICK_H   = Math.max(20, Math.round(H * 0.20));
    }

    // ─── Bézier math ───────────────────────────────────────────────────────────
    function bezierPoint(t) {
        const mt = 1 - t;
        return {
            x: mt*mt*mt*P0.x + 3*mt*mt*t*P1.x + 3*mt*t*t*P2.x + t*t*t*P3.x,
            y: mt*mt*mt*P0.y + 3*mt*mt*t*P1.y + 3*mt*t*t*P2.y + t*t*t*P3.y,
        };
    }

    function bezierTangent(t) {
        const mt = 1 - t;
        const dx = 3*(mt*mt*(P1.x-P0.x) + 2*mt*t*(P2.x-P1.x) + t*t*(P3.x-P2.x));
        const dy = 3*(mt*mt*(P1.y-P0.y) + 2*mt*t*(P2.y-P1.y) + t*t*(P3.y-P2.y));
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        return { x: dx/len, y: dy/len };
    }

    // Surface normal pointing ABOVE the slope
    // CW rotation in standard-math coords: (tx,ty) → (ty,−tx)
    // For uphill tangent (tx>0, ty<0): result is (ty<0, −tx<0) → left-and-up ✓
    function bezierNormal(t) {
        const tan = bezierTangent(t);
        return { x: tan.y, y: -tan.x };
    }

    function bezierAngle(t) {
        const tan = bezierTangent(t);
        return Math.atan2(tan.y, tan.x);
    }

    // ─── State ─────────────────────────────────────────────────────────────────
    const IDLE_T        = 0.07;
    const MAX_T         = 0.90;   // stop before crest clips top edge
    const PUSH_SPEED    = 0.024;  // normal hover speed
    const PUSH_SPEED_FAST = 0.072; // click-held speed (3× faster)
    const ROLL_SPEED    = 0.095;

    let t            = IDLE_T;
    let boulderAngle = 0;
    let isHovered    = false;
    let isClicking   = false;
    let rolling      = false;
    let lastTime     = performance.now();
    let frameId      = null;

    // ─── Input events ──────────────────────────────────────────────────────────
    canvas.addEventListener('mouseenter', () => { isHovered = true;  rolling = false; });
    canvas.addEventListener('mouseleave', () => { isHovered = false; isClicking = false; });
    canvas.addEventListener('mousedown',  () => { if (isHovered) isClicking = true; });
    canvas.addEventListener('mouseup',    () => { isClicking = false; });

    // Safety: release on global mouseup too (e.g., drag out)
    window.addEventListener('mouseup', () => { isClicking = false; });

    // ─── Draw: hill ────────────────────────────────────────────────────────────
    function drawHill(color) {
        ctx.beginPath();
        ctx.moveTo(P0.x, H);
        ctx.lineTo(P0.x, P0.y);
        ctx.bezierCurveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y);
        ctx.lineTo(P3.x, H);
        ctx.closePath();
        ctx.fillStyle   = color;
        ctx.globalAlpha = 0.07;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.moveTo(P0.x, P0.y);
        ctx.bezierCurveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.stroke();
    }

    // ─── Draw: click-burst indicator ───────────────────────────────────────────
    // Small radiating arcs when clicking to give tactile feedback
    let burstFrames = 0;
    function drawBurst(bx, by, color) {
        if (burstFrames <= 0) return;
        const r = BOULDER_R * (1.4 + (8 - burstFrames) * 0.18);
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = burstFrames / 8 * 0.35;
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        burstFrames--;
    }

    // ─── Draw: boulder ─────────────────────────────────────────────────────────
    function drawBoulder(bx, by, angle, color) {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.arc(0, 0, BOULDER_R, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.globalAlpha = 0.09;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.stroke();

        // Crack texture (rotates with boulder for rolling feel)
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.moveTo(-BOULDER_R * 0.45, -BOULDER_R * 0.12);
        ctx.lineTo( BOULDER_R * 0.08,  BOULDER_R * 0.38);
        ctx.lineTo( BOULDER_R * 0.40, -BOULDER_R * 0.08);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    // ─── Draw: stick figure ────────────────────────────────────────────────────
    function drawSisyphus(sx, sy, angle, pushing, color) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        const s = STICK_H;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';

        const lean = pushing ? -0.28 : (rolling ? 0.10 : 0);
        ctx.save();
        ctx.rotate(lean);

        // Head
        ctx.beginPath();
        ctx.arc(0, -s * 0.87, s * 0.12, 0, Math.PI * 2);
        ctx.stroke();

        // Torso
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.75);
        ctx.lineTo(0, -s * 0.38);
        ctx.stroke();

        if (pushing) {
            // Arms thrust forward toward the boulder
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.62);
            ctx.lineTo( s * 0.30, -s * 0.75);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.62);
            ctx.lineTo( s * 0.30, -s * 0.50);
            ctx.stroke();
        } else {
            // Arms hanging loose / despairing
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.62);
            ctx.lineTo(-s * 0.18, -s * 0.36);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.62);
            ctx.lineTo( s * 0.18, -s * 0.36);
            ctx.stroke();
        }

        // Legs — walk cycle only while pushing; faster when clicking
        const walkSpeed = isClicking ? 38 : 22;
        const walk = pushing ? Math.sin(t * Math.PI * walkSpeed) * 0.22 : 0;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.38);
        ctx.lineTo(-s * (0.15 + walk), 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.38);
        ctx.lineTo( s * (0.15 + walk), 0);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    // ─── Frame loop ────────────────────────────────────────────────────────────
    function frame(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.06);
        lastTime = ts;

        const color   = getColor();
        ctx.clearRect(0, 0, W, H);
        drawHill(color);

        const pushing = isHovered && !rolling;
        const speed   = (pushing && isClicking) ? PUSH_SPEED_FAST : PUSH_SPEED;

        if (pushing) {
            t            += speed * dt;
            boulderAngle -= speed * dt * 9;
            if (isClicking) burstFrames = 8; // trigger burst ring
            if (t >= MAX_T) { rolling = true; } // fate intervenes at the crest
        } else if (rolling || t > IDLE_T + 0.005) {
            rolling       = true;
            t            -= ROLL_SPEED * dt;
            boulderAngle += ROLL_SPEED * dt * 11;
            if (t <= IDLE_T) { t = IDLE_T; rolling = false; }
        }

        const pt    = bezierPoint(t);
        const norm  = bezierNormal(t);
        const angle = bezierAngle(t);

        const bx = pt.x + norm.x * BOULDER_R;
        const by = pt.y + norm.y * BOULDER_R;

        drawBoulder(bx, by, boulderAngle, color);
        drawBurst(bx, by, color);
        drawSisyphus(pt.x, pt.y, angle, pushing, color);

        frameId = requestAnimationFrame(frame);
    }

    // ─── Resize ────────────────────────────────────────────────────────────────
    function resize() {
        W = container.clientWidth  || 240;
        H = container.clientHeight || 150;
        canvas.width  = W;
        canvas.height = H;
        canvas.style.width  = '100%';
        canvas.style.height = '100%';
        recomputeGeometry();
    }

    // ─── Boot ──────────────────────────────────────────────────────────────────
    resize();
    lastTime = performance.now();
    frameId  = requestAnimationFrame(frame);

    window.addEventListener('resize', resize);
    window.addEventListener('unload', () => { if (frameId) cancelAnimationFrame(frameId); });

    if (typeof logger !== 'undefined') logger.log('🪨 Sisyphus initialized');
})();
