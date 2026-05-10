function setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const randomThemeButton = document.getElementById("random-theme-btn");
    const themeToast = document.getElementById("theme-toast");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const htmlElement = document.documentElement;
    let themeToastTimer = null;

    if (!themeToggle || !sunIcon || !moonIcon) {
        return;
    }

    function setToggleIcons(isLightMode) {
        sunIcon.style.display = isLightMode ? "block" : "none";
        moonIcon.style.display = isLightMode ? "none" : "block";
    }

    function clearRandomTheme() {
        const variablesToClear = [
            "--bg-deep",
            "--bg-panel",
            "--text-cream",
            "--text-muted",
            "--gold-primary",
            "--gold-dim",
            "--accent-glow",
            "--border-subtle",
            "--header-bg",
            "--hero-gradient-start",
            "--project-hover-bg",
            "--project-number-color",
            "--bg-elevated",
            "--mesh-accent-a",
            "--mesh-accent-b",
            "--glass-highlight"
        ];

        variablesToClear.forEach((variable) => {
            htmlElement.style.removeProperty(variable);
        });
    }

    function applyThemeMode(mode) {
        const isLightMode = mode === "light";
        htmlElement.classList.toggle("light-mode", isLightMode);
        setToggleIcons(isLightMode);
        localStorage.setItem("theme", mode);
    }

    function createRandomPalette() {
        const hue = Math.floor(Math.random() * 360);
        const accentHue = (hue + 40) % 360;

        return {
            "--bg-deep": `hsl(${hue} 24% 8%)`,
            "--bg-panel": `hsl(${hue} 21% 13%)`,
            "--text-cream": `hsl(${hue} 18% 94%)`,
            "--text-muted": `hsl(${hue} 14% 72%)`,
            "--gold-primary": `hsl(${accentHue} 78% 64%)`,
            "--gold-dim": `hsl(${accentHue} 44% 40%)`,
            "--accent-glow": `hsl(${accentHue} 78% 64% / 0.22)`,
            "--border-subtle": "rgba(255, 255, 255, 0.12)",
            "--header-bg": `hsl(${hue} 22% 7% / 0.82)`,
            "--hero-gradient-start": `hsl(${hue} 22% 18%)`,
            "--project-hover-bg": `hsl(${hue} 24% 16%)`,
            "--project-number-color": `hsl(${accentHue} 82% 67% / 0.17)`,
            "--bg-elevated": `hsl(${hue} 22% 16% / 0.68)`,
            "--mesh-accent-a": `hsl(${accentHue} 80% 64% / 0.24)`,
            "--mesh-accent-b": `hsl(${(accentHue + 110) % 360} 78% 62% / 0.2)`,
            "--glass-highlight": "rgba(255, 255, 255, 0.16)"
        };
    }

    function applyRandomTheme() {
        const palette = createRandomPalette();
        htmlElement.classList.remove("light-mode");

        Object.entries(palette).forEach(([token, value]) => {
            htmlElement.style.setProperty(token, value);
        });

        setToggleIcons(false);
        localStorage.setItem("theme", "random");
        localStorage.setItem("randomThemePalette", JSON.stringify(palette));

        if (themeToast) {
            themeToast.classList.add("show");

            if (themeToastTimer) {
                window.clearTimeout(themeToastTimer);
            }

            themeToastTimer = window.setTimeout(() => {
                themeToast.classList.remove("show");
            }, 1700);
        }
    }

    const savedTheme = localStorage.getItem("theme");
    const savedPalette = localStorage.getItem("randomThemePalette");

    if (savedTheme === "random" && savedPalette) {
        try {
            const palette = JSON.parse(savedPalette);
            Object.entries(palette).forEach(([token, value]) => {
                htmlElement.style.setProperty(token, value);
            });
            htmlElement.classList.remove("light-mode");
            setToggleIcons(false);
        } catch (error) {
            clearRandomTheme();
            applyThemeMode("dark");
        }
    } else {
        clearRandomTheme();
        applyThemeMode(savedTheme === "light" ? "light" : "dark");
    }

    themeToggle.addEventListener("click", () => {
        clearRandomTheme();
        localStorage.removeItem("randomThemePalette");

        const isLightMode = htmlElement.classList.toggle("light-mode");
        applyThemeMode(isLightMode ? "light" : "dark");
    });

    if (randomThemeButton) {
        randomThemeButton.addEventListener("click", applyRandomTheme);
    }
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const copied = document.execCommand("copy");
            document.body.removeChild(textArea);
            copied ? resolve() : reject(new Error("Copy command failed"));
        } catch (error) {
            document.body.removeChild(textArea);
            reject(error);
        }
    });
}

function setupEmailCopy() {
    const emailTrigger = document.getElementById("email-trigger");
    const copyLabel = document.getElementById("copy-label");
    const toast = document.getElementById("copy-toast");
    const emailAddress = "maniratnamorgu@gmail.com";

    if (!emailTrigger || !copyLabel || !toast) {
        return;
    }

    const originalLabelText = copyLabel.innerText;

    emailTrigger.addEventListener("click", async () => {
        try {
            await copyTextToClipboard(emailAddress);
            toast.classList.add("show");
            copyLabel.innerText = "COPIED!";
            copyLabel.style.color = "#ffffff";

            window.setTimeout(() => {
                toast.classList.remove("show");
                copyLabel.innerText = originalLabelText;
                copyLabel.style.color = "var(--gold-primary)";
            }, 2500);
        } catch (error) {
            copyLabel.innerText = "COPY FAILED";
            window.setTimeout(() => {
                copyLabel.innerText = originalLabelText;
            }, 2000);
        }
    });
}

function setupActiveNavOnScroll() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (navLinks.length === 0) {
        return;
    }

    const sectionMap = navLinks
        .map((link) => {
            const targetId = link.getAttribute("href");
            if (!targetId) {
                return null;
            }

            const section = document.querySelector(targetId);
            if (!section) {
                return null;
            }

            return { link, section };
        })
        .filter(Boolean);

    if (sectionMap.length === 0) {
        return;
    }

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 140;
        let currentActive = sectionMap[0].link;

        sectionMap.forEach(({ link, section }) => {
            if (section.offsetTop <= scrollPosition) {
                currentActive = link;
            }
        });

        sectionMap.forEach(({ link }) => {
            link.classList.toggle("active", link === currentActive);
        });
    }

    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
}

function setupMobileMenu() {
    const menuToggleButton = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!menuToggleButton || !navLinks) {
        return;
    }

    function closeMenu() {
        navLinks.classList.remove("is-open");
        menuToggleButton.setAttribute("aria-expanded", "false");
        menuToggleButton.innerText = "Menu";
    }

    function openMenu() {
        navLinks.classList.add("is-open");
        menuToggleButton.setAttribute("aria-expanded", "true");
        menuToggleButton.innerText = "Close";
    }

    menuToggleButton.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("is-open");
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

function setupToolkitLayoutAnimation() {
    const toolkitGrid = document.getElementById("toolkit-grid");
    if (!toolkitGrid) {
        return;
    }

    const toolkitCards = Array.from(toolkitGrid.querySelectorAll(".toolkit-card"));
    if (toolkitCards.length === 0) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function runFlipAnimation(domUpdate) {
        const firstRects = new Map(
            toolkitCards.map((card) => [card, card.getBoundingClientRect()])
        );

        domUpdate();

        if (prefersReducedMotion) {
            return;
        }

        toolkitCards.forEach((card) => {
            const first = firstRects.get(card);
            const last = card.getBoundingClientRect();
            if (!first || !last) {
                return;
            }

            const deltaX = first.left - last.left;
            const deltaY = first.top - last.top;
            const scaleX = first.width / last.width;
            const scaleY = first.height / last.height;

            card.animate(
                [
                    {
                        transformOrigin: "top left",
                        transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`
                    },
                    {
                        transformOrigin: "top left",
                        transform: "translate(0, 0) scale(1, 1)"
                    }
                ],
                {
                    duration: 500,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                }
            );
        });
    }

    function setActiveCard(selectedCard) {
        runFlipAnimation(() => {
            const isAlreadyActive = selectedCard.classList.contains("is-active");

            toolkitCards.forEach((card) => {
                card.classList.remove("is-active");
                card.setAttribute("aria-expanded", "false");
            });

            if (!isAlreadyActive) {
                selectedCard.classList.add("is-active");
                selectedCard.setAttribute("aria-expanded", "true");
            }
        });
    }

    toolkitCards.forEach((card) => {
        card.addEventListener("click", () => {
            setActiveCard(card);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveCard(card);
            }
        });
    });

    if (toolkitCards[0]) {
        setActiveCard(toolkitCards[0]);
    }
}

function setupHeroDepthEffect() {
    const hero = document.querySelector(".hero");
    const heroVisual = document.querySelector(".hero-visual");
    const mainCard = document.querySelector(".hero-visual-main");
    const chipOne = document.querySelector(".hero-visual-chip.one");
    const chipTwo = document.querySelector(".hero-visual-chip.two");

    if (!hero || !heroVisual || !mainCard || !chipOne || !chipTwo) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        return;
    }

    function resetTransforms() {
        mainCard.style.transform = "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";
        chipOne.style.transform = "translate3d(0, 0, 0)";
        chipTwo.style.transform = "translate3d(0, 0, 0)";
    }

    hero.addEventListener("mousemove", (event) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        mainCard.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0) rotateX(${y * -5}deg) rotateY(${x * 6}deg)`;
        chipOne.style.transform = `translate3d(${x * 14}px, ${y * 8}px, 0)`;
        chipTwo.style.transform = `translate3d(${x * -10}px, ${y * -6}px, 0)`;
    });

    hero.addEventListener("mouseleave", resetTransforms);
}

function setupMotionEnhancements() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        return;
    }

    import("https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm")
        .then(({ animate, stagger }) => {
            animate(".hero-content > *", { opacity: [0, 1], y: [24, 0] }, {
                duration: 0.7,
                ease: "easeOut",
                delay: stagger(0.08)
            });

            const revealTargets = document.querySelectorAll(
                ".about-text, .exp-item, .project-card, .contact-left, .contact-right, .availability-box"
            );

            revealTargets.forEach((element) => {
                element.style.opacity = "0";
                element.style.transform = "translateY(20px)";
            });

            const revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        animate(entry.target, { opacity: [0, 1], y: [20, 0] }, {
                            duration: 0.65,
                            ease: "easeOut"
                        });
                        observer.unobserve(entry.target);
                    });
                },
                { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
            );

            revealTargets.forEach((element) => {
                revealObserver.observe(element);
            });

            const interactiveTargets = document.querySelectorAll(".project-card, .btn, .contact-item");
            interactiveTargets.forEach((element) => {
                element.addEventListener("mouseenter", () => {
                    animate(element, { y: -4, scale: 1.01 }, {
                        type: "spring",
                        stiffness: 280,
                        damping: 20
                    });
                });

                element.addEventListener("mouseleave", () => {
                    animate(element, { y: 0, scale: 1 }, {
                        type: "spring",
                        stiffness: 280,
                        damping: 22
                    });
                });
            });

            const heroSection = document.querySelector(".hero");
            if (heroSection) {
                window.addEventListener("scroll", () => {
                    const offset = Math.min(window.scrollY * 0.12, 90);
                    heroSection.style.backgroundPosition = `center ${-offset}px`;
                }, { passive: true });
            }

            const projectNumbers = document.querySelectorAll(".project-number");
            if (projectNumbers.length > 0) {
                const numberObserver = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach((entry) => {
                            if (!entry.isIntersecting) {
                                return;
                            }

                            const target = entry.target;
                            const finalValue = Number.parseInt(target.textContent, 10);

                            if (Number.isNaN(finalValue)) {
                                observer.unobserve(target);
                                return;
                            }

                            animate(0, finalValue, {
                                duration: 0.9,
                                ease: "easeOut",
                                onUpdate: (latest) => {
                                    target.textContent = String(Math.round(latest)).padStart(2, "0");
                                }
                            });

                            observer.unobserve(target);
                        });
                    },
                    { threshold: 0.5 }
                );

                projectNumbers.forEach((node) => {
                    numberObserver.observe(node);
                });
            }
        })
        .catch(() => {
        });
}

function initPortfolioWebsite() {
    setupThemeToggle();
    setupEmailCopy();
    setupActiveNavOnScroll();
    setupMobileMenu();
    setupToolkitLayoutAnimation();
    setupHeroDepthEffect();
    setupMotionEnhancements();
}

document.addEventListener("DOMContentLoaded", initPortfolioWebsite);
