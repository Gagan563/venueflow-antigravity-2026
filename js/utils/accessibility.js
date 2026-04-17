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
    this.screenReaderMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.highContrastMode = window.matchMedia('(prefers-contrast: high)').matches;

    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });

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
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = event => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
    document.documentElement.style.fontSize = isLarge ? '20px' : '16px';
    this.announce(`Large text ${isLarge ? 'enabled' : 'disabled'}`);
  },

  /**
   * Set up accessibility settings panel
   * @private
   */
  _setupA11yPanel() {
    const button = DOM.$('#btn-accessibility');
    if (!button) return;

    button.addEventListener('click', () => {
      const existing = DOM.$('#a11y-panel');
      if (existing) {
        existing.remove();
        return;
      }

      const panel = DOM.create('div', {
        id: 'a11y-panel',
        className: 'glass-cyber rounded-[1.5rem] border border-white/10 text-white',
        role: 'dialog',
        'aria-label': 'Accessibility Settings',
        style: {
          position: 'fixed',
          top: '68px',
          right: '12px',
          zIndex: '1000',
          width: '280px',
          padding: '16px'
        }
      });

      panel.innerHTML = `
        <h3 class="font-headline font-black text-sm uppercase tracking-[0.18em] mb-4">Accessibility</h3>
        <div class="space-y-3">
          <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
            <span class="text-sm">High Contrast</span>
            <input type="checkbox" id="toggle-contrast" ${this.highContrastMode ? 'checked' : ''}>
          </label>
          <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
            <span class="text-sm">Large Text</span>
            <input type="checkbox" id="toggle-large-text">
          </label>
          <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
            <span class="text-sm">Screen Reader</span>
            <input type="checkbox" id="toggle-sr" ${this.screenReaderMode ? 'checked' : ''}>
          </label>
          <button class="w-full rounded-full bg-zinc-900 border border-white/10 px-4 py-3 text-[10px] font-headline font-black uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors" id="btn-test-tts">
            Test Voice
          </button>
        </div>
      `;

      document.body.appendChild(panel);

      DOM.$('#toggle-contrast', panel)?.addEventListener('change', () => this.toggleHighContrast());
      DOM.$('#toggle-large-text', panel)?.addEventListener('change', () => this.toggleLargeText());
      DOM.$('#toggle-sr', panel)?.addEventListener('change', event => {
        this.screenReaderMode = event.target.checked;
        this.announce(`Screen reader announcements ${this.screenReaderMode ? 'enabled' : 'disabled'}`);
      });
      DOM.$('#btn-test-tts', panel)?.addEventListener('click', () => {
        this.speak('Welcome to VenueFlow. Your smart stadium assistant is ready.');
      });

      const closeHandler = event => {
        if (!panel.contains(event.target) && !event.target.closest('#btn-accessibility')) {
          panel.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    });
  }
};
