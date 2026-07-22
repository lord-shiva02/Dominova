import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

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

// Particle Vertex Shader
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
    gl_PointSize = aSize * (350.0 / -mvPosition.z);
  }
`;

// Particle Fragment Shader
const particleFragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, dist) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Line Vertex Shader
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

// Line Fragment Shader
const lineFragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, vOpacity);
  }
`;

const ParticleNetwork = ({ inViewport }) => {
  const pointsGeomRef = useRef();
  const linesGeomRef = useRef();
  
  // Detection constants
  const isTouch = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const count = useMemo(() => {
    if (typeof window === 'undefined') return 1000;
    return window.innerWidth < 768 ? 300 : 1000;
  }, []);

  const maxLines = useMemo(() => {
    if (typeof window === 'undefined') return 800;
    return window.innerWidth < 768 ? 200 : 800;
  }, []);

  const connectionDist = 2.0;
  const repelRadius = 3.0;
  const repelStrength = 0.65;
  const driftSpeed = 0.06;
  const driftScale = 0.15;
  const driftAmt = 1.8;

  const simplex = useMemo(() => new SimplexNoise(), []);
  
  // Interaction positions
  const mouseWorld = useMemo(() => new THREE.Vector3(9999, 9999, 0), []);
  const targetMouseWorld = useMemo(() => new THREE.Vector3(9999, 9999, 0), []);

  // Set up static buffers and metadata once
  const [positions, colors, opacities, sizes, particlesData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const op = new Float32Array(count);
    const sz = new Float32Array(count);
    const data = [];

    const goldColor = new THREE.Color('#C9A227');
    const whiteColor = new THREE.Color('#F5F5F0');

    // Layout boundaries based on standard camera
    const aspect = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.7;
    const boxX = 14 * aspect;
    const boxY = 14;
    const boxZ = 8;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * boxX;
      const y = (Math.random() - 0.5) * boxY;
      const z = (Math.random() - 0.5) * boxZ;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      data.push({
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

      const t = Math.random();
      const mixedColor = new THREE.Color().copy(goldColor).lerp(whiteColor, t);
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;

      op[i] = 0.2 + Math.random() * 0.6;
      sz[i] = 0.04 + Math.random() * 0.08;
    }

    return [pos, col, op, sz, data];
  }, [count]);

  // Set up lines static buffers
  const [linePos, lineCol, lineOp] = useMemo(() => {
    return [
      new Float32Array(maxLines * 2 * 3),
      new Float32Array(maxLines * 2 * 3),
      new Float32Array(maxLines * 2)
    ];
  }, [maxLines]);

  useFrame((state) => {
    // Stop rendering completely if not in viewport or reduced motion
    if (!inViewport.current || reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // 1. Slow camera rotation
    state.camera.position.x = Math.sin(time * 0.05) * 0.5;
    state.camera.position.y = Math.cos(time * 0.03) * 0.5;
    state.camera.lookAt(0, 0, 0);

    // 2. Map mouse coordinate to Z=0 world plane
    if (!isTouch && Math.abs(state.pointer.x) <= 1.0 && Math.abs(state.pointer.y) <= 1.0) {
      const vector = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5);
      vector.unproject(state.camera);
      const dir = vector.sub(state.camera.position).normalize();
      const distance = -state.camera.position.z / dir.z;
      targetMouseWorld.copy(state.camera.position).add(dir.multiplyScalar(distance));
    } else {
      targetMouseWorld.set(9999, 9999, 0);
    }
    mouseWorld.lerp(targetMouseWorld, 0.1);

    // 3. Update Particles
    if (pointsGeomRef.current) {
      const posAttr = pointsGeomRef.current.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const data = particlesData[i];

        const dx = simplex.noise3D(data.baseX * driftScale, data.baseY * driftScale + time * driftSpeed, time * driftSpeed) * driftAmt;
        const dy = simplex.noise3D(data.baseY * driftScale, data.baseZ * driftScale + time * driftSpeed, time * driftSpeed) * driftAmt;
        const dz = simplex.noise3D(data.baseZ * driftScale, data.baseX * driftScale + time * driftSpeed, time * driftSpeed) * driftAmt;

        const targetX = data.baseX + dx;
        const targetY = data.baseY + dy;
        const targetZ = data.baseZ + dz;

        let repelX = 0, repelY = 0;
        if (!isTouch && mouseWorld.x < 1000) {
          const distToMouse = Math.sqrt((targetX - mouseWorld.x) ** 2 + (targetY - mouseWorld.y) ** 2);
          if (distToMouse < repelRadius) {
            const force = (repelRadius - distToMouse) / repelRadius;
            const angle = Math.atan2(targetY - mouseWorld.y, targetX - mouseWorld.x);
            repelX = Math.cos(angle) * force * repelStrength;
            repelY = Math.sin(angle) * force * repelStrength;
          }
        }

        data.dispX += (repelX - data.dispX) * 0.1;
        data.dispY += (repelY - data.dispY) * 0.1;

        data.currentX = targetX + data.dispX;
        data.currentY = targetY + data.dispY;
        data.currentZ = targetZ;

        posAttr[i * 3] = data.currentX;
        posAttr[i * 3 + 1] = data.currentY;
        posAttr[i * 3 + 2] = data.currentZ;
      }
      pointsGeomRef.current.attributes.position.needsUpdate = true;
    }

    // 4. Update Lines using dynamic Spatial Grid
    if (linesGeomRef.current) {
      const grid = {};
      const cellSize = connectionDist;

      for (let i = 0; i < count; i++) {
        const data = particlesData[i];
        const gx = Math.floor(data.currentX / cellSize);
        const gy = Math.floor(data.currentY / cellSize);
        const gz = Math.floor(data.currentZ / cellSize);
        const key = `${gx},${gy},${gz}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(i);
      }

      let lineIdx = 0;
      const checkedPairs = new Set();
      const goldColor = new THREE.Color('#C9A227');

      for (let i = 0; i < count && lineIdx < maxLines; i++) {
        const pi = particlesData[i];
        const gx = Math.floor(pi.currentX / cellSize);
        const gy = Math.floor(pi.currentY / cellSize);
        const gz = Math.floor(pi.currentZ / cellSize);

        for (let ox = -1; ox <= 1 && lineIdx < maxLines; ox++) {
          for (let oy = -1; oy <= 1 && lineIdx < maxLines; oy++) {
            for (let oz = -1; oz <= 1 && lineIdx < maxLines; oz++) {
              const key = `${gx + ox},${gy + oy},${gz + oz}`;
              const cellParticles = grid[key];
              if (!cellParticles) continue;

              for (let j = 0; j < cellParticles.length && lineIdx < maxLines; j++) {
                const otherIdx = cellParticles[j];
                if (i === otherIdx) continue;

                const pairKey = i < otherIdx ? `${i}_${otherIdx}` : `${otherIdx}_${i}`;
                if (checkedPairs.has(pairKey)) continue;
                checkedPairs.add(pairKey);

                const pj = particlesData[otherIdx];
                const dx = pi.currentX - pj.currentX;
                const dy = pi.currentY - pj.currentY;
                const dz = pi.currentZ - pj.currentZ;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < connectionDist) {
                  const alpha = (1.0 - dist / connectionDist) * 0.35;

                  linePos[lineIdx * 6] = pi.currentX;
                  linePos[lineIdx * 6 + 1] = pi.currentY;
                  linePos[lineIdx * 6 + 2] = pi.currentZ;

                  linePos[lineIdx * 6 + 3] = pj.currentX;
                  linePos[lineIdx * 6 + 4] = pj.currentY;
                  linePos[lineIdx * 6 + 5] = pj.currentZ;

                  lineCol[lineIdx * 6] = goldColor.r;
                  lineCol[lineIdx * 6 + 1] = goldColor.g;
                  lineCol[lineIdx * 6 + 2] = goldColor.b;

                  lineCol[lineIdx * 6 + 3] = goldColor.r;
                  lineCol[lineIdx * 6 + 4] = goldColor.g;
                  lineCol[lineIdx * 6 + 5] = goldColor.b;

                  lineOp[lineIdx * 2] = alpha;
                  lineOp[lineIdx * 2 + 1] = alpha;

                  lineIdx++;
                }
              }
            }
          }
        }
      }

      linesGeomRef.current.setDrawRange(0, lineIdx * 2);
      linesGeomRef.current.attributes.position.needsUpdate = true;
      linesGeomRef.current.attributes.aColor.needsUpdate = true;
      linesGeomRef.current.attributes.aOpacity.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Particles Mesh */}
      <points>
        <bufferGeometry ref={pointsGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aColor"
            args={[colors, 3]}
          />
          <bufferAttribute
            attach="attributes-aOpacity"
            args={[opacities, 1]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          transparent
          depthWrite={false}
          depthTest
        />
      </points>

      {/* Connection Lines Mesh */}
      <lineSegments>
        <bufferGeometry ref={linesGeomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[linePos, 3]}
          />
          <bufferAttribute
            attach="attributes-aColor"
            args={[lineCol, 3]}
          />
          <bufferAttribute
            attach="attributes-aOpacity"
            args={[lineOp, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
          transparent
          depthWrite={false}
          depthTest
        />
      </lineSegments>
    </group>
  );
};

export default function Hero() {
  const containerRef = useRef();
  const sectionRef = useRef();
  const inViewport = useRef(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Reveal animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-text', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.3 }
      );
    }, containerRef);

    // Lazy mount Canvas after content begins loading to prevent blocking first paint
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 400);

    // Intersection observer for viewport check
    const observer = new IntersectionObserver(([entry]) => {
      inViewport.current = entry.isIntersecting;
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      ctx.revert();
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0E1A] bg-[radial-gradient(circle_at_center,_#0F1528_0%,_#0A0E1A_100%)]"
    >
      {/* 3D Animated Background */}
      {isMounted && (
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Canvas 
            camera={{ position: [0, 0, 12] }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.5} />
            <ParticleNetwork inViewport={inViewport} />
          </Canvas>
        </div>
      )}
      
      {/* Subtle overlay to ensure high contrast for text directly behind content */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A]/10 via-[#0A0E1A]/40 to-[#0A0E1A] z-0 pointer-events-none"></div>
      
      <div ref={containerRef} className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center">
        <span className="hero-text uppercase tracking-[0.2em] text-gold-primary font-bold text-sm mb-4 block">
          Empowering Next-Gen Engineers
        </span>
        
        <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl mb-6 font-display font-bold text-white tracking-tight leading-tight">
          Transform Your Campus <br className="hidden md:block"/> With <span className="text-gold-primary drop-shadow-[0_0_15px_rgba(201,162,39,0.3)]">Dominova</span>
        </h1>
        
        <p className="hero-text text-lg md:text-2xl text-text-on-dark/80 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
          Premium IT workshops, national-level hackathons, and expert placement training designed to bridge the gap between academia and industry.
        </p>
        
        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button 
            onClick={scrollToEvents}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#0B0E1A] font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            Explore Events
          </button>
          
          <button 
            onClick={scrollToBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border-2 border-gold-primary text-gold-primary font-semibold text-lg hover:bg-gold-primary hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_15px_rgba(201,162,39,0.2)] hover:shadow-[0_0_25px_rgba(201,162,39,0.4)]"
          >
            Bring Dominova to Your Campus
          </button>
        </div>
      </div>
    </section>
  );
}
