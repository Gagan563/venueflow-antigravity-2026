/* ============================================
   VenueFlow Event Timeline View
   Schedule, countdowns, calendar sync
   ============================================ */

const EventsView = {
  /** @type {NodeJS.Timer|null} */
  _countdownInterval: null,

  /**
   * Render the events view
   */
  render() {
    const container = DOM.$('#view-events');
    if (!container) return;

    const timeline = this._getTimeline();
    const primaryEvent = timeline.find(event => event.type === 'main') || timeline.find(event => event.phase === 'next') || timeline[0];
    const nextEvent = timeline.find(event => event.phase === 'next') || primaryEvent;

    container.innerHTML = `
      <div class="relative min-h-screen pt-24 pb-32 px-4 sm:px-6 w-full max-w-md mx-auto space-y-6 flex flex-col">
        <section class="glass-cyber rounded-[2.5rem] p-6 border-primary/20 animate-fade-in-up">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div>
              <p class="text-secondary font-bold text-[10px] tracking-[0.2em] uppercase mb-2">Live Schedule</p>
              <h1 class="text-3xl font-black italic tracking-tighter uppercase font-headline">
                Event<span class="text-primary text-neon-fuchsia">_Timeline</span>
              </h1>
              <p class="text-zinc-400 text-xs font-medium mt-3">
                ${Config.venue.currentEvent}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">Up Next</p>
              <p class="font-headline font-black text-sm text-white uppercase max-w-28 leading-tight">${nextEvent.title}</p>
              <p class="text-secondary text-[10px] font-bold mt-1">${Format.time(nextEvent.time)}</p>
            </div>
          </div>

          <div class="bg-black/50 border border-white/5 rounded-[2rem] p-4 mb-5">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div>
                <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">Kickoff Countdown</p>
                <p class="font-headline font-black text-lg uppercase text-white">${primaryEvent.title}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.18em] uppercase border border-primary/30 bg-primary/10 text-primary">
                ${primaryEvent.phase === 'completed' ? 'Completed' : primaryEvent.phase === 'next' ? 'Live next' : 'Upcoming'}
              </span>
            </div>
            <div class="flex justify-center gap-2" id="events-countdown">
              ${this._renderCountdownDigits(primaryEvent.time)}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button class="bg-primary text-black rounded-full py-3 px-4 font-headline font-black text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-transform" id="btn-sync-calendar">
              <span class="material-symbols-outlined text-sm">event_available</span>
              Sync All
            </button>
            <button class="bg-zinc-900 border border-white/10 text-white rounded-full py-3 px-4 font-headline font-black text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors" id="btn-add-main-event">
              <span class="material-symbols-outlined text-sm">event_note</span>
              Add Match
            </button>
            <button class="bg-zinc-900 border border-white/10 text-white rounded-full py-3 px-4 font-headline font-black text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors" id="btn-download-main-event">
              <span class="material-symbols-outlined text-sm">download</span>
              Download ICS
            </button>
            <button class="bg-zinc-900 border border-white/10 text-white rounded-full py-3 px-4 font-headline font-black text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors" id="btn-share-main-event">
              <span class="material-symbols-outlined text-sm">share</span>
              Share Match
            </button>
          </div>
        </section>

        <section class="animate-fade-in-up" style="animation-delay: 120ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h2 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
              <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
              Timeline
            </h2>
            <span class="text-zinc-500 font-bold text-[9px] tracking-[0.18em] uppercase">${timeline.length} events</span>
          </div>

          <div class="space-y-3">
            ${timeline.map((event, index) => {
              const statusMeta = this._getStatusMeta(event.phase);

              return `
                <article class="glass-cyber rounded-[2rem] p-4 border ${statusMeta.borderClass} animate-fade-in-up" style="animation-delay: ${(index + 2) * 80}ms;">
                  <div class="flex items-start gap-3">
                    <div class="w-11 h-11 rounded-2xl border ${statusMeta.dotClass} flex items-center justify-center shrink-0 bg-black">
                      <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">${statusMeta.icon}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="px-2 py-1 rounded-full text-[8px] font-black tracking-[0.18em] uppercase border ${statusMeta.badgeClass}">
                              ${statusMeta.label}
                            </span>
                            <span class="px-2 py-1 rounded-full text-[8px] font-black tracking-[0.18em] uppercase border border-white/10 text-zinc-400">
                              ${event.type}
                            </span>
                          </div>
                          <h3 class="font-headline font-black text-sm uppercase tracking-tight text-white leading-tight">${event.title}</h3>
                        </div>
                        <div class="text-right shrink-0">
                          <p class="font-headline font-black text-sm ${statusMeta.textClass}">${Format.time(event.time)}</p>
                          <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">${event.phase === 'completed' ? 'Done' : event.phase === 'next' ? 'Prepare now' : 'Upcoming'}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-3 gap-2 mt-4">
                        <button class="bg-zinc-900 border border-zinc-700 text-white rounded-full py-2 px-3 flex items-center justify-center gap-1 font-headline font-black text-[9px] tracking-[0.16em] hover:bg-zinc-800 transition-all uppercase" data-calendar-event="${index}">
                          <span class="material-symbols-outlined text-[10px]">event_note</span>
                          Cal
                        </button>
                        <button class="bg-zinc-900 border border-zinc-700 text-white rounded-full py-2 px-3 flex items-center justify-center gap-1 font-headline font-black text-[9px] tracking-[0.16em] hover:bg-zinc-800 transition-all uppercase" data-ics-event="${index}">
                          <span class="material-symbols-outlined text-[10px]">download</span>
                          ICS
                        </button>
                        <button class="bg-zinc-900 border border-zinc-700 text-white rounded-full py-2 px-3 flex items-center justify-center gap-1 font-headline font-black text-[9px] tracking-[0.16em] hover:bg-zinc-800 transition-all uppercase" data-share-event="${index}">
                          <span class="material-symbols-outlined text-[10px]">share</span>
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>

        <section class="glass-cyber rounded-[2rem] p-5 border-secondary/20 bg-secondary/5 animate-fade-in-up" style="animation-delay: 220ms;">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-2xl bg-black border border-secondary/30 text-secondary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">stadium</span>
            </div>
            <div>
              <p class="text-secondary font-bold text-[10px] tracking-[0.18em] uppercase mb-2">Stadium Fact</p>
              <p class="text-white text-sm leading-relaxed">${this._getRandomFact()}</p>
            </div>
          </div>
        </section>
      </div>
    `;

    this._bindEvents(container, primaryEvent);
    this._startCountdown(primaryEvent.time);
  },

  /**
   * Build timeline data with a derived current phase
   * @returns {Array}
   */
  _getTimeline() {
    const now = Date.now();
    let nextAssigned = false;

    return Config.schedule.map(event => {
      const eventTime = new Date(event.time).getTime();
      let phase = eventTime <= now ? 'completed' : 'upcoming';

      if (!nextAssigned && eventTime > now) {
        phase = 'next';
        nextAssigned = true;
      }

      return { ...event, phase };
    });
  },

  /**
   * Render countdown digits
   * @param {string} targetDate - Event start date
   * @returns {string}
   * @private
   */
  _renderCountdownDigits(targetDate) {
    const countdown = Format.countdown(targetDate);

    return `
      <div class="text-center min-w-[72px]">
        <div class="font-headline font-black text-3xl text-white bg-white/10 border border-white/10 rounded-2xl px-3 py-3" id="cd-hours">${countdown.hours}</div>
        <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.16em] mt-2">Hours</div>
      </div>
      <div class="font-headline font-black text-2xl text-zinc-600 self-center">:</div>
      <div class="text-center min-w-[72px]">
        <div class="font-headline font-black text-3xl text-white bg-white/10 border border-white/10 rounded-2xl px-3 py-3" id="cd-minutes">${countdown.minutes}</div>
        <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.16em] mt-2">Min</div>
      </div>
      <div class="font-headline font-black text-2xl text-zinc-600 self-center">:</div>
      <div class="text-center min-w-[72px]">
        <div class="font-headline font-black text-3xl text-primary text-neon-fuchsia bg-white/10 border border-white/10 rounded-2xl px-3 py-3" id="cd-seconds">${countdown.seconds}</div>
        <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.16em] mt-2">Sec</div>
      </div>
    `;
  },

  /**
   * Get visual status metadata for an event phase
   * @param {string} phase - Derived phase
   * @returns {Object}
   * @private
   */
  _getStatusMeta(phase) {
    if (phase === 'completed') {
      return {
        label: 'Completed',
        icon: 'check_circle',
        textClass: 'text-zinc-400',
        borderClass: 'border-white/5',
        dotClass: 'border-zinc-700 text-zinc-500',
        badgeClass: 'bg-zinc-900 border-zinc-700 text-zinc-400'
      };
    }

    if (phase === 'next') {
      return {
        label: 'Up Next',
        icon: 'bolt',
        textClass: 'text-primary',
        borderClass: 'border-primary/20 bg-primary/5',
        dotClass: 'border-primary/40 text-primary',
        badgeClass: 'bg-primary/10 border-primary/30 text-primary'
      };
    }

    return {
      label: 'Upcoming',
      icon: 'schedule',
      textClass: 'text-secondary',
      borderClass: 'border-secondary/10',
      dotClass: 'border-secondary/30 text-secondary',
      badgeClass: 'bg-secondary/10 border-secondary/30 text-secondary'
    };
  },

  /**
   * Build a calendar payload for a timeline event
   * @param {Object} event - Event data
   * @returns {Object}
   * @private
   */
  _buildCalendarEvent(event) {
    return {
      title: event.title,
      start: event.time,
      location: `${Config.venue.name}, ${Config.venue.location}`,
      description: `${Config.venue.currentEvent}\n${event.title}\nSeat: ${Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat)}`
    };
  },

  /**
   * Share an event via the Web Share API or clipboard
   * @param {Object} event - Event to share
   * @returns {Promise<void>}
   * @private
   */
  async _shareEvent(event) {
    const payload = this._buildCalendarEvent(event);
    const link = CalendarService.getShareLink(payload);

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} at ${Config.venue.name}`,
          url: link
        });
        return;
      } catch (error) {
        // Fall back to clipboard copy if sharing is dismissed or unavailable.
      }
    }

    const copied = await DOM.copyText(link);
    DOM.toast(copied ? 'Event link copied to clipboard' : 'Unable to copy event link', copied ? 'success' : 'warning');
  },

  /**
   * Bind events
   * @param {Element} container - View container
   * @param {Object} primaryEvent - Main event for top actions
   * @private
   */
  _bindEvents(container, primaryEvent) {
    DOM.$('#btn-sync-calendar', container)?.addEventListener('click', () => {
      CalendarService.addAllToCalendar();
    });

    DOM.$('#btn-add-main-event', container)?.addEventListener('click', () => {
      CalendarService.addToCalendar(this._buildCalendarEvent(primaryEvent));
    });

    DOM.$('#btn-download-main-event', container)?.addEventListener('click', () => {
      CalendarService.downloadICS(this._buildCalendarEvent(primaryEvent));
    });

    DOM.$('#btn-share-main-event', container)?.addEventListener('click', () => {
      this._shareEvent(primaryEvent);
    });

    DOM.$$('[data-calendar-event]', container).forEach(button => {
      button.addEventListener('click', () => {
        const event = this._getTimeline()[Number(button.dataset.calendarEvent)];
        if (event) {
          CalendarService.addToCalendar(this._buildCalendarEvent(event));
        }
      });
    });

    DOM.$$('[data-ics-event]', container).forEach(button => {
      button.addEventListener('click', () => {
        const event = this._getTimeline()[Number(button.dataset.icsEvent)];
        if (event) {
          CalendarService.downloadICS(this._buildCalendarEvent(event));
        }
      });
    });

    DOM.$$('[data-share-event]', container).forEach(button => {
      button.addEventListener('click', () => {
        const event = this._getTimeline()[Number(button.dataset.shareEvent)];
        if (event) {
          this._shareEvent(event);
        }
      });
    });
  },

  /**
   * Start countdown timer
   * @param {string} targetDate - Countdown target
   * @private
   */
  _startCountdown(targetDate) {
    if (this._countdownInterval) clearInterval(this._countdownInterval);

    this._countdownInterval = setInterval(() => {
      const countdown = Format.countdown(targetDate);
      const hours = DOM.$('#cd-hours');
      const minutes = DOM.$('#cd-minutes');
      const seconds = DOM.$('#cd-seconds');

      if (hours) hours.textContent = countdown.hours;
      if (minutes) minutes.textContent = countdown.minutes;
      if (seconds) seconds.textContent = countdown.seconds;

      if (countdown.expired) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
      }
    }, 1000);
  },

  /**
   * Random stadium fact
   * @returns {string}
   * @private
   */
  _getRandomFact() {
    const facts = [
      'Narendra Modi Stadium is the largest cricket stadium in the world, with room for more than 132,000 fans.',
      'The stadium can switch between multiple pitch blocks, which helps it host back-to-back tournament fixtures.',
      'Four team dressing rooms allow quicker event turnarounds during major tournaments and double-headers.',
      'Its bowl layout was designed to keep sightlines clear even from the upper tiers during night matches.',
      'The LED floodlights are mounted around the roofline, reducing glare for both batters and spectators.',
      'Major IPL nights here can feel like a city-scale live event, with crowd management run across multiple gates and concourses.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  }
};
