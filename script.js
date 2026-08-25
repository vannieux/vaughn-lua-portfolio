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
            setTimeout(hideLoader, prefersReducedMotion ? 0 : 500);
        });
        setTimeout(hideLoader, 2200);
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
            navbar.classList.toggle('nav-scrolled', scrollY > 20);
        }

        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        }

        if (backToTop) {
            backToTop.classList.toggle('hidden-state', scrollY <= 600);
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
        '.reveal-up, .reveal-left, .reveal-right, .reveal-line, .reveal-fade, .reveal-pop'
    );

    const revealOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');

            const counterEls = entry.target.querySelectorAll('.counter');
            counterEls.forEach(counterEl => {
                if (!counterEl.classList.contains('counted')) {
                    animateCounter(counterEl);
                    counterEl.classList.add('counted');
                }
            });

            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Auto-stagger: elements sharing a direct parent get incremental delays
    const staggerGroups = new Map();
    revealElements.forEach(el => {
        if (el.style.transitionDelay) return;
        const parent = el.parentElement;
        if (!parent) return;
        const list = staggerGroups.get(parent) || [];
        list.push(el);
        staggerGroups.set(parent, list);
    });
    staggerGroups.forEach(list => {
        if (list.length < 2) return;
        list.forEach((el, i) => {
            el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
        });
    });

    revealElements.forEach(el => revealOnScroll.observe(el));

    // Safety net: force-reveal anything the observer somehow never triggers
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('active')) el.classList.add('active');
        });
    }, 3000);

    // ------------------------------------------------------------------
    // 8. Animated Statistics Counters
    // ------------------------------------------------------------------
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        if (prefersReducedMotion) {
            counter.innerText = target;
            return;
        }
        const duration = 1600;
        const startTime = performance.now();
        const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const updateCounter = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(easeOutExpo(progress) * target);
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
    // 9. Hero Build Log — signature ticker, real-looking deploy events
    // ------------------------------------------------------------------
    const buildlog = document.getElementById('buildlog-body');

    if (buildlog) {
        const events = [
            { tick: '✓', text: 'index.html      compiled' },
            { tick: '✓', text: 'styles.css      minified' },
            { tick: '✓', text: 'script.js       linted, 0 warnings' },
            { tick: '✓', text: 'lighthouse      performance 98' },
            { tick: '→', text: 'deployed        vercel.app' },
            { tick: '✓', text: 'status          live' },
        ];

        if (prefersReducedMotion) {
            buildlog.innerHTML = events
                .map(e => `<div class="buildlog-line shown"><span class="buildlog-tick">${e.tick}</span><span>${e.text}</span></div>`)
                .join('');
        } else {
            let i = 0;
            const typeNext = () => {
                if (i >= events.length) {
                    const last = buildlog.lastElementChild;
                    if (last) {
                        const cursor = document.createElement('span');
                        cursor.className = 'buildlog-cursor';
                        last.appendChild(cursor);
                    }
                    return;
                }
                const e = events[i];
                const line = document.createElement('div');
                line.className = 'buildlog-line';
                line.innerHTML = `<span class="buildlog-tick">${e.tick}</span><span>${e.text}</span>`;
                buildlog.appendChild(line);
                requestAnimationFrame(() => line.classList.add('shown'));
                i++;
                setTimeout(typeNext, 320);
            };
            setTimeout(typeNext, 600);
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
                setTimeout(() => content.classList.add('open'), 10);
            } else {
                content.classList.remove('open');
                setTimeout(() => content.classList.add('hidden'), 400);
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

                    if (show) {
                        card.style.display = '';
                        // Allow the browser to register the display change before animating in
                        requestAnimationFrame(() => card.classList.remove('filtered-out'));
                    } else {
                        card.classList.add('filtered-out');
                        setTimeout(() => {
                            if (card.classList.contains('filtered-out')) {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
    }
});
