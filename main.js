/* =========================
   Helpers
   ========================= */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =========================
   Header: estado "scrolled" (Original)
   ========================= */
(function headerScroll() {
  const header = $('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* =========================
   Menú móvil (hamburguesa) — overlay centrado (Original + Redes Sociales)
   ========================= */
(function mobileMenu() {
  const btn = $('.menu-toggle');
  const nav = $('.primary-nav-mobile'); 
  
  if (!btn || !nav) return;

  let lastFocus = null;

  const focusFirstLink = () => {
    const first = $('.primary-nav-mobile a');
    if (first) first.focus();
  };

  const open = () => {
    lastFocus = document.activeElement;
    document.body.classList.add('menu-open');
  
    nav.classList.add('active');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
    setTimeout(focusFirstLink, 0);
  };

  const close = () => {
    document.body.classList.remove('menu-open');
    nav.classList.remove('active');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    if (lastFocus) btn.focus();
  };

  const toggle = () => (document.body.classList.contains('menu-open') ? close() : open());

  btn.addEventListener('click', toggle);
  
  $$('.primary-nav-mobile a').forEach(a => a.addEventListener('click', close));

  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  nav.addEventListener('click', (e) => {
    if (e.target === nav) close();
  });

  const mq = window.matchMedia('(min-width: 1051px)');
  const onChange = () => { if (mq.matches) close(); };
  mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
})();

/* =========================
   Carrusel Principal (slides + dots + autoplay) (Original - ARREGLADO)
   ========================= */
(function carousel() {
  const root = $('.carousel');
  if (!root) return;
    
  // El CSS se encarga de la visibilidad en móvil vs desktop
  // No necesitamos el chequeo de JS aquí

  const slides  = $$('.slides .slide', root);
  const prevBtn = $('.prev', root);
  const nextBtn = $('.next', root);
  const dotsWrap = $('.slider-dots', root);

  if (!slides.length || !dotsWrap) return;

  let dots = $$('.dot', dotsWrap);
  if (!dots.length) {
    const frag = document.createDocumentFragment();
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Ir al slide ${i + 1}`);
      frag.appendChild(b);
    });
    dotsWrap.appendChild(frag);
    dots = $$('.dot', dotsWrap);
  }

  let i = slides.findIndex(s => s.classList.contains('active'));
  if (i < 0) i = 0;
  let autoplay = null;
  const AUTOPLAY_MS = 5000;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(idx) {
    i = (idx + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (dots.length) {
      dots.forEach((d, k) => {
        d.classList.toggle('active', k === i);
        d.setAttribute('aria-selected', k === i ? 'true' : 'false');
        d.tabIndex = k === i ? 0 : -1;
      });
    }
  }

  function next() { show(i + 1); }
  function prev() { show(i - 1); }

  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);
  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));

  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  const startAuto = () => {
    if (reduceMotion || AUTOPLAY_MS <= 0) return;
    if (!autoplay) autoplay = setInterval(next, AUTOPLAY_MS);
  };
  const stopAuto = () => { if (autoplay) { clearInterval(autoplay); autoplay = null; } };

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  // Solo inicia si es visible (en desktop)
  // Usamos 'offsetParent' para verificar visibilidad (más robusto que getComputedStyle)
  if (root.offsetParent !== null) {
    show(i);
    startAuto();
  }
})();

/* =========================================================
   PLATOS BANDERA — highlight 2×2 (SOLO HOVER) (Original)
   ========================================================= */
(function platosBandera() {
  const grid = $('.platos-fotos');
  const optionsWrap = $('.platos-opciones');
  const options = optionsWrap ? $$('li:not(.opcion-descargar) a', optionsWrap) : [];

  if (!grid || !options.length) return;

  const isDesktop = () => window.matchMedia('(min-width: 1051px)').matches;
  const clearHL = () => grid.classList.remove('hl-1','hl-2','hl-3','hl-4');
  const setHL = (n) => { clearHL(); grid.classList.add(`hl-${n}`); };

  options.forEach(a => {
    const target = parseInt(a.dataset.target, 10);
    if (!target || target < 1 || target > 4) return;

    const onEnter = () => {
      if (isDesktop()) setHL(target);
    };
    const onLeave = () => {
      if (isDesktop()) clearHL();
    };

    a.addEventListener('mouseenter', onEnter);
    a.addEventListener('focus', onEnter);
    a.addEventListener('mouseleave', onLeave);
    a.addEventListener('blur', onLeave);
  });

  if (optionsWrap) {
    optionsWrap.addEventListener('mouseleave', () => {
      if (isDesktop()) clearHL();
    });
    optionsWrap.addEventListener('focusout', (e) => {
      if (isDesktop() && !optionsWrap.contains(e.relatedTarget)) {
        clearHL();
      }
    });
  }
  
  const onResize = () => {
    if (!isDesktop()) clearHL();
  };
  window.addEventListener('resize', onResize);
  onResize();
})();

/* =========================================================
   MINI CARRUSEL (El Escenario Perfecto) (Original)
   ========================================================= */
(function ctaMiniCarousel() {
    const carousel = $('#evento-carousel');
    if (!carousel) return; 

    const track = $('.carousel-track', carousel);
    const slides = $$('.carousel-slide', track);
    const nextButton = $('.carousel-button--right', carousel);
    const prevButton = $('.carousel-button--left', carousel);
    const dotsNav = $('.carousel-nav', carousel);
    const dots = $$('.carousel-indicator', dotsNav);
    
    let currentIndex = 0; 

    if (slides.length <= 1) {
        if(nextButton) nextButton.classList.add('is-hidden');
        if(prevButton) prevButton.classList.add('is-hidden');
        if(dotsNav) dotsNav.style.display = 'none';
        return;
    }
    
    const setSlide = (targetIndex) => {
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= slides.length) targetIndex = slides.length - 1;

        const targetSlide = slides[targetIndex];
        if (!targetSlide) return; // Añadida verificación
        
        const amountToMove = targetSlide.offsetLeft;
        track.style.transform = `translateX(-${amountToMove}px)`;
        
        slides.forEach(s => s.classList.remove('current-slide'));
        targetSlide.classList.add('current-slide');
        
        if(dots.length > 0) {
            dots.forEach(d => d.classList.remove('current-slide'));
            if(dots[targetIndex]) dots[targetIndex].classList.add('current-slide'); // Añadida verificación
        }
        
        if (targetIndex === 0) {
            prevButton.classList.add('is-hidden');
            nextButton.classList.remove('is-hidden');
        } else if (targetIndex === slides.length - 1) {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.add('is-hidden');
        } else {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');
        }
        
        currentIndex = targetIndex; 
    };

    nextButton.addEventListener('click', e => {
        setSlide(currentIndex + 1);
    });

    prevButton.addEventListener('click', e => {
        setSlide(currentIndex - 1);
    });

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button.carousel-indicator');
        if (!targetDot) return;
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        setSlide(targetIndex);
    });

    // Código de Swipe (se mantiene)
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;

    const getPositionX = e => (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);

    const touchStart = index => e => {
        startPos = getPositionX(e);
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none'; 
        
        const currentSlide = slides[currentIndex];
        if (!currentSlide) { // Verificación
            isDragging = false;
            cancelAnimationFrame(animationID);
            return;
        }
        prevTranslate = -currentSlide.offsetLeft;
        currentTranslate = prevTranslate;
    };

    const touchMove = e => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPos;
    };

    const touchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        track.style.transition = 'transform 0.3s ease-out';

        if (movedBy < -80 && currentIndex < slides.length - 1) {
            setSlide(currentIndex + 1);
        } else if (movedBy > 80 && currentIndex > 0) {
            setSlide(currentIndex - 1);
        } else {
            setSlide(currentIndex);
        }
    };

    const animation = () => {
        if (!isDragging) return;
        track.style.transform = `translateX(${currentTranslate}px)`;
        requestAnimationFrame(animation);
    };

    track.addEventListener('touchstart', touchStart(currentIndex), { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: true });
    track.addEventListener('touchend', touchEnd);
    
    track.addEventListener('mousedown', touchStart(currentIndex));
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
        if (isDragging) touchEnd(); 
    });
    
    $$('.carousel-image', track).forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
    
    track.addEventListener('click', e => {
        if (Math.abs(currentTranslate - prevTranslate) > 10) { 
            e.preventDefault();
            e.stopPropagation();
        }
    }, true); 

    const onResize = () => {
        const currentSlide = slides[currentIndex];
        if(!currentSlide) return;
        
        const newOffset = -currentSlide.offsetLeft;
        track.style.transition = 'none'; 
        track.style.transform = `translateX(${newOffset}px)`;
        
        prevTranslate = newOffset;
        currentTranslate = newOffset;
    };
    
    window.addEventListener('resize', onResize);
    
    setSlide(0); 
})();


/* =========================================================
   Carrusel Móvil de Platos Bandera (NUEVO - SOLO MÓVIL, ARREGLADO)
   ========================================================= */
(function mobilePlatosCarousel() {
    
    const root = $('#mobile-platos-carousel');
    if (!root) return;

    //const slidesContainer = root; // No necesario para fade
    const slides = $$('.carousel-slide', root);
    const prevBtn = $('.prev-platos', root.closest('.mobile-platos-carousel-section'));
    const nextBtn = $('.next-platos', root.closest('.mobile-platos-carousel-section'));
    const dotsWrap = $('.carousel-dots-mobile-platos', root.closest('.mobile-platos-carousel-section'));
    
    if (!slides.length || !dotsWrap) return;

    let dots = [];
    const frag = document.createDocumentFragment();
    slides.forEach((_, i) => {
        const b = document.createElement('span');
        b.className = 'dot';
        b.addEventListener('click', () => {
            stopAuto();
            show(i);
        });
        frag.appendChild(b);
    });
    dotsWrap.appendChild(frag);
    dots = $$('.dot', dotsWrap);

    let i = 0;
    const AUTOPLAY_MS = 4500;
    let autoplay = null;

    // === CAMBIO (Petición 1): Lógica de FADE (Opacidad) ===
    function show(idx) {
        i = (idx + slides.length) % slides.length;
        
        // Oculta todos los slides
        slides.forEach((s, k) => s.classList.toggle('active', k === i));
        
        // Actualiza los puntos
        dots.forEach((d, k) => d.classList.toggle('active', k === i));
    }
    
    function next() { show(i + 1); }
    function prev() { show(i - 1); }

    nextBtn && nextBtn.addEventListener('click', () => {
        stopAuto();
        next();
    });
    prevBtn && prevBtn.addEventListener('click', () => {
        stopAuto();
        prev();
    });

    const startAuto = () => {
        if (reduceMotion || AUTOPLAY_MS <= 0) return;
        if (!autoplay) autoplay = setInterval(next, AUTOPLAY_MS);
    };
    const stopAuto = () => { if (autoplay) { clearInterval(autoplay); autoplay = null; } };
    
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);

    // Solo inicia si es visible (en móvil)
    if (root.offsetParent !== null) {
        show(i);
        startAuto();
    }
})();

/* =========================================================
   Carrusel Móvil Conoce Jora (ELIMINADO)
   ========================================================= */
// (Se eliminó la función 'conoceJoraCarousel' para revertir a "como antes")


/* =========================================================
   Scroll Spy para Navegación de Categorías (comida.html) (Original)
   ========================================================= */
(function comidaNavScrollSpy() {
    const navList = $('.comida-nav .nav-list');
    if (!navList) return; 

    const navLinks = $$('a[href^="#"]', navList);
    const sections = navLinks.map(link => $(link.hash)).filter(s => s);

    if (sections.length === 0) return;

    const removeActiveClasses = () => {
        navLinks.forEach(link => link.classList.remove('active'));
    };

    const observerOptions = {
        root: null, 
        rootMargin: '-30% 0px -65% 0px', 
        threshold: 0 
    };

    const observerCallback = (entries) => {
        let activeSectionId = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const matchingLink = navList.querySelector(`a[href="#${id}"]`);
                
                removeActiveClasses();
                if (matchingLink) {
                    matchingLink.classList.add('active');
                    activeSectionId = id; 
                }
            }
        });
        
        if (!activeSectionId && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
             const lastLink = navLinks[navLinks.length - 1];
             if (lastLink) lastLink.classList.add('active');
        }
    };

    const activateOnScroll = () => {
        if (window.scrollY < 20) {
            removeActiveClasses();
            return; 
        }

        let firstVisibleSection = null;
        let minTop = Infinity;
        const triggerLine = window.innerHeight * 0.3; 

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= triggerLine) {
                 const distFromTrigger = Math.abs(rect.top - triggerLine);
                 if (distFromTrigger < minTop) {
                    minTop = distFromTrigger;
                    firstVisibleSection = section;
                 }
            }
        });

        if (firstVisibleSection) {
            const firstLink = navList.querySelector(`a[href="#${firstVisibleSection.id}"]`);
            if (firstLink) {
                removeActiveClasses();
                firstLink.classList.add('active');
            }
        } else {
             if (window.scrollY < 20) {
                 removeActiveClasses();
                 navLinks[0] && navLinks[0].classList.add('active');
             }
        }
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', activateOnScroll);
    
    window.addEventListener('load', () => {
         activateOnScroll();
    }, { once: true });
    
})();