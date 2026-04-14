/* ============================================
   VenueFlow Queue Status View — V2 Premium
   ============================================ */

const QueueView = {
  _activeTab: 'all',
  _trendChart: null,

  render() {
    const container = DOM.$('#view-queue');
    if (!container) return;

    const queues = AppState.get('queues');
    const minWait = Math.min(...queues.map(q => q.waitMinutes));
    const avgWait = Math.round(queues.reduce((s, q) => s + q.waitMinutes, 0) / queues.length);
    const maxWait = Math.max(...queues.map(q => q.waitMinutes));

    container.innerHTML = `
      <div class="animate-fade-in-up" style="margin-bottom: 20px;">
        <h1 style="font-size: var(--text-xl); font-weight: var(--font-extrabold); letter-spacing: -0.02em; margin-bottom: 4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-light)" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-3px;margin-right:8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Queue Status
        </h1>
        <p style="font-size: var(--text-sm); color: var(--text-tertiary);">Real-time wait times across the venue</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid-3 animate-fade-in-up" style="margin-bottom: 20px; animation-delay: 80ms;">
        <div class="card card-compact card-no-hover text-center" style="border-color: rgba(52,211,153,0.15);">
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 6px;">SHORTEST</div>
          <div class="font-mono font-bold" style="font-size: var(--text-xl); color: var(--success); text-shadow: 0 0 12px rgba(52,211,153,0.3);" id="queue-shortest">${minWait}m</div>
        </div>
        <div class="card card-compact card-no-hover text-center" style="border-color: rgba(79,142,255,0.15);">
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 6px;">AVERAGE</div>
          <div class="font-mono font-bold" style="font-size: var(--text-xl); color: var(--accent-blue-light); text-shadow: 0 0 12px rgba(79,142,255,0.3);" id="queue-average">${avgWait}m</div>
        </div>
        <div class="card card-compact card-no-hover text-center" style="border-color: rgba(248,113,113,0.15);">
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 6px;">LONGEST</div>
          <div class="font-mono font-bold" style="font-size: var(--text-xl); color: var(--danger); text-shadow: 0 0 12px rgba(248,113,113,0.3);" id="queue-longest">${maxWait}m</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex-row animate-fade-in-up" style="margin-bottom: 16px; gap: 8px; animation-delay: 120ms;" role="tablist">
        <button class="chip chip-active" data-tab="all" role="tab" id="tab-all">All</button>
        <button class="chip" data-tab="food" role="tab" id="tab-food">Food</button>
        <button class="chip" data-tab="restroom" role="tab" id="tab-restroom">Restrooms</button>
        <button class="chip" data-tab="gate" role="tab" id="tab-gate">Gates</button>
      </div>

      <!-- Queue List -->
      <div class="flex-col" id="queue-list" role="list" aria-live="polite">
        ${this._renderQueueList(queues)}
      </div>

      <!-- Trend Chart -->
      <div class="section" style="margin-top: 24px;">
        <div class="section-header">
          <span class="section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-2px;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            WAIT TIME TRENDS
          </span>
          <span class="badge badge-info">30 min</span>
        </div>
        <div class="card card-no-hover" style="padding: 16px; position: relative; height: 220px;">
          <canvas id="queue-trend-chart"></canvas>
        </div>
      </div>

      <!-- Best Times -->
      <div class="section" style="margin-top: 16px;">
        <div class="section-header">
          <span class="section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            BEST TIME TO GO
          </span>
        </div>
        ${this._renderBestTimes(queues)}
      </div>
    `;

    this._bindEvents(container);
    // Delay chart init to ensure canvas has layout dimensions after view animation
    setTimeout(() => requestAnimationFrame(() => this._initTrendChart()), 100);
    this._subscribeToUpdates();
  },

  _renderQueueList(queues) {
    const filtered = this._activeTab === 'all' ? queues : queues.filter(q => q.type === this._activeTab);
    const sorted = [...filtered].sort((a, b) => a.waitMinutes - b.waitMinutes);

    return sorted.map((q, i) => {
      const status = Format.waitStatus(q.waitMinutes);
      const barClass = q.waitMinutes <= 5 ? 'low' : q.waitMinutes <= 15 ? 'medium' : 'high';
      const trendIcon = q.trend === 'rising' ? '↑' : q.trend === 'falling' ? '↓' : '→';
      const trendColor = q.trend === 'rising' ? 'var(--danger)' : q.trend === 'falling' ? 'var(--success)' : 'var(--text-tertiary)';

      return `
        <div class="card card-compact animate-fade-in-up" style="animation-delay: ${i * 40}ms; margin-bottom: 8px;" role="listitem">
          <div class="flex-between" style="margin-bottom: 10px;">
            <div class="flex-row gap-4" style="gap: 12px;">
              <div style="
                width: 42px; height: 42px; border-radius: var(--radius-lg);
                background: ${this._getTypeGradient(q.type)};
                display: flex; align-items: center; justify-content: center;
                font-size: var(--text-lg); flex-shrink: 0;
              ">${q.icon}</div>
              <div>
                <div class="font-semibold" style="font-size: var(--text-sm);">${q.name}</div>
                <div class="flex-row" style="gap: 8px; margin-top: 3px;">
                  <span style="font-size: 10px; color: var(--text-tertiary); text-transform: capitalize;">${q.type}</span>
                  <span style="font-size: 10px; color: ${trendColor}; font-weight: 600;">${trendIcon} ${q.trend}</span>
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="font-mono font-bold" style="font-size: var(--text-xl); color: var(--${status}); text-shadow: 0 0 12px ${status === 'success' ? 'rgba(52,211,153,0.3)' : status === 'warning' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'};">
                ${q.waitMinutes}<span style="font-size: 10px; color: var(--text-tertiary); font-weight: 400;">min</span>
              </div>
            </div>
          </div>
          <div class="queue-bar queue-bar-${barClass}">
            <div class="queue-bar-fill" style="width: ${Math.min(100, q.capacity)}%"></div>
          </div>
          <div class="flex-between" style="margin-top: 8px;">
            <span style="font-size: 10px; color: var(--text-tertiary);">Capacity: ${q.capacity}%</span>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('map')" style="font-size: 10px; padding: 4px 10px;">Navigate →</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _getTypeGradient(type) {
    const gradients = {
      food: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(248,113,113,0.1))',
      restroom: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(99,102,241,0.1))',
      gate: 'linear-gradient(135deg, rgba(79,142,255,0.15), rgba(34,211,238,0.1))'
    };
    return gradients[type] || 'var(--glass-bg)';
  },

  _renderBestTimes(queues) {
    const recs = [
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>', title: 'Food Runs', desc: queues.filter(q => q.type === 'food').some(q => q.waitMinutes <= 5) ? 'Now! Some stands have short lines.' : 'Wait 15 min for lines to thin.', good: queues.filter(q => q.type === 'food').some(q => q.waitMinutes <= 5) },
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M2 21h20"/></svg>', title: 'Restrooms', desc: queues.filter(q => q.type === 'restroom').some(q => q.waitMinutes <= 3) ? 'Good time! Several have short waits.' : 'Try upper deck restrooms.', good: queues.filter(q => q.type === 'restroom').some(q => q.waitMinutes <= 3) },
      { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f8eff" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>', title: 'Exit Strategy', desc: 'Leave 5 min before final whistle to avoid post-game rush.', good: null }
    ];

    return recs.map(r => `
      <div class="card card-compact flex-row" style="gap: 12px; margin-bottom: 8px;">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--glass-bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${r.icon}</div>
        <div style="flex: 1;">
          <div class="font-semibold" style="font-size: var(--text-sm);">${r.title}</div>
          <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">${r.desc}</div>
        </div>
        ${r.good !== null ? `<span class="badge ${r.good ? 'badge-success' : 'badge-warning'}" style="align-self: flex-start;">${r.good ? 'Go Now' : 'Wait'}</span>` : '<span class="badge badge-info" style="align-self: flex-start;">Tip</span>'}
      </div>
    `).join('');
  },

  _initTrendChart() {
    const canvas = DOM.$('#queue-trend-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [];
    const foodData = [], restroomData = [], gateData = [];
    
    for (let i = 30; i >= 0; i -= 5) {
      labels.push(i === 0 ? 'Now' : `-${i}m`);
      foodData.push(Math.round(8 + Math.random() * 12));
      restroomData.push(Math.round(3 + Math.random() * 8));
      gateData.push(Math.round(2 + Math.random() * 6));
    }

    const queues = AppState.get('queues');
    foodData[foodData.length - 1] = Math.round(queues.filter(q => q.type === 'food').reduce((s, q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'food').length);
    restroomData[restroomData.length - 1] = Math.round(queues.filter(q => q.type === 'restroom').reduce((s, q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'restroom').length);
    gateData[gateData.length - 1] = Math.round(queues.filter(q => q.type === 'gate').reduce((s, q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'gate').length);

    this._trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Food', data: foodData, borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.08)', tension: 0.4, fill: true, pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
          { label: 'Restrooms', data: restroomData, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.08)', tension: 0.4, fill: true, pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 },
          { label: 'Gates', data: gateData, borderColor: '#4f8eff', backgroundColor: 'rgba(79,142,255,0.08)', tension: 0.4, fill: true, pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#556075', font: { family: 'Inter', size: 10 }, padding: 14, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: { backgroundColor: 'rgba(12,16,23,0.95)', titleColor: '#eef2f7', bodyColor: '#8896aa', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 10, cornerRadius: 10, titleFont: { family: 'Inter', weight: '600', size: 12 }, bodyFont: { family: 'JetBrains Mono', size: 11 }, callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} min` } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#556075', font: { family: 'Inter', size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#556075', font: { family: 'JetBrains Mono', size: 9 }, callback: (v) => `${v}m` }, min: 0, max: 25 }
        }
      }
    });
  },

  _bindEvents(container) {
    DOM.$$('.chip[data-tab]', container).forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.$$('.chip[data-tab]', container).forEach(c => c.classList.remove('chip-active'));
        chip.classList.add('chip-active');
        this._activeTab = chip.dataset.tab;
        DOM.$('#queue-list', container).innerHTML = this._renderQueueList(AppState.get('queues'));
      });
    });
  },

  _subscribeToUpdates() {
    AppState.subscribe('queues', (queues) => {
      const list = DOM.$('#queue-list');
      if (list) list.innerHTML = this._renderQueueList(queues);
      
      const s = DOM.$('#queue-shortest'), a = DOM.$('#queue-average'), l = DOM.$('#queue-longest');
      if (s) s.textContent = `${Math.min(...queues.map(q => q.waitMinutes))}m`;
      if (a) a.textContent = `${Math.round(queues.reduce((s,q) => s + q.waitMinutes, 0) / queues.length)}m`;
      if (l) l.textContent = `${Math.max(...queues.map(q => q.waitMinutes))}m`;

      if (this._trendChart) {
        const avgF = Math.round(queues.filter(q => q.type === 'food').reduce((s,q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'food').length);
        const avgR = Math.round(queues.filter(q => q.type === 'restroom').reduce((s,q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'restroom').length);
        const avgG = Math.round(queues.filter(q => q.type === 'gate').reduce((s,q) => s + q.waitMinutes, 0) / queues.filter(q => q.type === 'gate').length);
        [avgF, avgR, avgG].forEach((v, i) => { this._trendChart.data.datasets[i].data.push(v); this._trendChart.data.datasets[i].data.shift(); });
        this._trendChart.update('none');
      }
    });
  },

  destroy() { if (this._trendChart) { this._trendChart.destroy(); this._trendChart = null; } }
};
