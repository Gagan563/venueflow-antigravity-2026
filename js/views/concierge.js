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
      <div class="relative min-h-screen pt-24 pb-[140px] flex flex-col w-full max-w-md mx-auto">
        
        <!-- Header -->
        <div class="glass-cyber rounded-b-[2.5rem] p-6 border-b border-white/5 animate-fade-in-down z-10 sticky top-0 shrink-0">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center shrink-0 bg-primary/10 shadow-[0_0_15px_rgba(191,0,255,0.2)] relative">
                <span class="material-symbols-outlined text-primary text-xl">smart_toy</span>
                <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black animate-pulse"></div>
              </div>
              <div>
                <h1 class="text-2xl font-black italic tracking-tighter uppercase font-headline">A.I<span class="text-secondary text-neon-cyan">_NODE</span></h1>
                <p class="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">GMNI_MODEL_ACTIVE</p>
              </div>
            </div>
            <button class="w-10 h-10 rounded-full bg-black border border-white/5 text-zinc-500 flex items-center justify-center hover:text-white hover:border-white/20 transition-colors" id="btn-clear-chat">
              <span class="material-symbols-outlined text-sm">mop</span>
            </button>
          </div>
          
          <!-- Suggestions -->
          <div class="flex gap-2 overflow-x-auto pb-1 mt-4 no-scrollbar px-1" id="chat-suggestions">
            ${suggestions.map(s => `
              <button class="shrink-0 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded-full py-1.5 px-3 font-headline font-black text-[9px] uppercase tracking-widest transition-colors suggestion-chip" data-suggestion="${s}">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-grow overflow-y-auto px-4 py-6 space-y-6" id="chat-messages" role="log" aria-live="polite">
          ${chatHistory.length === 0 ? `
            <div class="animate-fade-in-up">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                  <span class="material-symbols-outlined text-primary text-xs">smart_toy</span>
                </div>
                <div class="glass-cyber rounded-2xl p-4 border-primary/10 bg-black/40 rounded-tl-none -ml-1">
                  <span class="text-[9px] text-primary font-bold uppercase tracking-widest mb-2 block">VENUEFLOW AI</span>
                  <p class="text-white text-sm mb-4 leading-relaxed">Hey there! 👋 Welcome to <strong class="text-secondary font-black">${Config.venue.name}</strong>!</p>
                  <p class="text-zinc-400 text-xs mb-3">I'm your AI concierge — here's what I can direct you to:</p>
                  <div class="grid grid-cols-2 gap-2 mb-4">
                    <div class="bg-zinc-900/50 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                       <span class="text-sm">🍔</span> <span class="text-[9px] text-zinc-300 font-bold tracking-widest uppercase">FOOD QUEUES</span>
                    </div>
                    <div class="bg-zinc-900/50 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                       <span class="text-sm">🚻</span> <span class="text-[9px] text-zinc-300 font-bold tracking-widest uppercase">RESTROOMS</span>
                    </div>
                    <div class="bg-zinc-900/50 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                       <span class="text-sm">📊</span> <span class="text-[9px] text-zinc-300 font-bold tracking-widest uppercase">CROWD DATA</span>
                    </div>
                    <div class="bg-zinc-900/50 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                       <span class="text-sm">🗺️</span> <span class="text-[9px] text-zinc-300 font-bold tracking-widest uppercase">NAVIGATION</span>
                    </div>
                  </div>
                  <p class="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">AWAITING_INPUT_COMMAND...</p>
                </div>
              </div>
            </div>
          ` : chatHistory.map(msg => this._renderMessage(msg)).join('')}
        </div>

        <!-- Input Area -->
        <div class="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 p-2 glass-cyber rounded-[2rem] border border-white/10 flex items-end gap-2" id="chat-input-area">
          <div class="flex-grow relative flex items-center bg-zinc-900 rounded-[1.5rem] px-4 py-3 border border-white/5 focus-within:border-primary/50 transition-colors">
            <span class="material-symbols-outlined text-zinc-500 text-lg mr-2" style="font-variation-settings: 'FILL' 1;">terminal</span>
            <textarea class="w-full bg-transparent border-none text-white text-sm outline-none resize-none max-h-32 placeholder:text-zinc-600 font-medium" id="chat-input" placeholder="Query Node..." rows="1" maxlength="500"></textarea>
          </div>
          <button class="w-12 h-12 rounded-[1.2rem] bg-primary text-black flex items-center justify-center shrink-0 active:scale-90 transition-all font-bold hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(191,0,255,0.3)]" id="btn-send-chat">
            <span class="material-symbols-outlined text-sm font-black">send</span>
          </button>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._scrollToBottom();
  },

  _renderMessage(msg) {
    if (msg.role === 'user') {
      return `
        <div class="flex items-start gap-3 flex-row-reverse animate-fade-in-up">
           <div class="glass-cyber rounded-2xl p-4 border-secondary/20 bg-secondary/10 rounded-tr-none -mr-1">
              <span class="text-[9px] text-secondary font-bold uppercase tracking-widest mb-2 block text-right text-neon-cyan">USER_QUERY</span>
              <div class="text-white text-sm leading-relaxed">${this._escapeHtml(msg.text)}</div>
           </div>
        </div>
      `;
    }
    return `
        <div class="flex items-start gap-3 animate-fade-in-up">
          <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
            <span class="material-symbols-outlined text-primary text-xs">smart_toy</span>
          </div>
          <div class="glass-cyber rounded-2xl p-4 border-primary/10 bg-black/40 rounded-tl-none -ml-1 overflow-x-hidden">
            <span class="text-[9px] text-primary font-bold uppercase tracking-widest mb-2 block">VENUEFLOW AI</span>
            <div class="text-zinc-200 text-sm leading-relaxed">${this._formatAIResponse(msg.text)}</div>
          </div>
        </div>
    `;
  },

  _formatAIResponse(text) {
    return DOM.escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n(\d+)\. /g, '<br>$1. ')
      .replace(/\n/g, '<br>');
  },

  _escapeHtml(text) {
    return DOM.escapeHTML(text);
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
