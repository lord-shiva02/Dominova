// --- TextType Component Class (Vanilla JS + GSAP) ---
class TextType {
    constructor(element, options = {}) {
        this.element = element;
        this.text = options.text || "";
        this.typingSpeed = options.typingSpeed ?? 50;
        this.initialDelay = options.initialDelay ?? 0;
        this.pauseDuration = options.pauseDuration ?? 2000;
        this.deletingSpeed = options.deletingSpeed ?? 30;
        this.loop = options.loop ?? true;
        this.showCursor = options.showCursor ?? true;
        this.hideCursorWhileTyping = options.hideCursorWhileTyping ?? false;
        this.cursorCharacter = options.cursorCharacter ?? '|';
        this.cursorClassName = options.cursorClassName ?? '';
        this.cursorBlinkDuration = options.cursorBlinkDuration ?? 0.5;
        this.textColors = options.textColors || [];
        this.variableSpeed = options.variableSpeed;
        this.onSentenceComplete = options.onSentenceComplete;
        this.startOnVisible = options.startOnVisible ?? false;
        this.reverseMode = options.reverseMode ?? false;

        this.displayedText = '';
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.currentTextIndex = 0;
        this.isVisible = !this.startOnVisible;
        
        this.textArray = Array.isArray(this.text) ? this.text : [this.text];

        this.init();
    }

    init() {
        this.element.classList.add('text-type');
        
        this.contentSpan = document.createElement('span');
        this.contentSpan.className = 'text-type__content';
        this.element.appendChild(this.contentSpan);

        if (this.showCursor) {
            this.cursorSpan = document.createElement('span');
            this.cursorSpan.className = `text-type__cursor ${this.cursorClassName}`;
            this.cursorSpan.textContent = this.cursorCharacter;
            this.element.appendChild(this.cursorSpan);

            // GSAP Cursor Blinking
            if (window.gsap) {
                window.gsap.set(this.cursorSpan, { opacity: 1 });
                window.gsap.to(this.cursorSpan, {
                    opacity: 0,
                    duration: this.cursorBlinkDuration,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power2.inOut'
                });
            } else {
                // Fallback to CSS blinking
                this.cursorSpan.style.animation = `blink ${this.cursorBlinkDuration * 2}s infinite step-end`;
                
                if (!document.getElementById('cursor-blink-styles')) {
                    const style = document.createElement('style');
                    style.id = 'cursor-blink-styles';
                    style.innerHTML = `
                        @keyframes blink {
                            from, to { opacity: 1; }
                            50% { opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }

        if (this.startOnVisible) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.isVisible = true;
                        this.startTyping();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this.element);
        } else {
            setTimeout(() => this.startTyping(), this.initialDelay);
        }
    }

    getRandomSpeed() {
        if (!this.variableSpeed) return this.typingSpeed;
        const { min, max } = this.variableSpeed;
        return Math.random() * (max - min) + min;
    }

    getCurrentTextColor() {
        if (this.textColors.length === 0) return 'inherit';
        return this.textColors[this.currentTextIndex % this.textColors.length];
    }

    startTyping() {
        const tick = () => {
            if (!this.isVisible) return;

            const currentText = this.textArray[this.currentTextIndex];
            const processedText = this.reverseMode ? currentText.split('').reverse().join('') : currentText;

            if (this.isDeleting) {
                if (this.displayedText === '') {
                    this.isDeleting = false;
                    
                    if (this.onSentenceComplete) {
                        this.onSentenceComplete(this.textArray[this.currentTextIndex], this.currentTextIndex);
                    }

                    if (this.currentTextIndex === this.textArray.length - 1 && !this.loop) {
                        return;
                    }

                    this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
                    this.currentCharIndex = 0;
                    
                    setTimeout(tick, 500);
                } else {
                    this.displayedText = this.displayedText.slice(0, -1);
                    this.updateDOM();
                    setTimeout(tick, this.deletingSpeed);
                }
            } else {
                if (this.currentCharIndex < processedText.length) {
                    this.displayedText += processedText[this.currentCharIndex];
                    this.currentCharIndex++;
                    this.updateDOM();
                    
                    const speed = this.variableSpeed ? this.getRandomSpeed() : this.typingSpeed;
                    setTimeout(tick, speed);
                } else if (this.textArray.length >= 1) {
                    if (!this.loop && this.currentTextIndex === this.textArray.length - 1) return;
                    
                    setTimeout(() => {
                        this.isDeleting = true;
                        tick();
                    }, this.pauseDuration);
                }
            }
        };

        tick();
    }

    updateDOM() {
        this.contentSpan.textContent = this.displayedText;
        
        const color = this.getCurrentTextColor();
        if (color.startsWith('linear-gradient')) {
            this.contentSpan.style.background = color;
            this.contentSpan.style.webkitBackgroundClip = 'text';
            this.contentSpan.style.webkitTextFillColor = 'transparent';
        } else {
            this.contentSpan.style.color = color;
            this.contentSpan.style.background = 'none';
            this.contentSpan.style.webkitBackgroundClip = 'initial';
            this.contentSpan.style.webkitTextFillColor = 'initial';
        }

        if (this.showCursor && this.hideCursorWhileTyping) {
            const currentText = this.textArray[this.currentTextIndex];
            const isTypingOrDeleting = this.currentCharIndex < currentText.length || this.isDeleting;
            if (isTypingOrDeleting) {
                this.cursorSpan.classList.add('text-type__cursor--hidden');
            } else {
                this.cursorSpan.classList.remove('text-type__cursor--hidden');
            }
        }
    }
}

// --- DecryptedText Component Class (Vanilla JS) ---
class DecryptedText {
    constructor(element, options = {}) {
        this.element = element;
        this.text = options.text || element.textContent || "";
        this.speed = options.speed ?? 50;
        this.maxIterations = options.maxIterations ?? 10;
        this.sequential = options.sequential ?? false;
        this.revealDirection = options.revealDirection ?? 'start';
        this.useOriginalCharsOnly = options.useOriginalCharsOnly ?? false;
        this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
        this.className = options.className || '';
        this.parentClassName = options.parentClassName || '';
        this.encryptedClassName = options.encryptedClassName || '';
        this.animateOn = options.animateOn || 'hover'; // 'hover', 'view', 'inViewHover', 'click'
        this.clickMode = options.clickMode || 'once';

        this.displayText = this.text;
        this.isAnimating = false;
        this.revealedIndices = new Set();
        this.hasAnimated = false;
        this.isDecrypted = this.animateOn !== 'click';
        this.direction = 'forward';
        this.interval = null;
        this.pointer = 0;
        this.order = [];

        this.availableChars = this.useOriginalCharsOnly
            ? Array.from(new Set(this.text.split(''))).filter(char => char !== ' ')
            : this.characters.split('');

        this.init();
    }

    init() {
        this.element.classList.add('decrypted-text-container');
        if (this.parentClassName) {
            this.element.classList.add(this.parentClassName);
        }
        
        this.element.innerHTML = '';

        // Screen-reader accessibility text
        const srOnly = document.createElement('span');
        srOnly.style.position = 'absolute';
        srOnly.style.width = '1px';
        srOnly.style.height = '1px';
        srOnly.style.padding = '0';
        srOnly.style.margin = '-1px';
        srOnly.style.overflow = 'hidden';
        srOnly.style.clip = 'rect(0,0,0,0)';
        srOnly.style.border = '0';
        srOnly.textContent = this.text;
        this.element.appendChild(srOnly);

        // Visual text wrapper
        this.ariaSpan = document.createElement('span');
        this.ariaSpan.setAttribute('aria-hidden', 'true');
        this.element.appendChild(this.ariaSpan);

        this.charSpans = [];
        this.text.split('').forEach((char, index) => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            this.ariaSpan.appendChild(charSpan);
            this.charSpans.push(charSpan);
        });

        if (this.animateOn === 'click') {
            this.encryptInstantly();
        } else {
            this.displayText = this.text;
            this.isDecrypted = true;
        }
        
        this.updateDOM();

        // Event Listeners
        if (this.animateOn === 'hover' || this.animateOn === 'inViewHover') {
            this.element.addEventListener('mouseenter', () => this.triggerHoverDecrypt());
            this.element.addEventListener('mouseleave', () => this.resetToPlainText());
        } else if (this.animateOn === 'click') {
            this.element.addEventListener('click', () => this.handleClick());
        }

        if (this.animateOn === 'view' || this.animateOn === 'inViewHover') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.triggerDecrypt();
                        this.hasAnimated = true;
                        if (this.animateOn === 'view') {
                            observer.disconnect();
                        }
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this.element);
        }
    }

    shuffleText(originalText, currentRevealed) {
        return originalText
            .split('')
            .map((char, i) => {
                if (char === ' ') return ' ';
                if (currentRevealed.has(i)) return originalText[i];
                return this.availableChars[Math.floor(Math.random() * this.availableChars.length)];
            })
            .join('');
    }

    computeOrder(len) {
        const order = [];
        if (len <= 0) return order;
        if (this.revealDirection === 'start') {
            for (let i = 0; i < len; i++) order.push(i);
            return order;
        }
        if (this.revealDirection === 'end') {
            for (let i = len - 1; i >= 0; i--) order.push(i);
            return order;
        }
        
        // Center-out reveal
        const middle = Math.floor(len / 2);
        let offset = 0;
        while (order.length < len) {
            if (offset % 2 === 0) {
                const idx = middle + offset / 2;
                if (idx >= 0 && idx < len) order.push(idx);
            } else {
                const idx = middle - Math.ceil(offset / 2);
                if (idx >= 0 && idx < len) order.push(idx);
            }
            offset++;
        }
        return order.slice(0, len);
    }

    fillAllIndices() {
        const s = new Set();
        for (let i = 0; i < this.text.length; i++) s.add(i);
        return s;
    }

    removeRandomIndices(set, count) {
        const arr = Array.from(set);
        for (let i = 0; i < count && arr.length > 0; i++) {
            const idx = Math.floor(Math.random() * arr.length);
            arr.splice(idx, 1);
        }
        return new Set(arr);
    }

    encryptInstantly() {
        const emptySet = new Set();
        this.revealedIndices = emptySet;
        this.displayText = this.shuffleText(this.text, emptySet);
        this.isDecrypted = false;
        this.updateDOM();
    }

    triggerDecrypt() {
        if (this.sequential) {
            this.order = this.computeOrder(this.text.length);
            this.pointer = 0;
            this.revealedIndices = new Set();
        } else {
            this.revealedIndices = new Set();
        }
        this.direction = 'forward';
        this.isAnimating = true;
        this.startInterval();
    }

    triggerReverse() {
        if (this.sequential) {
            this.order = this.computeOrder(this.text.length).slice().reverse();
            this.pointer = 0;
            this.revealedIndices = this.fillAllIndices();
            this.displayText = this.shuffleText(this.text, this.fillAllIndices());
        } else {
            this.revealedIndices = this.fillAllIndices();
            this.displayText = this.shuffleText(this.text, this.fillAllIndices());
        }
        this.direction = 'reverse';
        this.isAnimating = true;
        this.startInterval();
    }

    startInterval() {
        clearInterval(this.interval);
        let currentIteration = 0;

        const getNextIndex = (revealedSet) => {
            const textLength = this.text.length;
            switch (this.revealDirection) {
                case 'start':
                    return revealedSet.size;
                case 'end':
                    return textLength - 1 - revealedSet.size;
                case 'center': {
                    const middle = Math.floor(textLength / 2);
                    const offset = Math.floor(revealedSet.size / 2);
                    const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

                    if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
                        return nextIndex;
                    }

                    for (let i = 0; i < textLength; i++) {
                        if (!revealedSet.has(i)) return i;
                    }
                    return 0;
                }
                default:
                    return revealedSet.size;
            }
        };

        this.interval = setInterval(() => {
            if (this.sequential) {
                // Forward sequential
                if (this.direction === 'forward') {
                    if (this.revealedIndices.size < this.text.length) {
                        const nextIndex = getNextIndex(this.revealedIndices);
                        this.revealedIndices.add(nextIndex);
                        this.displayText = this.shuffleText(this.text, this.revealedIndices);
                        this.updateDOM();
                    } else {
                        clearInterval(this.interval);
                        this.isAnimating = false;
                        this.isDecrypted = true;
                        this.displayText = this.text;
                        this.updateDOM();
                    }
                }
                // Reverse sequential
                if (this.direction === 'reverse') {
                    if (this.pointer < this.order.length) {
                        const idxToRemove = this.order[this.pointer++];
                        this.revealedIndices.delete(idxToRemove);
                        this.displayText = this.shuffleText(this.text, this.revealedIndices);
                        this.updateDOM();
                        if (this.revealedIndices.size === 0) {
                            clearInterval(this.interval);
                            this.isAnimating = false;
                            this.isDecrypted = false;
                            this.updateDOM();
                        }
                    } else {
                        clearInterval(this.interval);
                        this.isAnimating = false;
                        this.isDecrypted = false;
                        this.updateDOM();
                    }
                }
            } else {
                // Non-Sequential Forward
                if (this.direction === 'forward') {
                    this.displayText = this.shuffleText(this.text, this.revealedIndices);
                    this.updateDOM();
                    currentIteration++;
                    if (currentIteration >= this.maxIterations) {
                        clearInterval(this.interval);
                        this.isAnimating = false;
                        this.displayText = this.text;
                        this.isDecrypted = true;
                        this.updateDOM();
                    }
                }
                // Non-Sequential Reverse
                if (this.direction === 'reverse') {
                    if (this.revealedIndices.size === 0) {
                        this.revealedIndices = this.fillAllIndices();
                    }
                    const removeCount = Math.max(1, Math.ceil(this.text.length / Math.max(1, this.maxIterations)));
                    this.revealedIndices = this.removeRandomIndices(this.revealedIndices, removeCount);
                    this.displayText = this.shuffleText(this.text, this.revealedIndices);
                    this.updateDOM();
                    currentIteration++;
                    if (this.revealedIndices.size === 0 || currentIteration >= this.maxIterations) {
                        clearInterval(this.interval);
                        this.isAnimating = false;
                        this.isDecrypted = false;
                        this.displayText = this.shuffleText(this.text, new Set());
                        this.updateDOM();
                    }
                }
            }
        }, this.speed);
    }

    handleClick() {
        if (this.animateOn !== 'click') return;

        if (this.clickMode === 'once') {
            if (this.isDecrypted) return;
            this.direction = 'forward';
            this.triggerDecrypt();
        }

        if (this.clickMode === 'toggle') {
            if (this.isDecrypted) {
                this.triggerReverse();
            } else {
                this.direction = 'forward';
                this.triggerDecrypt();
            }
        }
    }

    triggerHoverDecrypt() {
        if (this.isAnimating) return;
        this.revealedIndices = new Set();
        this.isDecrypted = false;
        this.displayText = this.text;
        this.direction = 'forward';
        this.isAnimating = true;
        this.startInterval();
    }

    resetToPlainText() {
        clearInterval(this.interval);
        this.isAnimating = false;
        this.revealedIndices = new Set();
        this.displayText = this.text;
        this.isDecrypted = true;
        this.direction = 'forward';
        this.updateDOM();
    }

    updateDOM() {
        const chars = this.displayText.split('');
        chars.forEach((char, index) => {
            const charSpan = this.charSpans[index];
            if (!charSpan) return;
            charSpan.textContent = char;
            
            const isRevealedOrDone = this.revealedIndices.has(index) || (!this.isAnimating && this.isDecrypted);
            if (isRevealedOrDone) {
                charSpan.className = this.className;
            } else {
                charSpan.className = this.encryptedClassName;
            }
        });
    }
}

// --- ScrambledText Component Class (Vanilla JS) ---
class ScrambledText {
    constructor(element, options = {}) {
        this.element = element;
        this.radius = options.radius ?? 100;
        this.duration = options.duration ?? 1.2;
        this.speed = options.speed ?? 0.5;
        this.scrambleChars = options.scrambleChars || '.:';

        this.init();
    }

    init() {
        const text = this.element.textContent.trim();
        this.element.innerHTML = '';

        this.charSpans = [];
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.dataset.content = char;
            this.element.appendChild(span);
            this.charSpans.push(span);
        });

        // Mouse pointer move listener (window scope for smooth tracking)
        window.addEventListener('pointermove', (e) => this.handleMove(e));
    }

    handleMove(e) {
        this.charSpans.forEach(span => {
            if (span.dataset.content === ' ') return;

            const rect = span.getBoundingClientRect();
            const charX = rect.left + rect.width / 2;
            const charY = rect.top + rect.height / 2;

            const dx = e.clientX - charX;
            const dy = e.clientY - charY;
            const dist = Math.hypot(dx, dy);

            if (dist < this.radius) {
                this.scrambleChar(span, dist);
            }
        });
    }

    scrambleChar(span, dist) {
        if (span.dataset.animating === 'true') return;
        span.dataset.animating = 'true';

        const original = span.dataset.content;
        const effectDuration = this.duration * (1 - dist / this.radius) * 1000;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / effectDuration, 1);

            if (progress < 1) {
                // Set a random scramble character from scrambleChars
                const randIndex = Math.floor(Math.random() * this.scrambleChars.length);
                span.textContent = this.scrambleChars[randIndex];
                
                // Introduce micro delays relative to speed
                setTimeout(() => requestAnimationFrame(tick), 1000 * this.speed * 0.1);
            } else {
                span.textContent = original;
                span.dataset.animating = 'false';
            }
        };

        requestAnimationFrame(tick);
    }
}

// --- Stack Component Class (Vanilla JS Card Stack) ---
class StackGallery {
    constructor(container, options = {}) {
        this.container = container;
        this.images = options.images || [];
        this.sensitivity = options.sensitivity ?? 150;
        this.randomRotation = options.randomRotation ?? true;
        this.onCardClick = options.onCardClick;

        this.stack = [...this.images];
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.perspective = '1000px';

        this.render();
    }

    render() {
        this.container.innerHTML = '';

        this.stack.forEach((src, index) => {
            const card = document.createElement('div');
            card.className = 'stack-card-el';

            // Custom inline styles for premium look
            card.style.position = 'absolute';
            card.style.width = '140px';
            card.style.height = '180px';
            card.style.left = 'calc(50% - 70px)';
            card.style.top = 'calc(50% - 90px)';
            card.style.borderRadius = '12px';
            card.style.overflow = 'hidden';
            card.style.cursor = 'grab';
            card.style.border = '2px solid rgba(251, 208, 81, 0.4)';
            card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
            card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            const zIndex = index + 1;
            const scale = 1 + index * 0.05 - this.stack.length * 0.05;
            const rotateZ = (this.stack.length - index - 1) * -4 + (this.randomRotation ? (Math.random() * 8 - 4) : 0);
            const translateY = (this.stack.length - index - 1) * -8;

            card.style.zIndex = zIndex;
            card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotateZ}deg)`;
            card.style.transformOrigin = 'center bottom';

            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.pointerEvents = 'none';
            img.style.userSelect = 'none';
            card.appendChild(img);

            // Bind drag/swipe triggers for top card
            if (index === this.stack.length - 1) {
                this.bindDrag(card, scale, rotateZ, translateY);
            }

            this.container.appendChild(card);
        });
    }

    bindDrag(card, baseScale, baseRotate, baseTranslateY) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;

        const onStart = (e) => {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            card.style.cursor = 'grabbing';
            card.style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;
            currentX = x - startX;
            currentY = y - startY;

            const dragRotateY = currentX * 0.15;
            card.style.transform = `translate(${currentX}px, ${currentY + baseTranslateY}px) scale(${baseScale * 1.05}) rotate(${baseRotate + dragRotateY}deg)`;
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            card.style.cursor = 'grab';
            card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            const dragDistance = Math.hypot(currentX, currentY);
            if (dragDistance > this.sensitivity) {
                this.sendToBack();
            } else {
                card.style.transform = `translateY(${baseTranslateY}px) scale(${baseScale}) rotate(${baseRotate}deg)`;
            }
            currentX = 0;
            currentY = 0;
        };

        card.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        card.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);

        card.addEventListener('click', () => {
            if (Math.hypot(currentX, currentY) < 5) {
                this.sendToBack();
            }
        });
    }

    sendToBack() {
        const topCard = this.stack.pop();
        this.stack.unshift(topCard);
        this.render();

        if (this.onCardClick) {
            this.onCardClick(this.stack[this.stack.length - 1]);
        }
    }
}

// --- CircularGallery Component Class (Vanilla JS + CSS 3D Carousel) ---
class CircularGallery {
    constructor(container, options = {}) {
        this.container = container;
        this.items = options.items || [];
        this.bend = options.bend ?? 3;
        this.textColor = options.textColor ?? '#ffffff';
        this.borderRadius = options.borderRadius ?? 0.05;
        this.scrollEase = options.scrollEase ?? 0.05;
        this.scrollSpeed = options.scrollSpeed ?? 2;
        this.onItemClick = options.onItemClick;

        this.currentAngle = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.perspective = '1000px';

        this.track = document.createElement('div');
        this.track.style.position = 'absolute';
        this.track.style.width = '100%';
        this.track.style.height = '100%';
        this.track.style.transformStyle = 'preserve-3d';
        this.track.style.transition = 'transform 0.5s ease-out';
        this.container.appendChild(this.track);

        const count = this.items.length;
        const angleStep = 360 / count;
        const radius = 180; // responsive cylinder radius

        this.items.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'circular-card';
            card.style.position = 'absolute';
            card.style.width = '80px';
            card.style.height = '120px';
            card.style.left = 'calc(50% - 40px)';
            card.style.top = 'calc(50% - 60px)';
            card.style.borderRadius = '10px';
            card.style.overflow = 'hidden';
            card.style.border = '2px solid rgba(251, 208, 81, 0.4)';
            card.style.cursor = 'pointer';
            card.style.transition = 'border-color 0.3s, transform 0.3s';

            const angle = i * angleStep;
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

            const img = document.createElement('img');
            img.src = item.image;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            card.appendChild(img);

            card.addEventListener('click', () => {
                if (this.onItemClick) {
                    this.onItemClick(item.image);
                }
                this.rotateTo(i);

                this.track.querySelectorAll('.circular-card').forEach(c => c.style.borderColor = 'rgba(251, 208, 81, 0.4)');
                card.style.borderColor = 'var(--primary)';
            });

            if (i === 0) card.style.borderColor = 'var(--primary)';
            this.track.appendChild(card);
        });

        // Drag physics & gestures
        let isDragging = false;
        let startX = 0;
        let startAngle = 0;

        const onStart = (e) => {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startAngle = this.currentAngle;
            this.track.style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const x = e.clientX || e.touches[0].clientX;
            const dx = x - startX;
            const deltaAngle = (dx / this.container.clientWidth) * 180;
            this.currentAngle = startAngle + deltaAngle;
            this.track.style.transform = `translateZ(-${radius}px) rotateY(${this.currentAngle}deg)`;
        };

        const onEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            // Snap to nearest index
            const snappedIndex = Math.round(-this.currentAngle / angleStep);
            this.rotateTo(snappedIndex);
        };

        this.container.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.container.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);

        this.rotateTo(0);
    }

    rotateTo(index) {
        const count = this.items.length;
        const angleStep = 360 / count;
        const radius = 180;
        const targetAngle = -index * angleStep;

        this.track.style.transition = 'transform 0.5s ease-out';
        this.track.style.transform = `translateZ(-${radius}px) rotateY(${targetAngle}deg)`;
        this.currentAngle = targetAngle;
    }
}

// --- DomeGallery Component Class (Vanilla JS CSS 3D Dome) ---
class DomeGallery {
    constructor(container, options = {}) {
        this.container = container;
        this.images = options.images || [];
        this.maxVerticalRotationDeg = options.maxVerticalRotationDeg ?? 8;
        this.onImageClick = options.onImageClick;

        this.rotation = { x: 0, y: 0 };
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.startRot = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.classList.add('dome-gallery');

        this.radius = 240; // dome cylinder radius
        this.container.style.setProperty('--radius', `${this.radius}px`);

        this.sphere = document.createElement('div');
        this.sphere.className = 'dome-sphere';
        this.container.appendChild(this.sphere);

        this.buildTiles();
        this.bindEvents();
        this.applyTransform();
    }

    buildTiles() {
        const count = this.images.length;
        const angleStep = 25; 
        const startAngle = -((count - 1) * angleStep) / 2;

        this.images.forEach((src, i) => {
            const tile = document.createElement('div');
            tile.className = 'dome-tile';

            const rotateY = startAngle + i * angleStep;
            const rotateX = (i % 2 === 0 ? 5 : -5);

            tile.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(var(--radius))`;

            const img = document.createElement('img');
            img.src = src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            tile.appendChild(img);

            tile.addEventListener('click', () => {
                if (this.onImageClick) {
                    this.onImageClick(src);
                }

                this.sphere.querySelectorAll('.dome-tile').forEach(t => t.classList.remove('active'));
                tile.classList.add('active');
            });

            if (i === 0) tile.classList.add('active');

            this.sphere.appendChild(tile);
        });
    }

    bindEvents() {
        const onStart = (e) => {
            this.isDragging = true;
            this.startX = e.clientX || e.touches[0].clientX;
            this.startY = e.clientY || e.touches[0].clientY;
            this.startRot = { ...this.rotation };
            this.container.style.cursor = 'grabbing';
        };

        const onMove = (e) => {
            if (!this.isDragging) return;
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;
            const dx = x - this.startX;
            const dy = y - this.startY;

            this.rotation.y = this.startRot.y + dx * 0.25;
            this.rotation.x = Math.max(-this.maxVerticalRotationDeg, Math.min(this.maxVerticalRotationDeg, this.startRot.x - dy * 0.15));

            this.applyTransform();
        };

        const onEnd = () => {
            this.isDragging = false;
            this.container.style.cursor = 'grab';
        };

        this.container.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.container.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);
    }

    applyTransform() {
        this.sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${this.rotation.x}deg) rotateY(${this.rotation.y}deg)`;
    }
}

// --- DecayCard Component Class (Vanilla JS SVG Turbulence Displacement) ---
class DecayCard {
    constructor(container, options = {}) {
        this.container = container;
        this.image = options.image || '';
        this.width = options.width || 300;
        this.height = options.height || 400;
        this.baseFrequency = options.baseFrequency ?? 0.015;
        this.numOctaves = options.numOctaves ?? 5;
        this.seed = options.seed ?? 4;
        this.maxDisplacement = options.maxDisplacement ?? 400;
        this.movementBound = options.movementBound ?? 50;
        this.text = options.text || '';

        this.filterId = `decay-filter-${Math.random().toString(36).substr(2, 9)}`;

        this.cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.cachedCursor = { ...this.cursor };
        this.winsize = { width: window.innerWidth, height: window.innerHeight };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', '-60 -75 720 900');
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        this.svg.style.position = 'relative';
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.svg.style.display = 'block';
        this.svg.style.willChange = 'transform';
        this.container.appendChild(this.svg);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svg.appendChild(defs);

        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', this.filterId);
        defs.appendChild(filter);

        this.turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
        this.turbulence.setAttribute('type', 'turbulence');
        this.turbulence.setAttribute('baseFrequency', this.baseFrequency.toString());
        this.turbulence.setAttribute('numOctaves', this.numOctaves.toString());
        this.turbulence.setAttribute('seed', this.seed.toString());
        this.turbulence.setAttribute('stitchTiles', 'stitch');
        this.turbulence.setAttribute('x', '0%');
        this.turbulence.setAttribute('y', '0%');
        this.turbulence.setAttribute('width', '100%');
        this.turbulence.setAttribute('height', '100%');
        this.turbulence.setAttribute('result', 'turbulence1');
        filter.appendChild(this.turbulence);

        this.displacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        this.displacementMap.setAttribute('in', 'SourceGraphic');
        this.displacementMap.setAttribute('in2', 'turbulence1');
        this.displacementMap.setAttribute('scale', '0');
        this.displacementMap.setAttribute('xChannelSelector', 'R');
        this.displacementMap.setAttribute('yChannelSelector', 'B');
        this.displacementMap.setAttribute('x', '0%');
        this.displacementMap.setAttribute('y', '0%');
        this.displacementMap.setAttribute('width', '100%');
        this.displacementMap.setAttribute('height', '100%');
        this.displacementMap.setAttribute('result', 'displacementMap3');
        filter.appendChild(this.displacementMap);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(g);

        this.svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.image);
        this.svgImage.setAttribute('x', '0');
        this.svgImage.setAttribute('y', '0');
        this.svgImage.setAttribute('width', '600');
        this.svgImage.setAttribute('height', '750');
        this.svgImage.setAttribute('filter', `url(#${this.filterId})`);
        this.svgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        g.appendChild(this.svgImage);

        if (this.text) {
            this.textEl = document.createElement('div');
            this.textEl.className = 'decay-card-text';
            this.textEl.innerHTML = this.text;
            this.container.appendChild(this.textEl);
        }

        this.bindEvents();
        this.startRender();
    }

    updateImage(src) {
        this.image = src;
        this.svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
    }

    bindEvents() {
        this.resizeHandler = () => {
            this.winsize = { width: window.innerWidth, height: window.innerHeight };
        };
        this.mouseMoveHandler = (ev) => {
            this.cursor = { x: ev.clientX, y: ev.clientY };
        };

        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
    }

    startRender() {
        const lerp = (a, b, n) => (1 - n) * a + n * b;
        const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
        const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);

        const imgValues = {
            imgTransforms: { x: 0, y: 0, rz: 0 },
            displacementScale: 0
        };

        const render = () => {
            let targetX = lerp(imgValues.imgTransforms.x, map(this.cursor.x, 0, this.winsize.width, -120, 120), 0.1);
            let targetY = lerp(imgValues.imgTransforms.y, map(this.cursor.y, 0, this.winsize.height, -120, 120), 0.1);
            let targetRz = lerp(imgValues.imgTransforms.rz, map(this.cursor.x, 0, this.winsize.width, -10, 10), 0.1);

            if (targetX > this.movementBound) targetX = this.movementBound + (targetX - this.movementBound) * 0.2;
            if (targetX < -this.movementBound) targetX = -this.movementBound + (targetX + this.movementBound) * 0.2;
            if (targetY > this.movementBound) targetY = this.movementBound + (targetY - this.movementBound) * 0.2;
            if (targetY < -this.movementBound) targetY = -this.movementBound + (targetY + this.movementBound) * 0.2;

            imgValues.imgTransforms.x = targetX;
            imgValues.imgTransforms.y = targetY;
            imgValues.imgTransforms.rz = targetRz;

            if (window.gsap) {
                window.gsap.set(this.svg, {
                    x: imgValues.imgTransforms.x,
                    y: imgValues.imgTransforms.y,
                    rotateZ: imgValues.imgTransforms.rz
                });
            }

            const cursorTravelledDistance = distance(
                this.cachedCursor.x,
                this.cursor.x,
                this.cachedCursor.y,
                this.cursor.y
            );
            imgValues.displacementScale = lerp(
                imgValues.displacementScale,
                map(cursorTravelledDistance, 0, 200, 0, this.maxDisplacement),
                0.06
            );

            if (window.gsap) {
                window.gsap.set(this.displacementMap, { attr: { scale: imgValues.displacementScale } });
            }

            this.cachedCursor = { ...this.cursor };
            this.rafId = requestAnimationFrame(render);
        };

        this.rafId = requestAnimationFrame(render);
    }

    destroy() {
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
}

// --- CardSwap Component Class (Vanilla JS Stack Swap) ---
class CardSwap {
    constructor(container, options = {}) {
        this.container = container;
        this.cardsData = options.cards || [];
        this.width = options.width || 240;
        this.height = options.height || 300;
        this.cardDistance = options.cardDistance ?? 40;
        this.verticalDistance = options.verticalDistance ?? 45;
        this.delay = options.delay ?? 3500;
        this.skewAmount = options.skewAmount ?? 6;
        this.easing = options.easing || 'elastic';

        this.order = Array.from({ length: this.cardsData.length }, (_, i) => i);
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.classList.add('card-swap-container');

        this.cardElements = [];
        const total = this.cardsData.length;

        this.cardsData.forEach((data, i) => {
            const card = document.createElement('div');
            card.className = 'swap-card';
            card.style.width = `${this.width}px`;
            card.style.height = `${this.height}px`;

            const img = document.createElement('img');
            img.src = data.image;
            card.appendChild(img);

            const content = document.createElement('div');
            content.className = 'swap-card-content';
            content.innerHTML = `<h3>${data.title}</h3><p>${data.description}</p>`;
            card.appendChild(content);

            this.container.appendChild(card);
            this.cardElements.push(card);
        });

        this.updatePlacement();
        this.startAutoplay();
    }

    makeSlot(i, total) {
        return {
            x: i * this.cardDistance,
            y: -i * this.verticalDistance,
            z: -i * this.cardDistance * 1.5,
            zIndex: total - i
        };
    }

    updatePlacement() {
        const total = this.cardElements.length;
        this.order.forEach((cardIdx, i) => {
            const el = this.cardElements[cardIdx];
            const slot = this.makeSlot(i, total);
            if (window.gsap) {
                window.gsap.set(el, {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    xPercent: -50,
                    yPercent: -50,
                    skewY: this.skewAmount,
                    transformOrigin: 'center center',
                    zIndex: slot.zIndex,
                    force3D: true
                });
            }
        });
    }

    swap() {
        if (this.order.length < 2) return;

        const [front, ...rest] = this.order;
        const elFront = this.cardElements[front];

        const config = this.easing === 'elastic'
            ? { ease: 'elastic.out(0.6,0.9)', durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 }
            : { ease: 'power1.inOut', durDrop: 0.8, durMove: 0.8, durReturn: 0.8, promoteOverlap: 0.45, returnDelay: 0.2 };

        if (window.gsap) {
            const tl = window.gsap.timeline();

            tl.to(elFront, {
                y: '+=400',
                duration: config.durDrop,
                ease: config.ease
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

            rest.forEach((idx, i) => {
                const el = this.cardElements[idx];
                const slot = this.makeSlot(i, this.cardElements.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(el, {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    duration: config.durMove,
                    ease: config.ease
                }, `promote+=${i * 0.15}`);
            });

            const backSlot = this.makeSlot(this.cardElements.length - 1, this.cardElements.length);
            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);

            tl.call(() => {
                window.gsap.set(elFront, { zIndex: backSlot.zIndex });
            }, undefined, 'return');

            tl.to(elFront, {
                x: backSlot.x,
                y: backSlot.y,
                z: backSlot.z,
                duration: config.durReturn,
                ease: config.ease
            }, 'return');

            tl.call(() => {
                this.order = [...rest, front];
            });
        }
    }

    startAutoplay() {
        this.interval = setInterval(() => this.swap(), this.delay);
    }

    destroy() {
        clearInterval(this.interval);
    }
}

// --- Carousel Component Class (Vanilla JS rotating slider) ---
class Carousel {
    constructor(container, options = {}) {
        this.container = container;
        this.items = options.items || [];
        this.baseWidth = options.baseWidth || 280;
        this.autoplay = options.autoplay ?? true;
        this.autoplayDelay = options.autoplayDelay ?? 3000;
        this.loop = options.loop ?? true;

        this.position = this.loop ? 1 : 0;
        this.gap = 16;
        this.itemWidth = this.baseWidth - 32;
        this.offset = this.itemWidth + this.gap;
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.container.innerHTML = '';

        this.carouselEl = document.createElement('div');
        this.carouselEl.className = 'carousel-container';
        this.carouselEl.style.width = `${this.baseWidth}px`;
        this.container.appendChild(this.carouselEl);

        this.track = document.createElement('div');
        this.track.className = 'carousel-track';
        this.track.style.width = `${this.itemWidth}px`;
        this.track.style.gap = `${this.gap}px`;
        this.track.style.perspective = '1000px';
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        this.carouselEl.appendChild(this.track);

        this.renderItems = this.loop
            ? [this.items[this.items.length - 1], ...this.items, this.items[0]]
            : this.items;

        this.itemElements = [];
        this.renderItems.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'carousel-item';
            card.style.width = `${this.itemWidth}px`;

            const img = document.createElement('img');
            img.src = item.image;
            card.appendChild(img);

            const content = document.createElement('div');
            content.className = 'carousel-item-content';
            content.innerHTML = `<div class="carousel-item-title">${item.title}</div><p class="carousel-item-description">${item.description}</p>`;
            card.appendChild(content);

            this.track.appendChild(card);
            this.itemElements.push(card);
        });

        const indContainer = document.createElement('div');
        indContainer.className = 'carousel-indicators-container';
        this.carouselEl.appendChild(indContainer);

        this.indicatorsBox = document.createElement('div');
        this.indicatorsBox.className = 'carousel-indicators';
        indContainer.appendChild(this.indicatorsBox);

        this.indicatorButtons = [];
        this.items.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'carousel-indicator';
            btn.addEventListener('click', () => this.goTo(this.loop ? idx + 1 : idx));
            this.indicatorsBox.appendChild(btn);
            this.indicatorButtons.push(btn);
        });

        this.updatePosition();
        this.bindGestures();

        if (this.autoplay) {
            this.startAutoplay();
        }
    }

    goTo(pos) {
        if (this.isAnimating) return;
        this.position = pos;
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        this.updatePosition();

        this.isAnimating = true;
        setTimeout(() => {
            this.isAnimating = false;
            this.checkLoopBoundaries();
        }, 500);
    }

    checkLoopBoundaries() {
        if (!this.loop) return;

        if (this.position === this.renderItems.length - 1) {
            this.track.style.transition = 'none';
            this.position = 1;
            this.updatePosition();
        } else if (this.position === 0) {
            this.track.style.transition = 'none';
            this.position = this.items.length;
            this.updatePosition();
        }
    }

    updatePosition() {
        const tx = -this.position * this.offset;
        this.track.style.transform = `translateX(${tx}px)`;

        this.itemElements.forEach((el, index) => {
            const diff = index - this.position;
            let angle = diff * 45;
            el.style.transform = `rotateY(${angle}deg) translateZ(${Math.abs(diff) * -30}px)`;
            el.style.zIndex = (100 - Math.abs(diff)).toString();
        });

        const activeIndex = this.loop
            ? (this.position - 1 + this.items.length) % this.items.length
            : this.position;

        this.indicatorButtons.forEach((btn, idx) => {
            if (idx === activeIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    bindGestures() {
        let startX = 0;
        let currentDrag = 0;
        let isDragging = false;

        const onStart = (e) => {
            if (this.isAnimating) return;
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            this.track.style.transition = 'none';
            clearInterval(this.autoplayInterval);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const x = e.clientX || e.touches[0].clientX;
            currentDrag = x - startX;

            const tx = -this.position * this.offset + currentDrag;
            this.track.style.transform = `translateX(${tx}px)`;
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            const threshold = 60;
            if (currentDrag < -threshold) {
                this.goTo(this.position + 1);
            } else if (currentDrag > threshold) {
                this.goTo(this.position - 1);
            } else {
                this.goTo(this.position);
            }

            currentDrag = 0;
            if (this.autoplay) {
                this.startAutoplay();
            }
        };

        this.track.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.track.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);
    }

    startAutoplay() {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = setInterval(() => {
            this.goTo(this.position + 1);
        }, this.autoplayDelay);
    }

    destroy() {
        clearInterval(this.autoplayInterval);
    }
}

// --- Gradient Blinds Background Component (Vanilla JS + OGL) ---
class GradientBlinds {
    constructor(container, options = {}) {
        this.container = container;
        this.paused = options.paused ?? false;
        this.gradientColors = options.gradientColors || ['#FF9FFC', '#5227FF'];
        this.angle = options.angle ?? 0;
        this.noise = options.noise ?? 0.3;
        this.blindCount = options.blindCount ?? 16;
        this.blindMinWidth = options.blindMinWidth ?? 60;
        this.mouseDampening = options.mouseDampening ?? 0.15;
        this.mirrorGradient = options.mirrorGradient ?? false;
        this.spotlightRadius = options.spotlightRadius ?? 0.5;
        this.spotlightSoftness = options.spotlightSoftness ?? 1;
        this.spotlightOpacity = options.spotlightOpacity ?? 1;
        this.distortAmount = options.distortAmount ?? 0;
        this.shineDirection = options.shineDirection ?? 'left';
        this.mixBlendMode = options.mixBlendMode ?? 'lighten';
        this.dpr = options.dpr;

        this.mouseTarget = [0, 0];
        this.lastTime = 0;
        this.firstResize = true;
        this.raf = null;

        this.init();
    }

    init() {
        if (!this.container) return;
        const oglLib = window.OGL || window.ogl;
        if (!oglLib) {
            console.error("OGL library is not loaded.");
            return;
        }

        const { Renderer, Program, Mesh, Triangle } = oglLib;

        this.renderer = new Renderer({
            dpr: this.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
            alpha: true,
            antialias: true
        });
        const gl = this.renderer.gl;
        this.canvas = gl.canvas;

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.container.appendChild(this.canvas);

        const vertex = `
            attribute vec2 position;
            attribute vec2 uv;
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragment = `
            #ifdef GL_ES
            precision mediump float;
            #endif

            uniform vec3  iResolution;
            uniform vec2  iMouse;
            uniform float iTime;

            uniform float uAngle;
            uniform float uNoise;
            uniform float uBlindCount;
            uniform float uSpotlightRadius;
            uniform float uSpotlightSoftness;
            uniform float uSpotlightOpacity;
            uniform float uMirror;
            uniform float uDistort;
            uniform float uShineFlip;
            uniform vec3  uColor0;
            uniform vec3  uColor1;
            uniform vec3  uColor2;
            uniform vec3  uColor3;
            uniform vec3  uColor4;
            uniform vec3  uColor5;
            uniform vec3  uColor6;
            uniform vec3  uColor7;
            uniform int   uColorCount;

            varying vec2 vUv;

            float rand(vec2 co){
                return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
            }

            vec2 rotate2D(vec2 p, float a){
                float c = cos(a);
                float s = sin(a);
                return mat2(c, -s, s, c) * p;
            }

            vec3 getGradientColor(float t){
                float tt = clamp(t, 0.0, 1.0);
                int count = uColorCount;
                if (count < 2) count = 2;
                float scaled = tt * float(count - 1);
                float seg = floor(scaled);
                float f = fract(scaled);

                if (seg < 1.0) return mix(uColor0, uColor1, f);
                if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
                if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
                if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
                if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
                if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
                if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
                if (count > 7) return uColor7;
                if (count > 6) return uColor6;
                if (count > 5) return uColor5;
                if (count > 4) return uColor4;
                if (count > 3) return uColor3;
                if (count > 2) return uColor2;
                return uColor1;
            }

            void mainImage( out vec4 fragColor, in vec2 fragCoord )
            {
                vec2 uv0 = fragCoord.xy / iResolution.xy;

                float aspect = iResolution.x / iResolution.y;
                vec2 p = uv0 * 2.0 - 1.0;
                p.x *= aspect;
                vec2 pr = rotate2D(p, uAngle);
                pr.x /= aspect;
                vec2 uv = pr * 0.5 + 0.5;

                vec2 uvMod = uv;
                if (uDistort > 0.0) {
                    float a = uvMod.y * 6.0;
                    float b = uvMod.x * 6.0;
                    float w = 0.01 * uDistort;
                    uvMod.x += sin(a) * w;
                    uvMod.y += cos(b) * w;
                }
                float t = uvMod.x;
                if (uMirror > 0.5) {
                    t = 1.0 - abs(1.0 - 2.0 * fract(t));
                }
                vec3 base = getGradientColor(t);

                vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
                float d = length(uv0 - offset);
                float r = max(uSpotlightRadius, 1e-4);
                float dn = d / r;
                float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
                vec3 cir = vec3(spot);
                float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
                if (uShineFlip > 0.5) stripe = 1.0 - stripe;
                vec3 ran = vec3(stripe);

                vec3 col = cir + base - ran;
                col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

                fragColor = vec4(col, 1.0);
            }

            void main() {
                vec4 color;
                mainImage(color, vUv * iResolution.xy);
                gl_FragColor = color;
            }
        `;

        const hexToRGB = hex => {
            const c = hex.replace('#', '').padEnd(6, '0');
            const r = parseInt(c.slice(0, 2), 16) / 255;
            const g = parseInt(c.slice(2, 4), 16) / 255;
            const b = parseInt(c.slice(4, 6), 16) / 255;
            return [r, g, b];
        };

        const prepStops = stops => {
            const MAX_COLORS = 8;
            const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);
            if (base.length === 1) base.push(base[0]);
            while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
            const arr = [];
            for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[i]));
            const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
            return { arr, count };
        };

        const { arr: colorArr, count: colorCount } = prepStops(this.gradientColors);

        this.uniforms = {
            iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
            iMouse: { value: [0, 0] },
            iTime: { value: 0 },
            uAngle: { value: (this.angle * Math.PI) / 180 },
            uNoise: { value: this.noise },
            uBlindCount: { value: Math.max(1, this.blindCount) },
            uSpotlightRadius: { value: this.spotlightRadius },
            uSpotlightSoftness: { value: this.spotlightSoftness },
            uSpotlightOpacity: { value: this.spotlightOpacity },
            uMirror: { value: this.mirrorGradient ? 1 : 0 },
            uDistort: { value: this.distortAmount },
            uShineFlip: { value: this.shineDirection === 'right' ? 1 : 0 },
            uColor0: { value: colorArr[0] },
            uColor1: { value: colorArr[1] },
            uColor2: { value: colorArr[2] },
            uColor3: { value: colorArr[3] },
            uColor4: { value: colorArr[4] },
            uColor5: { value: colorArr[5] },
            uColor6: { value: colorArr[6] },
            uColor7: { value: colorArr[7] },
            uColorCount: { value: colorCount }
        };

        this.program = new Program(gl, {
            vertex,
            fragment,
            uniforms: this.uniforms
        });

        this.geometry = new Triangle(gl);
        this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });

        const resize = () => {
            const rect = this.container.getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];

            if (this.blindMinWidth && this.blindMinWidth > 0) {
                const maxByMinWidth = Math.max(1, Math.floor(rect.width / this.blindMinWidth));
                const effective = this.blindCount ? Math.min(this.blindCount, maxByMinWidth) : maxByMinWidth;
                this.uniforms.uBlindCount.value = Math.max(1, effective);
            } else {
                this.uniforms.uBlindCount.value = Math.max(1, this.blindCount);
            }

            if (this.firstResize) {
                this.firstResize = false;
                const cx = gl.drawingBufferWidth / 2;
                const cy = gl.drawingBufferHeight / 2;
                this.uniforms.iMouse.value = [cx, cy];
                this.mouseTarget = [cx, cy];
            }
        };

        resize();
        this.ro = new ResizeObserver(resize);
        this.ro.observe(this.container);

        this.onPointerMove = e => {
            const rect = this.canvas.getBoundingClientRect();
            const scale = this.renderer.dpr || 1;
            const x = (e.clientX - rect.left) * scale;
            const y = (rect.height - (e.clientY - rect.top)) * scale;
            this.mouseTarget = [x, y];
            if (this.mouseDampening <= 0) {
                this.uniforms.iMouse.value = [x, y];
            }
        };
        this.canvas.addEventListener('pointermove', this.onPointerMove);

        const loop = t => {
            this.raf = requestAnimationFrame(loop);
            this.uniforms.iTime.value = t * 0.001;

            if (this.mouseDampening > 0) {
                if (!this.lastTime) this.lastTime = t;
                const dt = (t - this.lastTime) / 1000;
                this.lastTime = t;
                const tau = Math.max(1e-4, this.mouseDampening);
                let factor = 1 - Math.exp(-dt / tau);
                if (factor > 1) factor = 1;
                const target = this.mouseTarget;
                const cur = this.uniforms.iMouse.value;
                cur[0] += (target[0] - cur[0]) * factor;
                cur[1] += (target[1] - cur[1]) * factor;
            } else {
                this.lastTime = t;
            }

            if (!this.paused && this.program && this.mesh) {
                try {
                    this.renderer.render({ scene: this.mesh });
                } catch (e) {
                    console.error(e);
                }
            }
        };
        this.raf = requestAnimationFrame(loop);
    }

    destroy() {
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.canvas) this.canvas.removeEventListener('pointermove', this.onPointerMove);
        if (this.ro) this.ro.disconnect();
        if (this.canvas && this.canvas.parentElement === this.container) {
            this.container.removeChild(this.canvas);
        }

        const callIfFn = (obj, key) => {
            if (obj && typeof obj[key] === 'function') {
                obj[key].call(obj);
            }
        };

        callIfFn(this.program, 'remove');
        callIfFn(this.geometry, 'remove');
        callIfFn(this.mesh, 'remove');
        callIfFn(this.renderer, 'destroy');

        this.program = null;
        this.geometry = null;
        this.mesh = null;
        this.renderer = null;
    }
}

// --- DOM Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Gradient Blinds Background
    const blindsEl = document.getElementById("blinds-background");
    if (blindsEl) {
        new GradientBlinds(blindsEl, {
            gradientColors: ['#FF9FFC', '#5227FF'],
            angle: 0,
            noise: 0.3,
            blindCount: 12,
            blindMinWidth: 50,
            spotlightRadius: 0.5,
            spotlightSoftness: 1,
            spotlightOpacity: 1,
            mouseDampening: 0.15,
            distortAmount: 0,
            shineDirection: "left",
            mixBlendMode: "lighten"
        });
    }

    // Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Initialize TextType for Hero Title Typing Animation
    const typingEl = document.getElementById("hero-typing-text");
    if (typingEl) {
        new TextType(typingEl, {
            text: ["Technology Excellence", "Expert IT Workshops", "Hackathon Guidance", "Testing Training"],
            typingSpeed: 75,
            deletingSpeed: 30,
            pauseDuration: 3000,
            showCursor: true,
            cursorCharacter: "|",
            cursorBlinkDuration: 0.6,
            textColors: [
                "linear-gradient(135deg, #fbd051, #ffe89e)", 
                "#ffffff", 
                "linear-gradient(135deg, #fbd051, #ffe89e)", 
                "#ffffff"
            ]
        });
    }

    // Initialize DecryptedText for Services Subtitle
    const servicesSubtitle = document.getElementById("services-subtitle");
    if (servicesSubtitle) {
        new DecryptedText(servicesSubtitle, {
            text: "Comprehensive IT training and guidance tailored for engineering excellence",
            animateOn: "inViewHover",
            revealDirection: "center",
            sequential: true,
            speed: 30,
            className: "revealed",
            encryptedClassName: "encrypted"
        });
    }

    // Initialize ScrambledText for the requested three subtitle/CTA lines
    const eventsSubtitle = document.getElementById("events-subtitle");
    if (eventsSubtitle) {
        new ScrambledText(eventsSubtitle, { radius: 100, duration: 1.2, speed: 0.5, scrambleChars: '.:' });
    }

    const testimonialsSubtitle = document.getElementById("testimonials-subtitle");
    if (testimonialsSubtitle) {
        new ScrambledText(testimonialsSubtitle, { radius: 100, duration: 1.2, speed: 0.5, scrambleChars: '.:' });
    }

    const collaborateDesc = document.getElementById("collaborate-desc");
    if (collaborateDesc) {
        new ScrambledText(collaborateDesc, { radius: 100, duration: 1.2, speed: 0.5, scrambleChars: '.:' });
    }

    // Initialize interactive galleries for the first three event items
    const nexoraStack = document.getElementById("nexora-stack");
    if (nexoraStack) {
        new StackGallery(nexoraStack, {
            images: [
                "assets/nexora-1.jpg",
                "assets/nexora-2.jpg",
                "assets/nexora-3.jpg",
                "assets/nexora-4.jpg",
                "assets/nexora-5.jpg"
            ],
            onCardClick: (src) => {
                const mainImg = nexoraStack.parentElement.querySelector(".main-image");
                if (mainImg) {
                    mainImg.src = src;
                }
            }
        });
    }

    const biBattleCircular = document.getElementById("bi-battle-circular");
    if (biBattleCircular) {
        new CircularGallery(biBattleCircular, {
            items: [
                { image: "assets/bi-battle-1.jpg" },
                { image: "assets/bi-battle-2.jpg" },
                { image: "assets/bi-battle-3.jpg" },
                { image: "assets/bi-battle-4.jpg" },
                { image: "assets/bi-battle-5.jpg" }
            ],
            onItemClick: (src) => {
                const mainImg = biBattleCircular.parentElement.querySelector(".main-image");
                if (mainImg) {
                    mainImg.src = src;
                }
            }
        });
    }

    const secEvalDome = document.getElementById("sec-eval-dome");
    if (secEvalDome) {
        new DomeGallery(secEvalDome, {
            images: [
                "assets/sec-eval-1.jpg",
                "assets/sec-eval-2.jpg",
                "assets/sec-eval-3.jpg",
                "assets/sec-eval-4.jpg",
                "assets/sec-eval-5.jpg"
            ],
            onImageClick: (src) => {
                const mainImg = secEvalDome.parentElement.querySelector(".main-image");
                if (mainImg) {
                    mainImg.src = src;
                }
            }
        });
    }

    // Initialize DecayCard for Event 4 (sec-guid)
    const secGuidDecay = document.getElementById("sec-guid-decay");
    if (secGuidDecay) {
        const mainCard = secGuidDecay.querySelector(".decay-card-main");
        if (mainCard) {
            const decay = new DecayCard(mainCard, {
                image: "assets/sec-guid-1.jpg",
                width: 320,
                height: 320,
                baseFrequency: 0.015,
                numOctaves: 5,
                seed: 4,
                maxDisplacement: 250,
                movementBound: 40,
                text: "SEC Guidance"
            });

            // Connect thumbnails to trigger image decay changes
            const thumbs = secGuidDecay.querySelectorAll(".thumb");
            thumbs.forEach(thumb => {
                thumb.addEventListener("click", () => {
                    secGuidDecay.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                    thumb.classList.add("active");
                    decay.updateImage(thumb.src);
                });
            });
        }
    }

    // Initialize CardSwap for Event 5 (QUANTUM FORGE)
    const quantumSwap = document.getElementById("quantum-swap");
    if (quantumSwap) {
        new CardSwap(quantumSwap, {
            cards: [
                { image: "assets/quantum-forge-1.jpg", title: "QUANTUM FORGE", description: "Hackathon strategy briefing and tools" },
                { image: "assets/quantum-forge-2.jpg", title: "Morning Session", description: "Deep dive into problem solving architectures" },
                { image: "assets/quantum-forge-3.jpg", title: "Speaker Session", description: "Manikandan from Infosys giving live presentation" },
                { image: "assets/quantum-forge-4.jpg", title: "Team Contest", description: "Practical hands-on projects evaluated by panel" },
                { image: "assets/quantum-forge-5.jpg", title: "Winning Teams", description: "Award distribution for outstanding performance" }
            ],
            width: 230,
            height: 290,
            cardDistance: 50,
            verticalDistance: 55,
            delay: 4000
        });
    }

    // Initialize Carousel for Event 6 (PEC Guest Lecture)
    const pecLectureCarousel = document.getElementById("pec-lecture-carousel");
    if (pecLectureCarousel) {
        new Carousel(pecLectureCarousel, {
            items: [
                { image: "images/main/m1.jpg", title: "PEC Guest Lecture", description: "Comprehensive testing methodologies workshop" },
                { image: "images/main/m2.jpg", title: "Lecture Session", description: "B Deepak explaining User Requirement Documents" },
                { image: "images/main/m3.jpg", title: "Student Interaction", description: "Deep dive into Agile and Scrum models" },
                { image: "images/main/m4.jpg", title: "Hands-on Demos", description: "Practical bug logging and test execution cases" },
                { image: "images/main/m5.jpg", title: "Speaker Award", description: "PEC Engineering department presenting accolade" },
                { image: "images/main/m6.jpg", title: "Q&A Session", description: "Interactive question and answer session" },
                { image: "images/main/m7.jpg", title: "Workshop Wrap-up", description: "Group discussions and final wrap-up" }
            ],
            baseWidth: 280,
            autoplay: true,
            autoplayDelay: 3500
        });
    }

    // "Explore Our Work" Smooth Scroll
    const exploreBtn = document.getElementById("explore-btn");
    const eventsSection = document.getElementById("events-section");
    if (exploreBtn && eventsSection) {
        exploreBtn.addEventListener("click", () => {
            eventsSection.scrollIntoView({ behavior: "smooth" });
        });
    }

    // Event Galleries Thumbnail Switcher (for non-interactive standard event galleries, e.g. event 4, 5, 6)
    const galleries = document.querySelectorAll(".event-gallery");
    galleries.forEach((gallery) => {
        const mainImage = gallery.querySelector(".main-image");
        const thumbs = gallery.querySelectorAll(".thumb");

        thumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => {
                // Update active state
                gallery.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");

                // Update main image source and alt
                if (mainImage) {
                    mainImage.src = thumb.src;
                    mainImage.alt = thumb.alt;
                }
            });
        });
    });

    // Scroll Animation Observer (Premium Micro-interactions)
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Targets for animation
    const animationTargets = [
        ...document.querySelectorAll(".service-card"),
        ...document.querySelectorAll(".event-card"),
        ...document.querySelectorAll(".testimonial-card"),
        ...document.querySelectorAll(".contact-card"),
        document.querySelector(".hero-content"),
        document.querySelector(".collaborate-content")
    ].filter(Boolean);

    // Set up initial animation styles and observe
    animationTargets.forEach((target, index) => {
        // Skip hero content as we want it immediately visible/animated
        if (target.classList.contains("hero-content")) {
            target.classList.add("animated");
            return;
        }

        target.style.opacity = "0";
        target.style.transform = "translateY(20px)";
        target.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        
        // Add staggered delay based on index if they are in a grid
        const parent = target.parentElement;
        if (parent && (parent.classList.contains("services-grid") || parent.classList.contains("testimonials-grid") || parent.classList.contains("contact-grid"))) {
            const delay = (index % 4) * 150; // Stagger up to 4 columns
            target.style.transitionDelay = `${delay}ms`;
        }

        animateOnScroll.observe(target);
    });

    // Add a stylesheet rule dynamically for the animated state
    const style = document.createElement("style");
    style.innerHTML = `
        .animated {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // --- Image Lightbox Modal ---
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.querySelector(".lightbox-close");

    if (lightbox && lightboxImg) {
        const openLightbox = (src, altText = "") => {
            lightboxImg.src = src;
            lightboxCaption.textContent = altText;
            lightbox.classList.add("show");
            document.body.style.overflow = "hidden"; // Disable background scrolling
        };

        const closeLightbox = () => {
            lightbox.classList.remove("show");
            document.body.style.overflow = ""; // Re-enable background scrolling
            setTimeout(() => {
                lightboxImg.src = "";
            }, 300);
        };

        if (lightboxClose) {
            lightboxClose.addEventListener("click", closeLightbox);
        }
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target === lightboxClose) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("show")) {
                closeLightbox();
            }
        });

        // Intercept clicks on images across the whole website
        document.body.addEventListener("click", (e) => {
            if (e.target.closest('#image-lightbox')) return;
            if (e.target.closest('.lightbox-close')) return;

            // Check if clicked on DecayCard svg image
            const decayCardMain = e.target.closest(".decay-card-main");
            if (decayCardMain) {
                const imageEl = decayCardMain.querySelector("image");
                if (imageEl) {
                    const href = imageEl.getAttribute("href") || imageEl.getAttribute("xlink:href");
                    if (href) {
                        openLightbox(href, "SEC Hackathon Guidance");
                    }
                }
                return;
            }

            // Check if clicked on CardSwap card
            const swapCard = e.target.closest(".swap-card");
            if (swapCard) {
                const img = swapCard.querySelector("img");
                const h3 = swapCard.querySelector("h3");
                if (img) {
                    openLightbox(img.src, h3 ? h3.textContent : "Event Gallery Image");
                }
                return;
            }

            // Check if clicked on Carousel card
            const carouselItem = e.target.closest(".carousel-item");
            if (carouselItem) {
                const img = carouselItem.querySelector("img");
                const title = carouselItem.querySelector(".carousel-item-title");
                if (img) {
                    openLightbox(img.src, title ? title.textContent : "Event Gallery Image");
                }
                return;
            }

            // Check if clicked on StackGallery card (img has pointer-events: none)
            const stackCard = e.target.closest(".stack-card-el");
            if (stackCard) {
                const img = stackCard.querySelector("img");
                if (img) {
                    openLightbox(img.src, img.alt || "Event Image");
                }
                return;
            }

            // For all other images
            if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
                openLightbox(e.target.src, e.target.alt || "Image");
                return;
            }
        });
    }

    // --- 3D Background Grid Tilt/Parallax ---
    const grid3d = document.querySelector(".grid-background-3d");
    if (grid3d) {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        window.addEventListener("mousemove", (e) => {
            // Normalize coordinates (-1 to 1)
            targetX = (e.clientX / window.innerWidth) * 2 - 1;
            targetY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        const animateGrid = () => {
            // Smooth interpolation
            mouseX += (targetX - mouseX) * 0.08;
            mouseY += (targetY - mouseY) * 0.08;

            // Apply tilts
            const rotateX = 65 + mouseY * 12; // Base tilt is 65deg, mouse moves it +/- 12deg
            const rotateY = -mouseX * 12;      // Side-to-side swing
            const translateZ = -50 + Math.abs(mouseX) * 15;

            grid3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            requestAnimationFrame(animateGrid);
        };
        animateGrid();
    }

});

