/* ═══════════════════════════════════════════════════════════════════
   BULL CREEK DENTAL — 60FPS CANVAS SCRUBBER & MASTER ENGINE
   Synchronized to all 6 Chapters (576 WebP Dental 3D Frames)
   ═══════════════════════════════════════════════════════════════════ */

const canvas = document.getElementById("film");
const ctx = canvas ? canvas.getContext("2d") : null;
const track = document.getElementById("track");
const loader = document.getElementById("loader");
const loadbar = document.getElementById("loadbar");
const scrollCue = document.getElementById("scroll-cue");
const captions = [...document.querySelectorAll(".caption")];
const siteNav = document.querySelector(".site-nav");

const KEEP = 120;      // evict bitmaps further than this
const AHEAD = 30;      // decode ahead in scroll direction

const state = {
  blobs: [],
  bitmaps: new Map(),
  count: 0,
  pattern: "",
  current: -1,
  target: 0,
  smooth: 0,
  dir: 1,
  ready: false,
  decoding: new Set(),
};

/* ── 1. Scrubber Loading & Manifest ───────────────────────── */

async function loadManifest() {
  const res = await fetch("frames/frames.json");
  if (!res.ok) throw new Error("Manifest not found");
  return res.json();
}

function frameURL(i) {
  return state.pattern.replace("%04d", String(i + 1).padStart(4, "0"));
}

async function fetchBlob(i) {
  if (state.blobs[i]) return state.blobs[i];
  const res = await fetch(frameURL(i));
  state.blobs[i] = await res.blob();
  return state.blobs[i];
}

async function decodeFrame(i) {
  if (state.bitmaps.has(i) || state.decoding.has(i) || !state.blobs[i]) return;
  state.decoding.add(i);
  try {
    const bmp = await createImageBitmap(state.blobs[i]);
    state.bitmaps.set(i, bmp);
  } catch (err) {
    // transient retry next tick
  }
  state.decoding.delete(i);
}

function manageWindow(center) {
  for (let d = 0; d <= AHEAD; d++) {
    const fwd = center + d * state.dir;
    const back = center - Math.min(d, 8) * state.dir;
    if (fwd >= 0 && fwd < state.count) decodeFrame(fwd);
    if (back >= 0 && back < state.count) decodeFrame(back);
  }
  if (state.bitmaps.size > KEEP * 2) {
    for (const [idx, bmp] of state.bitmaps) {
      if (Math.abs(idx - center) > KEEP) {
        bmp.close();
        state.bitmaps.delete(idx);
      }
    }
  }
}

async function preloadFrames() {
  const { count } = state;
  const EAGER = Math.min(Math.ceil(count * 0.18), 80);

  let done = 0;
  await Promise.all(
    Array.from({ length: EAGER }, (_, i) =>
      fetchBlob(i).then(() => {
        done++;
        if (loadbar) loadbar.style.width = `${(done / EAGER) * 100}%`;
      })
    )
  );

  await decodeFrame(0);
  state.ready = true;
  if (loader) loader.classList.add("done");

  // Fetch remaining frames in background
  let next = EAGER;
  Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < count) {
        const i = next++;
        try { await fetchBlob(i); } catch (e) {}
      }
    })
  );
}

/* ── 2. Canvas Drawing ────────────────────────────────────── */

function resizeCanvas() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  state.current = -1; // force re-render
}

function nearestDecoded(i) {
  if (state.bitmaps.has(i)) return i;
  for (let d = 1; d < state.count; d++) {
    if (state.bitmaps.has(i - d)) return i - d;
    if (state.bitmaps.has(i + d)) return i + d;
  }
  return -1;
}

function drawFrame(i) {
  if (!ctx || !canvas) return;
  const j = nearestDecoded(i);
  if (j < 0) return;
  const bmp = state.bitmaps.get(j);
  const cw = canvas.width, ch = canvas.height;
  
  ctx.fillStyle = "#070E0D";
  ctx.fillRect(0, 0, cw, ch);

  // Contain fit with seamless edge blend
  const s = Math.min(cw / bmp.width, ch / bmp.height) * 1.04;
  const w = bmp.width * s;
  const h = bmp.height * s;
  ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h);
  state.current = j;
}

/* ── 3. Scroll Mapping & Captions ─────────────────────────── */

function getProgress() {
  if (!track) return 0;
  const max = track.offsetHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

function updateCaptions(p) {
  for (const el of captions) {
    const tIn = +el.dataset.in;
    const tHold = +el.dataset.hold;
    const tOut = +el.dataset.out;
    const rise = Math.max((tHold - tIn) * 0.45, 0.01);
    const fall = Math.max((tOut - tHold) * 0.6, 0.01);
    
    let o = 0;
    if (p >= tIn && p <= tOut) {
      o = Math.min((p - tIn) / rise, 1) * Math.min((tOut - p) / fall, 1);
      o = Math.min(Math.max(o, 0), 1);
    }
    el.style.opacity = o.toFixed(3);
    const drift = (p - tHold) * -40; // subtle smooth parallax
    el.style.transform = `${transformBase(el)} translateY(${drift.toFixed(1)}px)`;
  }
  if (scrollCue) scrollCue.style.opacity = p < 0.02 ? "1" : "0";
}

function transformBase(el) {
  if (el.classList.contains("cap-center")) return "translate(-50%, -50%)";
  if (el.classList.contains("cap-bottom")) return "translateX(-50%)";
  if (el.classList.contains("cap-top")) return "translateX(-50%)";
  return "translateY(-50%)";
}

/* ── 4. Main 60fps Animation Loop ─────────────────────────── */

let lastT = performance.now();
function tick(now) {
  const dt = Math.min((now - lastT) / 1000, 0.5) || 0.016;
  lastT = now;

  if (state.ready) {
    const p = getProgress();
    const prevTarget = state.target;
    state.target = p * (state.count - 1);
    if (state.target !== prevTarget) state.dir = state.target >= prevTarget ? 1 : -1;

    // Time-based smooth lerp damping
    const k = 1 - Math.exp(-dt * 14);
    state.smooth += (state.target - state.smooth) * k;
    if (Math.abs(state.target - state.smooth) < 0.4) state.smooth = state.target;

    const i = Math.round(state.smooth);
    manageWindow(i);
    if (i !== state.current) drawFrame(i);
    updateCaptions(p);
  }

  // Update navbar on scroll
  if (siteNav) {
    if (window.scrollY > 120) {
      siteNav.classList.add("scrolled");
    } else {
      siteNav.classList.remove("scrolled");
    }
  }

  requestAnimationFrame(tick);
}

/* ── 5. Intersection Observer Reveal Engine ───────────────── */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

function checkReveals() {
  document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add("in");
    }
  });
}
window.addEventListener("scroll", checkReveals, { passive: true });

/* ── 6. Interactive Before / After Split Slider ───────────── */

const gallerySlider = document.getElementById("gallery-split-slider");
const galleryBefore = document.getElementById("gallery-split-before");
const galleryDivider = document.getElementById("gallery-split-divider");
let isDragging = false;

function setSplitPosition(x) {
  if (!gallerySlider || !galleryBefore || !galleryDivider) return;
  const rect = gallerySlider.getBoundingClientRect();
  let pos = (x - rect.left) / rect.width;
  pos = Math.max(0.04, Math.min(0.96, pos));
  galleryBefore.style.width = `${pos * 100}%`;
  galleryDivider.style.left = `${pos * 100}%`;
}

if (gallerySlider) {
  const onPointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSplitPosition(clientX);
  };
  const stopDragging = () => { isDragging = false; };

  gallerySlider.addEventListener("mousedown", (e) => {
    isDragging = true;
    setSplitPosition(e.clientX);
  });
  gallerySlider.addEventListener("touchstart", (e) => {
    isDragging = true;
    setSplitPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", stopDragging);
  window.addEventListener("touchend", stopDragging);
}

/* ── 7. Diagnostic Problems Selector ──────────────────────── */

const dentalProblemsData = {
  toothache: {
    title: "Acute Toothache Relief",
    desc: "Severe toothache is often a sign of deep dental decay, an infected pulp, or cracked enamel. At Bull Creek Dental, we provide same-day urgent appointments, gentle root canal therapy, and soothing restorative care to relieve your discomfort immediately."
  },
  stains: {
    title: "Stained & Discolored Teeth",
    desc: "Whether caused by coffee, tea, smoking, or natural aging, our in-chair Philips Zoom teeth whitening (up to 8 shades lighter in 60 mins) and hand-crafted porcelain veneers can restore a bright, radiant, and natural-looking smile."
  },
  crooked: {
    title: "Crooked & Crowded Teeth",
    desc: "We offer Diamond Invisalign® clear aligners in Bull Creek that straighten crooked or crowded teeth discreetly and comfortably for adults, teenagers, and children without metal brackets."
  },
  gaps: {
    title: "Spacing & Tooth Gaps",
    desc: "Gaps between teeth can be corrected seamlessly using Invisalign clear aligners, tooth-colored composite bonding, or bespoke porcelain veneers to achieve balanced symmetry."
  },
  bleeding: {
    title: "Bleeding Gums & Gingivitis",
    desc: "Bleeding gums are an early sign of gingivitis or gum inflammation. Routine ultrasonic scaling and dental cleanings at Bull Creek Dental remove plaque and calculus to protect your gums from progressive periodontal disease."
  },
  wisdom: {
    title: "Wisdom Teeth Pain & Impacted Molars",
    desc: "Impacting wisdom teeth can cause severe pain, swelling, and crowding. Our dentists evaluate wisdom teeth with precision digital X-rays and provide gentle in-chair surgical extractions or sedation options."
  },
  sensitivity: {
    title: "Teeth Sensitivity to Cold & Hot",
    desc: "Acute sensitivity to cold, hot, or sweet foods often results from worn enamel, receded gums, or micro-cracks. We provide desensitizing fluoride varnishes, protective bonding, and custom dental splints."
  },
  sleep: {
    title: "Snoring & Sleep Apnoea",
    desc: "Disrupted sleep and loud snoring can be alleviated with custom-fitted oral mandibular advancement splints that gently keep your airway open throughout the night."
  },
  tmj: {
    title: "TMJ Disorder & Teeth Grinding (Bruxism)",
    desc: "Clenching and grinding during sleep cause jaw soreness, morning headaches, and tooth wear. We craft customized night splints and neuromuscular bite guards to protect your teeth and relieve joint tension."
  }
};

window.selectDentalProblem = function (key) {
  const data = dentalProblemsData[key];
  if (!data) return;

  document.querySelectorAll(".diag-chip").forEach((btn) => btn.classList.remove("active"));
  if (window.event && window.event.target) window.event.target.classList.add("active");

  const titleEl = document.getElementById("problem-title");
  const descEl = document.getElementById("problem-desc");

  if (titleEl && descEl) {
    titleEl.innerText = data.title;
    descEl.innerText = data.desc;
  }
};

/* ── 8. FAQ Accordion ─────────────────────────────────────── */

window.toggleFaqAccordion = function (button) {
  const row = button.closest(".faq-row");
  const isActive = row.classList.contains("active");

  document.querySelectorAll(".faq-row").forEach((el) => el.classList.remove("active"));
  if (!isActive) row.classList.add("active");
};

/* ── 8b. Mobile Navigation Drawer ────────────────────────── */

const mobileToggle = document.getElementById("nav-mobile-toggle");
const mobileDrawer = document.getElementById("mobile-drawer");

window.toggleMobileDrawer = function () {
  if (!mobileDrawer || !mobileToggle) return;
  const isOpen = mobileDrawer.classList.toggle("open");
  mobileToggle.classList.toggle("active", isOpen);
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
  mobileDrawer.setAttribute("aria-hidden", String(!isOpen));
};

window.closeMobileDrawer = function () {
  if (!mobileDrawer || !mobileToggle) return;
  mobileDrawer.classList.remove("open");
  mobileToggle.classList.remove("active");
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileDrawer.setAttribute("aria-hidden", "true");
};

if (mobileToggle) {
  mobileToggle.addEventListener("click", window.toggleMobileDrawer);
}

/* ── 9. Interactive Booking Modal ────────────────────────── */

const modal = document.getElementById("booking-modal");

window.openBookingModal = function () {
  if (modal) modal.classList.add("open");
};

window.closeBookingModal = function () {
  if (modal) modal.classList.remove("open");
};

window.closeBookingModalOverlay = function (e) {
  if (e.target === modal) closeBookingModal();
};

window.openBookingWithService = function (serviceName) {
  openBookingModal();
  const select = document.getElementById("modal-serv");
  if (select) {
    for (let opt of select.options) {
      if (opt.text.toLowerCase().includes(serviceName.toLowerCase()) || opt.value.toLowerCase().includes(serviceName.toLowerCase())) {
        opt.selected = true;
        break;
      }
    }
  }
};

window.openBookingWithDoctor = function (doctorName) {
  openBookingModal();
  const select = document.getElementById("modal-doc");
  if (select) {
    for (let opt of select.options) {
      if (opt.text.toLowerCase().includes(doctorName.toLowerCase()) || opt.value.toLowerCase().includes(doctorName.toLowerCase())) {
        opt.selected = true;
        break;
      }
    }
  }
};

window.submitBookingForm = function (e) {
  e.preventDefault();
  const name = document.getElementById("modal-name").value;
  const serv = document.getElementById("modal-serv").value;
  
  alert(`Thank you, ${name}! Your appointment request for Bull Creek Dental (${serv}) has been received. Our clinical reception team will contact you shortly to confirm your booking.`);
  closeBookingModal();
};

/* ── 10. Boot Sequence ────────────────────────────────────── */

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

loadManifest()
  .then((manifest) => {
    state.count = manifest.count;
    state.pattern = manifest.pattern;
    state.blobs = new Array(manifest.count).fill(null);
    requestAnimationFrame(tick);
    return preloadFrames();
  })
  .catch((err) => {
    console.warn("Could not load frames manifest, using direct fallback:", err);
    if (loader) loader.classList.add("done");
  });
