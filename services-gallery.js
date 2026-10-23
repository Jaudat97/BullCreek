/* ═══════════════════════════════════════════════════════════════════
   BULL CREEK DENTAL — LUXURY HORIZONTAL PINNED SERVICES SHOWCASE
   Exact Controller from sections-component/service-section
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const craftTrack = document.querySelector('.craft-h-track');
  const pin = document.querySelector('.craft-h-pin');
  if (!craftTrack || !pin) return;

  const dots = gsap.utils.toArray('.craft-h-dots span');
  const cards = gsap.utils.toArray('.craft-h-card');
  const cardCount = cards.length;

  // Desktop Horizontal Pin Scroll (> 900px)
  if (window.innerWidth > 900) {
    const getScrollAmount = () => craftTrack.scrollWidth - pin.offsetWidth;

    gsap.to(craftTrack, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => '+=' + (getScrollAmount() * 1.15),
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (cardCount - 1),
          duration: 0.45,
          ease: 'power2.inOut'
        },
        onUpdate: (self) => {
          const idx = Math.min(cardCount - 1, Math.floor(self.progress * cardCount));
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      }
    });

    // Subtle breathing pulse on the hint arrow
    gsap.to('.craft-h-hint span', {
      x: 6,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Card + text reveal animations upon entering viewport
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top 80%',
        once: true
      }
    });

    tl.from(cards, {
      opacity: 0,
      scale: 0.92,
      y: 40,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    }, 0);

    cards.forEach((card, i) => {
      const label = card.querySelector('.craft-h-label');
      const title = card.querySelector('h3');
      const num = card.querySelector('.craft-h-num');
      const desc = card.querySelector('.craft-h-desc');

      if (num) {
        tl.from(num, {
          y: -50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, 0.08 + i * 0.08);
      }
      if (label && title) {
        tl.from([label, title, desc], {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out'
        }, 0.2 + i * 0.08);
      }
    });
  } else {
    // Mobile touch scroll sync for dots
    const scrollEl = document.querySelector('.craft-h-scroll');
    if (scrollEl) {
      const updateMobileDots = () => {
        const center = scrollEl.scrollLeft + scrollEl.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      };

      scrollEl.addEventListener('scroll', updateMobileDots, { passive: true });
      updateMobileDots();
    }
  }

  // Click on a treatment card to open booking with that service
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      if (typeof openBookingWithService === 'function') {
        openBookingWithService(title);
      } else if (typeof selectBookingTreatment === 'function') {
        selectBookingTreatment(title);
      }
    });
  });
});
