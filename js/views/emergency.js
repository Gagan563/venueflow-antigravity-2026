/* ============================================
   VenueFlow Emergency View
   SOS, routes, contacts, and safety guidance
   ============================================ */

const EmergencyView = {
  render() {
    const container = DOM.$('#view-emergency');
    if (!container) return;

    const seat = Config.venue.userSeat;
    const gates = AppState.get('queues').filter(queue => queue.type === 'gate');
    const sortedGates = [...gates].sort((a, b) => a.waitMinutes - b.waitMinutes);
    const medicalPois = Config.pois.filter(poi => poi.type === 'medical');

    container.innerHTML = `
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        <section class="glass-cyber rounded-[2.5rem] p-6 border-red-500/20 text-center animate-fade-in-up">
          <div class="inline-flex items-center gap-2 bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full mb-4 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_#EF4444]"></span>
            <span class="font-black text-[9px] uppercase tracking-[0.2em] font-headline">Critical Support</span>
          </div>
          <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline text-white">
            Safety<span class="text-red-500 text-neon-cyan drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">_Protocols</span>
          </h1>
          <p class="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-2">Emergency assistance and venue guidance</p>
        </section>

        <div class="flex justify-center py-2 animate-scale-in" style="animation-delay: 80ms;">
          <button class="relative w-40 h-40 rounded-full bg-red-500 bg-gradient-to-tr from-red-600 to-red-400 flex flex-col items-center justify-center p-0 cursor-pointer shadow-[0_0_40px_rgba(239,68,68,0.4),inset_0_4px_10px_rgba(255,255,255,0.4)] border-4 border-black group active:scale-90 transition-transform overflow-hidden" id="btn-sos" aria-label="Send SOS emergency alert">
            <div class="absolute inset-0 rounded-full border border-white/30 group-hover:scale-110 transition-transform duration-500"></div>
            <div class="absolute -inset-4 rounded-full border border-red-500/30 animate-ping"></div>
            <span class="material-symbols-outlined text-white text-5xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style="font-variation-settings: 'FILL' 1;">emergency</span>
            <span class="font-headline font-black text-white text-3xl tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">SOS</span>
          </button>
        </div>

        <section class="glass-cyber rounded-2xl p-4 border-blue-500/20 bg-blue-500/5 animate-fade-in-up" style="animation-delay: 120ms;">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-black border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                <span class="material-symbols-outlined text-xl">my_location</span>
              </div>
              <div>
                <p class="font-black text-white text-lg uppercase tracking-tight">${Format.seat(seat.section, seat.row, seat.seat)}</p>
                <p class="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">Lower sector // ${Config.venue.name}</p>
              </div>
            </div>
            <button class="bg-zinc-900 border border-white/10 text-white rounded-full px-4 py-2 text-[10px] font-headline font-black uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors" id="btn-play-announcement">
              Speak
            </button>
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 180ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-500" style="font-variation-settings: 'FILL' 1;">directions_run</span>
              Evac Routes
            </h2>
            <span class="text-zinc-500 font-bold text-[9px] tracking-[0.18em] uppercase">Fastest exits first</span>
          </div>
          <div class="space-y-3">
            ${sortedGates.map(gate => {
              const isBest = gate.waitMinutes <= 5;
              const poiData = Config.pois.find(poi => poi.id === gate.id);

              return `
                <button class="w-full text-left glass-cyber rounded-2xl p-4 ${isBest ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5'} hover:bg-zinc-900 transition-colors" ${poiData ? `data-navigate-lat="${poiData.lat}" data-navigate-lng="${poiData.lng}"` : ''}>
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-black border ${isBest ? 'border-emerald-500/40 text-emerald-500' : 'border-red-500/30 text-red-400'} flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined">exit_to_app</span>
                    </div>
                    <div class="flex-grow">
                      <div class="flex items-start justify-between gap-3 mb-1">
                        <h3 class="font-headline font-black text-sm uppercase tracking-tight text-white">${gate.name}</h3>
                        <span class="px-2 py-1 rounded-full text-[8px] font-black tracking-[0.18em] uppercase border ${isBest ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-400'}">
                          ${gate.waitMinutes}m wait
                        </span>
                      </div>
                      <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">${isBest ? 'Recommended now' : 'Use if nearest route is blocked'}</p>
                    </div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 240ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-blue-400">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">call</span>
              Emergency Contacts
            </h2>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${Config.emergency.contacts.map(contact => `
              <a class="glass-cyber rounded-2xl p-4 border-white/5 hover:bg-zinc-900 transition-colors" href="tel:${contact.number}" data-contact-name="${DOM.escapeHTML(contact.name)}">
                <p class="text-lg mb-3">${contact.icon}</p>
                <p class="font-headline font-black text-xs uppercase tracking-[0.16em] text-white leading-tight">${contact.name}</p>
                <p class="text-zinc-400 text-[11px] font-bold mt-2">${contact.number}</p>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 300ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-secondary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">medical_services</span>
              First Aid
            </h2>
          </div>
          <div class="space-y-3">
            ${medicalPois.map(station => `
              <button class="w-full text-left glass-cyber rounded-2xl p-4 border-white/5 hover:bg-zinc-900 transition-colors" data-navigate-lat="${station.lat}" data-navigate-lng="${station.lng}">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-black border border-secondary/30 text-secondary flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined">local_hospital</span>
                  </div>
                  <div class="flex-grow">
                    <p class="font-headline font-black text-sm uppercase tracking-tight text-white">${station.name}</p>
                    <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">Tap to route on the live map</p>
                  </div>
                  <span class="material-symbols-outlined text-zinc-500">arrow_forward</span>
                </div>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 360ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-orange-500">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shield</span>
              Safety Tips
            </h2>
          </div>
          <div class="glass-cyber rounded-[2rem] p-5 border-white/5 space-y-3">
            <p class="text-zinc-300 text-sm leading-relaxed">${Config.emergency.evacuationMessage}</p>
            ${Config.emergency.safetyTips.map((tip, index) => `
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black">${index + 1}</div>
                <p class="text-zinc-400 text-sm leading-relaxed">${tip}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 420ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-orange-500">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">warning</span>
              Submit Report
            </h2>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${this._renderReportButton('btn-report-suspicious', 'policy', 'Suspicious intel')}
            ${this._renderReportButton('btn-report-maintenance', 'build', 'System repair')}
            ${this._renderReportButton('btn-report-medical', 'medical_services', 'Medical assist')}
            ${this._renderReportButton('btn-report-lost', 'child_care', 'Lost child')}
          </div>
        </section>
      </div>
    `;

    this._bindEvents(container);
  },

  /**
   * Render a quick report button
   * @param {string} id - Element ID
   * @param {string} icon - Material icon
   * @param {string} label - Button label
   * @returns {string}
   * @private
   */
  _renderReportButton(id, icon, label) {
    return `
      <button class="glass-cyber rounded-2xl p-4 border-orange-500/20 text-left hover:bg-zinc-900 transition-colors active:scale-95" id="${id}">
        <span class="material-symbols-outlined text-orange-500 mb-2">${icon}</span>
        <p class="font-headline font-black text-xs text-white uppercase tracking-widest">${label}</p>
      </button>
    `;
  },

  /**
   * Bind UI events
   * @param {Element} container - View container
   * @private
   */
  _bindEvents(container) {
    DOM.$('#btn-sos', container)?.addEventListener('click', () => this._triggerSOS());

    DOM.$('#btn-play-announcement', container)?.addEventListener('click', () => {
      A11y.speak(Config.emergency.evacuationMessage);
      DOM.toast('Playing emergency announcement', 'info');
    });

    DOM.$$('[data-navigate-lat]', container).forEach(element => {
      element.addEventListener('click', () => {
        Router.navigate('map');
        setTimeout(() => {
          MapsService.focusOn(Number(element.dataset.navigateLat), Number(element.dataset.navigateLng));
          MapsService.navigateTo(Number(element.dataset.navigateLat), Number(element.dataset.navigateLng));
        }, 500);
      });
    });

    DOM.$$('[data-contact-name]', container).forEach(link => {
      link.addEventListener('click', () => {
        DOM.toast(`Calling ${link.dataset.contactName}`, 'info');
      });
    });

    [
      ['btn-report-suspicious', 'Suspicious activity'],
      ['btn-report-maintenance', 'Maintenance issue'],
      ['btn-report-medical', 'Medical issue'],
      ['btn-report-lost', 'Lost child']
    ].forEach(([id, label]) => {
      DOM.$(`#${id}`, container)?.addEventListener('click', () => {
        FirebaseService.submitReport(label, `Reported from ${Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat)}`);
        DOM.toast(`Report submitted: ${label}`, 'success');
        A11y.announce(`${label} report submitted to stadium staff.`);
      });
    });
  },

  /**
   * Trigger an SOS alert
   * @private
   */
  _triggerSOS() {
    if (confirm('Send an SOS alert?\n\nThis will notify stadium security with your location.\nOnly use in genuine emergencies.')) {
      const location = Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat);
      FirebaseService.sendSOS({ seat: location, section: Config.venue.userSeat.section, timestamp: Date.now() });
      DOM.toast('SOS alert sent. Security has been notified.', 'danger', 5000);
      A11y.announce('Emergency SOS alert sent. Security notified.');
      A11y.speak('Emergency alert sent. Stadium security has been notified.');
    }
  },

  destroy() {}
};
