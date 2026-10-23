/* ═══════════════════════════════════════════════════════════════════
   BULL CREEK DENTAL — FULL TEAM ROSTER (5 SPECIALISTS CONTROLLER)
   Dynamic Filtering & Bio Cards
   ═══════════════════════════════════════════════════════════════════ */

const FULL_TEAM_DATA = [
  {
    name: 'Dr. Ash Malhotra',
    role: 'Principal Dentist & Sedation Lead',
    category: 'sedation',
    qual: 'BDS (2006) · ADC (Royal Melbourne Hospital 2009)',
    img: 'team/Dr-Ash-Malhotra.png',
    bio: 'Over 18 years of clinical experience in cosmetic smile design, porcelain veneers, crowns, bridges, Invisalign, and gentle sedation for anxious patients.'
  },
  {
    name: 'Dr. Amy Liu',
    role: 'Orthodontics & Clear Aligners',
    category: 'ortho',
    qual: 'Doctor of Dental Medicine (DMD, University of Western Australia)',
    img: 'team/Dr-Amy-Liu.png',
    bio: 'Specialist interest in Invisalign clear aligners, dental implants, and comfortable cosmetic smile transformations. Fluent in English, Mandarin, and Cantonese.'
  },
  {
    name: 'Dr. Prayas Mahapatra',
    role: 'Preventative & Family Dentist',
    category: 'general',
    qual: 'Doctor of Dental Medicine (DMD, University of Western Australia)',
    img: 'team/Dr-Prayas-Mahapatra.png',
    bio: 'Compassionate, gentle dental care focused on preventative oral wellness, patient relationships, and anxiety-free family dental experiences.'
  },
  {
    name: 'Dr. Gretchan Phillip',
    role: 'Restorative & Oral Rehabilitation',
    category: 'restorative',
    qual: 'BDS (2010) · Master of Dental Surgery (MDS)',
    img: 'team/Dr-Gretchan-Phillip.png',
    bio: 'Over 14 years clinical expertise delivering master-level precision across crowns, bridges, endodontics, and complex full-mouth oral restorations.'
  },
  {
    name: 'Dr. Michelle Dunne',
    role: 'Children’s Dentistry & Extractions',
    category: 'pediatric',
    qual: 'Dental Degree (Trinity College Dublin, Ireland 2013)',
    img: 'team/Dr-Michelle-Dunne.png',
    bio: '11+ years of gentle dental experience specializing in anxiety-free children’s dentistry (CDBS), wisdom teeth extractions, and preventative care.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('fullTeamGrid');
  if (!grid) return;

  const renderTeam = (filter = 'all') => {
    grid.innerHTML = '';
    const filtered = filter === 'all'
      ? FULL_TEAM_DATA
      : FULL_TEAM_DATA.filter(m => m.category === filter || filter === 'dentist');

    filtered.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'fullteam-card';
      card.dataset.category = m.category;

      card.innerHTML = `
        <div class="fullteam-photo">
          <img src="${encodeURI(m.img)}" alt="${m.name} — ${m.role} at Bull Creek Dental" loading="lazy" />
          <div class="fullteam-overlay">
            <div class="fullteam-name">${m.name}</div>
            <div class="fullteam-role">${m.role}</div>
            <span class="fullteam-qual">${m.qual}</span>
            <p class="fullteam-bio">${m.bio}</p>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (typeof openBookingWithDoctor === 'function') {
          openBookingWithDoctor(m.name);
        } else {
          const ctaSec = document.getElementById('cta-booking-section');
          if (ctaSec) ctaSec.scrollIntoView({ behavior: 'smooth' });
        }
      });

      grid.appendChild(card);
    });

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        grid.querySelectorAll('.fullteam-card'),
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  };

  renderTeam('all');

  const filterBtns = document.querySelectorAll('.fullteam-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      renderTeam(cat);
    });
  });
});
