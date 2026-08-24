document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // 1. Initialize Lucide Icons
    // ------------------------------------------------------------------
    lucide.createIcons();

    // ------------------------------------------------------------------
    // 2. Set Current Year in Footer
    // ------------------------------------------------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ------------------------------------------------------------------
    // 3. Boot Loader — brief branded entrance, then reveal page
    // ------------------------------------------------------------------
    const loader = document.getElementById('loader');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const hideLoader = () => {
        if (!loader) return;
        loader.classList.add('loader-hidden');
        document.body.classList.remove('overflow-hidden');
        setTimeout(() => loader.remove(), 700);
    };

    if (loader) {
        document.body.classList.add('overflow-hidden');
        window.addEventListener('load', () => {
            setTimeout(hideLoader, prefersReducedMotion ? 0 : 550);
        });
        // Safety net in case load event is delayed
        setTimeout(hideLoader, 2500);
    }

    // ------------------------------------------------------------------
    // 4. Mobile Menu Toggle
    // ------------------------------------------------------------------
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            menuBtn.setAttribute('aria-expanded', String(!isOpen));
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
                lucide.createIcons();
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // ------------------------------------------------------------------
    // 5. Sticky Navigation, Scroll Progress & Back-to-top
    // ------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');

    const onScroll = () => {
        const scrollY = window.scrollY;

        if (navbar) {
            if (scrollY > 20) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        }

        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        }

        if (backToTop) {
            if (scrollY > 600) {
                backToTop.classList.remove('hidden-state');
            } else {
                backToTop.classList.add('hidden-state');
            }
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    // ------------------------------------------------------------------
    // 6. Active Nav Link Highlighting (scroll-spy)
    // ------------------------------------------------------------------
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length && navLinks.length) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('link-active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => spyObserver.observe(section));
    }

    // ------------------------------------------------------------------
    // 7. Scroll Reveal Animations (Intersection Observer)
    // ------------------------------------------------------------------
    const revealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-clip, .reveal-pop, .reveal-focus, .reveal-flip, .reveal-step, .reveal-count'
    );

    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');

            const counterEl = entry.target.querySelector('.counter');
            if (counterEl && !counterEl.classList.contains('counted')) {
                animateCounter(counterEl);
                counterEl.classList.add('counted');
            }

            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Auto-stagger: elements sharing a direct parent and the same reveal
    // class get incremental delays so grids/lists cascade instead of
    // popping in simultaneously. An explicit inline transition-delay
    // already set in markup is left untouched.
    const staggerGroups = new Map();
    revealElements.forEach(el => {
        if (el.style.transitionDelay) return;
        const parent = el.parentElement;
        if (!parent) return;
        const key = parent;
        const list = staggerGroups.get(key) || [];
        list.push(el);
        staggerGroups.set(key, list);
    });
    staggerGroups.forEach(list => {
        if (list.length < 2) return;
        list.forEach((el, i) => {
            el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
        });
    });

    revealElements.forEach(el => revealOnScroll.observe(el));

    // ------------------------------------------------------------------
    // 8. Animated Statistics Counters
    // ------------------------------------------------------------------
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        if (prefersReducedMotion) {
            counter.innerText = target;
            return;
        }
        const duration = 1800;
        const startTime = performance.now();

        const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const updateCounter = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(eased * target);
            counter.innerText = current;
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        requestAnimationFrame(updateCounter);
    }

    // ------------------------------------------------------------------
    // 9. Hero Code Editor — self-typing signature animation
    // ------------------------------------------------------------------
    const editorBody = document.getElementById('editor-body');

    if (editorBody) {
        // Each line stored as HTML (already syntax-highlighted) + plain-text length for timing
        const codeLines = [
            `<span class="syn-cmt">// portfolio.build.js</span>`,
            `<span class="syn-key">const</span> <span class="syn-plain">developer</span> <span class="syn-punc">=</span> <span class="syn-punc">{</span>`,
            `&nbsp;&nbsp;<span class="syn-attr">role</span><span class="syn-punc">:</span> <span class="syn-str">"Frontend Engineer"</span><span class="syn-punc">,</span>`,
            `&nbsp;&nbsp;<span class="syn-attr">stack</span><span class="syn-punc">:</span> <span class="syn-punc">[</span><span class="syn-str">"HTML5"</span><span class="syn-punc">,</span> <span class="syn-str">"Tailwind"</span><span class="syn-punc">,</span> <span class="syn-str">"JS"</span><span class="syn-punc">]</span><span class="syn-punc">,</span>`,
            `&nbsp;&nbsp;<span class="syn-attr">focus</span><span class="syn-punc">:</span> <span class="syn-str">"clean, responsive UI"</span><span class="syn-punc">,</span>`,
            `&nbsp;&nbsp;<span class="syn-attr">status</span><span class="syn-punc">:</span> <span class="syn-fn">available</span><span class="syn-punc">()</span>`,
            `<span class="syn-punc">};</span>`,
            `&nbsp;`,
            `<span class="syn-fn">ship</span><span class="syn-punc">(</span><span class="syn-plain">developer</span><span class="syn-punc">);</span>`
        ];

        if (prefersReducedMotion) {
            editorBody.innerHTML = codeLines
                .map(l => `<span class="editor-line">${l}</span>`)
                .join('');
        } else {
            let lineIndex = 0;

            const typeNextLine = () => {
                if (lineIndex >= codeLines.length) {
                    // Blinking caret rests on the final line
                    const lastLine = editorBody.lastElementChild;
                    if (lastLine) {
                        const caret = document.createElement('span');
                        caret.className = 'editor-caret';
                        lastLine.appendChild(caret);
                    }
                    return;
                }

                const lineEl = document.createElement('span');
                lineEl.className = 'editor-line';
                lineEl.innerHTML = codeLines[lineIndex];
                lineEl.style.opacity = '0';
                editorBody.appendChild(lineEl);

                requestAnimationFrame(() => {
                    lineEl.style.transition = 'opacity 0.25s ease';
                    lineEl.style.opacity = '1';
                });

                lineIndex++;
                setTimeout(typeNextLine, 220);
            };

            // Kick off shortly after load so it's visible once hero is in view
            setTimeout(typeNextLine, 700);
        }
    }

    // ------------------------------------------------------------------
    // 10. FAQ Accordion Logic
    // ------------------------------------------------------------------
    const accordionBtns = document.querySelectorAll('.accordion-btn');

    accordionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const isOpening = content.classList.contains('hidden');

            this.classList.toggle('active');
            this.setAttribute('aria-expanded', String(isOpening));

            if (isOpening) {
                content.classList.remove('hidden');
                setTimeout(() => {
                    content.classList.add('open');
                }, 10);
            } else {
                content.classList.remove('open');
                setTimeout(() => {
                    content.classList.add('hidden');
                }, 400);
            }
        });
    });

    // ------------------------------------------------------------------
    // 11. Project Filter Pills
    // ------------------------------------------------------------------
    const filterPills = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('[data-category]');

    if (filterPills.length && projectCards.length) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filter = pill.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const show = filter === 'all' || category === filter;
                    card.style.display = show ? '' : 'none';
                });
            });
        });
    }

    // ------------------------------------------------------------------
    // 12. Subtle tilt on hero mockups following cursor (desktop only)
    // ------------------------------------------------------------------
    const heroStage = document.getElementById('hero-stage');

    if (heroStage && window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
        const mockups = heroStage.querySelectorAll('[data-tilt]');

        heroStage.addEventListener('mousemove', (e) => {
            const rect = heroStage.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            mockups.forEach(el => {
                const strength = parseFloat(el.getAttribute('data-tilt')) || 6;
                el.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
            });
        });

        heroStage.addEventListener('mouseleave', () => {
            mockups.forEach(el => {
                el.style.transform = 'rotateY(0deg) rotateX(0deg)';
            });
        });
    }
});
