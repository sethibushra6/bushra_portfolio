/*==================================================
PORTFOLIO SCRIPT.JS
Bushra Shafaq Sethi — Portfolio
==================================================*/

document.addEventListener('DOMContentLoaded', () => {

    /*--------------------------------------------
    ELEMENTS
    --------------------------------------------*/
    const navbar      = document.querySelector('.navbar');
    const menuToggle  = document.getElementById('menuToggle');
    const navLinks    = document.querySelector('.nav-links');
    const navOverlay  = document.getElementById('navOverlay');
    const navLinkItems = document.querySelectorAll('.nav-links a');
    const scrollTopBtn = document.getElementById('scrollTop');
    const sections    = document.querySelectorAll('section[id]');

    /*--------------------------------------------
    MOBILE MENU TOGGLE
    --------------------------------------------*/
    function openMenu(){
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        menuToggle.innerHTML = "<i class='bx bx-x'></i>";
        document.body.style.overflow = 'hidden';
    }

    function closeMenu(){
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        menuToggle.innerHTML = "<i class='bx bx-menu'></i>";
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.contains('active') ? closeMenu() : openMenu();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    // Close mobile menu whenever a nav link is clicked
    navLinkItems.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on resize back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });

    /*--------------------------------------------
    NAVBAR BACKGROUND ON SCROLL
    --------------------------------------------*/
    function handleNavbarScroll(){
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /*--------------------------------------------
    SCROLL TO TOP BUTTON
    --------------------------------------------*/
    function handleScrollTopButton(){
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /*--------------------------------------------
    ACTIVE NAV LINK ON SCROLL (scrollspy)
    --------------------------------------------*/
    function handleActiveLink(){
        let currentSectionId = '';
        const scrollPos = window.scrollY + 160;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    /*--------------------------------------------
    SCROLL EVENT (throttled with requestAnimationFrame)
    --------------------------------------------*/
    let ticking = false;

    function onScroll(){
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleNavbarScroll();
                handleScrollTopButton();
                handleActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);

    // Run once on load so the correct state shows immediately
    handleNavbarScroll();
    handleScrollTopButton();
    handleActiveLink();

    /*--------------------------------------------
    SCROLL REVEAL ANIMATIONS
    --------------------------------------------*/
    const revealTargets = document.querySelectorAll(
        '.info-box, .stat-card, .skill-card, .project-card, .contact-card, .about-image, .about-content'
    );

    revealTargets.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealTargets.forEach(el => revealObserver.observe(el));

    /*--------------------------------------------
    RESUME DOWNLOAD SAFETY CHECK
    Warns in console (not to the visitor) if the
    resume file is missing, to help debugging.
    --------------------------------------------*/
    const resumeLink = document.querySelector('a[href$=".pdf"]');
    if (resumeLink) {
        fetch(resumeLink.getAttribute('href'), { method: 'HEAD' })
            .then(res => {
                if (!res.ok) {
                    console.warn(
                        `Resume file not found at "${resumeLink.getAttribute('href')}". ` +
                        `Make sure the PDF is uploaded to the repo with the exact same file name.`
                    );
                }
            })
            .catch(() => {
                console.warn('Could not verify resume file (likely running locally without a server, or offline).');
            });
    }

});
