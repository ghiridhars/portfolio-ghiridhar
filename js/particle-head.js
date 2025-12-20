/* ========================================
   PARTICLE HEAD - Three.js 3D Animation
   Brutalist style rotating head
   ======================================== */

const ParticleHead = {
    CONFIG: {
        particleCount: 8000,
        particleSize: 0.025,
        rotationSpeed: 0.002,
        mouseInfluence: 0.15
    },

    scene: null,
    camera: null,
    renderer: null,
    particlesMesh: null,
    mouseX: 0,
    mouseY: 0,
    container: null,
    material: null,
    isInitialized: false,

    init() {
        this.container = document.getElementById('particle-head-container');
        if (!this.container) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.CONFIG.rotationSpeed = 0;
            this.CONFIG.mouseInfluence = 0;
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.getBackgroundColor(), 0.12);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 7;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Create the particle head
        this.createParticleHead();

        // Events
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Listen for theme changes
        this.observeThemeChanges();

        this.isInitialized = true;
        this.animate();
    },

    getBackgroundColor() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? 0x000000 : 0xffffff;
    },

    getParticleColor() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? 0xffffff : 0x000000;
    },

    createParticleHead() {
        // Start with a dense Icosahedron as base
        const geometry = new THREE.IcosahedronGeometry(1.8, 16);
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        const positions = [];

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);

            // SCULPTING THE HEAD
            // 1. Elongate vertically
            vertex.y *= 1.35;

            // 2. Taper the Chin
            if (vertex.y < 0) {
                const taperFactor = 1.0 - (Math.abs(vertex.y) * 0.35);
                vertex.x *= taperFactor;
                vertex.z *= taperFactor;
            }

            // 3. Flatten the Face
            if (vertex.z > 0) {
                vertex.z *= 0.9;
            }

            // 4. Neck/Base Cutoff
            if (vertex.y < -2.2) continue;

            // 5. Brutalist noise/glitch
            const noise = 0.05;
            vertex.x += (Math.random() - 0.5) * noise;
            vertex.y += (Math.random() - 0.5) * noise;
            vertex.z += (Math.random() - 0.5) * noise;

            positions.push(vertex.x, vertex.y, vertex.z);
        }

        // Create geometry from sculpted points
        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Material
        this.material = new THREE.PointsMaterial({
            color: this.getParticleColor(),
            size: this.CONFIG.particleSize,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

        // Mesh
        this.particlesMesh = new THREE.Points(newGeometry, this.material);
        this.scene.add(this.particlesMesh);
    },

    observeThemeChanges() {
        // Watch for theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateColors();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    },

    updateColors() {
        if (this.material) {
            this.material.color.setHex(this.getParticleColor());
        }
        if (this.scene && this.scene.fog) {
            this.scene.fog.color.setHex(this.getBackgroundColor());
        }
    },

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    },

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    },

    animate() {
        if (!this.isInitialized) return;
        requestAnimationFrame(() => this.animate());

        if (this.particlesMesh) {
            // Auto rotation
            this.particlesMesh.rotation.y += this.CONFIG.rotationSpeed;

            // Mouse influence
            const targetRotX = this.mouseY * this.CONFIG.mouseInfluence * 0.5;
            const targetRotY = this.mouseX * this.CONFIG.mouseInfluence;

            // Smooth interpolation
            this.particlesMesh.rotation.x += (targetRotX - this.particlesMesh.rotation.x) * 0.05;
            this.particlesMesh.rotation.y += (targetRotY - (this.particlesMesh.rotation.y % (Math.PI * 2))) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ParticleHead.init();
});
