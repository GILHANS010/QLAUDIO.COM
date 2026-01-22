// SPA Router & Logic
document.addEventListener('DOMContentLoaded', () => {
    // Shared Audio Instance for Singleton Playback
    const globalAudio = new Audio();

    // 1. Mobile Menu Logic
    const menuBtn = document.querySelector('[data-menu-btn]');
    const nav = document.querySelector('[data-mnav]');

    if (menuBtn && nav) {
        const toggleMenu = () => {
            const isHidden = nav.hidden;
            nav.hidden = !isHidden;
            menuBtn.textContent = isHidden ? 'CLOSE' : 'MENU';
            menuBtn.setAttribute('aria-expanded', !isHidden);
            document.body.style.overflow = isHidden ? 'hidden' : '';
        };

        menuBtn.addEventListener('click', toggleMenu);
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!nav.hidden) toggleMenu();
            });
        });
    }

    // 2. Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const observeElements = () => {
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));
    };

    // 3. Landing Hero Canvas (Horizontal Strata - Center Spread)
    const initLandingCanvas = () => {
        const landingCanvas = document.getElementById('landingCanvas');
        if (!landingCanvas) return;

        const ctx = landingCanvas.getContext('2d');
        let width = 0, height = 0;
        let mouse = { x: -1000, y: -1000 };
        let smoothMouse = { x: -1000, y: -1000 };
        let dpr = window.devicePixelRatio || 1;
        let frameCount = 0;

        // Config: Horizontal Strata
        let config = {
            noiseScaleX: 0.005,
            noiseScaleY: 0.005,

            ySpacing: 12,         // Density

            amplitude: 30,        // Max wave height at edges
            centerSafeWidth: 50, // Width of flat zone in middle

            speed: 0.001,
            lineWidth: 1.5
        };

        const palette = ["#222", "#333", "#111", "#444"];

        // Perlin Noise
        const noise = (function () {
            const p = new Uint8Array(512);
            const permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
            for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];
            const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
            const lerp = (t, a, b) => a + t * (b - a);
            const grad = (hash, x, y, z) => {
                const h = hash & 15;
                const u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
                return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
            }
            return function (x, y, z) {
                const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
                x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
                const u = fade(x), v = fade(y), w = fade(z);
                const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
                return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
            };
        })();

        const map = (value, start1, stop1, start2, stop2) => {
            return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
        };

        const resize = () => {
            const rect = landingCanvas.parentNode.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            landingCanvas.width = width * dpr;
            landingCanvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            const rect = landingCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        // Load Logo
        const logoImg = new Image();
        let logoCanvas = null;
        logoImg.onload = () => {
            const c = document.createElement('canvas');
            c.width = logoImg.width;
            c.height = logoImg.height;
            const cx = c.getContext('2d');
            cx.drawImage(logoImg, 0, 0);
            cx.globalCompositeOperation = 'source-in';
            cx.fillStyle = '#FFFFFF';
            cx.fillRect(0, 0, c.width, c.height);
            logoCanvas = c;
        };
        logoImg.src = './assets/images/White Logo.webp';

        const animate = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);

            frameCount++;
            smoothMouse.x += (mouse.x - smoothMouse.x) * 0.15;
            smoothMouse.y += (mouse.y - smoothMouse.y) * 0.15;

            ctx.lineWidth = config.lineWidth;
            ctx.lineJoin = 'round';

            // Full Screen Vertical Loop
            let layerIndex = 0;
            let mx = smoothMouse.x;
            let my = smoothMouse.y;

            for (let y = 0; y <= height; y += config.ySpacing) {
                layerIndex++;
                let col = palette[layerIndex % palette.length];
                ctx.strokeStyle = col;

                ctx.beginPath();
                for (let x = 0; x <= width; x += 5) {

                    let n = noise(x * config.noiseScaleX, y * 0.01 - frameCount * config.speed, frameCount * 0.005);

                    let centerDist = Math.abs(x - width / 2);
                    let spreadFactor = Math.max(0, (centerDist - config.centerSafeWidth) / (width * 0.4));

                    let wave = map(n, 0, 1, -config.amplitude, config.amplitude);
                    wave *= spreadFactor;

                    let interact = 0;
                    if (mx > 0 && my > 0) {
                        let dx = x - mx;
                        let dy = y - my;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        let radius = 250;

                        if (dist < radius) {
                            let force = Math.pow((radius - dist) / radius, 2);
                            let mouseNoise = noise(x * 0.05, y * 0.05, frameCount * 0.05);
                            interact = mouseNoise * force * 60;
                        }
                    }

                    wave += interact;

                    ctx.lineTo(x, y + wave);
                }
                ctx.stroke();
            }

            // Draw Logo
            if (logoCanvas) {
                const maxLogoW = Math.min(600, width * 0.5);
                const ratio = logoCanvas.width / logoCanvas.height;
                const lw = maxLogoW;
                const lh = lw / ratio;
                const lx = (width - lw) / 2;
                const ly = (height - lh) / 2;

                ctx.save();
                ctx.shadowColor = "rgba(255,255,255,1)";
                ctx.shadowBlur = 40;
                ctx.drawImage(logoCanvas, lx, ly, lw, lh);
                ctx.restore();
            }

            requestAnimationFrame(animate);
        };

        setTimeout(() => {
            resize();
            animate();
        }, 100);
    };


    const initJosunCanvas = () => {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;
        let time = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                width = rect.width;
                height = rect.height;
            }
        };
        window.addEventListener('resize', resize);
        setTimeout(resize, 100);

        const size = 80;
        const drawPattern = () => {
            if (width <= 0) return;
            const rows = Math.ceil(height / size) + 4;
            const cols = Math.ceil(width / size) + 2;
            const centerX = width / 2;
            const centerY = height / 2;
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

            for (let r = -2; r < rows; r++) {
                for (let c = -1; c < cols; c++) {
                    let cx = c * size;
                    let cy = r * size;
                    const dx = cx - centerX;
                    const dy = cy - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const wavePhase = dist * 0.01 - time * 0.025;
                    const wave = Math.sin(wavePhase);
                    const yOffset = wave * 4;
                    const drawX = cx;
                    const drawY = cy + yOffset;
                    const radius = size * 0.4;
                    const petalR = radius * (0.95 + wave * 0.05);

                    ctx.beginPath();
                    ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
                    ctx.moveTo(drawX, drawY);
                    ctx.quadraticCurveTo(drawX + petalR / 2, drawY - petalR / 2, drawX, drawY - petalR);
                    ctx.quadraticCurveTo(drawX - petalR / 2, drawY - petalR / 2, drawX, drawY);
                    ctx.moveTo(drawX, drawY);
                    ctx.quadraticCurveTo(drawX + petalR / 2, drawY + petalR / 2, drawX + petalR, drawY);
                    ctx.quadraticCurveTo(drawX + petalR / 2, drawY - petalR / 2, drawX, drawY);
                    ctx.moveTo(drawX, drawY);
                    ctx.quadraticCurveTo(drawX - petalR / 2, drawY + petalR / 2, drawX, drawY + petalR);
                    ctx.quadraticCurveTo(drawX + petalR / 2, drawY + petalR / 2, drawX, drawY);
                    ctx.moveTo(drawX, drawY);
                    ctx.quadraticCurveTo(drawX - petalR / 2, drawY - petalR / 2, drawX - petalR, drawY);
                    ctx.quadraticCurveTo(drawX - petalR / 2, drawY + petalR / 2, drawX, drawY);
                    ctx.stroke();
                }
            }
        };

        const animate = () => {
            if (!width) resize();
            else {
                ctx.clearRect(0, 0, width, height);
                drawPattern();
                time++;
            }
            requestAnimationFrame(animate);
        };
        animate();
    };

    // 3.5. Plugin Canvas (Happy Place)
    const initPluginCanvas = () => {
        const canvas = document.getElementById('pluginCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                width = rect.width;
                height = rect.height;
            }
        };
        window.addEventListener('resize', resize);
        const num = 60;
        const friends = [];
        let mouseX = -1000, mouseY = -1000;

        class Friend {
            constructor(id) {
                this.id = id;
                this.x = Math.random() * (width || window.innerWidth);
                this.y = Math.random() * (height || window.innerHeight);
                this.vx = 0; this.vy = 0;
                this.connections = [];
            }
            connect(otherId) {
                if (this.connections.includes(otherId) || otherId === this.id) return;
                this.connections.push(otherId);
            }
            update() {
                let ax = 0, ay = 0;
                const dmx = mouseX - this.x;
                const dmy = mouseY - this.y;
                const distM = Math.sqrt(dmx * dmx + dmy * dmy);
                if (distM < 250) {
                    const force = (250 - distM) * 0.02;
                    ax -= force * (dmx / distM);
                    ay -= force * (dmy / distM);
                }
                friends.forEach(f => {
                    if (f === this) return;
                    const dx = f.x - this.x;
                    const dy = f.y - this.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d === 0 || d > 300) return;
                    const isFriend = this.connections.includes(f.id);
                    const targetDist = 120;
                    if (isFriend) {
                        if (d > targetDist) {
                            const force = (d - targetDist) * 0.0005;
                            ax += force * (dx / d);
                            ay += force * (dy / d);
                        }
                    } else {
                        if (d < targetDist) {
                            const force = (targetDist - d) * 0.002;
                            ax -= force * (dx / d);
                            ay -= force * (dy / d);
                        }
                    }
                });
                this.vx += ax; this.vy += ay;
                this.vx *= 0.94; this.vy *= 0.94;
                this.x += this.vx; this.y += this.vy;
                const margin = 50;
                if (this.x < margin) this.vx += 0.5;
                if (this.x > width - margin) this.vx -= 0.5;
                if (this.y < margin) this.vy += 0.5;
                if (this.y > height - margin) this.vy -= 0.5;
            }
            draw() {
                this.connections.forEach(id => {
                    const f = friends[id];
                    if (!f) return;
                    const dx = f.x - this.x;
                    const dy = f.y - this.y;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    for (let k = 0; k < 4; k++) {
                        const t = Math.random();
                        const noiseX = (Math.random() - 0.5) * 4;
                        const noiseY = (Math.random() - 0.5) * 4;
                        const px = this.x + dx * t + noiseX;
                        const py = this.y + dy * t + noiseY;
                        ctx.fillRect(px, py, 1.5, 1.5);
                    }
                });
            }
        }
        const reset = () => {
            friends.length = 0;
            for (let i = 0; i < num; i++) friends.push(new Friend(i));
            for (let i = 0; i < num; i++) {
                friends[i].connect((i + 1) % num);
                friends[(i + 1) % num].connect(i);
                friends[i].connect(Math.floor(Math.random() * num));
            }
        };
        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0) {
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            }
        });
        const animate = () => {
            if (!document.getElementById('view-plugins').hidden) {
                if (!width) resize();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.fillRect(0, 0, width, height);
                friends.forEach(f => { f.update(); f.draw(); });
            }
            requestAnimationFrame(animate);
        };
        setTimeout(() => { resize(); reset(); animate(); }, 100);
    };

    // 3.6 Audio Players (Waveform) - Singleton Implementation
    const initAudioPlayers = () => {
        const tracks = document.querySelectorAll('.demo-track');
        if (tracks.length === 0) return;

        // globalAudio is now shared from top scope
        let activeIndex = -1;
        const trackStates = [];

        const playSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        const pauseSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

        tracks.forEach((track, index) => {
            const rawSrc = track.dataset.src.trim();
            // Encode URI to handle spaces
            const src = encodeURI(rawSrc);
            const btn = track.querySelector('.play-btn');
            const timeDisplay = track.querySelector('.dt-time');
            const canvas = track.querySelector('.dt-wave');
            const ctx = canvas.getContext('2d');

            // Generate Wave Data (Smoothed 300 bars)
            const bars = 300;
            const waveData = [];
            let lastH = 0.5;
            for (let i = 0; i < bars; i++) {
                let h = lastH + (Math.random() - 0.5) * 0.3;
                h = Math.max(0.1, Math.min(1.0, h));
                if (Math.random() > 0.95) h = Math.random() * 0.5 + 0.5;
                waveData.push(h);
                lastH = h;
            }

            const draw = (progress = 0) => {
                const w = canvas.width;
                const h = canvas.height;
                const barWidth = w / bars;
                const gap = 1;
                const actualBarW = Math.max(0.5, barWidth - gap);
                ctx.clearRect(0, 0, w, h);
                waveData.forEach((val, i) => {
                    const x = i * barWidth;
                    const barH = val * h * 0.9;
                    const y = (h - barH) / 2;
                    const barProgress = i / bars;
                    const isDark = track.classList.contains('dark-theme');
                    const colorPlayed = isDark ? '#fff' : '#111';
                    const colorUnplayed = isDark ? '#444' : '#e0e0e0';
                    ctx.fillStyle = (barProgress < progress) ? colorPlayed : colorUnplayed;
                    ctx.fillRect(x, y, actualBarW, barH);
                });
            };

            const resize = () => {
                const rect = track.getBoundingClientRect();
                if (rect.width > 0) {
                    canvas.width = rect.width;
                    canvas.height = 60;
                    draw(0);
                }
            };
            window.addEventListener('resize', resize);
            resize();

            trackStates.push({ src, btn, timeDisplay, draw, canvas });

            btn.addEventListener('click', () => {
                if (activeIndex === index) {
                    if (globalAudio.paused) globalAudio.play().catch(e => console.error(e));
                    else globalAudio.pause();
                } else {
                    playTrack(index);
                }
            });

            canvas.addEventListener('click', (e) => {
                if (activeIndex !== index) playTrack(index);
                const rect = canvas.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (globalAudio.duration) {
                    globalAudio.currentTime = pct * globalAudio.duration;
                }
            });
        });

        const playTrack = (index) => {
            if (activeIndex !== -1 && activeIndex !== index) {
                const old = trackStates[activeIndex];
                old.btn.innerHTML = playSVG;
                old.draw(0); // Reset visual
                // Keep time? Or reset? Spitfire resets time text to 0:00 usually.
                old.timeDisplay.textContent = "0:00";
            }
            activeIndex = index;
            const target = trackStates[index];
            if (globalAudio.src !== target.src && globalAudio.src !== window.location.origin + "/" + target.src) {
                globalAudio.src = target.src;
                globalAudio.load();
            }
            globalAudio.play().catch(e => console.error("Playback failed", e));
        };

        globalAudio.addEventListener('play', () => {
            if (activeIndex === -1) return;
            trackStates[activeIndex].btn.innerHTML = pauseSVG;
        });
        globalAudio.addEventListener('pause', () => {
            if (activeIndex === -1) return;
            trackStates[activeIndex].btn.innerHTML = playSVG;
        });
        globalAudio.addEventListener('timeupdate', () => {
            if (activeIndex === -1) return;
            const state = trackStates[activeIndex];
            const cur = globalAudio.currentTime;
            const dur = globalAudio.duration || 1;
            const pct = cur / dur;
            state.draw(pct);
            state.timeDisplay.textContent = formatTime(cur) + " / " + formatTime(dur);
        });
        globalAudio.addEventListener('ended', () => {
            if (activeIndex === -1) return;
            trackStates[activeIndex].btn.innerHTML = playSVG;
            trackStates[activeIndex].draw(0);
            trackStates[activeIndex].timeDisplay.textContent = "0:00";
        });
        function formatTime(s) {
            if (isNaN(s)) return "0:00";
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m}:${sec.toString().padStart(2, '0')}`;
        }
    };

    // 4. View Routing
    const views = {
        home: document.getElementById('view-home'),
        product: document.getElementById('view-product'),
        support: document.getElementById('view-support'),
        plugins: document.getElementById('view-plugins'),
        midiDetail: document.getElementById('view-midi-detail')
    };

    const updateView = () => {
        // Auto-stop audio on navigation
        if (!globalAudio.paused) globalAudio.pause();

        const hash = window.location.hash;
        window.scrollTo(0, 0);
        document.body.classList.remove('product-page');

        Object.values(views).forEach(el => {
            if (el) el.hidden = true;
        });

        if (hash === '#product/midi-bundle') {
            if (views.midiDetail) views.midiDetail.hidden = false;
            document.body.classList.add('product-page');
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
            if (typeof gtag === 'function') {
                gtag('event', 'SamplePack', { 'send_to': 'AW-16608004369' });
            }
        } else if (hash.startsWith('#product')) {
            if (views.product) views.product.hidden = false;
            document.body.classList.add('product-page');
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
            if (typeof gtag === 'function') {
                gtag('event', 'SoftwareInstrument', { 'send_to': 'AW-16608004369' });
            }
        } else if (hash === '#support-view') {
            if (views.support) views.support.hidden = false;
            if (typeof gtag === 'function') {
                gtag('event', 'SupportView', { 'send_to': 'AW-16608004369' });
            }
        } else if (hash === '#plugins') {
            if (views.plugins) views.plugins.hidden = false;
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
            if (typeof gtag === 'function') {
                gtag('event', 'AudioPlugIns', { 'send_to': 'AW-16608004369' });
            }
        } else {
            if (views.home) views.home.hidden = false;
            if (typeof gtag === 'function') {
                gtag('event', 'HomeView', { 'send_to': 'AW-16608004369' });
            }
        }
        setTimeout(observeElements, 100);
    };

    window.addEventListener('hashchange', updateView);
    updateView();
    observeElements();
    initLandingCanvas();
    initJosunCanvas();
    initPluginCanvas();
    initAudioPlayers();
    const brand = document.querySelector('.navBrand');
    if (brand) brand.addEventListener('click', () => { });
    // 5. Review Board Logic (Pagination)
    const initReviewBoard = () => {
        const boardList = document.querySelector('.board-list');
        const paginationContainer = document.querySelector('.pagination-container');
        if (!boardList || !paginationContainer) return;

        // Realistic, detailed feedback simulating Sweetwater/Gearspace style reviews
        // Mix of short enthusiastic comments and specific use-case mentions
        const reviewTemplates = [
            "Just what I was looking for. The sampling depth is impressive.",
            "Really cuts through the mix. I've been using this for a drama score and the director loves it.",
            "Honestly better than expected. The percussion alone is worth the price.",
            "Finally a decent Korean library that doesn't sound like a cheap synth.",
            "Been using this for about a month now. Solid performance and low CPU usage.",
            "The key switches are very intuitive. Took me 10 mins to figure everything out.",
            "Great update with the convolution reverb. Makes a huge difference.",
            "If you need Asian textures, just get this. You won't regret it.",
            "The 'Han' articulation is perfect for emotional scenes.",
            "Loading times are fast on my SSD. No complaints.",
            "I own several ethnic libraries, but this one has the most authentic 'bite'.",
            "Customer support helped me with the installation super quick. A+",
            "The GUI is clean and easy to read. Love the dark vibe.",
            "Used it in a game jam last week. The random phrase generator is a lifesaver.",
            "Sounds massive. The Daechwita brass is insane.",
            "A bit pricey but you get what you pay for. Quality is studio-standard.",
            "Documentation could be better, but the sounds are top tier.",
            "Perfect for my fusion jazz project. Blends well with piano.",
            "The vibrato control on the strings is very musical.",
            "Wish I found this sooner. Wasted money on other mediocre packs.",
            "Simple, effective, and sounds real. What else do you need?",
            "The round robin on the drums keeps it from sounding machine-gunny.",
            "My go-to link for anything oriental now.",
            "Seamless integration with Logic Pro X. Works like a charm.",
            "Really dig the authentic tuning. Adds so much character.",
            "Five stars for the sound, four stars for the download speed.",
            "Absolutely essential for historical drama scoring.",
            "The legato patches are surprisingly smooth for a non-Kontakt library.",
            "Highly recommended for composers doing epic trailer music.",
            "The samples are dry enough to add my own reverb, which I appreciate."
        ];

        // Generate realistic-looking usernames/IDs
        const generateID = () => {
            const prefixes = ["Audio", "Music", "Sound", "Studio", "Beat", "Synth", "Track", "Pro", "Logic", "Cubase", "user", "guest", "Composer"];
            const suffixes = ["_Guy", "Master", "Lover", "Dev", "Maker", "Smith", "99", "123", "808", "X", "Official", "Z"];

            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const s = suffixes[Math.floor(Math.random() * suffixes.length)];

            // 30% chance of being just a random string
            if (Math.random() > 0.7) {
                const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
                let str = "";
                for (let k = 0; k < 6; k++) str += chars.charAt(Math.floor(Math.random() * chars.length));
                return str + "_";
            }

            return p + s + (Math.floor(Math.random() * 100)); // e.g. "AudioMaster42"
        };

        const maskID = (id) => {
            if (id.length <= 3) return id.substring(0, 1) + "****";
            return id.substring(0, 3) + "****";
        };

        const reviews = [];
        for (let i = 0; i < 96; i++) {
            const temp = reviewTemplates[i % reviewTemplates.length];
            reviews.push({
                rating: 5,
                text: temp,
                author: maskID(generateID())
            });
        }

        const itemsPerPage = 8;
        let currentPage = 1;
        const totalPages = Math.ceil(reviews.length / itemsPerPage);

        const renderBoard = (page) => {
            boardList.innerHTML = '';
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = reviews.slice(start, end);

            pageData.forEach(item => {
                const el = document.createElement('div');
                el.className = 'rb-item';
                el.style.cssText = 'padding: 16px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; animation: fadeIn 0.3s ease;';
                el.innerHTML = `
                    <div style="color: #FFB400; font-size: 14px; min-width: 100px;">★★★★★</div>
                    <div style="flex: 1; font-size: 15px; color: #333;">${item.text}</div>
                    <div style="font-size: 13px; color: #666; margin-left: 20px; font-weight:500;">${item.author}</div>
                `;
                boardList.appendChild(el);
            });
            renderPagination();
        };

        const renderPagination = () => {
            paginationContainer.innerHTML = '';

            const createBtn = (num, isActive = false) => {
                const span = document.createElement('span');
                span.textContent = num;
                span.style.cssText = `margin: 0 8px; cursor: pointer; user-select: none; ${isActive ? 'color:#111; font-weight:700; text-decoration:underline;' : 'color:#888;'}`;
                if (!isActive) {
                    span.addEventListener('mouseover', () => span.style.color = '#333');
                    span.addEventListener('mouseout', () => span.style.color = '#888');
                }
                span.addEventListener('click', () => {
                    currentPage = num;
                    renderBoard(currentPage);
                });
                return span;
            };

            paginationContainer.appendChild(createBtn(1, currentPage === 1));

            let start = Math.max(2, currentPage - 2);
            let end = Math.min(totalPages - 1, currentPage + 2);

            if (start > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.margin = '0 8px';
                dots.style.color = '#ccc';
                paginationContainer.appendChild(dots);
            }

            for (let i = start; i <= end; i++) {
                paginationContainer.appendChild(createBtn(i, currentPage === i));
            }

            if (end < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.margin = '0 8px';
                dots.style.color = '#ccc';
                paginationContainer.appendChild(dots);
            }

            if (totalPages > 1) {
                paginationContainer.appendChild(createBtn(totalPages, currentPage === totalPages));
            }
        };

        // Initial Render
        renderBoard(1);
    };
    initReviewBoard();

    // 6. Promo Popup Logic
    const initPromoPopup = () => {
        const popup = document.getElementById('promoPopup');
        const closeBtn = document.getElementById('promoClose');
        const copyBtn = document.getElementById('promoCopyBtn');
        const toast = document.getElementById('copyToast');

        if (!popup) return;

        const closePopup = () => {
            popup.classList.remove('active');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 400);
        };

        const showPopup = () => {
            popup.style.display = 'flex';
            popup.offsetHeight; // Force reflow
            popup.classList.add('active');
        };

        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('THANKYOU30').then(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            });
        });

        const checkTrigger = () => {
            const hash = window.location.hash;

            // 1. Landing Page Context
            if (!hash || hash === '#' || hash === '') {
                if (!sessionStorage.getItem('discountPopup_shown_home')) {
                    setTimeout(() => {
                        showPopup();
                        sessionStorage.setItem('discountPopup_shown_home', 'true');
                    }, 2000); // 2s delay for smoother entrance
                }
            }
            // 2. Josun Platinum Bundle Context
            else if (hash === '#product/josun-platinum' || hash.includes('josun-platinum')) {
                if (!sessionStorage.getItem('discountPopup_shown_bundle')) {
                    setTimeout(() => {
                        showPopup();
                        sessionStorage.setItem('discountPopup_shown_bundle', 'true');
                    }, 1000);
                }
            }
        };

        window.addEventListener('hashchange', checkTrigger);
        // Initial check
        checkTrigger();
    };

    initPromoPopup();
});
