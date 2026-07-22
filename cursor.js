class CustomCursor {
  constructor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.follower = document.createElement('div');
    this.follower.className = 'custom-cursor-follower';
    
    document.body.appendChild(this.cursor);
    document.body.appendChild(this.follower);

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: this.pos.x, y: this.pos.y };
    this.speed = 0.2;

    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Instant update for the crosshair dot
      gsap.set(this.cursor, {
        x: this.mouse.x,
        y: this.mouse.y
      });
    });

    const interactables = document.querySelectorAll('a, button, input, textarea, select, label, .magnetic');
    
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.follower.classList.add('hover');
        this.cursor.classList.add('hover'); // rotate crosshair → ×
        if (el.classList.contains('magnetic')) {
          this.activateMagnetic(el);
        }
      });
      
      el.addEventListener('mouseleave', () => {
        this.follower.classList.remove('hover');
        this.cursor.classList.remove('hover'); // back to +
        if (el.classList.contains('magnetic')) {
          this.deactivateMagnetic(el);
        }
      });
    });
  }

  activateMagnetic(el) {
    el.addEventListener('mousemove', this.magneticMove);
  }

  deactivateMagnetic(el) {
    el.removeEventListener('mousemove', this.magneticMove);
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  magneticMove = (e) => {
    const el = e.currentTarget;
    const bounds = el.getBoundingClientRect();
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;

    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  loop() {
    // Smooth follow for the trail
    this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
    this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

    gsap.set(this.follower, {
      x: this.pos.x,
      y: this.pos.y
    });

    requestAnimationFrame(this.loop.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Only init on non-touch (fine pointer = mouse) devices
  if (window.matchMedia("(pointer: fine)").matches) {
    new CustomCursor();
  } else {
    // Touch device — restore native cursor and pointer behavior
    document.body.style.cursor = 'auto';
    document.querySelectorAll('a, button, input, textarea, .magnetic').forEach(el => {
      el.style.cursor = '';
    });
  }
});
