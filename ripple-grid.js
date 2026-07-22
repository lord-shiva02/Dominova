class RippleGrid {
  constructor(container, options = {}) {
    this.container = container;
    
    // Default options mapped from the React component
    this.enableRainbow = options.enableRainbow || false;
    this.gridColor = options.gridColor || '#ffe627';
    this.rippleIntensity = options.rippleIntensity !== undefined ? options.rippleIntensity : 0.2;
    this.gridSize = options.gridSize !== undefined ? options.gridSize : 24;
    this.gridThickness = options.gridThickness !== undefined ? options.gridThickness : 15;
    this.fadeDistance = options.fadeDistance !== undefined ? options.fadeDistance : 2.2;
    this.vignetteStrength = options.vignetteStrength !== undefined ? options.vignetteStrength : 3;
    this.glowIntensity = options.glowIntensity !== undefined ? options.glowIntensity : 0.1;
    this.opacity = options.opacity !== undefined ? options.opacity : 0.8;
    this.gridRotation = options.gridRotation || 0;
    this.mouseInteraction = options.mouseInteraction !== undefined ? options.mouseInteraction : true;
    this.mouseInteractionRadius = options.mouseInteractionRadius !== undefined ? options.mouseInteractionRadius : 1.2;
    
    this.mousePosition = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.mouseInfluence = 0;
    
    this.init();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
      : [1, 1, 1];
  }

  init() {
    if (!window.ogl) {
      console.error('OGL library not found. Please include it before ripple-grid.js');
      return;
    }

    // Disable the WebGL ripple grid on mobile viewports — WebGL shaders
    // are expensive on mid-range Android GPUs and not needed below 768px.
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) {
      // Hide the container so there's no blank WebGL canvas
      if (this.container) this.container.style.display = 'none';
      return;
    }

    const { Renderer, Program, Triangle, Mesh } = window.ogl;
    
    this.renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2), // desktop always fine
      alpha: true
    });
    
    const gl = this.renderer.gl;
    this.gl = gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.pointerEvents = 'none'; // let clicks pass through to container
    
    this.container.appendChild(gl.canvas);

    const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

    const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

    this.uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      enableRainbow: { value: this.enableRainbow },
      gridColor: { value: this.hexToRgb(this.gridColor) },
      rippleIntensity: { value: this.rippleIntensity },
      gridSize: { value: this.gridSize },
      gridThickness: { value: this.gridThickness },
      fadeDistance: { value: this.fadeDistance },
      vignetteStrength: { value: this.vignetteStrength },
      glowIntensity: { value: this.glowIntensity },
      opacity: { value: this.opacity },
      gridRotation: { value: this.gridRotation },
      mouseInteraction: { value: this.mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: this.mouseInteractionRadius }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms: this.uniforms });
    this.mesh = new Mesh(gl, { geometry, program });

    this.resize = this.resize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener('resize', this.resize);
    
    if (this.mouseInteraction) {
      // Listen on window so elements on top don't block mouse events
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseenter', this.handleMouseEnter);
      window.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    this.resize();
    this.animationId = requestAnimationFrame(this.render);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.uniforms.iResolution.value = [w, h];
  }

  handleMouseMove(e) {
    if (!this.mouseInteraction) return;
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y coordinate
    this.targetMouse = { x, y };
  }

  handleMouseEnter() {
    if (!this.mouseInteraction) return;
    this.mouseInfluence = 1.0;
  }

  handleMouseLeave() {
    if (!this.mouseInteraction) return;
    this.mouseInfluence = 0.0;
  }

  render(t) {
    this.uniforms.iTime.value = t * 0.001;

    const lerpFactor = 0.1;
    this.mousePosition.x += (this.targetMouse.x - this.mousePosition.x) * lerpFactor;
    this.mousePosition.y += (this.targetMouse.y - this.mousePosition.y) * lerpFactor;

    const currentInfluence = this.uniforms.mouseInfluence.value;
    const targetInfluence = this.mouseInfluence;
    this.uniforms.mouseInfluence.value += (targetInfluence - currentInfluence) * 0.05;

    this.uniforms.mousePosition.value = [this.mousePosition.x, this.mousePosition.y];

    this.renderer.render({ scene: this.mesh });
    this.animationId = requestAnimationFrame(this.render);
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.mouseInteraction) {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseenter', this.handleMouseEnter);
      window.removeEventListener('mouseleave', this.handleMouseLeave);
    }
    cancelAnimationFrame(this.animationId);
    this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (this.gl.canvas.parentNode === this.container) {
      this.container.removeChild(this.gl.canvas);
    }
  }
}
