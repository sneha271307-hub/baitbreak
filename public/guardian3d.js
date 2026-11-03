import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const container = document.getElementById("guardian-3d");

if (container) {
    const width = () => container.clientWidth || 400;
    const height = () => container.clientHeight || 450;

    /* ---------- Scene, camera, renderer ---------- */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width() / height(), 0.1, 100);
    camera.position.set(0, 0.35, 11.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    /* ---------- Soft studio reflections (this gives the glossy 3D look) ---------- */

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();

    envScene.add(
        new THREE.Mesh(
            new THREE.BoxGeometry(24, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0x5f6fa0, side: THREE.BackSide })
        )
    );

    function softbox(x, y, z, w, h, d, color, intensity) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(color).multiplyScalar(intensity)
            })
        );
        mesh.position.set(x, y, z);
        envScene.add(mesh);
    }

    softbox(0, 11, 0, 14, 0.6, 14, 0xffffff, 5);      // top light
    softbox(-11, 2, 4, 0.6, 9, 9, 0xbfe4ff, 3.5);     // cool left light
    softbox(11, 0, 5, 0.6, 7, 7, 0xffffff, 3);        // right light
    softbox(0, 3, 11, 10, 6, 0.6, 0xffffff, 2.5);     // front light

    scene.environment = pmrem.fromScene(envScene, 0.03).texture;

    /* ---------- Lights ---------- */

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 6, 7);
    scene.add(keyLight);

    const coolLight = new THREE.PointLight(0x55c8ff, 18);
    coolLight.position.set(-4, 1, 5);
    scene.add(coolLight);

    const rimLight = new THREE.PointLight(0x7a6bff, 22);
    rimLight.position.set(4, 2, -3);
    scene.add(rimLight);

    /* ---------- Materials ---------- */

    const white = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.28,
        metalness: 0.0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.0
    });

    const blue = new THREE.MeshPhysicalMaterial({
        color: 0x74b4f2,
        roughness: 0.25,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0
    });

    const lightBlue = new THREE.MeshPhysicalMaterial({
        color: 0xa9d5ff,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.1
    });

    const visorMat = new THREE.MeshPhysicalMaterial({
        color: 0x0b0f1f,
        roughness: 0.3,
        metalness: 0.0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 0.22
    });

    const glow = new THREE.MeshBasicMaterial({ color: 0x86f4ff, toneMapped: false });
    const glowSoft = new THREE.MeshBasicMaterial({ color: 0xd4fcff, toneMapped: false });

    const orbMat = new THREE.MeshPhysicalMaterial({
        color: 0x5b4fe6,
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 1,
        envMapIntensity: 1.2,
        emissive: 0x2a1f9a,
        emissiveIntensity: 0.55
    });

    /* ---------- Shape helpers ---------- */

    // Rounded "squircle" ellipsoid. A bigger n means a boxier shape.
    function squircleGeometry(n, wSeg = 72, hSeg = 56) {
        const geo = new THREE.SphereGeometry(1, wSeg, hSeg);
        const pos = geo.attributes.position;
        const nor = geo.attributes.normal;
        const e = 2 / n;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);

            const nx = Math.sign(x) * Math.pow(Math.abs(x), e);
            const ny = Math.sign(y) * Math.pow(Math.abs(y), e);
            const nz = Math.sign(z) * Math.pow(Math.abs(z), e);

            pos.setXYZ(i, nx, ny, nz);

            // exact surface normal of the shape (gradient), so shading has no seams
            const gx = Math.sign(nx) * Math.pow(Math.abs(nx), n - 1);
            const gy = Math.sign(ny) * Math.pow(Math.abs(ny), n - 1);
            const gz = Math.sign(nz) * Math.pow(Math.abs(nz), n - 1);
            const len = Math.hypot(gx, gy, gz) || 1;
            nor.setXYZ(i, gx / len, gy / len, gz / len);
        }

        return geo;
    }

    function squircle(parent, x, y, z, sx, sy, sz, material, n = 2.6) {
        const mesh = new THREE.Mesh(squircleGeometry(n), material);
        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);
        parent.add(mesh);
        return mesh;
    }

    function ball(parent, x, y, z, sx, sy, sz, material) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), material);
        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);
        parent.add(mesh);
        return mesh;
    }

    function capsule(parent, x, y, z, radius, length, material) {
        const mesh = new THREE.Mesh(
            new THREE.CapsuleGeometry(radius, length, 12, 32),
            material
        );
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    // Leaf-shaped fin with a pointed tip
    function finGeometry() {
        const curve = new THREE.SplineCurve([
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.17, 0.14),
            new THREE.Vector2(0.21, 0.42),
            new THREE.Vector2(0.14, 0.72),
            new THREE.Vector2(0.0, 1.05)
        ]);
        return new THREE.LatheGeometry(curve.getPoints(28), 32);
    }

    // Egg-shaped body: wider at the top, rounded at the bottom
    function bodyGeometry() {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const y = -1 + t * 2;
            const r = Math.sqrt(Math.max(0, 1 - y * y)) * (0.84 + 0.16 * y);
            pts.push(new THREE.Vector2(r, y));
        }
        return new THREE.LatheGeometry(pts, 64);
    }

    /* ---------- Robot ---------- */

    const robot = new THREE.Group();
    robot.position.x = 0.7; // balances the raised arm and the orb
    scene.add(robot);

    const bob = new THREE.Group(); // gentle floating motion happens here
    robot.add(bob);

    /* HEAD */
    const head = new THREE.Group();
    head.position.y = 1.15;
    bob.add(head);

    squircle(head, 0, 0, 0, 1.55, 1.1, 1.05, white, 2.7);

    // Dark glass visor
    squircle(head, 0, 0.02, 0.86, 1.18, 0.74, 0.26, visorMat, 3.6);

    // Eyes
    const leftEye = ball(head, -0.46, 0.04, 1.1, 0.2, 0.25, 0.05, glow);
    const rightEye = ball(head, 0.46, 0.04, 1.1, 0.2, 0.25, 0.05, glow);

    // Corner brackets on the visor
    function bracket(cx, cy, sx, sy) {
        const arm = 0.2, thick = 0.045;
        const h = new THREE.Mesh(new THREE.BoxGeometry(arm, thick, 0.03), glow);
        h.position.set(cx + (sx * arm) / 2, cy, 1.1);
        const v = new THREE.Mesh(new THREE.BoxGeometry(thick, arm, 0.03), glow);
        v.position.set(cx, cy + (sy * arm) / 2, 1.1);
        head.add(h, v);
    }
    bracket(-0.8, 0.5, 1, -1);   // top left
    bracket(0.8, 0.5, -1, -1);   // top right
    bracket(-0.8, -0.45, 1, 1);  // bottom left
    bracket(0.8, -0.45, -1, 1);  // bottom right

    // Ear pieces
    for (const side of [-1, 1]) {
        const ear = squircle(head, side * 1.55, -0.02, 0, 0.34, 0.5, 0.5, blue, 2.4);
        ear.rotation.z = side * 0.08;
        squircle(head, side * 1.78, -0.02, 0, 0.1, 0.34, 0.34, lightBlue, 2.4);
    }

    // Leaf fins on top
    const finMat = new THREE.MeshPhysicalMaterial({
        color: 0x86c2ff,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.1
    });

    for (const side of [-1, 1]) {
        const fin = new THREE.Mesh(finGeometry(), finMat);
        fin.position.set(side * 1.2, 0.72, -0.05);
        fin.scale.set(1.1, 1.1, 0.5);
        fin.rotation.z = -side * 0.62;
        head.add(fin);
    }

    /* BODY */
    const body = new THREE.Mesh(bodyGeometry(), white);
    body.position.set(0, -1.2, 0);
    body.scale.set(1.38, 1.3, 1.0);
    bob.add(body);

    // Blue collar and shoulders
    squircle(bob, 0, -0.28, 0.1, 1.12, 0.42, 0.85, blue, 2.4);
    squircle(bob, -0.28, -0.85, 0.76, 0.22, 0.42, 0.14, blue, 2.4); // chest tab

    // Chest core
    const coreRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.27, 0.05, 20, 60),
        lightBlue
    );
    coreRing.position.set(0.15, -0.3, 0.9);
    bob.add(coreRing);

    ball(bob, 0.15, -0.3, 0.89, 0.23, 0.23, 0.07, glow);
    ball(bob, 0.15, -0.3, 0.94, 0.12, 0.12, 0.03, glowSoft);

    /* RIGHT ARM (hanging) */
    ball(bob, 1.3, -0.3, 0, 0.46, 0.46, 0.46, blue);
    const hangingArm = capsule(bob, 1.55, -1.12, 0, 0.3, 0.8, white);
    hangingArm.rotation.z = 0.3;

    /* LEFT ARM (raised, holding the orb) */
    ball(bob, -1.3, -0.3, 0.05, 0.46, 0.46, 0.46, blue);

    const sleeve = capsule(bob, -1.85, -0.4, 0.14, 0.32, 0.4, blue);
    sleeve.rotation.z = 1.3;

    const hand = squircle(bob, -2.45, -0.1, 0.2, 0.58, 0.23, 0.38, white, 2.3);
    hand.rotation.z = -0.3;

    /* ENERGY ORB with orbiting rings */
    const orbGroup = new THREE.Group();
    orbGroup.position.set(-2.65, 0.85, 0.3);
    bob.add(orbGroup);

    ball(orbGroup, 0, 0, 0, 0.52, 0.52, 0.52, orbMat);

    const facets = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.54, 1),
        new THREE.MeshBasicMaterial({
            color: 0x6fd6ff,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
            toneMapped: false
        })
    );
    orbGroup.add(facets);

    const rings = [];
    const ringSettings = [
        { rx: 1.15, ry: 0.0, rz: 0.0 },
        { rx: 0.35, ry: 0.0, rz: 1.1 },
        { rx: 1.2, ry: 0.8, rz: 0.4 }
    ];

    ringSettings.forEach((s, index) => {
        const ringGroup = new THREE.Group();
        ringGroup.rotation.set(s.rx, s.ry, s.rz);

        ringGroup.add(
            new THREE.Mesh(
                new THREE.TorusGeometry(0.78, 0.036, 16, 120),
                white
            )
        );

        for (let i = 0; i < 2; i++) {
            const a = (i / 2) * Math.PI * 2 + index * 1.1;
            ball(ringGroup, Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0, 0.09, 0.09, 0.09, blue);
        }

        orbGroup.add(ringGroup);
        rings.push(ringGroup);
    });

    // Tiny sparks around the orb
    const sparks = [];
    for (let i = 0; i < 4; i++) {
        const spark = ball(orbGroup, 0, 0, 0, 0.04, 0.04, 0.04, glow);
        sparks.push({ mesh: spark, angle: i * 1.57, radius: 1.0 + (i % 2) * 0.12, speed: 0.8 + i * 0.15 });
    }

    /* ---------- Background sparkles ---------- */

    const sparklePositions = [];
    for (let i = 0; i < 90; i++) {
        sparklePositions.push(
            (Math.random() - 0.5) * 9,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 3 - 1
        );
    }

    const sparkleGeometry = new THREE.BufferGeometry();
    sparkleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(sparklePositions, 3));

    const sparkleSystem = new THREE.Points(
        sparkleGeometry,
        new THREE.PointsMaterial({
            color: 0x9fe8ff,
            size: 0.04,
            transparent: true,
            opacity: 0.7,
            toneMapped: false
        })
    );
    scene.add(sparkleSystem);

    /* ---------- Mouse interaction ---------- */

    let mouseX = 0;
    let mouseY = 0;

    container.addEventListener("pointermove", (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7;
        mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.35;
    });

    container.addEventListener("pointerleave", () => {
        mouseX = 0;
        mouseY = 0;
    });

    /* ---------- Animation ---------- */

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Floating
        bob.position.y = Math.sin(t * 1.4) * 0.12;

        // Follow the mouse (head turns more than the body)
        robot.rotation.y += (mouseX - robot.rotation.y) * 0.05;
        head.rotation.y += (mouseX * 0.8 - head.rotation.y) * 0.06;
        head.rotation.x += (mouseY * 0.8 - head.rotation.x) * 0.06;

        // Orb
        orbGroup.position.y = 0.85 + Math.sin(t * 2.0) * 0.1;
        facets.rotation.y += 0.01;
        facets.rotation.x += 0.006;
        rings.forEach((r, i) => {
            r.rotation.z += 0.01 + i * 0.004;
            r.rotation.x += 0.004;
        });
        sparks.forEach((s) => {
            const a = s.angle + t * s.speed;
            s.mesh.position.set(Math.cos(a) * s.radius, Math.sin(a * 1.3) * 0.4, Math.sin(a) * s.radius);
        });

        // Blinking glowing eyes
        const blink = Math.abs(Math.sin(t * 0.9)) > 0.985 ? 0.1 : 1;
        const pulse = 1 + Math.sin(t * 3) * 0.05;
        leftEye.scale.y = 0.25 * pulse * blink;
        rightEye.scale.y = 0.25 * pulse * blink;

        // Chest core pulse
        coreRing.scale.setScalar(1 + Math.sin(t * 2.5) * 0.04);

        sparkleSystem.rotation.y += 0.0007;

        renderer.render(scene, camera);
    }

    animate();

    /* ---------- Responsive ---------- */

    function resize() {
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height());
    }

    window.addEventListener("resize", resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(container);
}