/* ============================================
   VenueFlow Accessibility Utilities
   ARIA management, focus trapping, TTS, 
   keyboard navigation, screen reader support
   ============================================ */

const A11y = {
  /** @type {boolean} Whether screen reader mode is active */
  screenReaderMode: false,

  /** @type {boolean} Whether high contrast mode is active */
  highContrastMode: false,

  /** @type {SpeechSynthesisUtterance|null} Current TTS utterance */
  _currentUtterance: null,

  /**
   * Initialize accessibility features
   */
  init() {
    // Check user preferences
    this.screenReaderMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.highContrastMode = window.matchMedia('(prefers-contrast: high)').matches;

    // Keyboard navigation detection
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });

    // Listen for accessibility toggle
    this._setupA11yPanel();
  },

  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} [priority='polite'] - 'polite' or 'assertive'
   */
  announce(message, priority = 'polite') {
    let announcer = DOM.$(`#a11y-announcer-${priority}`);
    
    if (!announcer) {
      announcer = DOM.create('div', {
        id: `a11y-announcer-${priority}`,
        className: 'sr-only',
        'aria-live': priority,
        'aria-atomic': 'true',
        role: priority === 'assertive' ? 'alert' : 'status'
      });
      document.body.appendChild(announcer);
    }

    // Clear and re-set to trigger announcement
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  },

  /**
   * Speak text using Web Speech API
   * @param {string} text - Text to speak
   * @param {Object} [options={}] - Speech options
   */
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';

    this._currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Stop any current speech
   */
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Trap focus within an element (for modals)
   * @param {Element} container - Container element
   * @returns {Function} Cleanup function
   */
  trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);
    first?.focus();

    return () => container.removeEventListener('keydown', handler);
  },

  /**
   * Set up ARIA attributes for a live-updating region
   * @param {Element} element - Element to make live
   * @param {string} [level='polite'] - ARIA live level
   */
  setLiveRegion(element, level = 'polite') {
    element.setAttribute('aria-live', level);
    element.setAttribute('aria-atomic', 'true');
  },

  /**
   * Update ARIA label for dynamic content
   * @param {Element|string} element - Element or selector
   * @param {string} label - New ARIA label
   */
  updateLabel(element, label) {
    const el = typeof element === 'string' ? DOM.$(element) : element;
    if (el) el.setAttribute('aria-label', label);
  },

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    this.highContrastMode = !this.highContrastMode;
    document.body.classList.toggle('high-contrast', this.highContrastMode);
    
    if (this.highContrastMode) {
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255,255,255,0.12)');
      document.documentElement.style.setProperty('--glass-border', 'rgba(255,255,255,0.25)');
      document.documentElement.style.setProperty('--text-secondary', '#c8d1db');
      document.documentElement.style.setProperty('--text-tertiary', '#9ca8b7');
    } else {
      document.documentElement.style.removeProperty('--glass-bg');
      document.documentElement.style.removeProperty('--glass-border');
      document.documentElement.style.removeProperty('--text-secondary');
      document.documentElement.style.removeProperty('--text-tertiary');
    }
    
    this.announce(`High contrast mode ${this.highContrastMode ? 'enabled' : 'disabled'}`);
  },

  /**
   * Toggle large text mode
   */
  toggleLargeText() {
    const isLarge = document.body.classList.toggle('large-text');
    if (isLarge) {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
    this.announce(`Large text ${isLarge ? 'enabled' : 'disabled'}`);
  },

  /**
   * Set up accessibility settings panel
   * @private
   */
  _setupA11yPanel() {
    const btn = DOM.$('#btn-accessibility');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const existing = DOM.$('#a11y-panel');
      if (existing) {
        existing.remove();
        return;
      }

      const panel = DOM.create('div', {
        id: 'a11y-panel',
        className: 'card',
        role: 'dialog',
        'aria-label': 'Accessibility Settings',
        style: {
          position: 'fixed',
          top: '60px',
          right: '12px',
          zIndex: '1000',
          width: '260px',
          padding: '16px'
        }
      });

      panel.innerHTML = `
        <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);">♿ Accessibility</h3>
        <div class="flex-col gap-4">
          <div class="flex-between">
            <span class="text-sm">High Contrast</span>
            <label class="toggle">
              <input type="checkbox" id="toggle-contrast" ${this.highContrastMode ? 'checked' : ''}>
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
          <div class="flex-between">
            <span class="text-sm">Large Text</span>
            <label class="toggle">
              <input type="checkbox" id="toggle-large-text">
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
          <div class="flex-between">
            <span class="text-sm">Screen Reader</span>
            <label class="toggle">
              <input type="checkbox" id="toggle-sr" ${this.screenReaderMode ? 'checked' : ''}>
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
          <button class="btn btn-secondary btn-sm btn-full" id="btn-test-tts">🔊 Test Voice</button>
        </div>
      `;

      document.body.appendChild(panel);

      // Event listeners
      DOM.$('#toggle-contrast', panel).addEventListener('change', () => this.toggleHighContrast());
      DOM.$('#toggle-large-text', panel).addEventListener('change', () => this.toggleLargeText());
      DOM.$('#toggle-sr', panel).addEventListener('change', (e) => {
        this.screenReaderMode = e.target.checked;
        this.announce(`Screen reader announcements ${this.screenReaderMode ? 'enabled' : 'disabled'}`);
      });
      DOM.$('#btn-test-tts', panel).addEventListener('click', () => {
        this.speak('Welcome to VenueFlow. Your smart stadium assistant is ready.');
      });

      // Close on outside click
      const closeHandler = (e) => {
        if (!panel.contains(e.target) && e.target !== btn) {
          panel.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    });
  }
};
