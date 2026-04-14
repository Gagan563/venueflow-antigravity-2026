/* ============================================
   VenueFlow AI Concierge View — V2 Premium
   Gemini-powered chat with polished UI
   ============================================ */

const ConciergeView = {
  render() {
    const container = DOM.$('#view-concierge');
    if (!container) return;

    const chatHistory = AppState.get('chatHistory');
    const suggestions = GeminiService.getSuggestions();

    container.innerHTML = `
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="animate-fade-in-up" style="padding-bottom: 14px; border-bottom: 1px solid var(--glass-border);">
          <div class="flex-between">
            <div class="flex-row gap-4">
              <div style="
                width: 48px; height: 48px; border-radius: var(--radius-xl);
                background: linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.15));
                border: 1px solid rgba(167,139,250,0.2);
                display: flex; align-items: center; justify-content: center;
                position: relative;
              ">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round">
                  <path d="M12 8V4H8"/><rect x="2" y="8" width="20" height="8" rx="2"/>
                  <path d="M6 8V4"/><path d="M8 16v4"/><path d="M16 16v4"/>
                  <circle cx="8" cy="12" r="1" fill="#a78bfa"/><circle cx="16" cy="12" r="1" fill="#a78bfa"/>
                </svg>
                <div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:var(--success);border:2px solid var(--bg-primary);box-shadow:0 0 6px var(--success);"></div>
              </div>
              <div>
                <h1 style="font-size: var(--text-lg); font-weight: var(--font-extrabold); letter-spacing: -0.02em;">AI Concierge</h1>
                <div class="flex-row gap-2" style="gap: 6px; margin-top: 2px;">
                  <span style="font-size: 10px; color: var(--accent-violet); font-weight: var(--font-semibold); letter-spacing: 0.04em;">Powered by Gemini</span>
                </div>
              </div>
            </div>
            <button class="btn btn-ghost btn-icon-sm" id="btn-clear-chat" aria-label="Clear chat" title="Clear chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Quick Suggestions -->
        <div class="chat-suggestions animate-fade-in-up" style="animation-delay: 80ms;" id="chat-suggestions">
          ${suggestions.map(s => `
            <button class="chip suggestion-chip" data-suggestion="${s}" style="white-space: nowrap; flex-shrink: 0;">${s}</button>
          `).join('')}
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" id="chat-messages" role="log" aria-label="Chat conversation" aria-live="polite">
          ${chatHistory.length === 0 ? `
            <div class="chat-bubble chat-bubble-ai">
              <div class="ai-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                VENUEFLOW AI
              </div>
              <div>
                <p style="color: var(--text-primary); margin-bottom: 10px;">Hey there! 👋 Welcome to <strong>${Config.venue.name}</strong>!</p>
                <p style="color: var(--text-secondary); margin-bottom: 10px;">I'm your AI concierge — here's what I can help with:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 12px 0;">
                  ${[
                    { icon: '🍔', label: 'Shortest food queues' },
                    { icon: '🚻', label: 'Nearest restrooms' },
                    { icon: '📊', label: 'Crowd information' },
                    { icon: '🗺️', label: 'Venue navigation' },
                    { icon: '📅', label: 'Event schedule' },
                    { icon: '🚨', label: 'Emergency help' }
                  ].map(item => `
                    <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--text-secondary);">
                      <span>${item.icon}</span>
                      <span>${item.label}</span>
                    </div>
                  `).join('')}
                </div>
                <p style="color: var(--text-tertiary); font-size: var(--text-sm);">Just ask me anything, or tap a suggestion above!</p>
              </div>
            </div>
          ` : chatHistory.map(msg => this._renderMessage(msg)).join('')}
        </div>

        <!-- Chat Input -->
        <div class="chat-input-area" id="chat-input-area">
          <div class="input-with-icon" style="flex: 1;">
            <span class="input-icon" style="font-size: var(--text-base);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <textarea class="input" id="chat-input" placeholder="Ask me anything about the venue..." rows="1" aria-label="Type your message" maxlength="500" style="padding-left: 40px;"></textarea>
          </div>
          <button class="btn btn-primary btn-icon" id="btn-send-chat" aria-label="Send message" title="Send" style="box-shadow: var(--shadow-glow-blue);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._scrollToBottom();
  },

  _renderMessage(msg) {
    if (msg.role === 'user') {
      return `<div class="chat-bubble chat-bubble-user">${this._escapeHtml(msg.text)}</div>`;
    }
    return `
      <div class="chat-bubble chat-bubble-ai">
        <div class="ai-label">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          VENUEFLOW AI
        </div>
        <div style="color: var(--text-secondary); line-height: 1.6;">${this._formatAIResponse(msg.text)}</div>
      </div>
    `;
  },

  _formatAIResponse(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n(\d+)\. /g, '<br>$1. ')
      .replace(/\n/g, '<br>');
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  async _sendMessage(message) {
    if (!message.trim()) return;

    const chatMessages = DOM.$('#chat-messages');
    const input = DOM.$('#chat-input');
    const sendBtn = DOM.$('#btn-send-chat');

    if (input) { input.value = ''; input.style.height = 'auto'; }

    const history = [...AppState.get('chatHistory'), { role: 'user', text: message }];
    AppState.set('chatHistory', history);

    if (chatMessages) chatMessages.insertAdjacentHTML('beforeend', this._renderMessage({ role: 'user', text: message }));

    // Typing indicator
    if (chatMessages) {
      chatMessages.insertAdjacentHTML('beforeend', `
        <div id="typing-indicator" class="typing-indicator">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
      `);
      this._scrollToBottom();
    }

    if (sendBtn) sendBtn.disabled = true;
    AppState.set('isChatLoading', true);

    try {
      const response = await GeminiService.chat(message);
      DOM.$('#typing-indicator')?.remove();

      const updatedHistory = [...AppState.get('chatHistory'), { role: 'ai', text: response }];
      AppState.set('chatHistory', updatedHistory);

      if (chatMessages) chatMessages.insertAdjacentHTML('beforeend', this._renderMessage({ role: 'ai', text: response }));
      A11y.announce('AI response received');
    } catch (error) {
      DOM.$('#typing-indicator')?.remove();
      if (chatMessages) {
        chatMessages.insertAdjacentHTML('beforeend', `
          <div class="chat-bubble chat-bubble-ai" style="border-color: rgba(248,113,113,0.2);">
            <div class="ai-label" style="color: var(--danger);">⚠ ERROR</div>
            <div style="color: var(--text-secondary);">Sorry, I'm having trouble connecting right now. Please try again.</div>
          </div>
        `);
      }
    } finally {
      AppState.set('isChatLoading', false);
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
      this._scrollToBottom();
    }
  },

  _scrollToBottom() {
    const el = DOM.$('#chat-messages');
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  },

  _bindEvents(container) {
    const input = DOM.$('#chat-input', container);
    const sendBtn = DOM.$('#btn-send-chat', container);
    const clearBtn = DOM.$('#btn-clear-chat', container);

    if (sendBtn) sendBtn.addEventListener('click', () => { if (input) this._sendMessage(input.value); });

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendMessage(input.value); }
      });
      input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
    }

    DOM.$$('.suggestion-chip', container).forEach(chip => {
      chip.addEventListener('click', () => {
        this._sendMessage(chip.dataset.suggestion);
        const suggestionsArea = DOM.$('#chat-suggestions', container);
        if (suggestionsArea) suggestionsArea.style.display = 'none';
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        AppState.set('chatHistory', []);
        GeminiService.clearHistory();
        this.render();
        DOM.toast('Chat cleared', 'info');
      });
    }
  },

  destroy() {}
};
