// AEGIS BALLISTICS - REGIONAL ARSENALS & RANGE RADAR

const MISSILE_DATABASE = [
  // China
  { name: 'DF-11 (CSS-7)', country: 'China', class: 'SRBM', range: 300, payload: 'Conventional / HE 500kg', status: 'Active', desc: 'Short-range road-mobile tactical missile for immediate cross-border strike operations.' },
  { name: 'DF-15 (CSS-6)', country: 'China', class: 'SRBM', range: 600, payload: 'Nuclear / Conventional 600kg', status: 'Active', desc: 'Solid-fueled road-mobile SRBM with terminal radar guidance.' },
  { name: 'DF-16', country: 'China', class: 'SRBM', range: 1000, payload: 'Precision Maneuvering Warhead', status: 'Active', desc: 'Newly developed highly precise regional ballistic missile filling the gap between SRBM and MRBM.' },
  { name: 'DF-21', country: 'China', class: 'MRBM', range: 2150, payload: 'Nuclear / Conventional', status: 'Active', desc: 'Two-stage solid-propellant medium-range ballistic missile.' },
  { name: 'DF-21D (ASBM)', country: 'China', class: 'MRBM', range: 2000, payload: 'Anti-Ship Kinetic Penetrator', status: 'Active', desc: 'World\'s first Anti-Ship Ballistic Missile designed to strike moving aircraft carrier battle groups.' },
  { name: 'DF-17 (HGV)', country: 'China', class: 'MRBM', range: 2500, payload: 'Hypersonic Glide Vehicle (Mach 10)', status: 'Active', desc: 'Solid-fueled booster mated to a Hypersonic Glide Vehicle (HGV) capable of low-altitude unpredictable flight path maneuvers.' },
  { name: 'DF-26', country: 'China', class: 'IRBM', range: 4000, payload: 'Dual-Capable (Nuclear / Conventional)', status: 'Active', desc: '"Guam Killer" intermediate-range ballistic missile capable of precision maritime and fixed ground strikes.' },
  { name: 'DF-5 / DF-5B', country: 'China', class: 'ICBM', range: 13000, payload: 'Heavy Megaton / Multi-MIRV', status: 'Active', desc: 'Silo-based two-stage liquid-propellant intercontinental ballistic missile capable of striking global targets.' },
  { name: 'DF-31 / 31AG', country: 'China', class: 'ICBM', range: 11000, payload: 'Single 1-MT or 3 MIRVs', status: 'Active', desc: 'Road-mobile off-road all-terrain 8-axle TEL solid-propellant strategic ICBM.' },
  { name: 'DF-41', country: 'China', class: 'ICBM', range: 15000, payload: '10 MIRVs + Decoy Suite', status: 'Active', desc: 'China\'s most advanced fourth-generation solid-fuel road/rail-mobile ICBM with Mach 25+ re-entry velocity.' },

  // Pakistan
  { name: 'Hatf-IX (Nasr)', country: 'Pakistan', class: 'SRBM', range: 70, payload: 'Sub-kiloton Tactical Nuclear', status: 'Active', desc: 'Multi-tube road-mobile short-range tactical battlefield deterrence weapon.' },
  { name: 'Hatf-II (Abdali)', country: 'Pakistan', class: 'SRBM', range: 200, payload: 'Conventional / Nuclear 450kg', status: 'Active', desc: 'Single-stage solid-fuel tactical battlefield ballistic missile.' },
  { name: 'Hatf-III (Ghaznavi)', country: 'Pakistan', class: 'SRBM', range: 300, payload: 'Conventional / Nuclear 500kg', status: 'Active', desc: 'Short-range solid-fueled ballistic missile for rapid retaliatory strikes.' },
  { name: 'Hatf-IV (Shaheen-I / IA)', country: 'Pakistan', class: 'SRBM', range: 900, payload: 'Nuclear / Conventional 1000kg', status: 'Active', desc: 'Solid-fueled road-mobile SRBM with upgraded post-separation terminal steering.' },
  { name: 'Hatf-V (Ghauri)', country: 'Pakistan', class: 'MRBM', range: 1500, payload: 'Liquid Propellant Warhead', status: 'Active', desc: 'Single-stage liquid-fueled MRBM developed with North Korean Nodong technology assistance.' },
  { name: 'Hatf-VI (Shaheen-II)', country: 'Pakistan', class: 'MRBM', range: 2500, payload: 'Two-stage Solid Propellant', status: 'Active', desc: 'Two-stage solid-fuel medium-range ballistic missile with separating warhead.' },
  { name: 'Shaheen-III', country: 'Pakistan', class: 'IRBM', range: 2750, payload: 'Solid-fuel Multi-stage', status: 'Active', desc: 'Pakistan\'s longest-range ballistic missile capable of reaching all strategic targets within the subcontinent.' },
  { name: 'Ababeel', country: 'Pakistan', class: 'MRBM', range: 2200, payload: 'MIRV (Multiple Warheads)', status: 'Testing', desc: 'Three-stage solid-propellant MRBM specifically engineered to carry Multiple Independently Targetable Re-entry Vehicles (MIRV).' },

  // Afghanistan
  { name: 'Scud-B (R-17 Elbrus)', country: 'Afghanistan', class: 'SRBM', range: 300, payload: 'High Explosive 1000kg', status: 'Historical / Leftover', desc: 'Soviet-origin liquid-fueled battlefield ballistic missile remnants from past regional conflicts.' },
  { name: 'FROG-7 (9K52 Luna-M)', country: 'Afghanistan', class: 'SRBM', range: 70, payload: 'Uncrewed Artillery Rocket 450kg', status: 'Historical / Leftover', desc: 'Unguided short-range battlefield artillery rocket system leftover from cold-war era stock.' }
];

document.addEventListener('DOMContentLoaded', () => {
  const cardsGrid = document.getElementById('arsenal-cards-grid');
  const searchInput = document.getElementById('arsenal-search');
  const filterPills = document.querySelectorAll('.filter-pill');

  let currentFilter = 'all';
  let searchQuery = '';

  function renderMissiles() {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = '';

    const filtered = MISSILE_DATABASE.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery) ||
                          m.country.toLowerCase().includes(searchQuery) ||
                          m.class.toLowerCase().includes(searchQuery) ||
                          m.desc.toLowerCase().includes(searchQuery);

      if (!matchSearch) return false;

      if (currentFilter === 'all') return true;
      if (currentFilter === 'China' || currentFilter === 'Pakistan' || currentFilter === 'Afghanistan') {
        return m.country === currentFilter;
      }
      if (currentFilter === 'ICBM') return m.class === 'ICBM';
      if (currentFilter === 'MRBM') return m.class === 'MRBM' || m.class === 'SRBM';
      return true;
    });

    if (filtered.length === 0) {
      cardsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No missile systems found matching criteria.</div>`;
      return;
    }

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'm-card-item';
      
      let badgeClass = 'srbm-badge';
      if (m.class === 'MRBM') badgeClass = 'mrbm-badge';
      if (m.class === 'IRBM') badgeClass = 'irbm-badge';
      if (m.class === 'ICBM') badgeClass = 'icbm-badge';

      card.innerHTML = `
        <div class="mci-header">
          <span class="mci-name">${m.name}</span>
          <span class="class-badge ${badgeClass}">${m.class}</span>
        </div>
        <span class="mci-country">📍 ${m.country} &bull; ${m.status}</span>
        <div class="mci-range-box">
          <span>Max Range:</span>
          <strong style="color: var(--cyan-glow);">${m.range.toLocaleString()} km</strong>
        </div>
        <p class="mci-desc">${m.desc}</p>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
          Payload: <span style="color: #fff;">${m.payload}</span>
        </div>
      `;
      cardsGrid.appendChild(card);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderMissiles();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderMissiles();
      playBeep(650, 0.04);
    });
  });

  renderMissiles();
  initRadarCanvas();
});

// Interactive Range Radar Canvas
function initRadarCanvas() {
  const radarCanvas = document.getElementById('radarCanvas');
  if (!radarCanvas) return;
  const ctx = radarCanvas.getContext('2d');

  const selectedMissiles = [
    { name: 'Scud-B', range: 300, color: '#ffaa00' },
    { name: 'DF-15', range: 900, color: '#00ff88' },
    { name: 'Shaheen-II', range: 2500, color: '#00f2fe' },
    { name: 'DF-26', range: 4000, color: '#4facfe' },
    { name: 'DF-41', range: 15000, color: '#ff3366' }
  ];

  // Populate Legend
  const legendBox = document.getElementById('radar-legend-items');
  if (legendBox) {
    legendBox.innerHTML = selectedMissiles.map(m => `
      <div class="legend-entry">
        <span class="leg-color" style="background: ${m.color};"></span>
        <strong style="color: #fff;">${m.name}:</strong>
        <span>${m.range.toLocaleString()} km range reach</span>
      </div>
    `).join('');
  }

  let angleSweep = 0;

  function drawRadar() {
    const width = 600;
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 30;

    ctx.clearRect(0, 0, width, height);

    // Radar concentric distance rings (representing up to 15,000 km)
    const MAX_RANGE_KM = 16000;
    const rings = [1000, 3000, 5500, 10000, 15000];

    rings.forEach((rKm, idx) => {
      const radius = (rKm / MAX_RANGE_KM) * maxRadius;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.18)';
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(0, 242, 254, 0.45)';
      ctx.font = '9px "JetBrains Mono"';
      ctx.fillText(`${rKm} km`, cx + 4, cy - radius + 10);
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    // Draw missile range arcs
    selectedMissiles.forEach(m => {
      const r = (m.range / MAX_RANGE_KM) * maxRadius;
      ctx.beginPath();
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = m.color;
      ctx.font = '10px "Orbitron"';
      ctx.fillText(`${m.name}`, cx + r * 0.707 + 5, cy - r * 0.707 - 5);
    });

    // Rotating Radar Scanner line
    angleSweep += 0.02;
    const sweepX = cx + Math.cos(angleSweep) * maxRadius;
    const sweepY = cy + Math.sin(angleSweep) * maxRadius;

    const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    sweepGrad.addColorStop(0, 'rgba(0, 242, 254, 0.3)');
    sweepGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, angleSweep - 0.25, angleSweep);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.stroke();

    // Center Origin Dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '9px "JetBrains Mono"';
    ctx.fillText('LAUNCH ORIGIN (0 KM)', cx - 55, cy + 18);

    requestAnimationFrame(drawRadar);
  }

  window.drawRadar = drawRadar;
  drawRadar();
}
