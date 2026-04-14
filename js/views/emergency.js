/* ============================================
   VenueFlow Emergency View — V2 Premium
   ============================================ */

const EmergencyView = {
  render() {
    const container = DOM.$('#view-emergency');
    if (!container) return;

    const emergency = Config.emergency;
    const seat = Config.venue.userSeat;
    const gates = AppState.get('queues').filter(q => q.type === 'gate');
    const sortedGates = [...gates].sort((a, b) => a.waitMinutes - b.waitMinutes);

    container.innerHTML = `
      <div class="animate-fade-in-up" style="margin-bottom: 20px;">
        <h1 style="font-size: var(--text-xl); font-weight: var(--font-extrabold); letter-spacing: -0.02em; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Emergency & Safety
        </h1>
        <p style="font-size: var(--text-sm); color: var(--text-tertiary);">Stay safe at ${Config.venue.name}</p>
      </div>

      <!-- SOS Button -->
      <div class="text-center animate-scale-in" style="margin-bottom: 28px; animation-delay: 80ms;">
        <button class="btn" id="btn-sos" style="
          width: 110px; height: 110px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(248,113,113,0.9), rgba(220,38,38,0.95));
          color: white; flex-direction: column; gap: 4px;
          margin: 0 auto; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(248,113,113,0.3), 0 0 60px rgba(248,113,113,0.15), inset 0 1px 0 rgba(255,255,255,0.2);
          border: 2px solid rgba(248,113,113,0.4);
          position: relative; overflow: visible;
          animation: sos-breathe 2s ease-in-out infinite;
        " aria-label="Send SOS emergency alert">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em;">SOS</span>
        </button>
        <p style="font-size: 10px; color: var(--text-tertiary); margin-top: 12px;">Tap for emergency assistance</p>
      </div>

      <!-- Your Location -->
      <div class="card card-compact animate-fade-in-up" style="border-left: 3px solid var(--accent-blue); margin-bottom: 16px; animation-delay: 160ms;">
        <div class="flex-row" style="gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--accent-blue-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-light)" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="font-semibold text-sm">Your Location</div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px;">${Format.seat(seat.section, seat.row, seat.seat)}</div>
            <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">Lower Bowl · ${Config.venue.name}</div>
          </div>
        </div>
      </div>

      <!-- Emergency Contacts -->
      <div class="section animate-fade-in-up" style="animation-delay: 240ms;">
        <div class="section-header">
          <span class="section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-2px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
            EMERGENCY CONTACTS
          </span>
        </div>
        <div class="flex-col gap-2">
          ${emergency.contacts.map((contact, i) => `
            <a href="tel:${contact.number}" class="card card-compact flex-row" style="gap: 12px; text-decoration: none; color: inherit; animation-delay: ${(i+1)*60}ms;" id="emergency-contact-${i}">
              <div style="
                width: 42px; height: 42px; border-radius: var(--radius-lg);
                background: ${contact.icon === '🚑' ? 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(220,38,38,0.1))' : contact.icon === '🛡️' ? 'linear-gradient(135deg, rgba(79,142,255,0.15), rgba(34,211,238,0.1))' : 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(99,102,241,0.1))'};
                display: flex; align-items: center; justify-content: center; font-size: var(--text-lg); flex-shrink: 0;
              ">${contact.icon}</div>
              <div style="flex: 1;">
                <div class="font-semibold" style="font-size: var(--text-sm);">${contact.name}</div>
                <div class="font-mono" style="font-size: 11px; color: var(--text-tertiary);">${contact.number}</div>
              </div>
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--success-dim); display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Nearest Exits -->
      <div class="section animate-fade-in-up" style="animation-delay: 320ms;">
        <div class="section-header">
          <span class="section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-2px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            NEAREST EXITS
          </span>
        </div>
        <div class="flex-col gap-2">
          ${sortedGates.map((gate, i) => {
            const status = Format.waitStatus(gate.waitMinutes);
            const poiData = Config.pois.find(p => p.id === gate.id);
            return `
              <div class="card card-compact flex-row" style="gap: 12px; cursor: pointer;" ${poiData ? `data-navigate-lat="${poiData.lat}" data-navigate-lng="${poiData.lng}"` : ''}>
                <div style="width: 42px; height: 42px; border-radius: var(--radius-lg); background: linear-gradient(135deg, rgba(79,142,255,0.15), rgba(34,211,238,0.1)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue-light)" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </div>
                <div style="flex: 1;">
                  <div class="font-semibold" style="font-size: var(--text-sm);">${gate.name}</div>
                  <div class="flex-row" style="gap: 8px; margin-top: 3px;">
                    <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--${status}); box-shadow: 0 0 6px var(--${status});"></div>
                    <span style="font-size: 10px; color: var(--${status});">${gate.waitMinutes} min wait</span>
                    <span style="font-size: 10px; color: var(--text-tertiary);">· ${gate.trend === 'rising' ? '↑' : gate.trend === 'falling' ? '↓' : '→'} ${gate.trend}</span>
                  </div>
                </div>
                <span class="badge ${gate.waitMinutes <= 5 ? 'badge-success' : 'badge-warning'}" style="align-self: center;">${gate.waitMinutes <= 5 ? 'Best' : 'Open'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Evacuation Guidelines -->
      <div class="section animate-fade-in-up" style="animation-delay: 400ms;">
        <div class="section-header">
          <span class="section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:-2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            EVACUATION GUIDELINES
          </span>
        </div>
        <div class="card card-no-hover" style="border-left: 3px solid var(--danger); background: rgba(248,113,113,0.03);">
          <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7;">${emergency.evacuationMessage}</p>
        </div>
      </div>

      <!-- First Aid -->
      <div class="section animate-fade-in-up" style="animation-delay: 480ms;">
        <div class="section-header">
          <span class="section-title">FIRST AID STATIONS</span>
        </div>
        <div class="flex-col gap-2">
          ${Config.pois.filter(p => p.type === 'medical').map(poi => `
            <div class="card card-compact flex-row" style="gap: 12px; cursor: pointer;" data-navigate-lat="${poi.lat}" data-navigate-lng="${poi.lng}">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-lg); background: linear-gradient(135deg, rgba(248,113,113,0.15), rgba(220,38,38,0.1)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div style="flex: 1;">
                <div class="font-semibold" style="font-size: var(--text-sm);">${poi.name}</div>
                <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">Medical services available</div>
              </div>
              <button class="btn btn-ghost btn-sm" style="font-size: 10px; padding: 4px 10px;">Navigate →</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Safety Tips -->
      <div class="section animate-fade-in-up" style="animation-delay: 560ms;">
        <div class="section-header">
          <span class="section-title">SAFETY TIPS</span>
        </div>
        <div class="card card-no-hover">
          <div class="flex-col" style="gap: 14px;">
            ${emergency.safetyTips.map((tip, i) => `
              <div class="flex-row" style="gap: 12px; align-items: flex-start;">
                <div style="width: 24px; height: 24px; border-radius: var(--radius-sm); background: var(--accent-blue-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 10px; font-weight: 800; color: var(--accent-blue-light);">${i + 1}</div>
                <p style="font-size: var(--text-sm); color: var(--text-secondary); flex: 1; line-height: 1.5;">${tip}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Report Issues -->
      <div class="section animate-fade-in-up" style="animation-delay: 640ms;">
        <div class="section-header"><span class="section-title">REPORT AN ISSUE</span></div>
        <div class="grid-2 gap-2">
          ${[
            { id: 'btn-report-suspicious', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', label: 'Suspicious Activity' },
            { id: 'btn-report-maintenance', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>', label: 'Maintenance' },
            { id: 'btn-report-medical', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', label: 'Medical Need' },
            { id: 'btn-report-lost', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', label: 'Lost Child' }
          ].map(r => `
            <button class="btn btn-secondary btn-sm btn-full" id="${r.id}" style="gap: 6px; font-size: 11px; padding: 10px;">
              ${r.icon} ${r.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    DOM.$('#btn-sos', container)?.addEventListener('click', () => this._triggerSOS());

    DOM.$$('[data-navigate-lat]', container).forEach(el => {
      el.addEventListener('click', () => {
        Router.navigate('map');
        setTimeout(() => MapsService.navigateTo(parseFloat(el.dataset.navigateLat), parseFloat(el.dataset.navigateLng)), 500);
      });
    });

    ['btn-report-suspicious', 'btn-report-maintenance', 'btn-report-medical', 'btn-report-lost'].forEach(id => {
      DOM.$(`#${id}`, container)?.addEventListener('click', () => {
        const label = DOM.$(`#${id}`).textContent.trim();
        FirebaseService.submitReport(label, `Reported from ${Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat)}`);
        DOM.toast(`Report submitted: ${label}`, 'success');
        A11y.announce(`${label} report submitted to stadium staff.`);
      });
    });
  },

  _triggerSOS() {
    if (confirm('🚨 Send an SOS alert?\n\nThis will notify stadium security with your location.\nOnly use in genuine emergencies.')) {
      const location = Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat);
      FirebaseService.sendSOS({ seat: location, section: Config.venue.userSeat.section, timestamp: Date.now() });
      DOM.toast('🚨 SOS Alert sent! Security has been notified.', 'danger', 5000);
      A11y.announce('Emergency SOS alert sent. Security notified.');
      A11y.speak('Emergency alert sent. Stadium security has been notified.');
    }
  },

  destroy() {}
};
