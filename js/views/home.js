/* ============================================
   VenueFlow Home Dashboard View — V2 Premium
   Immersive dark design with neon accents
   ============================================ */

const HomeView = {
  _countdownInterval: null,

  render() {
    const container = DOM.$('#view-home');
    if (!container) return;

    const attendance = AppState.get('currentAttendance');
    const density = AppState.get('overallCrowdDensity');
    const crowdInfo = Format.crowdLevel(density);
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(q => q.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
    const shortestRestroom = [...queues].filter(q => q.type === 'restroom').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
    const countdown = Format.countdown(Config.venue.eventTime);
    const seat = Config.venue.userSeat;
    const activeOrders = AppState.get('activeOrders');    container.innerHTML = `
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        
        <!-- Welcome Hero -->
        <div class="glass-cyber rounded-[2.5rem] p-6 border-fuchsia-500/20 relative overflow-hidden animate-fade-in-up">
          <div class="absolute inset-0 bg-primary/5"></div>
          <div class="relative z-10 flex justify-between items-start mb-4">
            <div>
              <p class="text-secondary font-bold text-[10px] tracking-widest uppercase mb-1 text-neon-cyan">LIVE_NODE_CONNECTED</p>
              <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline">COMMAND<br><span class="text-primary text-neon-fuchsia">CENTER</span></h1>
            </div>
            <div class="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-primary text-sm shadow-[0_0_10px_#BF00FF]">bolt</span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-3 relative z-10">
            <span class="text-xl">🏈</span>
            <div>
              <p class="font-black text-xs uppercase tracking-tight text-white">${Config.venue.currentEvent}</p>
              <p class="text-[10px] text-zinc-500 font-bold uppercase">${Config.venue.name} // SEC ${seat.section}</p>
            </div>
          </div>
          
          <div class="flex justify-between items-end mt-4 relative z-10" id="home-countdown">
            <div class="text-center">
              <div class="font-headline font-black text-3xl leading-none text-white">${countdown.hours}</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">HRS</div>
            </div>
            <span class="font-headline font-black text-2xl text-zinc-700 leading-none pb-2">:</span>
            <div class="text-center">
              <div class="font-headline font-black text-3xl leading-none text-white">${countdown.minutes}</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">MIN</div>
            </div>
            <span class="font-headline font-black text-2xl text-zinc-700 leading-none pb-2">:</span>
            <div class="text-center">
              <div class="font-headline font-black text-3xl leading-none text-primary text-neon-fuchsia">${countdown.seconds}</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SEC</div>
            </div>
          </div>
        </div>

        <!-- Telemetry Data (Live Metrics) -->
        <div class="animate-fade-in-up" style="animation-delay: 100ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">monitoring</span>
              TELEMETRY
            </h3>
            <span class="text-secondary font-bold text-[9px] tracking-widest uppercase border border-secondary/30 px-2 py-0.5 rounded px-2">REALTIME</span>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-secondary/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">groups</span>
              <div class="font-headline font-black text-2xl text-white mt-1" id="home-attendance">${Format.compactNumber(attendance)}</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ATTENDANCE</div>
            </div>
            
            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-${crowdInfo.level === 'low' ? 'zinc-500' : 'orange-500'}/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-${crowdInfo.level === 'low' ? 'zinc-400' : 'orange-500'}" style="font-variation-settings: 'FILL' 1;">blur_on</span>
              <div class="font-headline font-black text-2xl text-white mt-1" id="home-density">${density}%</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">NETWORK_LOAD</div>
            </div>
            
            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-fuchsia-500/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-fuchsia-500" style="font-variation-settings: 'FILL' 1;">restaurant</span>
              <div class="font-headline font-black text-2xl text-white mt-1">${shortestFood.waitMinutes}<span class="text-xs text-zinc-500">m</span></div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">FAST::${shortestFood.name}</div>
            </div>
            
            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-blue-500/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-blue-500" style="font-variation-settings: 'FILL' 1;">wc</span>
              <div class="font-headline font-black text-2xl text-white mt-1">${shortestRestroom.waitMinutes}<span class="text-xs text-zinc-500">m</span></div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">FAST::${shortestRestroom.name}</div>
            </div>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="animate-fade-in-up" style="animation-delay: 200ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">grid_view</span>
              QUICK_ACCESS
            </h3>
          </div>
          
          <div class="grid grid-cols-4 gap-2">
            <button class="flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-colors quick-action group" data-action="navigate-map">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                <span class="material-symbols-outlined text-sm">map</span>
              </div>
              <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">MAP</span>
            </button>
            <button class="flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-colors quick-action group" data-action="navigate-order">
              <div class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/30 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                <span class="material-symbols-outlined text-sm">fastfood</span>
              </div>
              <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">FOOD</span>
            </button>
            <button class="flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-colors quick-action group" data-action="navigate-concierge">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30 group-hover:bg-primary group-hover:text-black transition-colors">
                <span class="material-symbols-outlined text-sm">smart_toy</span>
              </div>
              <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">AI_BOT</span>
            </button>
            <button class="flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-colors quick-action group" data-action="navigate-queue">
              <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <span class="material-symbols-outlined text-sm">trending_up</span>
              </div>
              <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">STATS</span>
            </button>
          </div>
        </div>

        <!-- Active Orders -->
        ${activeOrders.length > 0 ? `
        <div class="animate-fade-in-up" style="animation-delay: 300ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">package</span>
              ACTIVE_TASKS
            </h3>
            <span class="text-black bg-primary font-bold text-[9px] tracking-widest uppercase rounded flex items-center justify-center w-5 h-5">${activeOrders.length}</span>
          </div>
          <div class="space-y-3">
          ${activeOrders.map(order => `
            <div class="glass-cyber p-4 rounded-2xl border-primary/30 bg-primary/5 flex items-center justify-between">
              <div>
                <p class="font-black text-white text-sm uppercase tracking-tight">${order.id}</p>
                <p class="text-zinc-500 text-[9px] font-bold tracking-widest">${order.items.map(i => i.emoji).join(' ')} // ${order.items.length} ITEMS</p>
              </div>
              <span class="bg-black text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-white/20 rounded-md">
                ${order.status}
              </span>
            </div>
          `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- AI Smart Tip -->
        <div class="animate-fade-in-up" style="animation-delay: 400ms;">
          <div class="glass-cyber p-4 rounded-2xl border-secondary/30 bg-secondary/5 flex gap-4 mt-2 hover:bg-zinc-900 transition-colors cursor-pointer" onclick="Router.navigate('concierge')">
            <div class="w-10 h-10 rounded-full bg-black border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">tips_and_updates</span>
            </div>
            <div>
              <p class="font-black text-white text-sm uppercase tracking-tight mb-1">${this._getSmartTip().title}</p>
              <p class="text-zinc-400 text-xs font-medium leading-snug">${this._getSmartTip().desc}</p>
            </div>
          </div>
        </div>

      </div>
    `;

    this._bindEvents(container);
    this._startCountdown();
    this._subscribeToUpdates();
  },

  _bindEvents(container) {
    DOM.$$('.quick-action', container).forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        if (action) Router.navigate(action.replace('navigate-', ''));
      });
    });

    const seeAll = DOM.$('#home-see-all-events', container);
    if (seeAll) seeAll.addEventListener('click', () => Router.navigate('events'));
  },

  _startCountdown() {
    if (this._countdownInterval) clearInterval(this._countdownInterval);
    
    this._countdownInterval = setInterval(() => {
      const el = DOM.$('#home-countdown');
      if (!el) { clearInterval(this._countdownInterval); return; }

      const cd = Format.countdown(Config.venue.eventTime);
      const blocks = el.querySelectorAll('.text-3xl');
      if (blocks.length >= 3) {
        blocks[0].textContent = cd.hours;
        blocks[1].textContent = cd.minutes;
        blocks[2].textContent = cd.seconds;
      }
    }, 1000);
  },

  _subscribeToUpdates() {
    AppState.subscribe('currentAttendance', (val) => {
      const el = DOM.$('#home-attendance');
      if (el) el.textContent = Format.compactNumber(val);
    });

    AppState.subscribe('overallCrowdDensity', (val) => {
      const el = DOM.$('#home-density');
      if (el) { el.textContent = `${val}%`; el.style.color = Format.crowdLevel(val).color; }
    });
  },

  _getSmartTip() {
    const density = AppState.get('overallCrowdDensity');
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(q => q.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

    if (density > 80) return { title: 'Beat the crowd', desc: 'The venue is filling up fast. Head to concessions now before halftime rush!' };
    if (shortestFood && shortestFood.waitMinutes <= 5) return { title: `${shortestFood.name} has a short line!`, desc: `Only ${shortestFood.waitMinutes} min wait — grab food now before it gets busy.` };
    return { title: 'Try Pre-Ordering', desc: 'Skip the line entirely by pre-ordering food from your seat in the Order tab.' };
  },

  destroy() {
    if (this._countdownInterval) { clearInterval(this._countdownInterval); this._countdownInterval = null; }
  }
};
