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
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        <!-- Header -->
        <div class="glass-cyber rounded-[2.5rem] p-6 border-red-500/20 text-center animate-fade-in-up">
          <div class="inline-flex items-center gap-2 bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full mb-4 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_#EF4444]"></span>
            <span class="font-black text-[9px] uppercase tracking-[0.2em] font-headline">CRITICAL_NODE</span>
          </div>
          <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline text-white">SAFETY<span class="text-red-500 text-neon-cyan drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">_PROTOCOLS</span></h1>
          <p class="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-2">EMERGENCY ASSISTANCE</p>
        </div>

        <!-- Big SOS Button -->
        <div class="flex justify-center py-6 animate-scale-in" style="animation-delay: 80ms;">
          <button class="relative w-40 h-40 rounded-full bg-red-500 bg-gradient-to-tr from-red-600 to-red-400 flex flex-col items-center justify-center p-0 cursor-pointer shadow-[0_0_40px_rgba(239,68,68,0.4),inset_0_4px_10px_rgba(255,255,255,0.4)] border-4 border-black group active:scale-90 transition-transform overflow-hidden" id="btn-sos" aria-label="Send SOS emergency alert">
            <div class="absolute inset-0 rounded-full border border-white/30 group-hover:scale-110 transition-transform duration-500"></div>
            <div class="absolute -inset-4 rounded-full border border-red-500/30 animate-ping"></div>
            <span class="material-symbols-outlined text-white text-5xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style="font-variation-settings: 'FILL' 1;">emergency</span>
            <span class="font-headline font-black text-white text-3xl tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">SOS</span>
          </button>
        </div>

        <!-- Location Node -->
        <div class="animate-fade-in-up" style="animation-delay: 160ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500" style="font-variation-settings: 'FILL' 1;">my_location</span>
              YOUR_LOCATION
            </h3>
            <span class="text-blue-500 font-bold text-[9px] tracking-widest uppercase border border-blue-500/30 px-2 py-0.5 rounded px-2 bg-blue-500/10">GPS_LOCKED</span>
          </div>
          <div class="glass-cyber rounded-2xl p-4 border-blue-500/20 bg-blue-500/5">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-black border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                <span class="material-symbols-outlined text-xl">satellite_alt</span>
              </div>
              <div>
                <p class="font-black text-white text-lg uppercase tracking-tight">${Format.seat(seat.section, seat.row, seat.seat)}</p>
                <p class="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">LOWER SECTOR // ${Config.venue.name}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Exits -->
        <div class="animate-fade-in-up" style="animation-delay: 240ms;">
           <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-500" style="font-variation-settings: 'FILL' 1;">directions_run</span>
              EVAC_ROUTES
            </h3>
          </div>
          <div class="space-y-3">
          ${sortedGates.map((gate, i) => {
            const isBest = gate.waitMinutes <= 5;
            const poiData = Config.pois.find(p => p.id === gate.id);
            return \`
              <div class="glass-cyber rounded-2xl p-3 border-emerald-500/20 \${isBest ? 'bg-emerald-500/5' : ''} flex items-center gap-3 cursor-pointer hover:bg-zinc-900 transition-colors" \${poiData ? \`data-navigate-lat="\${poiData.lat}" data-navigate-lng="\${poiData.lng}"\` : ''}>
                <div class="w-10 h-10 rounded-xl bg-black border \${isBest ? 'border-emerald-500/50 text-emerald-500' : 'border-emerald-500/20 text-emerald-500/50'} flex flex-col items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-sm">exit_to_app</span>
                </div>
                <div class="flex-grow">
                  <div class="flex justify-between items-start mb-1">
                    <h4 class="font-headline font-black text-white text-sm uppercase tracking-tight">\${gate.name}</h4>
                    <span class="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border \${isBest ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}">\${gate.waitMinutes}M_WAIT</span>
                  </div>
                  <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">STATUS: \${isBest ? 'OPTIMAL' : 'CONGESTED'}</p>
                </div>
              </div>
            \`;
          }).join('')}
          </div>
        </div>

        <!-- Issue Reporting -->
        <div class="animate-fade-in-up" style="animation-delay: 320ms;">
           <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2 text-orange-500">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">warning</span>
              SUBMIT_REPORT
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-3">
             <button class="glass-cyber rounded-2xl p-3 border-orange-500/20 text-left hover:bg-zinc-900 transition-colors active:scale-95" id="btn-report-suspicious">
                <span class="material-symbols-outlined text-orange-500 mb-2">policy</span>
                <p class="font-headline font-black text-xs text-white uppercase tracking-widest">SUSPICIOUS INTEL</p>
             </button>
             <button class="glass-cyber rounded-2xl p-3 border-orange-500/20 text-left hover:bg-zinc-900 transition-colors active:scale-95" id="btn-report-maintenance">
                <span class="material-symbols-outlined text-orange-500 mb-2">build</span>
                <p class="font-headline font-black text-xs text-white uppercase tracking-widest">SYSTEM REPAIR</p>
             </button>
             <button class="glass-cyber rounded-2xl p-3 border-orange-500/20 text-left hover:bg-zinc-900 transition-colors active:scale-95" id="btn-report-medical">
                <span class="material-symbols-outlined text-orange-500 mb-2">medical_services</span>
                <p class="font-headline font-black text-xs text-white uppercase tracking-widest">MEDICAL ASST.</p>
             </button>
             <button class="glass-cyber rounded-2xl p-3 border-orange-500/20 text-left hover:bg-zinc-900 transition-colors active:scale-95" id="btn-report-lost">
                <span class="material-symbols-outlined text-orange-500 mb-2">child_care</span>
                <p class="font-headline font-black text-xs text-white uppercase tracking-widest">LOST ENTITY</p>
             </button>
          </div>
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
