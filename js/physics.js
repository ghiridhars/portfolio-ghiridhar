// ========================================
// PHYSICS ENGINE FOR UI INTERACTIONS
// Custom spring physics, magnetic effects, momentum
// Requires: utils.js (for logger)
// ========================================

/**
 * Vector2D - Basic 2D vector math
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        if (scalar === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return this.divide(mag);
    }

    limit(max) {
        if (this.magnitude() > max) {
            return this.normalize().multiply(max);
        }
        return new Vector2D(this.x, this.y);
    }

    distance(v) {
        return this.subtract(v).magnitude();
    }

    static lerp(a, b, t) {
        return new Vector2D(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }
}

/**
 * Spring - Realistic spring physics simulation
 */
class Spring {
    constructor(options = {}) {
        this.stiffness = options.stiffness || 150;  // Spring constant (k)
        this.damping = options.damping || 15;       // Damping coefficient
        this.mass = options.mass || 1;              // Mass
        this.precision = options.precision || 0.01; // Settling threshold
        
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.target = new Vector2D(0, 0);
        
        this.isSettled = true;
        this.onUpdate = options.onUpdate || null;
        this.onSettle = options.onSettle || null;
    }

    setTarget(x, y) {
        this.target = new Vector2D(x, y);
        this.isSettled = false;
    }

    setPosition(x, y) {
        this.position = new Vector2D(x, y);
    }

    update(deltaTime) {
        if (this.isSettled) return;

        // Clamp deltaTime to prevent instability
        const dt = Math.min(deltaTime, 0.064);

        // Spring force: F = -k * displacement
        const displacement = this.position.subtract(this.target);
        const springForce = displacement.multiply(-this.stiffness);

        // Damping force: F = -c * velocity
        const dampingForce = this.velocity.multiply(-this.damping);

        // Total force and acceleration (F = ma, so a = F/m)
        const totalForce = springForce.add(dampingForce);
        const acceleration = totalForce.divide(this.mass);

        // Update velocity and position (semi-implicit Euler)
        this.velocity = this.velocity.add(acceleration.multiply(dt));
        this.position = this.position.add(this.velocity.multiply(dt));

        // Check if settled
        const velocityMag = this.velocity.magnitude();
        const distanceToTarget = this.position.distance(this.target);

        if (velocityMag < this.precision && distanceToTarget < this.precision) {
            this.position = new Vector2D(this.target.x, this.target.y);
            this.velocity = new Vector2D(0, 0);
            this.isSettled = true;
            if (this.onSettle) this.onSettle();
        }

        if (this.onUpdate) {
            this.onUpdate(this.position.x, this.position.y);
        }
    }
}

/**
 * PhysicsBody - A physics-enabled element
 */
class PhysicsBody {
    constructor(element, options = {}) {
        this.element = element;
        this.mass = options.mass || 1;
        this.friction = options.friction || 0.95;
        this.bounciness = options.bounciness || 0.7;
        this.gravityScale = options.gravityScale || 0;
        
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        
        this.isDragging = false;
        this.dragOffset = new Vector2D(0, 0);
        this.lastMousePos = new Vector2D(0, 0);
        
        this.bounds = options.bounds || null; // { left, right, top, bottom }
        this.onUpdate = options.onUpdate || null;
    }

    applyForce(force) {
        // F = ma, so a = F/m
        const f = force.divide(this.mass);
        this.acceleration = this.acceleration.add(f);
    }

    update(deltaTime, gravity = new Vector2D(0, 0)) {
        if (this.isDragging) return;

        const dt = Math.min(deltaTime, 0.064);

        // Apply gravity
        if (this.gravityScale > 0) {
            this.applyForce(gravity.multiply(this.mass * this.gravityScale));
        }

        // Update velocity
        this.velocity = this.velocity.add(this.acceleration.multiply(dt));
        
        // Apply friction
        this.velocity = this.velocity.multiply(this.friction);

        // Update position
        this.position = this.position.add(this.velocity.multiply(dt * 60));

        // Boundary collision
        if (this.bounds) {
            this.handleBoundaryCollision();
        }

        // Reset acceleration
        this.acceleration = new Vector2D(0, 0);

        // Apply to element
        this.applyTransform();

        if (this.onUpdate) {
            this.onUpdate(this.position, this.velocity);
        }
    }

    handleBoundaryCollision() {
        const { left, right, top, bottom } = this.bounds;

        if (this.position.x < left) {
            this.position.x = left;
            this.velocity.x *= -this.bounciness;
        } else if (this.position.x > right) {
            this.position.x = right;
            this.velocity.x *= -this.bounciness;
        }

        if (this.position.y < top) {
            this.position.y = top;
            this.velocity.y *= -this.bounciness;
        } else if (this.position.y > bottom) {
            this.position.y = bottom;
            this.velocity.y *= -this.bounciness;
        }
    }

    applyTransform() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    startDrag(mouseX, mouseY) {
        this.isDragging = true;
        this.dragOffset = new Vector2D(
            mouseX - this.position.x,
            mouseY - this.position.y
        );
        this.lastMousePos = new Vector2D(mouseX, mouseY);
        this.velocity = new Vector2D(0, 0);
    }

    drag(mouseX, mouseY) {
        if (!this.isDragging) return;

        const newPos = new Vector2D(
            mouseX - this.dragOffset.x,
            mouseY - this.dragOffset.y
        );

        // Calculate velocity from mouse movement
        this.velocity = newPos.subtract(this.position).multiply(0.5);
        this.position = newPos;
        this.lastMousePos = new Vector2D(mouseX, mouseY);

        this.applyTransform();
    }

    endDrag() {
        this.isDragging = false;
        // Velocity is already set from drag movement
    }
}

/**
 * MagneticElement - Element that's attracted to cursor
 */
class MagneticElement {
    constructor(element, options = {}) {
        this.element = element;
        this.strength = options.strength || 0.3;
        this.radius = options.radius || 100;
        this.spring = new Spring({
            stiffness: options.stiffness || 200,
            damping: options.damping || 20,
            onUpdate: (x, y) => {
                this.element.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
        
        this.originalRect = null;
        this.isActive = true;
    }

    updateRect() {
        this.originalRect = this.element.getBoundingClientRect();
    }

    attract(mouseX, mouseY) {
        if (!this.isActive || !this.originalRect) return;

        const centerX = this.originalRect.left + this.originalRect.width / 2;
        const centerY = this.originalRect.top + this.originalRect.height / 2;

        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + 
            Math.pow(mouseY - centerY, 2)
        );

        if (distance < this.radius) {
            // Calculate attraction based on distance
            const pull = (1 - distance / this.radius) * this.strength;
            const deltaX = (mouseX - centerX) * pull;
            const deltaY = (mouseY - centerY) * pull;
            
            this.spring.setTarget(deltaX, deltaY);
        } else {
            this.spring.setTarget(0, 0);
        }
    }

    update(deltaTime) {
        this.spring.update(deltaTime);
    }
}

/**
 * BounceElement - Bouncy hover/click effects
 */
class BounceElement {
    constructor(element, options = {}) {
        this.element = element;
        this.scaleSpring = new Spring({
            stiffness: options.stiffness || 300,
            damping: options.damping || 15,
            onUpdate: (x) => {
                this.element.style.transform = `scale(${1 + x})`;
            }
        });
        this.scaleSpring.setPosition(0, 0);
        
        this.hoverScale = options.hoverScale || 0.05;
        this.clickScale = options.clickScale || -0.1;
        
        this.setupEvents();
    }

    setupEvents() {
        this.element.addEventListener('mouseenter', () => {
            this.scaleSpring.setTarget(this.hoverScale, 0);
        });

        this.element.addEventListener('mouseleave', () => {
            this.scaleSpring.setTarget(0, 0);
        });

        this.element.addEventListener('mousedown', () => {
            this.scaleSpring.setTarget(this.clickScale, 0);
        });

        this.element.addEventListener('mouseup', () => {
            this.scaleSpring.setTarget(this.hoverScale, 0);
        });
    }

    update(deltaTime) {
        this.scaleSpring.update(deltaTime);
    }
}

/**
 * TiltElement - 3D tilt on hover
 */
class TiltElement {
    constructor(element, options = {}) {
        this.element = element;
        this.maxTilt = options.maxTilt || 15;
        this.perspective = options.perspective || 1000;
        this.scale = options.scale || 1.02;
        
        this.springX = new Spring({ stiffness: 200, damping: 20 });
        this.springY = new Spring({ stiffness: 200, damping: 20 });
        this.springScale = new Spring({ stiffness: 300, damping: 20 });
        
        this.springX.setPosition(0, 0);
        this.springY.setPosition(0, 0);
        this.springScale.setPosition(1, 0);
        
        this.isHovering = false;
        this.rect = null;
        
        this.setupEvents();
    }

    setupEvents() {
        this.element.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.rect = this.element.getBoundingClientRect();
            this.springScale.setTarget(this.scale, 0);
        });

        this.element.addEventListener('mousemove', (e) => {
            if (!this.isHovering || !this.rect) return;

            const x = e.clientX - this.rect.left;
            const y = e.clientY - this.rect.top;
            
            const centerX = this.rect.width / 2;
            const centerY = this.rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -this.maxTilt;
            const rotateY = ((x - centerX) / centerX) * this.maxTilt;
            
            this.springX.setTarget(rotateX, 0);
            this.springY.setTarget(rotateY, 0);
        });

        this.element.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.springX.setTarget(0, 0);
            this.springY.setTarget(0, 0);
            this.springScale.setTarget(1, 0);
        });
    }

    update(deltaTime) {
        this.springX.update(deltaTime);
        this.springY.update(deltaTime);
        this.springScale.update(deltaTime);
        
        const rotateX = this.springX.position.x;
        const rotateY = this.springY.position.x;
        const scale = this.springScale.position.x;
        
        this.element.style.transform = `
            perspective(${this.perspective}px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
    }
}

/**
 * RippleEffect - Material-style ripple on click
 */
class RippleEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.color = options.color || 'var(--text-dark)';
        this.duration = options.duration || 600;
        
        this.element.style.position = 'relative';
        this.element.style.overflow = 'hidden';
        
        this.setupEvents();
    }

    setupEvents() {
        this.element.addEventListener('click', (e) => {
            this.createRipple(e);
        });
    }

    createRipple(e) {
        const rect = this.element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'physics-ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: ${this.color};
            opacity: 0.3;
            pointer-events: none;
            transform: scale(0);
            animation: ripple-expand ${this.duration}ms ease-out forwards;
            width: ${size}px;
            height: ${size}px;
            left: ${e.clientX - rect.left - size / 2}px;
            top: ${e.clientY - rect.top - size / 2}px;
        `;
        
        this.element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, this.duration);
    }
}

/**
 * FloatingElement - Gentle floating animation
 */
class FloatingElement {
    constructor(element, options = {}) {
        this.element = element;
        this.amplitude = options.amplitude || 10;
        this.frequency = options.frequency || 0.5;
        this.phase = options.phase || Math.random() * Math.PI * 2;
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;
        const y = Math.sin(this.time * this.frequency * Math.PI * 2 + this.phase) * this.amplitude;
        const x = Math.cos(this.time * this.frequency * 0.5 * Math.PI * 2 + this.phase) * (this.amplitude * 0.3);
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }
}

/**
 * GravityDrop - Elements fall with gravity on trigger
 */
class GravityDrop {
    constructor(elements, options = {}) {
        this.bodies = [];
        this.gravity = new Vector2D(0, options.gravity || 980);
        this.isActive = false;
        
        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const body = new PhysicsBody(el, {
                mass: 1 + Math.random() * 0.5,
                friction: 0.99,
                bounciness: 0.6 + Math.random() * 0.2,
                gravityScale: 1,
                bounds: {
                    left: -window.innerWidth,
                    right: window.innerWidth,
                    top: -window.innerHeight,
                    bottom: window.innerHeight - rect.top + 100
                }
            });
            
            // Random initial rotation velocity
            body.rotationVel = (Math.random() - 0.5) * 10;
            body.rotation = 0;
            
            this.bodies.push(body);
        });
    }

    trigger() {
        this.isActive = true;
        // Add random initial velocities
        this.bodies.forEach(body => {
            body.velocity = new Vector2D(
                (Math.random() - 0.5) * 200,
                -Math.random() * 300
            );
        });
    }

    update(deltaTime) {
        if (!this.isActive) return;
        
        this.bodies.forEach(body => {
            body.update(deltaTime, this.gravity);
            body.rotation += body.rotationVel * deltaTime;
            body.element.style.transform = `
                translate(${body.position.x}px, ${body.position.y}px) 
                rotate(${body.rotation}deg)
            `;
        });
    }
}

/**
 * ElasticString - Connect elements with elastic strings
 */
class ElasticString {
    constructor(elementA, elementB, options = {}) {
        this.elementA = elementA;
        this.elementB = elementB;
        this.restLength = options.restLength || 100;
        this.stiffness = options.stiffness || 0.1;
        this.damping = options.damping || 0.9;
        
        this.canvas = null;
        this.ctx = null;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'elastic-string-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        const rectA = this.elementA.getBoundingClientRect();
        const rectB = this.elementB.getBoundingClientRect();
        
        const ax = rectA.left + rectA.width / 2;
        const ay = rectA.top + rectA.height / 2;
        const bx = rectB.left + rectB.width / 2;
        const by = rectB.top + rectB.height / 2;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw elastic curve
        this.ctx.beginPath();
        this.ctx.moveTo(ax, ay);
        
        // Calculate control point for curve
        const midX = (ax + bx) / 2;
        const midY = (ay + by) / 2;
        const distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
        const sag = Math.min(distance * 0.2, 50);
        
        this.ctx.quadraticCurveTo(midX, midY + sag, bx, by);
        
        this.ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-dark').trim();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    destroy() {
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

/**
 * PhysicsWorld - Main physics simulation manager
 */
class PhysicsWorld {
    constructor() {
        this.magneticElements = [];
        this.bounceElements = [];
        this.tiltElements = [];
        this.floatingElements = [];
        this.draggableBodies = [];
        this.gravityDrops = [];
        
        this.lastTime = performance.now();
        this.isRunning = false;
        this.mousePos = new Vector2D(0, 0);
        
        this.setupMouseTracking();
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mousePos = new Vector2D(e.clientX, e.clientY);
            
            // Update magnetic elements
            this.magneticElements.forEach(mag => {
                mag.attract(e.clientX, e.clientY);
            });
        });
    }

    addMagnetic(element, options = {}) {
        const magnetic = new MagneticElement(element, options);
        magnetic.updateRect();
        this.magneticElements.push(magnetic);
        return magnetic;
    }

    addBounce(element, options = {}) {
        const bounce = new BounceElement(element, options);
        this.bounceElements.push(bounce);
        return bounce;
    }

    addTilt(element, options = {}) {
        const tilt = new TiltElement(element, options);
        this.tiltElements.push(tilt);
        return tilt;
    }

    addFloating(element, options = {}) {
        const floating = new FloatingElement(element, options);
        this.floatingElements.push(floating);
        return floating;
    }

    addRipple(element, options = {}) {
        return new RippleEffect(element, options);
    }

    addDraggable(element, options = {}) {
        const body = new PhysicsBody(element, options);
        
        element.style.cursor = 'grab';
        element.style.userSelect = 'none';
        
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            body.startDrag(e.clientX, e.clientY);
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (body.isDragging) {
                body.drag(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (body.isDragging) {
                body.endDrag();
                element.style.cursor = 'grab';
            }
        });

        this.draggableBodies.push(body);
        return body;
    }

    addGravityDrop(elements, options = {}) {
        const drop = new GravityDrop(elements, options);
        this.gravityDrops.push(drop);
        return drop;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
        logger.log('🎱 Physics engine started');
    }

    stop() {
        this.isRunning = false;
        logger.log('🎱 Physics engine stopped');
    }

    loop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update all physics objects
        this.magneticElements.forEach(m => m.update(deltaTime));
        this.bounceElements.forEach(b => b.update(deltaTime));
        this.tiltElements.forEach(t => t.update(deltaTime));
        this.floatingElements.forEach(f => f.update(deltaTime));
        this.draggableBodies.forEach(d => d.update(deltaTime));
        this.gravityDrops.forEach(g => g.update(deltaTime));

        requestAnimationFrame(() => this.loop());
    }

    // Update rects on resize
    handleResize() {
        this.magneticElements.forEach(m => m.updateRect());
    }
}

// ========================================
// INITIALIZE PHYSICS ON DOM READY
// ========================================

let physicsWorld = null;

function initPhysics() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        logger.log('🎱 Physics disabled (reduced motion preference)');
        return;
    }

    physicsWorld = new PhysicsWorld();

    // Add magnetic effect to buttons
    document.querySelectorAll('.btn, .btn-primary, .btn-secondary').forEach(btn => {
        physicsWorld.addMagnetic(btn, {
            strength: 0.4,
            radius: 120,
            stiffness: 180,
            damping: 18
        });
    });

    // Add bounce effect to nav links
    document.querySelectorAll('.nav-menu a, .nav-logo').forEach(link => {
        physicsWorld.addBounce(link, {
            hoverScale: 0.08,
            clickScale: -0.05,
            stiffness: 400,
            damping: 12
        });
    });

    // Add tilt effect to cards
    document.querySelectorAll('.portfolio-item, .book-card, .stat-card, .project-card').forEach(card => {
        physicsWorld.addTilt(card, {
            maxTilt: 8,
            scale: 1.02,
            perspective: 1000
        });
    });

    // Add ripple to interactive elements
    document.querySelectorAll('.btn, .theme-toggle, .nav-toggle').forEach(el => {
        physicsWorld.addRipple(el);
    });

    // Add floating effect to specific elements
    document.querySelectorAll('.hero-title .highlight').forEach((el, i) => {
        physicsWorld.addFloating(el, {
            amplitude: 5,
            frequency: 0.3,
            phase: i * 0.5
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        physicsWorld.handleResize();
    });

    // Start the physics loop
    physicsWorld.start();

    logger.log('🎱 Physics UI initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhysics);
} else {
    initPhysics();
}

// Export for use in other scripts
window.PhysicsWorld = PhysicsWorld;
window.physicsWorld = physicsWorld;
