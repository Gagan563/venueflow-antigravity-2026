/* ============================================
   VenueFlow Home Dashboard View
   Live overview, telemetry, and quick actions
   ============================================ */

const HomeView = {
  _countdownInterval: null,
  _unsubscribeFns: [],

  render() {
    const container = DOM.$('#view-home');
    if (!container) return;

    const attendance = AppState.get('currentAttendance');
    const density = AppState.get('overallCrowdDensity');
    const crowdInfo = Format.crowdLevel(density);
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(queue => queue.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
    const shortestRestroom = [...queues].filter(queue => queue.type === 'restroom').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
    const countdown = Format.countdown(Config.venue.eventTime);
    const seat = Config.venue.userSeat;
    const activeOrders = AppState.get('activeOrders');
    const smartTip = this._getSmartTip();

    container.innerHTML = `
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        <section class="glass-cyber rounded-[2.5rem] p-6 border-fuchsia-500/20 relative overflow-hidden animate-fade-in-up">
          <div class="absolute inset-0 bg-primary/5"></div>
          <div class="relative z-10 flex justify-between items-start mb-4">
            <div>
              <p class="text-secondary font-bold text-[10px] tracking-widest uppercase mb-1 text-neon-cyan">Live node connected</p>
              <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline">Command<br><span class="text-primary text-neon-fuchsia">Center</span></h1>
            </div>
            <div class="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-primary text-sm shadow-[0_0_10px_#BF00FF]">bolt</span>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-3 relative z-10">
            <span class="text-xl">🏏</span>
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

          <button class="mt-5 w-full bg-zinc-900 border border-white/10 text-white rounded-full py-3 font-headline font-black text-[10px] uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors" id="home-see-all-events">
            View full timeline
          </button>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 100ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">monitoring</span>
              Telemetry
            </h2>
            <span class="text-secondary font-bold text-[9px] tracking-widest uppercase border border-secondary/30 px-2 py-0.5 rounded px-2">Realtime</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-secondary/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">groups</span>
              <div class="font-headline font-black text-2xl text-white mt-1" id="home-attendance">${Format.compactNumber(attendance)}</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Attendance</div>
            </div>

            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-white/10 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined ${crowdInfo.level === 'low' ? 'text-zinc-400' : 'text-orange-500'}" style="font-variation-settings: 'FILL' 1;">blur_on</span>
              <div class="font-headline font-black text-2xl text-white mt-1" id="home-density">${density}%</div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Crowd load</div>
            </div>

            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-fuchsia-500/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-fuchsia-500" style="font-variation-settings: 'FILL' 1;">restaurant</span>
              <div class="font-headline font-black text-2xl text-white mt-1">${shortestFood.waitMinutes}<span class="text-xs text-zinc-500">m</span></div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">Fast::${shortestFood.name}</div>
            </div>

            <div class="glass-cyber p-4 rounded-2xl flex flex-col gap-2 border-blue-500/20 hover:bg-zinc-900 transition-colors">
              <span class="material-symbols-outlined text-blue-500" style="font-variation-settings: 'FILL' 1;">wc</span>
              <div class="font-headline font-black text-2xl text-white mt-1">${shortestRestroom.waitMinutes}<span class="text-xs text-zinc-500">m</span></div>
              <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">Fast::${shortestRestroom.name}</div>
            </div>
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 180ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">grid_view</span>
              Quick Access
            </h2>
          </div>

          <div class="grid grid-cols-4 gap-2">
            ${this._renderQuickAction('navigate-map', 'map', 'MAP', 'bg-blue-500/10 text-blue-500 border-blue-500/30')}
            ${this._renderQuickAction('navigate-order', 'fastfood', 'FOOD', 'bg-orange-500/10 text-orange-500 border-orange-500/30')}
            ${this._renderQuickAction('navigate-concierge', 'smart_toy', 'AI BOT', 'bg-primary/10 text-primary border-primary/30')}
            ${this._renderQuickAction('navigate-queue', 'trending_up', 'STATS', 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30')}
          </div>
        </section>

        ${activeOrders.length > 0 ? `
          <section class="animate-fade-in-up" style="animation-delay: 260ms;">
            <div class="flex justify-between items-end mb-4 px-2">
              <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-primary">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">package</span>
                Active Tasks
              </h2>
              <span class="text-black bg-primary font-bold text-[9px] tracking-widest uppercase rounded flex items-center justify-center w-5 h-5">${activeOrders.length}</span>
            </div>
            <div class="space-y-3">
              ${activeOrders.map(order => `
                <div class="glass-cyber p-4 rounded-2xl border-primary/30 bg-primary/5 flex items-center justify-between">
                  <div>
                    <p class="font-black text-white text-sm uppercase tracking-tight">${order.id}</p>
                    <p class="text-zinc-500 text-[9px] font-bold tracking-widest">${order.items.map(item => item.emoji).join(' ')} // ${order.items.length} items</p>
                  </div>
                  <span class="bg-black text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-white/20 rounded-md">
                    ${order.status}
                  </span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <section class="animate-fade-in-up" style="animation-delay: 340ms;">
          <div class="glass-cyber p-4 rounded-2xl border-secondary/30 bg-secondary/5 flex gap-4 mt-2 hover:bg-zinc-900 transition-colors cursor-pointer" id="home-smart-tip">
            <div class="w-10 h-10 rounded-full bg-black border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">tips_and_updates</span>
            </div>
            <div>
              <p class="font-black text-white text-sm uppercase tracking-tight mb-1">${smartTip.title}</p>
              <p class="text-zinc-400 text-xs font-medium leading-snug">${smartTip.desc}</p>
            </div>
          </div>
        </section>
      </div>
    `;

    this._bindEvents(container);
    this._startCountdown();
    this._subscribeToUpdates();
  },

  /**
   * Render a quick action button
   * @param {string} action - Action identifier
   * @param {string} icon - Material icon name
   * @param {string} label - Button label
   * @param {string} styleClass - Accent classes
   * @returns {string}
   * @private
   */
  _renderQuickAction(action, icon, label, styleClass) {
    return `
      <button class="flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-colors quick-action group" data-action="${action}">
        <div class="w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${styleClass}">
          <span class="material-symbols-outlined text-sm">${icon}</span>
        </div>
        <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">${label}</span>
      </button>
    `;
  },

  _bindEvents(container) {
    DOM.$$('.quick-action', container).forEach(element => {
      element.addEventListener('click', () => {
        const action = element.dataset.action;
        if (action) Router.navigate(action.replace('navigate-', ''));
      });
    });

    DOM.$('#home-see-all-events', container)?.addEventListener('click', () => Router.navigate('events'));
    DOM.$('#home-smart-tip', container)?.addEventListener('click', () => Router.navigate('concierge'));
  },

  _startCountdown() {
    if (this._countdownInterval) clearInterval(this._countdownInterval);

    this._countdownInterval = setInterval(() => {
      const element = DOM.$('#home-countdown');
      if (!element) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
        return;
      }

      const countdown = Format.countdown(Config.venue.eventTime);
      const blocks = element.querySelectorAll('.text-3xl');
      if (blocks.length >= 3) {
        blocks[0].textContent = countdown.hours;
        blocks[1].textContent = countdown.minutes;
        blocks[2].textContent = countdown.seconds;
      }
    }, 1000);
  },

  _subscribeToUpdates() {
    this._unsubscribe();
    this._unsubscribeFns = [
      AppState.subscribe('currentAttendance', value => {
        const element = DOM.$('#home-attendance');
        if (element) element.textContent = Format.compactNumber(value);
      }),
      AppState.subscribe('overallCrowdDensity', value => {
        const element = DOM.$('#home-density');
        if (element) {
          element.textContent = `${value}%`;
          element.style.color = Format.crowdLevel(value).color;
        }
      }),
      AppState.subscribe('activeOrders', () => this.render())
    ];
  },

  _unsubscribe() {
    this._unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this._unsubscribeFns = [];
  },

  _getSmartTip() {
    const density = AppState.get('overallCrowdDensity');
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(queue => queue.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

    if (density > 80) {
      return {
        title: 'Beat the crowd',
        desc: 'The venue is filling up fast. Head to concessions now before the next rush.'
      };
    }

    if (shortestFood && shortestFood.waitMinutes <= 5) {
      return {
        title: `${shortestFood.name} has a short line`,
        desc: `Only ${shortestFood.waitMinutes} minutes right now. It is a good time to order before queues climb again.`
      };
    }

    return {
      title: 'Try pre-ordering',
      desc: 'Skip the concourse line entirely by placing a food order from your seat.'
    };
  },

  destroy() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }

    this._unsubscribe();
  }
};
