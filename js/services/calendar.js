/* ============================================
   VenueFlow Google Calendar Service
   Event scheduling and calendar sync
   ============================================ */

const CalendarService = {
  /**
   * Add event to Google Calendar via URL
   * This uses the Google Calendar event creation URL which 
   * works without OAuth and opens the user's calendar
   * @param {Object} event - Event details
   * @param {string} event.title - Event title
   * @param {string} event.start - Start datetime ISO string
   * @param {string} [event.end] - End datetime ISO string
   * @param {string} [event.description] - Event description
   * @param {string} [event.location] - Event location
   */
  addToCalendar(event) {
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 3600000); // Default 1 hour

    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || `Event at ${Config.venue.name} — Powered by VenueFlow`,
      location: event.location || `${Config.venue.name}, ${Config.venue.location}`,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    DOM.toast('📅 Opening Google Calendar...', 'success');
    A11y.announce('Opening Google Calendar to add event');
  },

  /**
   * Add all upcoming events to calendar
   */
  addAllToCalendar() {
    const upcoming = Config.schedule.filter(e => e.status === 'upcoming');
    
    if (upcoming.length === 0) {
      DOM.toast('No upcoming events to add', 'info');
      return;
    }

    // Add the main event
    const mainEvent = upcoming.find(e => e.type === 'main') || upcoming[0];
    this.addToCalendar({
      title: mainEvent.title,
      start: mainEvent.time,
      description: `${Config.venue.currentEvent}\n\nEvents:\n${upcoming.map(e => `• ${e.title} - ${Format.time(e.time)}`).join('\n')}\n\nPowered by VenueFlow`
    });
  },

  /**
   * Create a downloadable ICS file for an event
   * @param {Object} event - Event details
   */
  downloadICS(event) {
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 3600000);

    const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VenueFlow//Stadium Experience//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || 'Event at ' + Config.venue.name}`,
      `LOCATION:${event.location || Config.venue.name}`,
      `UID:${Date.now()}@venueflow`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);

    DOM.toast('📅 Calendar file downloaded', 'success');
  },

  /**
   * Get a shareable calendar link for the event
   * @param {Object} event - Event details
   * @returns {string} Google Calendar URL
   */
  getShareLink(event) {
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 3600000);

    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location || Config.venue.name
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
};
