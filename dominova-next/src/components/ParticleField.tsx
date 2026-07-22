"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simplex Noise 3D Implementation
class SimplexNoise {
  private p: Uint8Array;
  private perm: Uint8Array;
  private permMod12: Uint8Array;

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

  noise3D(xin: number, yin: number, zin: number): number {
    let n0 = 0.0, n1 = 0.0, n2 = 0.0, n3 = 0.0;
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

    let i1 = 0, j1 = 0, k1 = 0;
    let i2 = 0, j2 = 0, k2 = 0;

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

  private grad3D(hash: number, x: number, y: number, z: number): number {
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

interface ParticleFieldProps {
  inViewport: React.MutableRefObject<boolean>;
}

interface ParticleData {
  baseX: number;
  baseY: number;
  baseZ: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  noiseOffsetZ: number;
  currentX: number;
  currentY: number;
  currentZ: number;
  dispX: number;
  dispY: number;
  dispZ: number;
}

export default function ParticleField({ inViewport }: ParticleFieldProps) {
  const pointsGeomRef = useRef<THREE.BufferGeometry>(null);
  const linesGeomRef = useRef<THREE.BufferGeometry>(null);

  // Checks for client utilities
  const isTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    return ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  }, []);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const count = useMemo(() => {
    if (typeof window === "undefined") return 1000;
    return window.innerWidth < 768 ? 300 : 1000;
  }, []);

  const maxLines = useMemo(() => {
    if (typeof window === "undefined") return 800;
    return window.innerWidth < 768 ? 200 : 800;
  }, []);

  const connectionDist = 2.0;
  const repelRadius = 3.0;
  const repelStrength = 0.65;
  const driftSpeed = 0.06;
  const driftScale = 0.15;
  const driftAmt = 1.8;

  const simplex = useMemo(() => new SimplexNoise(), []);
  
  const mouseWorld = useMemo(() => new THREE.Vector3(9999, 9999, 0), []);
  const targetMouseWorld = useMemo(() => new THREE.Vector3(9999, 9999, 0), []);

  // Compute buffers
  const [positions, colors, opacities, sizes, particlesData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const op = new Float32Array(count);
    const sz = new Float32Array(count);
    const data: ParticleData[] = [];

    const goldColor = new THREE.Color("#C9A227");
    const whiteColor = new THREE.Color("#F5F5F0");

    const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.7;
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

  const [linePos, lineCol, lineOp] = useMemo(() => {
    return [
      new Float32Array(maxLines * 2 * 3),
      new Float32Array(maxLines * 2 * 3),
      new Float32Array(maxLines * 2)
    ];
  }, [maxLines]);

  useFrame((state) => {
    if (!inViewport.current || reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // 1. Slow camera auto-rotate
    state.camera.position.x = Math.sin(time * 0.05) * 0.5;
    state.camera.position.y = Math.cos(time * 0.03) * 0.5;
    state.camera.lookAt(0, 0, 0);

    // 2. Projected mouse position
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

    // 3. Update Positions
    if (pointsGeomRef.current) {
      const posAttr = pointsGeomRef.current.attributes.position.array as Float32Array;

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

    // 4. Draw connection lines using Spatial grid
    if (linesGeomRef.current) {
      const grid: Record<string, number[]> = {};
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
      const checkedPairs = new Set<string>();
      const goldColor = new THREE.Color("#C9A227");

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
}
