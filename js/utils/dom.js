/* ============================================
   VenueFlow DOM Utilities
   Helper functions for DOM manipulation
   ============================================ */

const DOM = {
  /**
   * Escape HTML special characters for safe injection
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHTML(text = '') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Select a single element
   * @param {string} selector - CSS selector
   * @param {Element} [parent=document] - Parent element
   * @returns {Element|null}
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Select multiple elements
   * @param {string} selector - CSS selector
   * @param {Element} [parent=document] - Parent element
   * @returns {Element[]}
   */
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  /**
   * Create an element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} [attrs={}] - Attributes and properties
   * @param {...(string|Element)} children - Child elements or text
   * @returns {Element}
   */
  create(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else if (key === 'innerHTML') {
        el.innerHTML = value;
      } else {
        el.setAttribute(key, value);
      }
    }

    children.forEach(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        el.appendChild(child);
      }
    });

    return el;
  },

  /**
   * Render HTML string into a container
   * @param {Element|string} container - Container element or selector
   * @param {string} html - HTML string
   */
  render(container, html) {
    const el = typeof container === 'string' ? this.$(container) : container;
    if (el) {
      el.innerHTML = html;
      // Trigger animations for stagger children
      this.$$('.stagger-children > *', el).forEach(child => {
        child.style.animationPlayState = 'running';
      });
    }
  },

  /**
   * Add ripple effect to a button
   * @param {Event} e - Click event
   */
  ripple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  },

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} [type='info'] - Toast type: success, warning, danger, info
   * @param {number} [duration=3000] - Display duration in ms
   */
  toast(message, type = 'info', duration = 3000) {
    const container = this.$('#toast-container') || document.body;
    const icons = { success: '✅', warning: '⚠️', danger: '🚨', info: 'ℹ️' };

    const toast = this.create('div', {
      className: `toast toast-${type}`,
      role: 'alert',
      'aria-live': 'assertive'
    },
      this.create('span', { 'aria-hidden': 'true' }, icons[type] || 'ℹ️'),
      this.create('span', {}, message)
    );

    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  /**
   * Copy text to the clipboard with a textarea fallback
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>}
   */
  async copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Fall through to the legacy copy path below.
    }

    const textarea = this.create('textarea', {
      style: {
        position: 'fixed',
        opacity: '0',
        pointerEvents: 'none'
      }
    }, text);

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  },

  /**
   * Create a skeleton loader placeholder
   * @param {number} [lines=3] - Number of skeleton lines
   * @returns {string} HTML string
   */
  skeleton(lines = 3) {
    return Array(lines).fill(0).map((_, i) =>
      `<div class="skeleton skeleton-text${i === lines - 1 ? '-short' : ''}" style="animation-delay: ${i * 100}ms"></div>`
    ).join('');
  },

  /**
   * Debounce a function
   * @param {Function} fn - Function to debounce
   * @param {number} [delay=300] - Delay in ms
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Throttle a function
   * @param {Function} fn - Function to throttle
   * @param {number} [limit=100] - Limit in ms
   * @returns {Function}
   */
  throttle(fn, limit = 100) {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
