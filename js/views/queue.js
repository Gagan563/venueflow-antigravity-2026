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
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        <!-- Header -->
        <div class="glass-cyber rounded-[2.5rem] p-6 border-emerald-500/20 text-center animate-fade-in-up">
          <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10B981]"></span>
            <span class="font-black text-[9px] uppercase tracking-[0.2em] font-headline">WAIT_TIMES</span>
          </div>
          <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline">CROWD<span class="text-emerald-500 text-neon-cyan">_CONTROL</span></h1>
          <p class="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-2">OPTIMIZING ROUTES</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-3 gap-3 animate-fade-in-up" style="animation-delay: 80ms;">
          <div class="glass-cyber p-3 rounded-2xl flex flex-col items-center justify-center border-emerald-500/20 hover:bg-zinc-900 transition-colors">
            <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">SHORTEST</span>
            <div class="font-headline font-black text-2xl text-emerald-500" id="queue-shortest">${minWait}<span class="text-xs">m</span></div>
          </div>
          <div class="glass-cyber p-3 rounded-2xl flex flex-col items-center justify-center border-blue-500/20 hover:bg-zinc-900 transition-colors">
            <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">AVERAGE</span>
            <div class="font-headline font-black text-2xl text-blue-500" id="queue-average">${avgWait}<span class="text-xs">m</span></div>
          </div>
          <div class="glass-cyber p-3 rounded-2xl flex flex-col items-center justify-center border-fuchsia-500/20 hover:bg-zinc-900 transition-colors">
            <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">LONGEST</span>
            <div class="font-headline font-black text-2xl text-fuchsia-500" id="queue-longest">${maxWait}<span class="text-xs">m</span></div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar animate-fade-in-up px-1" style="animation-delay: 120ms;" role="tablist">
          <button class="shrink-0 font-headline font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors active:scale-95 border ${this._activeTab === 'all' ? 'bg-primary text-black border-primary/50' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'}" data-tab="all" role="tab" id="tab-all">ALL</button>
          <button class="shrink-0 font-headline font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors active:scale-95 border ${this._activeTab === 'food' ? 'bg-primary text-black border-primary/50' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'}" data-tab="food" role="tab" id="tab-food">FOOD</button>
          <button class="shrink-0 font-headline font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors active:scale-95 border ${this._activeTab === 'restroom' ? 'bg-primary text-black border-primary/50' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'}" data-tab="restroom" role="tab" id="tab-restroom">WC</button>
          <button class="shrink-0 font-headline font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors active:scale-95 border ${this._activeTab === 'gate' ? 'bg-primary text-black border-primary/50' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'}" data-tab="gate" role="tab" id="tab-gate">GATES</button>
        </div>

        <!-- Queue List -->
        <div class="space-y-4" id="queue-list" role="list">
          ${this._renderQueueList(queues)}
        </div>

        <!-- Trend Chart -->
        <div class="animate-fade-in-up" style="animation-delay: 200ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-500" style="font-variation-settings: 'FILL' 1;">stacked_line_chart</span>
              WAIT_TRENDS
            </h3>
            <span class="text-zinc-500 font-bold text-[9px] tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded">30 MIN</span>
          </div>
          <div class="glass-cyber rounded-2xl p-4 border border-white/5 h-56 relative w-full overflow-hidden">
            <canvas id="queue-trend-chart" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Best Times / Tips -->
        <div class="animate-fade-in-up" style="animation-delay: 300ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">tips_and_updates</span>
              STRATEGY
            </h3>
          </div>
          <div class="space-y-3">
            ${this._renderBestTimes(queues)}
          </div>
        </div>
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
      const isHigh = q.waitMinutes > 15;
      const isMedium = q.waitMinutes > 5 && q.waitMinutes <= 15;
      const statusColorClass = isHigh ? 'text-fuchsia-500' : (isMedium ? 'text-orange-500' : 'text-emerald-500');
      const barColorClass = isHigh ? 'bg-fuchsia-500' : (isMedium ? 'bg-orange-500' : 'bg-emerald-500');
      
      const trendIcon = q.trend === 'rising' ? 'moving_up' : q.trend === 'falling' ? 'moving_down' : 'flatware';
      const trendColor = q.trend === 'rising' ? 'text-fuchsia-500' : q.trend === 'falling' ? 'text-emerald-500' : 'text-zinc-500';

      return `
        <div class="glass-cyber rounded-2xl p-4 border-white/5 hover:bg-zinc-900 transition-colors animate-fade-in-up" style="animation-delay: ${i * 40}ms;" role="listitem">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0 text-xl shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                ${q.icon}
              </div>
              <div>
                <h4 class="font-headline font-black text-white text-sm uppercase tracking-tight">${q.name}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">${q.type}</span>
                  <span class="flex items-center text-[10px] uppercase font-black tracking-widest ${trendColor}">
                    <span class="material-symbols-outlined text-[12px] mr-0.5">${trendIcon}</span>
                    ${q.trend}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="text-right flex flex-col items-end">
              <div class="font-headline font-black text-2xl leading-none ${statusColorClass}">
                ${q.waitMinutes}<span class="text-[10px] text-zinc-500 ml-0.5 tracking-widest uppercase">MIN</span>
              </div>
            </div>
          </div>
          
          <div class="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 mb-2">
            <div class="h-full ${barColorClass} transition-all duration-1000" style="width: ${Math.min(100, q.capacity)}%"></div>
          </div>
          
          <div class="flex justify-between items-center mt-2">
            <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">NETWORK_LOAD: ${q.capacity}%</span>
            <button class="bg-zinc-800 text-white rounded px-2 py-1 flex items-center gap-1 font-headline font-black text-[9px] tracking-widest uppercase hover:bg-zinc-700 transition-colors" onclick="Router.navigate('map')">
              NAV <span class="material-symbols-outlined text-[10px]">arrow_forward</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  _getTypeGradient(type) {
    // Left for legacy compatibility or map styling if it references this
    return 'var(--glass-bg)';
  },

  _renderBestTimes(queues) {
    const recs = [
      { icon: 'fastfood', title: 'NUTRITION', desc: queues.filter(q => q.type === 'food').some(q => q.waitMinutes <= 5) ? 'Nodes available. Low queue detected.' : 'High traffic. Delay resupply.', good: queues.filter(q => q.type === 'food').some(q => q.waitMinutes <= 5) },
      { icon: 'wc', title: 'FACILITIES', desc: queues.filter(q => q.type === 'restroom').some(q => q.waitMinutes <= 3) ? 'Optimal timing. Clear path.' : 'Traffic congestion. Use upper sector.', good: queues.filter(q => q.type === 'restroom').some(q => q.waitMinutes <= 3) },
      { icon: 'directions_run', title: 'EVACUATION', desc: 'Pre-calculate exit route. Initiate 5m prior to protocol end.', good: null }
    ];

    return recs.map(r => `
      <div class="glass-cyber rounded-2xl p-3 border-white/5 flex gap-3 hover:bg-zinc-900 transition-colors">
        <div class="w-10 h-10 rounded-xl bg-black border ${r.good ? 'border-emerald-500/30 text-emerald-500' : r.good === false ? 'border-orange-500/30 text-orange-500' : 'border-blue-500/30 text-blue-500'} flex items-center justify-center shrink-0">
           <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">${r.icon}</span>
        </div>
        <div class="flex-grow py-0.5">
          <div class="flex justify-between items-start mb-1">
            <h5 class="font-headline font-black text-white text-xs uppercase tracking-widest">${r.title}</h5>
            ${r.good !== null ? `<span class="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${r.good ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}">${r.good ? 'GO_NOW' : 'HOLD'}</span>` : `<span class="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border bg-blue-500/10 border-blue-500/30 text-blue-500">INTEL</span>`}
          </div>
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-tight leading-tight">${r.desc}</p>
        </div>
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
