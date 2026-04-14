/* ============================================
   VenueFlow Formatting Utilities
   Time, number, currency, and text formatting
   ============================================ */

const Format = {
  /**
   * Format minutes into human-readable wait time
   * @param {number} minutes - Wait time in minutes
   * @returns {string}
   */
  waitTime(minutes) {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  },

  /**
   * Format a timestamp to relative time (e.g., "5 min ago")
   * @param {Date|number|string} date - Date to format
   * @returns {string}
   */
  relativeTime(date) {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = Math.floor((now - then) / 1000);

    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  },

  /**
   * Format time to HH:MM display
   * @param {Date|string} date - Date to format
   * @returns {string}
   */
  time(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} [currency='USD'] - Currency code
   * @returns {string}
   */
  currency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Format large numbers with suffixes
   * @param {number} num - Number to format
   * @returns {string}
   */
  compactNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },

  /**
   * Format percentage
   * @param {number} value - Value (0-100 or 0-1)
   * @param {number} [decimals=0] - Decimal places
   * @returns {string}
   */
  percentage(value, decimals = 0) {
    const pct = value > 1 ? value : value * 100;
    return `${pct.toFixed(decimals)}%`;
  },

  /**
   * Format distance in meters/km
   * @param {number} meters - Distance in meters
   * @returns {string}
   */
  distance(meters) {
    if (meters < 100) return `${Math.round(meters)}m`;
    if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  },

  /**
   * Get crowd level label and color from density percentage
   * @param {number} density - Density 0-100
   * @returns {{ label: string, color: string, level: string }}
   */
  crowdLevel(density) {
    if (density < 30) return { label: 'Low', color: 'var(--success)', level: 'low' };
    if (density < 60) return { label: 'Moderate', color: 'var(--warning)', level: 'medium' };
    if (density < 85) return { label: 'High', color: 'var(--accent-orange)', level: 'high' };
    return { label: 'Very High', color: 'var(--danger)', level: 'critical' };
  },

  /**
   * Get wait time status badge class
   * @param {number} minutes - Wait time in minutes
   * @returns {string} Badge class suffix
   */
  waitStatus(minutes) {
    if (minutes <= 5) return 'success';
    if (minutes <= 15) return 'warning';
    return 'danger';
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} [maxLength=50] - Maximum length
   * @returns {string}
   */
  truncate(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  /**
   * Format countdown timer (for events)
   * @param {Date|string} targetDate - Target date/time
   * @returns {{ hours: string, minutes: string, seconds: string, expired: boolean }}
   */
  countdown(targetDate) {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00', expired: true };

    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    return { hours, minutes, seconds, expired: false };
  },

  /**
   * Format a seat location
   * @param {string} section - Section name/number
   * @param {string} row - Row identifier
   * @param {string} seat - Seat number
   * @returns {string}
   */
  seat(section, row, seat) {
    return `Section ${section} · Row ${row} · Seat ${seat}`;
  }
};
