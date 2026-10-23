/* ═══════════════════════════════════════════════════════════════════
   BULL CREEK DENTAL — LUXURY INTERACTIVE BOOKING SECTION
   Dedicated JavaScript Controller for Appointment Concierge
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  const ctaBook = document.getElementById('ctaBook');
  const ctaSuccess = document.getElementById('ctaSuccess');
  const WA_NUMBER = '61435353608'; // Bull Creek Dental mobile / direct WhatsApp line 0435 353 608

  if (!ctaBook) return;

  const calGrid = document.getElementById('cal-grid');
  const calMonth = document.getElementById('cal-month');
  const slotGrid = document.getElementById('slot-grid');
  const summary = document.getElementById('bk-summary');
  const waBtn = document.getElementById('bk-wa');
  const confirmBtn = document.getElementById('bk-confirm');

  // Custom treatment dropdown elements
  const ddRoot = document.getElementById('bk-treatment');
  const ddBtn = document.getElementById('bk-dd-btn');
  const ddVal = ddRoot ? ddRoot.querySelector('.bk-dd-val') : null;
  let bkTreatment = '';

  if (ddBtn && ddRoot) {
    ddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = ddRoot.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    ddRoot.querySelectorAll('.bk-dd-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        bkTreatment = opt.textContent.trim();
        if (ddVal) {
          ddVal.textContent = bkTreatment;
          ddVal.removeAttribute('data-placeholder');
        }
        ddRoot.querySelectorAll('.bk-dd-opt').forEach((o) => o.classList.remove('sel'));
        opt.classList.add('sel');
        ddRoot.classList.remove('open');
        ddBtn.setAttribute('aria-expanded', 'false');
        updateBooking();
      });
    });

    document.addEventListener('click', (e) => {
      if (!ddRoot.contains(e.target)) {
        ddRoot.classList.remove('open');
        ddBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Available Time Slots (Bull Creek Dental Hours)
  const SLOTS = ['08:30', '09:45', '11:00', '12:15', '14:00', '15:15', '16:30'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewY = today.getFullYear();
  let viewM = today.getMonth();
  let selDate = null;
  let selTime = null;

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function fmtDate(d) {
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function updateBooking() {
    const t = bkTreatment || 'a consultation';
    let txt = `Hi Bull Creek Dental, I would like to book ${t}`;
    if (selDate) txt += ` on ${fmtDate(selDate)}`;
    if (selTime) txt += ` at ${selTime}`;
    txt += ' at your Bull Creek clinic (Suite 4/64 Bull Creek Dr).';

    if (waBtn) {
      waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;
    }
    if (summary) {
      summary.textContent = selDate ? `${fmtDate(selDate)}${selTime ? ' · ' + selTime : ''}` : '';
    }
  }

  function renderSlots() {
    if (!slotGrid) return;
    slotGrid.innerHTML = '';
    if (!selDate) {
      slotGrid.innerHTML = '<span class="slot-hint">Pick a date first</span>';
      return;
    }
    SLOTS.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot' + (s === selTime ? ' active' : '');
      b.textContent = s;
      b.addEventListener('click', () => {
        selTime = s;
        renderSlots();
        updateBooking();
      });
      slotGrid.appendChild(b);
    });
  }

  function renderCal() {
    if (!calMonth || !calGrid) return;
    calMonth.textContent = `${MONTHS[viewM]} ${viewY}`;
    calGrid.innerHTML = '';

    const first = new Date(viewY, viewM, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday = 0
    const days = new Date(viewY, viewM + 1, 0).getDate();

    for (let i = 0; i < startDow; i++) {
      const e = document.createElement('span');
      e.className = 'cal-empty';
      calGrid.appendChild(e);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(viewY, viewM, d);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cal-day';
      b.textContent = d;

      const isPast = date < today;
      const isSun = date.getDay() === 0; // Sundays closed

      if (isPast || isSun) {
        b.disabled = true;
        b.classList.add('off');
      }
      if (selDate && date.getTime() === selDate.getTime()) {
        b.classList.add('active');
      }
      if (date.getTime() === today.getTime()) {
        b.classList.add('today');
      }
      if (!b.disabled) {
        b.addEventListener('click', () => {
          selDate = date;
          selTime = null;
          renderCal();
          renderSlots();
          updateBooking();
        });
      }
      calGrid.appendChild(b);
    }
  }

  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');

  if (calPrev) {
    calPrev.addEventListener('click', () => {
      if (viewY === today.getFullYear() && viewM === today.getMonth()) return;
      viewM--;
      if (viewM < 0) {
        viewM = 11;
        viewY--;
      }
      renderCal();
    });
  }

  if (calNext) {
    calNext.addEventListener('click', () => {
      viewM++;
      if (viewM > 11) {
        viewM = 0;
        viewY++;
      }
      renderCal();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!bkTreatment || !selDate || !selTime) {
        if (summary) {
          summary.textContent = 'Please select your treatment, preferred date, and time.';
          summary.classList.add('warn');
          setTimeout(() => summary.classList.remove('warn'), 2500);
        }
        return;
      }

      if (window.gsap) {
        gsap.to(ctaBook, {
          opacity: 0,
          y: -12,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            ctaBook.style.display = 'none';
            if (ctaSuccess) {
              ctaSuccess.innerHTML = `✓ Request received &mdash; <strong>${bkTreatment}</strong> on ${fmtDate(selDate)} at ${selTime}. Our Bull Creek Dental reception team will contact you to confirm within 24 hours.`;
              ctaSuccess.classList.add('visible');
              gsap.from(ctaSuccess, { opacity: 0, y: 15, duration: 0.55, ease: 'power3.out' });
            }
          }
        });
      } else {
        ctaBook.style.display = 'none';
        if (ctaSuccess) {
          ctaSuccess.innerHTML = `✓ Request received &mdash; <strong>${bkTreatment}</strong> on ${fmtDate(selDate)} at ${selTime}. Our Bull Creek Dental reception team will contact you to confirm within 24 hours.`;
          ctaSuccess.classList.add('visible');
        }
      }
    });
  }

  // Pre-select treatment if triggered from other page links
  window.selectBookingTreatment = function (treatmentName) {
    if (ddRoot && ddVal) {
      bkTreatment = treatmentName;
      ddVal.textContent = treatmentName;
      ddVal.removeAttribute('data-placeholder');
      ddRoot.querySelectorAll('.bk-dd-opt').forEach((opt) => {
        if (opt.textContent.trim().toLowerCase().includes(treatmentName.toLowerCase())) {
          opt.classList.add('sel');
        } else {
          opt.classList.remove('sel');
        }
      });
      updateBooking();
      const ctaSec = document.getElementById('cta-booking-section');
      if (ctaSec) ctaSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initial Calendar Boot
  renderCal();
  renderSlots();
  updateBooking();
})();
