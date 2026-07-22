// Simplex Noise 3D Implementation (Lightweight & Self-contained)
class SimplexNoise {
  constructor() {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = (this.perm[i] % 12);
    }
  }

  noise3D(xin, yin, zin) {
    let n0, n1, n2, n3;
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    let s = (xin + yin + zin) * F3;
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let k = Math.floor(zin + s);

    let t = (i + j + k) * G3;
    let X0 = i - t;
    let Y0 = j - t;
    let Z0 = k - t;

    let x0 = xin - X0;
    let y0 = yin - Y0;
    let z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    let x1 = x0 - i1 + G3;
    let y1 = y0 - j1 + G3;
    let z1 = z0 - k1 + G3;
    let x2 = x0 - i2 + 2.0 * G3;
    let y2 = y0 - j2 + 2.0 * G3;
    let z2 = z0 - k2 + 2.0 * G3;
    let x3 = x0 - 1.0 + 3.0 * G3;
    let y3 = y0 - 1.0 + 3.0 * G3;
    let z3 = z0 - 1.0 + 3.0 * G3;

    let ii = i & 255;
    let jj = j & 255;
    let kk = k & 255;

    let gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    let gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    let gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    let gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.grad3D(gi0, x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.grad3D(gi1, x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.grad3D(gi2, x2, y2, z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * this.grad3D(gi3, x3, y3, z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  grad3D(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}

class HeroParticles {
  constructor() {
    this.container = document.getElementById('hero-particles');
    if (!this.container) return;

    // Check for prefers-reduced-motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if touch/mobile
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Setup viewport-based particle counts (3-tier: mobile / tablet / desktop)
    const width = window.innerWidth;
    // If user prefers reduced motion, skip all particle rendering
    if (this.reducedMotion) {
      this.particleCount = 0;
      this.maxLines = 0;
      return;
    }

    const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    if (width < 480 || isLowEnd) {
      this.particleCount = 60;
      this.maxLines = 40;
    } else if (width < 768) {
      this.particleCount = 120;
      this.maxLines = 80;
    } else if (width < 1024) {
      this.particleCount = 300;
      this.maxLines = 300;
    } else {
      this.particleCount = 600;
      this.maxLines = 500;
    }
    
    // Limits
    this.connectionDist = width < 640 ? 1.5 : 2.0;
    this.repelRadius = 3.0;
    this.repelStrength = 0.65;
    this.driftSpeed = 0.06;
    this.driftScale = 0.15;
    this.driftAmt = 1.8;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.simplex = new SimplexNoise();

    // Interaction State
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseWorld = new THREE.Vector3(9999, 9999, 0);
    this.targetMouseWorld = new THREE.Vector3(9999, 9999, 0);
    this.inViewport = true;
    this.rafId = null;

    // Particle and Line Data
    this.particlesData = [];
    this.positionsArray = null;
    this.colorsArray = null;
    this.opacitiesArray = null;
    this.sizesArray = null;

    this.particlesGeometry = null;
    this.particlesMesh = null;
    
    this.linesGeometry = null;
    this.linesMesh = null;
    this.linePositions = null;
    this.lineColors = null;
    this.lineOpacities = null;

    this.init();
  }

  init() {
    // 1. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 12);

    // 2. Renderer setup
    const isMobileDevice = window.innerWidth < 768;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobileDevice });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap DPR at 1 on small screens to save GPU memory
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1 : 2));
    this.container.appendChild(this.renderer.domElement);

    // 3. Initialize Particles
    this.particlesGeometry = new THREE.BufferGeometry();
    this.positionsArray = new Float32Array(this.particleCount * 3);
    this.colorsArray = new Float32Array(this.particleCount * 3);
    this.opacitiesArray = new Float32Array(this.particleCount);
    this.sizesArray = new Float32Array(this.particleCount);

    const goldColor = new THREE.Color('#C9A227');
    const whiteColor = new THREE.Color('#F5F5F0');

    // Bounds for initial particle distribution
    const aspect = window.innerWidth / window.innerHeight;
    const boxX = 14 * aspect;
    const boxY = 14;
    const boxZ = 8;

    for (let i = 0; i < this.particleCount; i++) {
      // Position
      const x = (Math.random() - 0.5) * boxX;
      const y = (Math.random() - 0.5) * boxY;
      const z = (Math.random() - 0.5) * boxZ;

      this.positionsArray[i * 3] = x;
      this.positionsArray[i * 3 + 1] = y;
      this.positionsArray[i * 3 + 2] = z;

      // Store initial position, noise offsets and displacement velocity
      this.particlesData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        noiseOffsetX: Math.random() * 100,
        noiseOffsetY: Math.random() * 100,
        noiseOffsetZ: Math.random() * 100,
        currentX: x,
        currentY: y,
        currentZ: z,
        dispX: 0,
        dispY: 0,
        dispZ: 0
      });

      // Color (Gradient between gold and white)
      const t = Math.random();
      const mixedColor = new THREE.Color().copy(goldColor).lerp(whiteColor, t);
      this.colorsArray[i * 3] = mixedColor.r;
      this.colorsArray[i * 3 + 1] = mixedColor.g;
      this.colorsArray[i * 3 + 2] = mixedColor.b;

      // Opacity (0.2 to 0.8)
      this.opacitiesArray[i] = 0.2 + Math.random() * 0.6;

      // Size (0.04 to 0.12)
      this.sizesArray[i] = 0.04 + Math.random() * 0.08;
    }

    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
    this.particlesGeometry.setAttribute('aColor', new THREE.BufferAttribute(this.colorsArray, 3));
    this.particlesGeometry.setAttribute('aOpacity', new THREE.BufferAttribute(this.opacitiesArray, 1));
    this.particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizesArray, 1));

    // Custom Shader Materials for Particles
    const particleVertexShader = `
      attribute vec3 aColor;
      attribute float aOpacity;
      attribute float aSize;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        vOpacity = aOpacity;
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        // Size attenuation based on distance to camera
        gl_PointSize = aSize * (350.0 / -mvPosition.z);
      }
    `;

    const particleFragmentShader = `
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        // Soft circular point shape
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, dist) * vOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true
    });

    this.particlesMesh = new THREE.Points(this.particlesGeometry, particleMaterial);
    this.scene.add(this.particlesMesh);

    // 4. Initialize Line Segments
    this.linesGeometry = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(this.maxLines * 2 * 3);
    this.lineColors = new Float32Array(this.maxLines * 2 * 3);
    this.lineOpacities = new Float32Array(this.maxLines * 2);

    this.linesGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.linesGeometry.setAttribute('aColor', new THREE.BufferAttribute(this.lineColors, 3));
    this.linesGeometry.setAttribute('aOpacity', new THREE.BufferAttribute(this.lineOpacities, 1));

    const lineVertexShader = `
      attribute vec3 aColor;
      attribute float aOpacity;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        vOpacity = aOpacity;
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const lineFragmentShader = `
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, vOpacity);
      }
    `;

    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true
    });

    this.linesMesh = new THREE.LineSegments(this.linesGeometry, lineMaterial);
    this.scene.add(this.linesMesh);

    // 5. Start Event Listeners and Animation
    this.bindEvents();

    if (this.reducedMotion) {
      // Just render once and don't loop
      this.updateSimulation(0);
      this.renderer.render(this.scene, this.camera);
    } else {
      this.animate();
    }
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize);

    // Desktop mouse movement tracking
    if (!this.isTouch) {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseleave', this.onMouseLeave);
    }

    // Scroll Pausing using IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.inViewport = entry.isIntersecting;
        if (this.inViewport && !this.reducedMotion && !this.rafId) {
          this.animate();
        }
      });
    }, { threshold: 0.05 });
    this.observer.observe(document.getElementById('hero'));
  }

  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove = (e) => {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onMouseLeave = () => {
    this.targetMouseWorld.set(9999, 9999, 0);
  }

  updateSimulation(time) {
    const goldColor = new THREE.Color('#C9A227');

    // 1. Raycast mouse to world coordinates at Z=0
    if (!this.isTouch && Math.abs(this.mouseX) <= 1.0 && Math.abs(this.mouseY) <= 1.0) {
      const vector = new THREE.Vector3(this.mouseX, this.mouseY, 0.5);
      vector.unproject(this.camera);
      const dir = vector.sub(this.camera.position).normalize();
      const distance = -this.camera.position.z / dir.z;
      this.targetMouseWorld.copy(this.camera.position).add(dir.multiplyScalar(distance));
    }

    // Smoothly interpolate mouse position
    this.mouseWorld.lerp(this.targetMouseWorld, 0.1);

    // 2. Update Particle positions (Simplex noise drift + Mouse interaction)
    const positions = this.particlesGeometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      const data = this.particlesData[i];

      // Drift computation using Simplex Noise
      const dx = this.simplex.noise3D(data.baseX * this.driftScale, data.baseY * this.driftScale + time * this.driftSpeed, time * this.driftSpeed) * this.driftAmt;
      const dy = this.simplex.noise3D(data.baseY * this.driftScale, data.baseZ * this.driftScale + time * this.driftSpeed, time * this.driftSpeed) * this.driftAmt;
      const dz = this.simplex.noise3D(data.baseZ * this.driftScale, data.baseX * this.driftScale + time * this.driftSpeed, time * this.driftSpeed) * this.driftAmt;

      const targetX = data.baseX + dx;
      const targetY = data.baseY + dy;
      const targetZ = data.baseZ + dz;

      // Mouse Repel Force
      let repelX = 0, repelY = 0, repelZ = 0;
      if (!this.isTouch && this.mouseWorld.x < 1000) {
        const mx = this.mouseWorld.x;
        const my = this.mouseWorld.y;
        
        const distToMouse = Math.sqrt((targetX - mx) ** 2 + (targetY - my) ** 2);
        if (distToMouse < this.repelRadius) {
          const force = (this.repelRadius - distToMouse) / this.repelRadius;
          const angle = Math.atan2(targetY - my, targetX - mx);
          
          repelX = Math.cos(angle) * force * this.repelStrength;
          repelY = Math.sin(angle) * force * this.repelStrength;
        }
      }

      // Smooth easing of displacements
      data.dispX += (repelX - data.dispX) * 0.1;
      data.dispY += (repelY - data.dispY) * 0.1;

      data.currentX = targetX + data.dispX;
      data.currentY = targetY + data.dispY;
      data.currentZ = targetZ;

      positions[i * 3] = data.currentX;
      positions[i * 3 + 1] = data.currentY;
      positions[i * 3 + 2] = data.currentZ;
    }
    this.particlesGeometry.attributes.position.needsUpdate = true;

    // 3. Build Spatial Grid for dynamic line drawing (O(N) search)
    const grid = {};
    const cellSize = this.connectionDist;

    for (let i = 0; i < this.particleCount; i++) {
      const data = this.particlesData[i];
      const gx = Math.floor(data.currentX / cellSize);
      const gy = Math.floor(data.currentY / cellSize);
      const gz = Math.floor(data.currentZ / cellSize);
      const cellKey = `${gx},${gy},${gz}`;
      
      if (!grid[cellKey]) grid[cellKey] = [];
      grid[cellKey].push(i);
    }

    // 4. Find pairs inside adjacent cells and draw connections
    let lineIdx = 0;
    const checkedPairs = new Set();

    for (let i = 0; i < this.particleCount && lineIdx < this.maxLines; i++) {
      const pi = this.particlesData[i];
      const gx = Math.floor(pi.currentX / cellSize);
      const gy = Math.floor(pi.currentY / cellSize);
      const gz = Math.floor(pi.currentZ / cellSize);

      // Check current cell + 26 neighbors
      for (let ox = -1; ox <= 1 && lineIdx < this.maxLines; ox++) {
        for (let oy = -1; oy <= 1 && lineIdx < this.maxLines; oy++) {
          for (let oz = -1; oz <= 1 && lineIdx < this.maxLines; oz++) {
            const neighborKey = `${gx + ox},${gy + oy},${gz + oz}`;
            const cellParticles = grid[neighborKey];
            if (!cellParticles) continue;

            for (let j = 0; j < cellParticles.length && lineIdx < this.maxLines; j++) {
              const otherIdx = cellParticles[j];
              if (i === otherIdx) continue;

              // Ensure uniqueness of pairs
              const pairKey = i < otherIdx ? `${i}_${otherIdx}` : `${otherIdx}_${i}`;
              if (checkedPairs.has(pairKey)) continue;
              checkedPairs.add(pairKey);

              const pj = this.particlesData[otherIdx];
              const dx = pi.currentX - pj.currentX;
              const dy = pi.currentY - pj.currentY;
              const dz = pi.currentZ - pj.currentZ;
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

              if (dist < this.connectionDist) {
                // Line fade with distance
                const alpha = (1.0 - dist / this.connectionDist) * 0.35;

                // Vertex positions
                this.linePositions[lineIdx * 6] = pi.currentX;
                this.linePositions[lineIdx * 6 + 1] = pi.currentY;
                this.linePositions[lineIdx * 6 + 2] = pi.currentZ;

                this.linePositions[lineIdx * 6 + 3] = pj.currentX;
                this.linePositions[lineIdx * 6 + 4] = pj.currentY;
                this.linePositions[lineIdx * 6 + 5] = pj.currentZ;

                // Vertex colors (Gold)
                this.lineColors[lineIdx * 6] = goldColor.r;
                this.lineColors[lineIdx * 6 + 1] = goldColor.g;
                this.lineColors[lineIdx * 6 + 2] = goldColor.b;

                this.lineColors[lineIdx * 6 + 3] = goldColor.r;
                this.lineColors[lineIdx * 6 + 4] = goldColor.g;
                this.lineColors[lineIdx * 6 + 5] = goldColor.b;

                // Opacity
                this.lineOpacities[lineIdx * 2] = alpha;
                this.lineOpacities[lineIdx * 2 + 1] = alpha;

                lineIdx++;
              }
            }
          }
        }
      }
    }

    // Set draw range of lines to only render actual connections
    this.linesGeometry.setDrawRange(0, lineIdx * 2);
    this.linesGeometry.attributes.position.needsUpdate = true;
    this.linesGeometry.attributes.aColor.needsUpdate = true;
    this.linesGeometry.attributes.aOpacity.needsUpdate = true;
  }

  animate = () => {
    if (!this.inViewport) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    // Slow ambient rotation of the camera
    this.camera.position.x = Math.sin(time * 0.05) * 0.5;
    this.camera.position.y = Math.cos(time * 0.03) * 0.5;
    this.camera.lookAt(0, 0, 0);

    this.updateSimulation(time);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.inViewport = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseleave', this.onMouseLeave);

    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}

// Lazy-init Three.js particle field to not block initial page rendering
document.addEventListener('DOMContentLoaded', () => {
  // Delay loading the 3D scene slightly after first paint
  setTimeout(() => {
    window.heroParticlesInstance = new HeroParticles();
  }, 400);
});
