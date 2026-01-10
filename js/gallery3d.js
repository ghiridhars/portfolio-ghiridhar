// ========================================
// 3D GALLERY - THREE.JS VIRTUAL MUSEUM
// Immersive 3D art gallery experience
// ========================================

/**
 * Gallery3D - Main 3D gallery class
 * Creates an immersive museum environment
 */
class Gallery3D {
    constructor(container, artworks) {
        this.container = container;
        this.artworks = artworks;
        
        // Three.js core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Gallery elements
        this.frames = [];
        this.lights = [];
        this.floor = null;
        this.walls = [];
        this.ceiling = null;
        
        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedFrame = null;
        this.isZoomed = false;
        this.originalCameraPos = null;
        this.originalCameraTarget = null;
        
        // Animation
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.isRunning = false;
        
        // Settings
        this.settings = {
            roomWidth: 30,
            roomDepth: 40,
            roomHeight: 8,
            frameSpacing: 6,
            frameHeight: 4,
            walkSpeed: 0.15,
            lookSpeed: 0.002,
            ambientIntensity: 1.5,
            spotlightIntensity: 3.0
        };
        
        // Movement
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Info panel
        this.infoPanel = null;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createRoom();
        this.createFrames();
        this.createControls();
        this.createInfoPanel();
        this.createUI();
        this.bindEvents();
        this.start();
        
        console.log('🖼️ 3D Gallery initialized');
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.scene.background = new THREE.Color(isDark ? 0x0a0a0a : 0xf5f5f5);
        this.scene.fog = new THREE.Fog(isDark ? 0x0a0a0a : 0xf5f5f5, 10, 50);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        // Start in the middle of the room, facing the back wall
        this.camera.position.set(0, 2, 10);
        this.camera.lookAt(0, 2, -10);
        console.log('📷 Camera initialized at', this.camera.position);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 2.0;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Strong ambient light for overall visibility
        const ambient = new THREE.AmbientLight(0xffffff, this.settings.ambientIntensity);
        this.scene.add(ambient);
        this.lights.push(ambient);
        
        // Hemisphere light for natural lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
        hemiLight.position.set(0, this.settings.roomHeight, 0);
        this.scene.add(hemiLight);
        this.lights.push(hemiLight);
        
        // Main directional light (simulating skylights)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(0, this.settings.roomHeight - 1, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        this.lights.push(mainLight);
        
        // Additional fill lights from corners
        const fillLight1 = new THREE.PointLight(0xffffff, 0.8, 50);
        fillLight1.position.set(-10, 6, -10);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.PointLight(0xffffff, 0.8, 50);
        fillLight2.position.set(10, 6, -10);
        this.scene.add(fillLight2);
        
        // Spotlights for each artwork will be added when frames are created
    }
    
    createRoom() {
        const { roomWidth, roomDepth, roomHeight } = this.settings;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x1a1a1a : 0xe0e0e0,
            roughness: 0.8,
            metalness: 0.2
        });
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Add floor pattern
        this.addFloorPattern();
        
        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x0d0d0d : 0xfafafa,
            roughness: 0.9,
            metalness: 0.1
        });
        this.ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        this.ceiling.rotation.x = Math.PI / 2;
        this.ceiling.position.y = roomHeight;
        this.scene.add(this.ceiling);
        
        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x1a1a1a : 0xf0f0f0,
            roughness: 0.9,
            metalness: 0.05,
            side: THREE.DoubleSide
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomWidth, roomHeight),
            wallMaterial
        );
        backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        this.walls.push(backWall);
        
        // Front wall (with entrance opening)
        const frontWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(roomWidth / 2 - 2, roomHeight),
            wallMaterial
        );
        frontWallLeft.position.set(-roomWidth / 4 - 1, roomHeight / 2, roomDepth / 2);
        frontWallLeft.rotation.y = Math.PI;
        this.scene.add(frontWallLeft);
        this.walls.push(frontWallLeft);
        
        const frontWallRight = new THREE.Mesh(
            new THREE.PlaneGeometry(roomWidth / 2 - 2, roomHeight),
            wallMaterial
        );
        frontWallRight.position.set(roomWidth / 4 + 1, roomHeight / 2, roomDepth / 2);
        frontWallRight.rotation.y = Math.PI;
        this.scene.add(frontWallRight);
        this.walls.push(frontWallRight);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomDepth, roomHeight),
            wallMaterial
        );
        leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        this.walls.push(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(roomDepth, roomHeight),
            wallMaterial
        );
        rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        this.walls.push(rightWall);
        
        // Add baseboards
        this.addBaseboards();
        
        // Add ceiling lights
        this.addCeilingLights();
    }
    
    addFloorPattern() {
        const { roomWidth, roomDepth } = this.settings;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const tileSize = 2;
        
        const linesMaterial = new THREE.LineBasicMaterial({ 
            color: isDark ? 0x2a2a2a : 0xcccccc,
            transparent: true,
            opacity: 0.5
        });
        
        // Grid lines
        const gridHelper = new THREE.GridHelper(
            Math.max(roomWidth, roomDepth), 
            Math.max(roomWidth, roomDepth) / tileSize,
            isDark ? 0x333333 : 0xbbbbbb,
            isDark ? 0x222222 : 0xdddddd
        );
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }
    
    addBaseboards() {
        const { roomWidth, roomDepth, roomHeight } = this.settings;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const baseboardMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x0a0a0a : 0x333333,
            roughness: 0.5,
            metalness: 0.3
        });
        
        const baseboardHeight = 0.15;
        const baseboardDepth = 0.05;
        
        // Create baseboards along walls
        const positions = [
            { pos: [0, baseboardHeight / 2, -roomDepth / 2 + baseboardDepth / 2], rot: [0, 0, 0], width: roomWidth },
            { pos: [-roomWidth / 2 + baseboardDepth / 2, baseboardHeight / 2, 0], rot: [0, Math.PI / 2, 0], width: roomDepth },
            { pos: [roomWidth / 2 - baseboardDepth / 2, baseboardHeight / 2, 0], rot: [0, Math.PI / 2, 0], width: roomDepth }
        ];
        
        positions.forEach(({ pos, rot, width }) => {
            const baseboard = new THREE.Mesh(
                new THREE.BoxGeometry(width, baseboardHeight, baseboardDepth),
                baseboardMaterial
            );
            baseboard.position.set(...pos);
            baseboard.rotation.set(...rot);
            this.scene.add(baseboard);
        });
    }
    
    addCeilingLights() {
        const { roomWidth, roomDepth, roomHeight } = this.settings;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Track lighting fixtures
        const trackGeometry = new THREE.BoxGeometry(0.1, 0.05, roomDepth - 4);
        const trackMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x222222 : 0x444444,
            metalness: 0.8,
            roughness: 0.3
        });
        
        // Left track
        const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
        leftTrack.position.set(-roomWidth / 4, roomHeight - 0.1, 0);
        this.scene.add(leftTrack);
        
        // Right track
        const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
        rightTrack.position.set(roomWidth / 4, roomHeight - 0.1, 0);
        this.scene.add(rightTrack);
    }
    
    createFrames() {
        const { roomWidth, roomDepth, frameSpacing, frameHeight, roomHeight } = this.settings;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'anonymous';
        
        // Frame material
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: isDark ? 0x1a1a1a : 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.7
        });
        
        // Calculate positions for artworks on walls
        const wallPositions = [];
        
        // Left wall artworks
        const leftWallCount = Math.floor((roomDepth - 8) / frameSpacing);
        for (let i = 0; i < leftWallCount; i++) {
            wallPositions.push({
                position: new THREE.Vector3(
                    -roomWidth / 2 + 0.1,
                    frameHeight,
                    -roomDepth / 2 + 4 + i * frameSpacing
                ),
                rotation: new THREE.Euler(0, Math.PI / 2, 0),
                wall: 'left'
            });
        }
        
        // Right wall artworks
        const rightWallCount = Math.floor((roomDepth - 8) / frameSpacing);
        for (let i = 0; i < rightWallCount; i++) {
            wallPositions.push({
                position: new THREE.Vector3(
                    roomWidth / 2 - 0.1,
                    frameHeight,
                    -roomDepth / 2 + 4 + i * frameSpacing
                ),
                rotation: new THREE.Euler(0, -Math.PI / 2, 0),
                wall: 'right'
            });
        }
        
        // Back wall artworks
        const backWallCount = Math.floor((roomWidth - 8) / frameSpacing);
        for (let i = 0; i < backWallCount; i++) {
            wallPositions.push({
                position: new THREE.Vector3(
                    -roomWidth / 2 + 4 + i * frameSpacing,
                    frameHeight,
                    -roomDepth / 2 + 0.1
                ),
                rotation: new THREE.Euler(0, 0, 0),
                wall: 'back'
            });
        }
        
        console.log('🖼️ Creating', Math.min(this.artworks.length, wallPositions.length), 'frames');
        
        // Create frames for each artwork
        this.artworks.forEach((artwork, index) => {
            if (index >= wallPositions.length) return;
            
            const { position, rotation, wall } = wallPositions[index];
            
            // Create frame group
            const frameGroup = new THREE.Group();
            frameGroup.userData = {
                artwork: artwork,
                index: index,
                isFrame: true
            };
            
            // Artwork dimensions
            const artWidth = 2.5;
            const artHeight = 2;
            const frameThickness = 0.1;
            const frameDepth = 0.12;
            
            // Create frame immediately with placeholder
            this.createFrameStructure(frameGroup, artWidth, artHeight, frameThickness, frameDepth, frameMaterial, isDark);
            
            // Position frame
            frameGroup.position.copy(position);
            frameGroup.rotation.copy(rotation);
            
            this.scene.add(frameGroup);
            this.frames.push(frameGroup);
            
            // Add nameplate
            this.addNameplate(frameGroup, artwork, position, rotation);
            
            // Add spotlight
            this.addArtworkSpotlight(frameGroup, position, wall);
            
            // Load texture asynchronously
            console.log(`🖼️ Loading texture ${index}: ${artwork.image}`);
            textureLoader.load(
                artwork.image,
                (texture) => {
                    console.log(`✅ Texture loaded: ${artwork.title}`);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    
                    // Calculate aspect ratio
                    const imageAspect = texture.image.width / texture.image.height;
                    let finalWidth = artWidth;
                    let finalHeight = artHeight;
                    
                    if (imageAspect > artWidth / artHeight) {
                        finalHeight = artWidth / imageAspect;
                    } else {
                        finalWidth = artHeight * imageAspect;
                    }
                    
                    // Find and update the placeholder
                    const placeholder = frameGroup.getObjectByName('artworkPlaceholder');
                    if (placeholder) {
                        placeholder.material.map = texture;
                        placeholder.material.color.setHex(0xffffff);
                        placeholder.material.needsUpdate = true;
                        
                        // Update geometry for aspect ratio
                        placeholder.geometry.dispose();
                        placeholder.geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
                    }
                },
                (progress) => {
                    // Loading progress
                },
                (error) => {
                    console.warn(`❌ Failed to load: ${artwork.image}`, error);
                }
            );
        });
    }
    
    createFrameStructure(frameGroup, artWidth, artHeight, frameThickness, frameDepth, frameMaterial, isDark) {
        // Create placeholder artwork (will be replaced when texture loads)
        // Using MeshBasicMaterial so artwork shows at full brightness regardless of lighting
        const placeholderGeometry = new THREE.PlaneGeometry(artWidth, artHeight);
        const placeholderMaterial = new THREE.MeshBasicMaterial({
            color: isDark ? 0x333333 : 0xcccccc,
            roughness: 0.9,
            metalness: 0.1
        });
        const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        placeholder.name = 'artworkPlaceholder';
        placeholder.position.z = frameDepth / 2 + 0.01;
        frameGroup.add(placeholder);
        
        // Frame border pieces
        const frameWidth = artWidth + frameThickness * 2;
        const frameHeightTotal = artHeight + frameThickness * 2;
        
        const framePieces = [
            { // Top
                geometry: new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
                position: [0, artHeight / 2 + frameThickness / 2, 0]
            },
            { // Bottom
                geometry: new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
                position: [0, -artHeight / 2 - frameThickness / 2, 0]
            },
            { // Left
                geometry: new THREE.BoxGeometry(frameThickness, frameHeightTotal, frameDepth),
                position: [-artWidth / 2 - frameThickness / 2, 0, 0]
            },
            { // Right
                geometry: new THREE.BoxGeometry(frameThickness, frameHeightTotal, frameDepth),
                position: [artWidth / 2 + frameThickness / 2, 0, 0]
            }
        ];
        
        framePieces.forEach(piece => {
            const mesh = new THREE.Mesh(piece.geometry, frameMaterial);
            mesh.position.set(...piece.position);
            mesh.castShadow = true;
            frameGroup.add(mesh);
        });
        
        // Back panel
        const backPanel = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth, frameHeightTotal, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        backPanel.position.z = -0.01;
        frameGroup.add(backPanel);
    }
    
    addArtworkSpotlight(frameGroup, position, wall) {
        const spotlight = new THREE.SpotLight(0xffffff, this.settings.spotlightIntensity);
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.3;
        spotlight.decay = 1;
        spotlight.distance = 15;
        spotlight.castShadow = false;
        
        // Position spotlight above and in front of artwork
        const offset = {
            left: new THREE.Vector3(2, 4, 0),
            right: new THREE.Vector3(-2, 4, 0),
            back: new THREE.Vector3(0, 4, 2)
        };
        
        spotlight.position.copy(position).add(offset[wall] || offset.back);
        spotlight.target = frameGroup;
        
        this.scene.add(spotlight);
        this.scene.add(spotlight.target);
        this.lights.push(spotlight);
    }
    
    addNameplate(frameGroup, artwork, position, rotation) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Draw nameplate background
        ctx.fillStyle = isDark ? '#1a1a1a' : '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = isDark ? '#333333' : '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(artwork.title, canvas.width / 2, 45);
        
        ctx.font = '24px Arial, sans-serif';
        ctx.fillStyle = isDark ? '#aaaaaa' : '#666666';
        ctx.fillText(artwork.category, canvas.width / 2, 90);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Create nameplate mesh
        const nameplateGeometry = new THREE.PlaneGeometry(1.2, 0.3);
        const nameplateMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.5,
            metalness: 0.3
        });
        
        const nameplate = new THREE.Mesh(nameplateGeometry, nameplateMaterial);
        nameplate.position.y = -1.5;
        nameplate.position.z = 0.06;
        
        frameGroup.add(nameplate);
    }
    
    createControls() {
        // First-person controls
        this.controls = {
            euler: new THREE.Euler(0, 0, 0, 'YXZ'),
            locked: false
        };
    }
    
    createInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.className = 'gallery-info-panel';
        this.infoPanel.innerHTML = `
            <h3 class="gallery-info-title"></h3>
            <p class="gallery-info-category"></p>
            <button class="gallery-info-close">&times;</button>
        `;
        this.infoPanel.style.display = 'none';
        this.container.appendChild(this.infoPanel);
        
        this.infoPanel.querySelector('.gallery-info-close').addEventListener('click', () => {
            this.closeZoom();
        });
    }
    
    createUI() {
        // Create controls help
        const controls = document.createElement('div');
        controls.className = 'gallery-controls-help';
        controls.innerHTML = `
            <div class="control-item"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</div>
            <div class="control-item"><kbd>Mouse</kbd> Look around</div>
            <div class="control-item"><kbd>Click</kbd> artwork to zoom</div>
            <div class="control-item"><kbd>ESC</kbd> Exit zoom / Exit gallery</div>
        `;
        this.container.appendChild(controls);
        
        // Create minimap
        this.createMinimap();
        
        // Create crosshair
        const crosshair = document.createElement('div');
        crosshair.className = 'gallery-crosshair';
        crosshair.innerHTML = '+';
        this.container.appendChild(crosshair);
    }
    
    createMinimap() {
        const minimap = document.createElement('div');
        minimap.className = 'gallery-minimap';
        
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 200;
        canvas.className = 'minimap-canvas';
        minimap.appendChild(canvas);
        
        this.container.appendChild(minimap);
        this.minimapCanvas = canvas;
        this.minimapCtx = canvas.getContext('2d');
    }
    
    updateMinimap() {
        if (!this.minimapCtx) return;
        
        const ctx = this.minimapCtx;
        const { roomWidth, roomDepth } = this.settings;
        const scale = 4;
        const offsetX = 75;
        const offsetY = 100;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Clear
        ctx.clearRect(0, 0, 150, 200);
        
        // Draw room outline
        ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            offsetX - roomWidth / 2 * scale / 5,
            offsetY - roomDepth / 2 * scale / 5,
            roomWidth * scale / 5,
            roomDepth * scale / 5
        );
        
        // Draw entrance
        ctx.fillStyle = isDark ? '#000000' : '#ffffff';
        ctx.fillRect(
            offsetX - 8,
            offsetY + roomDepth / 2 * scale / 5 - 2,
            16, 4
        );
        
        // Draw frames
        ctx.fillStyle = isDark ? '#666666' : '#999999';
        this.frames.forEach(frame => {
            const x = offsetX + frame.position.x * scale / 5;
            const z = offsetY + frame.position.z * scale / 5;
            ctx.fillRect(x - 2, z - 2, 4, 4);
        });
        
        // Draw player position
        ctx.fillStyle = '#ff4444';
        const playerX = offsetX + this.camera.position.x * scale / 5;
        const playerZ = offsetY + this.camera.position.z * scale / 5;
        
        ctx.beginPath();
        ctx.arc(playerX, playerZ, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playerX, playerZ);
        ctx.lineTo(playerX + dir.x * 15, playerZ + dir.z * 15);
        ctx.stroke();
    }
    
    bindEvents() {
        // Pointer lock for first-person controls
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-info-panel') || 
                e.target.closest('.gallery-controls-help') ||
                e.target.closest('.gallery-minimap') ||
                e.target.closest('.gallery-exit-btn')) {
                return;
            }
            
            if (!this.isZoomed && this.controls.locked) {
                // Check for artwork click
                this.checkArtworkClick();
            } else if (!this.controls.locked) {
                this.container.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.controls.locked = document.pointerLockElement === this.container;
            this.container.classList.toggle('pointer-locked', this.controls.locked);
        });
        
        // Mouse movement for looking around
        document.addEventListener('mousemove', (e) => {
            if (!this.controls.locked || this.isZoomed) return;
            
            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;
            
            this.controls.euler.setFromQuaternion(this.camera.quaternion);
            this.controls.euler.y -= movementX * this.settings.lookSpeed;
            this.controls.euler.x -= movementY * this.settings.lookSpeed;
            this.controls.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.controls.euler.x));
            
            this.camera.quaternion.setFromEuler(this.controls.euler);
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isZoomed && e.key === 'Escape') {
                this.closeZoom();
                return;
            }
            
            if (e.key === 'Escape' && this.controls.locked) {
                document.exitPointerLock();
                return;
            }
            
            switch (e.key.toLowerCase()) {
                case 'w': this.moveState.forward = true; break;
                case 's': this.moveState.backward = true; break;
                case 'a': this.moveState.left = true; break;
                case 'd': this.moveState.right = true; break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': this.moveState.forward = false; break;
                case 's': this.moveState.backward = false; break;
                case 'a': this.moveState.left = false; break;
                case 'd': this.moveState.right = false; break;
            }
        });
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Theme change handler
        const observer = new MutationObserver(() => this.updateTheme());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    
    checkArtworkClick() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.frames, true);
        
        if (intersects.length > 0) {
            // Find the frame group
            let frameGroup = intersects[0].object;
            while (frameGroup.parent && !frameGroup.userData.isFrame) {
                frameGroup = frameGroup.parent;
            }
            
            if (frameGroup.userData.isFrame) {
                this.zoomToArtwork(frameGroup);
            }
        }
    }
    
    zoomToArtwork(frameGroup) {
        if (this.isZoomed) return;
        
        this.isZoomed = true;
        this.selectedFrame = frameGroup;
        
        // Store original camera position
        this.originalCameraPos = this.camera.position.clone();
        this.originalCameraTarget = new THREE.Vector3();
        this.camera.getWorldDirection(this.originalCameraTarget);
        
        // Calculate zoom position (in front of artwork)
        const artworkPos = new THREE.Vector3();
        frameGroup.getWorldPosition(artworkPos);
        
        const zoomDistance = 3;
        const zoomDir = new THREE.Vector3();
        
        // Get frame forward direction
        const frameForward = new THREE.Vector3(0, 0, 1);
        frameForward.applyQuaternion(frameGroup.quaternion);
        
        const zoomPos = artworkPos.clone().add(frameForward.multiplyScalar(zoomDistance));
        zoomPos.y = this.camera.position.y;
        
        // Animate camera to zoom position
        this.animateCameraTo(zoomPos, artworkPos, () => {
            // Show info panel
            const artwork = frameGroup.userData.artwork;
            this.showInfoPanel(artwork);
        });
        
        // Exit pointer lock during zoom
        document.exitPointerLock();
    }
    
    animateCameraTo(targetPos, lookAt, onComplete) {
        const startPos = this.camera.position.clone();
        const startQuat = this.camera.quaternion.clone();
        
        // Calculate target quaternion
        const tempCamera = this.camera.clone();
        tempCamera.position.copy(targetPos);
        tempCamera.lookAt(lookAt);
        const targetQuat = tempCamera.quaternion.clone();
        
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.camera.quaternion.slerpQuaternions(startQuat, targetQuat, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        animate();
    }
    
    showInfoPanel(artwork) {
        this.infoPanel.querySelector('.gallery-info-title').textContent = artwork.title;
        this.infoPanel.querySelector('.gallery-info-category').textContent = artwork.category;
        this.infoPanel.style.display = 'block';
        
        // Animate in
        this.infoPanel.style.opacity = '0';
        this.infoPanel.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            this.infoPanel.style.transition = 'all 0.3s ease';
            this.infoPanel.style.opacity = '1';
            this.infoPanel.style.transform = 'translateY(0)';
        });
    }
    
    closeZoom() {
        if (!this.isZoomed) return;
        
        this.infoPanel.style.display = 'none';
        
        // Animate back to original position
        this.animateCameraTo(
            this.originalCameraPos,
            this.originalCameraPos.clone().add(this.originalCameraTarget),
            () => {
                this.isZoomed = false;
                this.selectedFrame = null;
            }
        );
    }
    
    updateMovement(deltaTime) {
        if (!this.controls.locked || this.isZoomed) return;
        
        const { roomWidth, roomDepth } = this.settings;
        const speed = this.settings.walkSpeed;
        
        // Get movement direction
        this.direction.z = Number(this.moveState.forward) - Number(this.moveState.backward);
        this.direction.x = Number(this.moveState.right) - Number(this.moveState.left);
        this.direction.normalize();
        
        if (this.moveState.forward || this.moveState.backward) {
            this.velocity.z -= this.direction.z * speed;
        }
        if (this.moveState.left || this.moveState.right) {
            this.velocity.x -= this.direction.x * speed;
        }
        
        // Apply movement relative to camera direction
        const moveX = this.velocity.x;
        const moveZ = this.velocity.z;
        
        this.camera.translateX(moveX);
        this.camera.translateZ(moveZ);
        
        // Boundary checking
        const margin = 2;
        this.camera.position.x = Math.max(-roomWidth / 2 + margin, Math.min(roomWidth / 2 - margin, this.camera.position.x));
        this.camera.position.z = Math.max(-roomDepth / 2 + margin, Math.min(roomDepth / 2 - margin, this.camera.position.z));
        
        // Apply friction
        this.velocity.multiplyScalar(0.85);
    }
    
    updateTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        this.scene.background = new THREE.Color(isDark ? 0x0a0a0a : 0xf5f5f5);
        this.scene.fog = new THREE.Fog(isDark ? 0x0a0a0a : 0xf5f5f5, 10, 50);
        
        // Update materials...
        // This would require re-creating materials for full theme support
    }
    
    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        this.updateMovement(deltaTime);
        this.updateMinimap();
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        this.stop();
        
        // Dispose geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
        
        // Remove DOM elements
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        
        document.exitPointerLock();
        
        console.log('🖼️ 3D Gallery destroyed');
    }
}

// ========================================
// GALLERY INITIALIZATION
// ========================================

let gallery3D = null;

function initGallery3D() {
    // Get artworks from the page - include hidden ones too
    const artworkElements = document.querySelectorAll('.portfolio-item');
    const artworks = [];
    
    console.log('🖼️ Found', artworkElements.length, 'portfolio items');
    
    artworkElements.forEach((el, idx) => {
        const img = el.querySelector('img');
        const title = el.querySelector('h3')?.textContent || 'Untitled';
        const category = el.querySelector('.portfolio-category')?.textContent || 'Artwork';
        
        if (img && img.src) {
            console.log(`  [${idx}] ${title}: ${img.src}`);
            artworks.push({
                image: img.src,
                title: title,
                category: category
            });
        }
    });
    
    // If no artworks found from DOM, use hardcoded fallback
    if (artworks.length === 0) {
        console.warn('No artworks found in DOM, using fallback images');
        const fallbackArtworks = [
            { image: 'assets/images/art/Avatar.jpg', title: 'Avatar', category: 'Tattoo Sketch' },
            { image: 'assets/images/art/Blood_Rose.jpeg', title: 'Blood Rose', category: 'Sketch' },
            { image: 'assets/images/art/Hulk_WallArt.jpg', title: 'Hulk', category: 'Wall Art' },
            { image: 'assets/images/art/Memento_Mori.jpeg', title: 'Memento Mori', category: 'Sketch' },
            { image: 'assets/images/art/Non_Omnis_Moriar.jpeg', title: 'Non Omnis Moriar', category: 'Sketch' },
            { image: 'assets/images/art/Pulp_Fiction.jpg', title: 'Pulp Fiction', category: 'Wall Art' },
            { image: 'assets/images/art/Robin_Williams.jpeg', title: 'Robin Williams', category: 'Portrait' },
            { image: 'assets/images/art/Ronaldo_WallArt.jpg', title: 'Cristiano Ronaldo', category: 'Wall Art' },
            { image: 'assets/images/art/Walter_White.jpeg', title: 'Walter White', category: 'Portrait' }
        ];
        artworks.push(...fallbackArtworks);
    }
    
    console.log('🖼️ Loading', artworks.length, 'artworks into 3D gallery');
    
    // Create gallery container
    const galleryContainer = document.createElement('div');
    galleryContainer.id = 'gallery3d-container';
    galleryContainer.className = 'gallery3d-container';
    galleryContainer.innerHTML = `
        <button class="gallery-exit-btn" aria-label="Exit 3D Gallery">
            <span class="material-symbols-sharp">close</span>
            <span>Exit Gallery</span>
        </button>
        <div class="gallery3d-canvas-wrapper" id="gallery3d-canvas"></div>
    `;
    
    document.body.appendChild(galleryContainer);
    
    // Exit button handler
    galleryContainer.querySelector('.gallery-exit-btn').addEventListener('click', () => {
        closeGallery3D();
    });
    
    // Initialize Three.js gallery
    const canvasWrapper = document.getElementById('gallery3d-canvas');
    gallery3D = new Gallery3D(canvasWrapper, artworks);
    
    // Show container with animation
    requestAnimationFrame(() => {
        galleryContainer.classList.add('active');
    });
    
    console.log('🖼️ 3D Gallery opened with', artworks.length, 'artworks');
}

function closeGallery3D() {
    const container = document.getElementById('gallery3d-container');
    if (!container) return;
    
    document.exitPointerLock();
    
    container.classList.remove('active');
    container.classList.add('closing');
    
    setTimeout(() => {
        if (gallery3D) {
            gallery3D.destroy();
            gallery3D = null;
        }
        container.remove();
    }, 500);
}

// Add button to trigger 3D gallery
function addGallery3DButton() {
    const sectionHeader = document.querySelector('.portfolio-section .section-header');
    if (!sectionHeader) return;
    
    // Check if button already exists
    if (document.getElementById('enter3dGalleryBtn')) return;
    
    const button = document.createElement('button');
    button.id = 'enter3dGalleryBtn';
    button.className = 'btn btn-primary gallery3d-trigger';
    button.innerHTML = `
        <span class="material-symbols-sharp">view_in_ar</span>
        <span>Enter 3D Gallery</span>
    `;
    button.addEventListener('click', initGallery3D);
    
    sectionHeader.appendChild(button);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGallery3DButton);
} else {
    addGallery3DButton();
}

// Export for external use
window.Gallery3D = Gallery3D;
window.initGallery3D = initGallery3D;
window.closeGallery3D = closeGallery3D;
