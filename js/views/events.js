/* ============================================
   VenueFlow Event Timeline View
   Schedule, countdowns, Google Calendar sync
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

    const schedule = Config.schedule;
    const now = Date.now();

    container.innerHTML = `
      <div class="page-header animate-fade-in-up">
        <h1 class="page-title">📅 Event Timeline</h1>
        <p class="page-desc">${Config.venue.currentEvent}</p>
      </div>

      <!-- Calendar Sync -->
      <div class="card animate-fade-in-up" style="margin-bottom: var(--space-5); animation-delay: 100ms;">
        <div class="flex-between">
          <div>
            <div class="font-semibold">📅 Sync to Google Calendar</div>
            <div class="text-sm text-tertiary">Add all events to your calendar</div>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-sync-calendar" aria-label="Add all events to Google Calendar">
            Add All
          </button>
        </div>
      </div>

      <!-- Main Event Highlight -->
      <div class="card animate-fade-in-up" style="background: var(--gradient-brand); border: none; margin-bottom: var(--space-5); animation-delay: 200ms; text-align: center; padding: var(--space-8) var(--space-5);">
        <div style="font-size: 2.5rem; margin-bottom: var(--space-3);">🏈</div>
        <h2 style="color: white; font-size: var(--text-xl); margin-bottom: var(--space-2);">${Config.venue.currentEvent}</h2>
        <p style="color: rgba(255,255,255,0.7); font-size: var(--text-sm); margin-bottom: var(--space-4);">${Config.venue.name} · ${Config.venue.location}</p>
        
        <!-- Countdown -->
        <div class="flex-center gap-4" id="events-countdown" style="margin-bottom: var(--space-3);">
          ${this._renderCountdownDigits()}
        </div>
        
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white; margin-top: var(--space-2);" id="btn-add-main-event" aria-label="Add kickoff to Google Calendar">
          📅 Add to Calendar
        </button>
      </div>

      <!-- Timeline -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">🕐 Full Schedule</h2>
          <span class="badge badge-brand">${schedule.length} events</span>
        </div>
        
        <div class="flex-col" style="position: relative;">
          <!-- Timeline line -->
          <div style="position: absolute; left: 22px; top: 0; bottom: 0; width: 2px; background: var(--glass-border);"></div>
          
          ${schedule.map((event, i) => {
            const isCompleted = event.status === 'completed';
            const isUpcoming = event.status === 'upcoming';
            const isNext = isUpcoming && (i === 0 || schedule[i - 1].status === 'completed');
            const eventTime = new Date(event.time);
            const timeStr = Format.time(event.time);
            const relativeStr = isCompleted ? Format.relativeTime(event.time) : '';
            const countdown = isUpcoming ? Format.countdown(event.time) : null;

            return `
              <div class="animate-fade-in-up" style="animation-delay: ${(i + 1) * 80}ms; position: relative; padding-left: 52px; padding-bottom: var(--space-5);">
                <!-- Timeline dot -->
                <div style="
                  position: absolute;
                  left: 14px;
                  top: 4px;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: ${isCompleted ? 'var(--success)' : isNext ? 'var(--accent-blue)' : 'var(--bg-tertiary)'};
                  border: 3px solid ${isCompleted ? 'var(--success)' : isNext ? 'var(--accent-blue)' : 'var(--glass-border)'};
                  ${isNext ? 'box-shadow: 0 0 10px rgba(59,130,246,0.4); animation: pulse-scale 2s infinite;' : ''}
                  z-index: 1;
                ">
                  ${isCompleted ? '<span style="position:absolute;top:-1px;left:1px;font-size:10px;">✓</span>' : ''}
                </div>
                
                <div class="card card-compact ${isCompleted ? '' : 'hover-lift'}" style="${isCompleted ? 'opacity: 0.6;' : ''} ${isNext ? 'border-color: var(--accent-blue); background: var(--accent-blue-dim);' : ''}">
                  <div class="flex-between" style="margin-bottom: var(--space-2);">
                    <div>
                      <div class="font-semibold">${event.title}</div>
                      <div class="flex-row gap-2" style="margin-top: 4px;">
                        <span class="text-xs text-tertiary">${timeStr}</span>
                        ${isCompleted ? `<span class="text-xs text-tertiary">· ${relativeStr}</span>` : ''}
                        ${isNext ? '<span class="badge badge-live badge-brand" style="font-size: 9px;">UP NEXT</span>' : ''}
                      </div>
                    </div>
                    <div class="flex-col gap-1" style="align-items: flex-end;">
                      <span class="badge ${this._getEventBadge(event.type)}">${event.type}</span>
                      ${countdown && !countdown.expired ? `
                        <span class="font-mono text-xs text-tertiary">${countdown.hours}:${countdown.minutes}:${countdown.seconds}</span>
                      ` : ''}
                    </div>
                  </div>
                  
                  ${!isCompleted ? `
                    <div class="flex-row gap-2" style="margin-top: var(--space-2);">
                      <button class="btn btn-ghost btn-sm" data-calendar-event="${i}" aria-label="Add ${event.title} to calendar" style="font-size: var(--text-xs);">
                        📅 Calendar
                      </button>
                      <button class="btn btn-ghost btn-sm" data-share-event="${i}" aria-label="Share ${event.title}" style="font-size: var(--text-xs);">
                        📤 Share
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Fun Fact -->
      <div class="card card-compact animate-fade-in-up" style="border-left: 3px solid var(--accent-violet); margin-top: var(--space-4);">
        <div class="font-medium text-sm" style="margin-bottom: var(--space-1);">🎲 Did You Know?</div>
        <div class="text-sm text-tertiary">
          ${this._getRandomFact()}
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._startCountdown();
  },

  /**
   * Render countdown digits
   * @private
   */
  _renderCountdownDigits() {
    const cd = Format.countdown(Config.venue.eventTime);
    const digitStyle = 'font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; color: white; background: rgba(255,255,255,0.15); padding: 8px 12px; border-radius: 8px; min-width: 48px; display: inline-block; text-align: center;';
    const labelStyle = 'font-size: 9px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;';
    const separatorStyle = 'font-size: var(--text-2xl); color: rgba(255,255,255,0.4); margin-top: -8px;';

    return `
      <div style="text-align: center;">
        <div style="${digitStyle}" id="cd-hours">${cd.hours}</div>
        <div style="${labelStyle}">Hours</div>
      </div>
      <span style="${separatorStyle}">:</span>
      <div style="text-align: center;">
        <div style="${digitStyle}" id="cd-minutes">${cd.minutes}</div>
        <div style="${labelStyle}">Min</div>
      </div>
      <span style="${separatorStyle}">:</span>
      <div style="text-align: center;">
        <div style="${digitStyle}" id="cd-seconds">${cd.seconds}</div>
        <div style="${labelStyle}">Sec</div>
      </div>
    `;
  },

  /**
   * Get badge class for event type
   * @private
   */
  _getEventBadge(type) {
    const badges = {
      logistics: 'badge-info',
      entertainment: 'badge-brand',
      ceremony: 'badge-warning',
      main: 'badge-danger',
      promo: 'badge-success'
    };
    return badges[type] || 'badge-info';
  },

  /**
   * Bind events
   * @private
   */
  _bindEvents(container) {
    // Sync all to calendar
    const syncBtn = DOM.$('#btn-sync-calendar', container);
    if (syncBtn) {
      syncBtn.addEventListener('click', () => CalendarService.addAllToCalendar());
    }

    // Add main event to calendar
    const addMainBtn = DOM.$('#btn-add-main-event', container);
    if (addMainBtn) {
      addMainBtn.addEventListener('click', () => {
        CalendarService.addToCalendar({
          title: Config.venue.currentEvent,
          start: Config.venue.eventTime,
          location: `${Config.venue.name}, ${Config.venue.location}`
        });
      });
    }

    // Individual calendar buttons
    DOM.$$('[data-calendar-event]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.calendarEvent);
        const event = Config.schedule[idx];
        if (event) {
          CalendarService.addToCalendar({
            title: event.title,
            start: event.time,
            location: `${Config.venue.name}, ${Config.venue.location}`
          });
        }
      });
    });

    // Share buttons
    DOM.$$('[data-share-event]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.shareEvent);
        const event = Config.schedule[idx];
        if (event) {
          const link = CalendarService.getShareLink({
            title: event.title,
            start: event.time,
            location: Config.venue.name
          });

          if (navigator.share) {
            navigator.share({
              title: event.title,
              text: `${event.title} at ${Config.venue.name}`,
              url: link
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(link).then(() => {
              DOM.toast('📋 Link copied to clipboard!', 'success');
            });
          }
        }
      });
    });
  },

  /**
   * Start countdown timer
   * @private
   */
  _startCountdown() {
    if (this._countdownInterval) clearInterval(this._countdownInterval);

    this._countdownInterval = setInterval(() => {
      const cd = Format.countdown(Config.venue.eventTime);
      const hours = DOM.$('#cd-hours');
      const minutes = DOM.$('#cd-minutes');
      const seconds = DOM.$('#cd-seconds');

      if (hours) hours.textContent = cd.hours;
      if (minutes) minutes.textContent = cd.minutes;
      if (seconds) seconds.textContent = cd.seconds;

      if (cd.expired) {
        clearInterval(this._countdownInterval);
      }
    }, 1000);
  },

  /**
   * Random stadium fact
   * @private
   */
  _getRandomFact() {
    const facts = [
      'MetLife Stadium can hold 82,500 fans and is the largest stadium in the NFL by seating capacity.',
      'The stadium uses enough electricity during a game day to power 33,000 homes.',
      'MetLife Stadium hosted Super Bowl XLVIII in 2014 — the first outdoor cold-weather Super Bowl.',
      'Over 40,000 hot dogs are sold at MetLife Stadium during a typical game day.',
      'The stadium has over 200,000 square feet of LED lighting.',
      'MetLife has 218 luxury suites and 9,000 club seats.'
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
