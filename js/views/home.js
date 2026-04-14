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
    const activeOrders = AppState.get('activeOrders');

    container.innerHTML = `
      <!-- ═══ Hero Card — Event Banner ═══ -->
      <div class="animate-fade-in-up" style="
        border-radius: var(--radius-2xl);
        padding: 28px 24px 24px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(79,142,255,0.15) 0%, rgba(167,139,250,0.1) 50%, rgba(244,114,182,0.08) 100%);
        border: 1px solid rgba(79,142,255,0.15);
      ">
        <!-- Animated orbs in background -->
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(79,142,255,0.15),transparent 70%);animation:float 6s ease-in-out infinite;"></div>
        <div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,0.12),transparent 70%);animation:float 8s ease-in-out infinite reverse;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div class="flex-between" style="margin-bottom: 16px;">
            <div>
              <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent-blue-light); margin-bottom: 6px;">🏈 GAME DAY</div>
              <h1 style="font-size: var(--text-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 4px;">
                Giants <span style="color: var(--text-tertiary); font-weight: 400;">vs</span> Eagles
              </h1>
              <p style="font-size: var(--text-xs); color: var(--text-tertiary);">NFL Sunday · ${Config.venue.name}</p>
            </div>
            <div class="badge badge-live badge-brand" style="padding: 5px 12px;">LIVE</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-md); width: fit-content;">
            <span style="font-size: var(--text-xs);">📍</span>
            <span style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">${Format.seat(seat.section, seat.row, seat.seat)}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Countdown Timer ═══ -->
      <div class="animate-fade-in-up" style="animation-delay: 80ms; margin-bottom: 20px;">
        <div class="card card-no-hover" style="text-align: center; padding: 24px 20px; border-color: rgba(79,142,255,0.08);">
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-tertiary); margin-bottom: 16px;">⏱ KICKOFF IN</div>
          <div id="home-countdown" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 4px;">
            ${this._renderCountdownBlock(countdown.hours, 'HRS')}
            <span style="font-size: var(--text-2xl); color: var(--text-tertiary); font-weight: 300; padding-top: 4px;">:</span>
            ${this._renderCountdownBlock(countdown.minutes, 'MIN')}
            <span style="font-size: var(--text-2xl); color: var(--text-tertiary); font-weight: 300; padding-top: 4px;">:</span>
            ${this._renderCountdownBlock(countdown.seconds, 'SEC')}
          </div>
        </div>
      </div>

      <!-- ═══ Live Metrics ═══ -->
      <div class="section animate-fade-in-up" style="animation-delay: 160ms;">
        <div class="section-header">
          <span class="section-title">📊 LIVE METRICS</span>
          <span class="badge badge-live badge-success" style="font-size: 9px;">REAL-TIME</span>
        </div>
        <div class="grid-2">
          <!-- Attendance -->
          <div class="card stat-card card-glow-blue" style="animation-delay: 180ms;">
            <div class="stat-icon" style="background: var(--accent-blue-dim); color: var(--accent-blue-light);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="stat-value" id="home-attendance" style="color: var(--accent-blue-light);">${Format.compactNumber(attendance)}</div>
            <div class="stat-label">Attendance</div>
            <div class="queue-bar queue-bar-${crowdInfo.level === 'critical' ? 'high' : crowdInfo.level}" style="margin-top: 8px;">
              <div class="queue-bar-fill" style="width: ${density}%"></div>
            </div>
          </div>

          <!-- Crowd Density -->
          <div class="card stat-card card-glow-${crowdInfo.level === 'low' ? 'success' : 'orange'}" style="animation-delay: 220ms;">
            <div class="stat-icon" style="background: ${crowdInfo.level === 'low' ? 'var(--success-dim)' : crowdInfo.level === 'medium' ? 'var(--warning-dim)' : 'var(--danger-dim)'}; color: ${crowdInfo.color};">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-value" style="color: ${crowdInfo.color};" id="home-density">${density}%</div>
            <div class="stat-label">Crowd Density</div>
            <span class="badge badge-${Format.waitStatus(density > 75 ? 20 : density > 50 ? 10 : 3)}" style="margin-top: 6px;">${crowdInfo.label}</span>
          </div>

          <!-- Fastest Food -->
          <div class="card stat-card card-glow-orange" style="animation-delay: 260ms;">
            <div class="stat-icon" style="background: var(--accent-orange-dim); color: var(--accent-orange);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div class="stat-value" style="color: var(--accent-orange);">${shortestFood.waitMinutes}<span style="font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 400;"> min</span></div>
            <div class="stat-label">Fastest Food</div>
            <small style="color: var(--text-tertiary); font-size: 10px; margin-top: 2px;">${shortestFood.name}</small>
          </div>

          <!-- Nearest Restroom -->
          <div class="card stat-card card-glow-violet" style="animation-delay: 300ms;">
            <div class="stat-icon" style="background: var(--accent-violet-dim); color: var(--accent-violet);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s0-1 2-1 2.5 2 4.5 2 2.5-2 4.5-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>
            </div>
            <div class="stat-value" style="color: var(--accent-violet);">${shortestRestroom.waitMinutes}<span style="font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 400;"> min</span></div>
            <div class="stat-label">Nearest Restroom</div>
            <small style="color: var(--text-tertiary); font-size: 10px; margin-top: 2px;">${shortestRestroom.name}</small>
          </div>
        </div>
      </div>

      <!-- ═══ Quick Actions ═══ -->
      <div class="section animate-fade-in-up" style="animation-delay: 320ms;">
        <div class="section-header">
          <span class="section-title">⚡ QUICK ACTIONS</span>
        </div>
        <div class="quick-actions">
          <div class="card quick-action" id="qa-map" data-action="navigate-map">
            <div class="qa-icon" style="background: linear-gradient(135deg, rgba(79,142,255,0.15), rgba(34,211,238,0.1)); border: 1px solid rgba(79,142,255,0.15);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f8eff" stroke-width="2" stroke-linecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            </div>
            <div class="qa-label">Live Map</div>
            <div class="qa-desc">Crowd density</div>
          </div>
          <div class="card quick-action" id="qa-food" data-action="navigate-order">
            <div class="qa-icon" style="background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(248,113,113,0.1)); border: 1px solid rgba(251,146,60,0.15);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div class="qa-label">Order Food</div>
            <div class="qa-desc">Skip the line</div>
          </div>
          <div class="card quick-action" id="qa-ai" data-action="navigate-concierge">
            <div class="qa-icon" style="background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.1)); border: 1px solid rgba(167,139,250,0.15);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"><path d="M12 8V4H8"/><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 8V4"/><path d="M8 16v4"/><path d="M16 16v4"/><circle cx="8" cy="12" r="1" fill="#a78bfa"/><circle cx="16" cy="12" r="1" fill="#a78bfa"/></svg>
            </div>
            <div class="qa-label">AI Concierge</div>
            <div class="qa-desc">Ask anything</div>
          </div>
          <div class="card quick-action" id="qa-queues" data-action="navigate-queue">
            <div class="qa-icon" style="background: linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.1)); border: 1px solid rgba(52,211,153,0.15);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="qa-label">Wait Times</div>
            <div class="qa-desc">Live updates</div>
          </div>
        </div>
      </div>

      <!-- ═══ Active Orders ═══ -->
      ${activeOrders.length > 0 ? `
      <div class="section animate-fade-in-up" style="animation-delay: 360ms;">
        <div class="section-header">
          <span class="section-title">📦 ACTIVE ORDERS</span>
          <span class="badge badge-brand">${activeOrders.length}</span>
        </div>
        ${activeOrders.map(order => `
          <div class="card card-compact card-glow-success" style="margin-bottom: 10px;">
            <div class="flex-between" style="margin-bottom: 8px;">
              <span class="font-semibold font-mono text-sm">${order.id}</span>
              <span class="badge badge-${order.status === 'preparing' ? 'warning' : order.status === 'ready' ? 'success' : 'info'}">${order.status}</span>
            </div>
            <div class="text-xs text-tertiary">${order.items.map(i => `${i.emoji} ${i.name}`).join(' · ')}</div>
            <div class="order-tracker" style="margin-top: 12px;">
              <div class="order-step ${order.status !== 'placed' ? 'completed' : 'current'}"><div class="step-dot"></div><span class="step-label">Ordered</span></div>
              <div class="order-line ${order.status === 'ready' || order.status === 'completed' ? 'completed' : ''}"></div>
              <div class="order-step ${order.status === 'ready' || order.status === 'completed' ? 'completed' : order.status === 'preparing' ? 'current' : ''}"><div class="step-dot"></div><span class="step-label">Preparing</span></div>
              <div class="order-line ${order.status === 'completed' ? 'completed' : ''}"></div>
              <div class="order-step ${order.status === 'completed' ? 'completed' : order.status === 'ready' ? 'current' : ''}"><div class="step-dot"></div><span class="step-label">Ready</span></div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- ═══ Coming Up ═══ -->
      <div class="section animate-fade-in-up" style="animation-delay: 400ms;">
        <div class="section-header">
          <span class="section-title">📅 COMING UP</span>
          <span class="section-action" id="home-see-all-events">See all →</span>
        </div>
        <div class="flex-col">
          ${Config.schedule.filter(e => e.status === 'upcoming').slice(0, 3).map((event, i) => `
            <div class="card card-compact flex-row" style="gap: 14px; animation-delay: ${(i+1)*60}ms;">
              <div style="min-width: 48px; text-align: center; padding: 6px 0;">
                <div class="font-mono font-bold" style="color: var(--accent-blue-light); font-size: var(--text-md); line-height: 1;">${Format.time(event.time).split(' ')[0]}</div>
                <div style="font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px;">${Format.time(event.time).split(' ')[1]}</div>
              </div>
              <div style="width: 1px; background: var(--glass-border); align-self: stretch;"></div>
              <div style="flex: 1; padding: 2px 0;">
                <div class="font-semibold" style="font-size: var(--text-sm);">${event.title}</div>
                <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 3px; text-transform: capitalize;">${event.type}</div>
              </div>
              <button class="btn btn-icon-sm btn-ghost" onclick="CalendarService.addToCalendar({title:'${event.title}',start:'${event.time}'})" title="Add to Calendar" aria-label="Add to Calendar">
                📅
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ═══ Smart Tip ═══ -->
      <div class="animate-fade-in-up" style="animation-delay: 460ms;">
        <div class="card card-compact" style="border-left: 3px solid var(--accent-cyan); background: rgba(34,211,238,0.03);">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-md); background: var(--accent-cyan-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div>
              <div class="font-semibold text-sm" style="margin-bottom: 4px;">${this._getSmartTip().title}</div>
              <div class="text-xs text-tertiary" style="line-height: 1.5;">${this._getSmartTip().desc}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._startCountdown();
    this._subscribeToUpdates();
  },

  _renderCountdownBlock(value, label) {
    return `
      <div style="text-align: center;">
        <div style="
          font-family: var(--font-mono); font-size: var(--text-3xl); font-weight: 800;
          color: var(--accent-blue-light); line-height: 1;
          text-shadow: 0 0 20px rgba(79,142,255,0.4), 0 0 40px rgba(79,142,255,0.15);
          min-width: 56px;
          padding: 8px 4px;
          background: rgba(79,142,255,0.05);
          border: 1px solid rgba(79,142,255,0.1);
          border-radius: var(--radius-lg);
        ">${value}</div>
        <div style="font-size: 8px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 6px; font-weight: 700;">${label}</div>
      </div>
    `;
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
      const blocks = el.querySelectorAll('[style*="font-mono"]');
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
