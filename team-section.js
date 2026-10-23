/* ═══════════════════════════════════════════════════════════════════
   BULL CREEK DENTAL — INTERACTIVE TEAM STAGE (CHARACTER SELECT)
   Dedicated JavaScript Controller for 5 Bull Creek Specialists
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  /* ── 1. Team Dataset (Scraped from bullcreekdental.com.au/meet-our-team) ── */
  const TEAM_SPECIALISTS = [
    {
      id: 'dr-ash-malhotra',
      name: 'Dr. Ash Malhotra',
      shortName: 'Dr. Ash',
      specialty: 'Principal Dentist & Sedation Lead',
      color: '#20C7BA',
      img: 'team/Dr-Ash-Malhotra.png',
      thumb: 'team/Dr-Ash-Malhotra.png',
      years: 18,
      edu: 'BDS (2006) · ADC (Royal Melbourne Hospital 2009)',
      cases: 'Over 12,000+ Happy Smiles',
      stats: { precision: 99, technique: 98, experience: 99 },
      quote: 'Her primary aim is to provide compassionate care beyond resolving presenting concerns, making every patient feel confident and safe.',
      bio: 'Dr Ash Malhotra holds a Bachelor of Dental Surgery (2006) and completed Australian Dental Council examinations at the Royal Melbourne Hospital in 2009. She has extensive experience across general, cosmetic, smile design, veneers, crowns, bridges, whitening, and Invisalign®. Dr Ash has a special interest in nervous patients and children, offering oral and IV sedation for completely anxiety-free treatments.',
      treatments: ['General Dentistry', 'Cosmetic Smile Design', 'Invisalign® Orthodontics', 'IV & Oral Sedation', 'Porcelain Veneers']
    },
    {
      id: 'dr-amy-liu',
      name: 'Dr. Amy Liu',
      shortName: 'Dr. Amy',
      specialty: 'Orthodontics & Clear Aligners',
      color: '#38EF7D',
      img: 'team/Dr-Amy-Liu.png',
      thumb: 'team/Dr-Amy-Liu.png',
      years: 8,
      edu: 'Doctor of Dental Medicine (DMD, University of Western Australia)',
      cases: 'Invisalign & Implant Specialist',
      stats: { precision: 98, technique: 97, experience: 95 },
      quote: 'Passionate about helping patients love their smiles through modern clear aligners, implants, and gentle care.',
      bio: 'Dr. Amy commenced working at Bull Creek Dental after obtaining her Doctor of Dental Medicine (DMD) from the University of Western Australia. She enjoys all aspects of general dentistry, with a strong focus in orthodontics, clear aligners like Invisalign, and dental implants. She constantly attends CPD courses to bring cutting-edge techniques to her patients and is fluent in English, Mandarin, and Cantonese.',
      treatments: ['Invisalign® Clear Aligners', 'Dental Implants', 'General Dentistry', 'Cosmetic Transformations']
    },
    {
      id: 'dr-prayas-mahapatra',
      name: 'Dr. Prayas Mahapatra',
      shortName: 'Dr. Prayas',
      specialty: 'Preventative & Family Dentist',
      color: '#4FACFE',
      img: 'team/Dr-Prayas-Mahapatra.png',
      thumb: 'team/Dr-Prayas-Mahapatra.png',
      years: 6,
      edu: 'Doctor of Dental Medicine (DMD, University of Western Australia)',
      cases: 'Gentle & Anxiety-Free Focus',
      stats: { precision: 97, technique: 96, experience: 94 },
      quote: 'Building meaningful relationships with patients and providing comfortable, pain-free dental experiences.',
      bio: 'Dr Prayas is a compassionate and eager dentist who completed his Doctor of Dental Medicine degree from the University of Western Australia. He is committed to delivering exceptional dental care, taking time to listen to patient concerns and explain procedures clearly. He focuses on comprehensive general dentistry and modern preventative techniques.',
      treatments: ['Preventative Checkups', 'Ultrasonic Scale & Clean', 'Restorative Fillings', 'Tooth Preservation']
    },
    {
      id: 'dr-gretchan-phillip',
      name: 'Dr. Gretchan Phillip',
      shortName: 'Dr. Gretchan',
      specialty: 'Restorative & Oral Rehabilitation',
      color: '#D4AF7E',
      img: 'team/Dr-Gretchan-Phillip.png',
      thumb: 'team/Dr-Gretchan-Phillip.png',
      years: 14,
      edu: 'BDS (2010) · Master of Dental Surgery (MDS)',
      cases: 'Master-Level Clinical Restorations',
      stats: { precision: 99, technique: 98, experience: 97 },
      quote: 'Delivering the highest standard of restorative dentistry and full mouth oral rehabilitation.',
      bio: 'Dr Gretchan received her Bachelor of Dental Surgery in 2010 and continued her postgraduate studies to earn a Master’s in Dental Surgery (MDS). With over 14 years of clinical experience, Dr Gretchan delivers master-level precision across crowns, fixed bridges, restorative therapies, and complex tooth reconstructions.',
      treatments: ['Crowns & Bridges', 'Master Restorations', 'Root Canal Therapy', 'Full Mouth Rehabilitation']
    },
    {
      id: 'dr-michelle-dunne',
      name: 'Dr. Michelle Dunne',
      shortName: 'Dr. Michelle',
      specialty: 'Children’s Dentistry & Extractions',
      color: '#F7971E',
      img: 'team/Dr-Michelle-Dunne.png',
      thumb: 'team/Dr-Michelle-Dunne.png',
      years: 11,
      edu: 'Dental Degree (Trinity College Dublin, Ireland 2013)',
      cases: 'Gentle Pediatric & Surgical Care',
      stats: { precision: 98, technique: 97, experience: 96 },
      quote: 'Being approachable, compassionate, and attentive is fundamental to giving every patient the highest standard of care.',
      bio: 'Dr Michelle Dunne qualified from the world-renowned Trinity College in Dublin, Ireland and has been practicing dentistry since 2013. She offers a wide range of treatments from preventative care to wisdom teeth extraction and Invisalign. She particularly loves pediatric dentistry, ensuring kids have fun, stress-free visits. Michelle speaks English, Irish, and French.',
      treatments: ['Children’s Dentistry (CDBS)', 'Wisdom Teeth Extraction', 'Invisalign®', 'Gentle Preventative Care']
    }
  ];

  /* ── 2. State & Elements ── */
  const csStage = document.getElementById('cs-stage');
  if (!csStage) return;

  const csCharEls = [];
  const csHudEntries = [];
  let csActive = 0;
  let csAnimating = false;

  /* ── 3. Build Characters on Stage ── */
  TEAM_SPECIALISTS.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'char-item';
    el.innerHTML = `
      <img src="${d.img}" alt="${d.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="char-fallback" style="color:${d.color}">${d.shortName[0]}</div>
    `;
    el.addEventListener('click', () => {
      if (csAnimating) return;
      i === csActive ? openDoctorStory() : csGoTo(i);
    });
    csStage.appendChild(el);
    csCharEls.push(el);
  });

  /* ── 4. Build Right-Side HUD ── */
  const hudEl = document.getElementById('doctor-hud');
  if (hudEl) {
    TEAM_SPECIALISTS.forEach((d, i) => {
      const entry = document.createElement('div');
      entry.className = 'hud-entry' + (i === 0 ? ' active' : '');
      entry.style.setProperty('--hud-color', d.color);
      entry.innerHTML = `
        <img class="hud-thumb" src="${d.thumb}" alt="${d.name}" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="hud-meta">
          <div class="hud-name">${d.name}</div>
          <div class="hud-spec">${d.specialty}</div>
        </div>
      `;
      entry.addEventListener('click', () => { if (!csAnimating) csGoTo(i); });
      hudEl.appendChild(entry);
      csHudEntries.push(entry);
    });
  }

  /* ── 5. Position & Lighting Calculations ── */
  function csComputeProps(i) {
    const len = TEAM_SPECIALISTS.length;
    let rel = i - csActive;
    if (rel > Math.floor(len / 2)) rel -= len;
    if (rel < -Math.floor(len / 2)) rel += len;
    const a = Math.abs(rel);

    // Mobile viewport adjustment
    if (typeof window !== 'undefined' && window.matchMedia('(max-width:640px)').matches) {
      return {
        left: 50 + rel * 28,
        bottom: a === 0 ? -2 : 0,
        height: a === 0 ? 76 : 56,
        scale: 1,
        opacity: a > 2 ? 0 : (a === 0 ? 1 : 0.65),
        z: 30 - a * 6,
        filter: a === 0 ? 'none' : `brightness(${a === 1 ? 0.35 : 0.15})`
      };
    }

    // Desktop Semicircular Lineup
    const dim = a === 0 ? 'none' : `brightness(${a === 1 ? 0.24 : (a === 2 ? 0.12 : 0.05)})`;
    return {
      left: 50 + rel * 20,
      bottom: 0,
      height: a === 0 ? 78 : (a === 1 ? 66 : (a === 2 ? 56 : 46)),
      scale: 1,
      opacity: a > 2 ? 0 : (a <= 1 ? 1 : 0.85),
      z: 30 - a * 6,
      filter: dim
    };
  }

  function csLayout(animate) {
    TEAM_SPECIALISTS.forEach((d, i) => {
      const el = csCharEls[i];
      if (!el) return;
      const p = csComputeProps(i);
      const t = {
        left: p.left + '%',
        bottom: p.bottom + '%',
        height: p.height + '%',
        xPercent: -50,
        scale: p.scale,
        opacity: p.opacity,
        zIndex: p.z,
        filter: p.filter,
        transformOrigin: 'bottom center',
        pointerEvents: p.opacity > 0.15 ? 'auto' : 'none'
      };
      if (animate && window.gsap) {
        gsap.to(el, { ...t, duration: 0.75, ease: 'power3.out' });
      } else if (window.gsap) {
        gsap.set(el, t);
      } else {
        Object.assign(el.style, {
          left: t.left,
          bottom: t.bottom,
          height: t.height,
          transform: 'translateX(-50%)',
          opacity: t.opacity,
          zIndex: t.zIndex,
          filter: t.filter
        });
      }
    });
  }

  /* ── 6. UI Details Update ── */
  function csUpdateUI(idx) {
    const d = TEAM_SPECIALISTS[idx];
    const specEl = document.getElementById('cs-doc-specialty');
    const nameEl = document.getElementById('cs-doc-name');
    const bioEl = document.getElementById('cs-doc-bio');
    const preFill = document.getElementById('cs-stat-pre');
    const preVal = document.getElementById('cs-stat-pre-val');
    const tecFill = document.getElementById('cs-stat-tec');
    const tecVal = document.getElementById('cs-stat-tec-val');
    const expFill = document.getElementById('cs-stat-exp');
    const expVal = document.getElementById('cs-stat-exp-val');
    const bookBtn = document.getElementById('cs-book-btn');
    const counterNum = document.getElementById('cs-counter-num');
    const counterTotal = document.getElementById('cs-counter-total');

    if (specEl) { specEl.textContent = d.specialty; specEl.style.color = d.color; }
    if (nameEl) { nameEl.textContent = d.name; }
    if (bioEl) { bioEl.textContent = d.bio; }

    if (preFill && preVal) {
      preFill.style.width = d.stats.precision + '%';
      preFill.style.background = d.color;
      preVal.textContent = d.stats.precision;
    }
    if (tecFill && tecVal) {
      tecFill.style.width = d.stats.technique + '%';
      tecFill.style.background = d.color;
      tecVal.textContent = d.stats.technique;
    }
    if (expFill && expVal) {
      expFill.style.width = d.stats.experience + '%';
      expFill.style.background = d.color;
      expVal.textContent = d.stats.experience;
    }

    if (bookBtn) {
      bookBtn.style.borderColor = d.color;
      bookBtn.style.color = d.color;
    }
    if (counterNum) counterNum.textContent = String(idx + 1).padStart(2, '0');
    if (counterTotal) counterTotal.textContent = String(TEAM_SPECIALISTS.length).padStart(2, '0');

    csHudEntries.forEach((e, i) => e.classList.toggle('active', i === idx));
    csStage.style.setProperty('--accent', d.color);
  }

  /* ── 7. Transition Orchestrator ── */
  function csGoTo(target) {
    const len = TEAM_SPECIALISTS.length;
    const t = ((target % len) + len) % len;
    if (csAnimating || t === csActive) return;
    csAnimating = true;
    csActive = t;

    const infoEls = ['#cs-doc-specialty', '#cs-doc-name', '#cs-doc-bio', '#cs-doc-stats', '#cs-book-btn'];
    if (window.gsap) {
      gsap.to(infoEls, {
        opacity: 0,
        y: -8,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          csUpdateUI(t);
          gsap.fromTo(infoEls, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
        }
      });
    } else {
      csUpdateUI(t);
    }

    csLayout(true);
    setTimeout(() => { csAnimating = false; }, 750);
  }

  /* ── 8. Story Panel Functions ── */
  const csStoryPanel = document.getElementById('cs-story-panel');
  const csStoryOverlay = document.getElementById('cs-story-overlay');

  window.openDoctorStory = function () {
    const d = TEAM_SPECIALISTS[csActive];
    const storyImg = document.getElementById('cs-story-img');
    const storySpec = document.getElementById('cs-story-specialty');
    const storyName = document.getElementById('cs-story-name');
    const storyYrs = document.getElementById('cs-story-years');
    const storyEdu = document.getElementById('cs-story-edu');
    const storyQuote = document.getElementById('cs-story-quote');
    const storyBio = document.getElementById('cs-story-bio');
    const storyTreatments = document.getElementById('cs-story-treatments');

    if (storyImg) storyImg.src = d.img;
    if (storySpec) { storySpec.textContent = d.specialty; storySpec.style.color = d.color; }
    if (storyName) storyName.textContent = d.name;
    if (storyYrs) { storyYrs.textContent = d.years + ' Years Clinical Practice'; storyYrs.style.color = d.color; }
    if (storyEdu) storyEdu.textContent = d.edu;
    if (storyQuote) storyQuote.textContent = `“${d.quote}”`;
    if (storyBio) storyBio.textContent = d.bio;
    if (storyTreatments) {
      storyTreatments.innerHTML = d.treatments.map(t => `<span class="cs-treat-tag">${t}</span>`).join('');
    }

    ['pre', 'tec', 'exp'].forEach((k, i) => {
      const val = [d.stats.precision, d.stats.technique, d.stats.experience][i];
      const fill = document.getElementById('cs-st-' + k);
      const valEl = document.getElementById('cs-st-' + k + '-val');
      if (fill && valEl) {
        fill.style.width = '0%';
        fill.style.background = d.color;
        valEl.textContent = val;
        valEl.style.color = d.color;
        setTimeout(() => { fill.style.width = val + '%'; }, 300 + i * 100);
      }
    });

    if (csStoryPanel) {
      csStoryPanel.style.setProperty('--doc', d.color);
      csStoryPanel.classList.add('open');
    }
    if (csStoryOverlay) csStoryOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeDoctorStory = function () {
    if (csStoryPanel) csStoryPanel.classList.remove('open');
    if (csStoryOverlay) csStoryOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  /* ── 9. Controls & Listeners ── */
  const prevBtn = document.getElementById('cs-btn-prev');
  const nextBtn = document.getElementById('cs-btn-next');
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); csGoTo(csActive - 1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); csGoTo(csActive + 1); });

  const bookBtn = document.getElementById('cs-book-btn');
  if (bookBtn) bookBtn.addEventListener('click', (e) => { e.stopPropagation(); openDoctorStory(); });

  const hintBtn = document.getElementById('cs-mobile-hint');
  if (hintBtn) hintBtn.addEventListener('click', (e) => { e.stopPropagation(); openDoctorStory(); });

  const storyBookBtn = document.getElementById('cs-story-book');
  if (storyBookBtn) {
    storyBookBtn.addEventListener('click', () => {
      const docName = TEAM_SPECIALISTS[csActive].name;
      closeDoctorStory();
      if (typeof openBookingWithDoctor === 'function') {
        openBookingWithDoctor(docName);
      } else {
        const ctaSec = document.getElementById('cta-booking-section');
        if (ctaSec) ctaSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') csGoTo(csActive + 1);
    if (e.key === 'ArrowLeft') csGoTo(csActive - 1);
    if (e.key === 'Escape') closeDoctorStory();
  });

  // Touch Swipe
  let touchStartX = null, touchStartY = null;
  csStage.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  csStage.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3 && !csAnimating) {
      csGoTo(csActive + (dx < 0 ? 1 : -1));
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  // Initial render
  window.addEventListener('resize', () => csLayout(false));
  csUpdateUI(csActive);
  csLayout(false);

  // GSAP ScrollTrigger Entrance
  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#character-select',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.from('#cs-heading', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' });
        gsap.from(csCharEls, { y: 90, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out' });
        gsap.from('#cs-info-panel', { x: -45, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
        gsap.from('#doctor-hud', { x: 45, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 });
        gsap.from('#cs-bottombar', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      }
    });
  }
})();
