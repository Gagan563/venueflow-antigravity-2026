/* ============================================
   VenueFlow Gemini AI Service
   AI-powered venue concierge chatbot
   Uses Google Gemini API for intelligent responses
   ============================================ */

const GeminiService = {
  /** @type {Array} Conversation history for context */
  conversationHistory: [],

  /** @type {boolean} Whether API is available */
  available: true,

  /**
   * Check whether Gemini is configured for live API calls
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(Config.gemini.apiKey);
  },

  /**
   * Send a message to Gemini AI and get a response
   * @param {string} userMessage - User's message
   * @returns {Promise<string>} AI response
   */
  async chat(userMessage) {
    if (!this.isConfigured()) {
      this.available = false;
      return this._getFallbackResponse(userMessage);
    }

    // Build context-aware prompt with current venue state
    const context = this._buildContext();
    
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      const response = await this._callGeminiAPI(context, userMessage);
      this.available = true;
      
      // Add response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: response }]
      });

      return response;
    } catch (error) {
      this.available = false;
      console.warn('Gemini API error, using fallback:', error.message);
      return this._getFallbackResponse(userMessage);
    }
  },

  /**
   * Call the Gemini API
   * @private
   * @param {string} context - Venue context
   * @param {string} message - User message
   * @returns {Promise<string>}
   */
  async _callGeminiAPI(context, message) {
    const url = `${Config.gemini.endpoint}/${Config.gemini.model}:generateContent?key=${Config.gemini.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${Config.gemini.systemPrompt}\n\n--- CURRENT VENUE STATUS ---\n${context}\n\n--- CONVERSATION SO FAR ---\n${this._getConversationSummary()}\n\n--- CURRENT USER MESSAGE ---\n${message}` }]
        }
      ],
      generationConfig: {
        temperature: Config.gemini.temperature,
        maxOutputTokens: Config.gemini.maxTokens,
        topP: 0.9,
        topK: 40
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('No response from Gemini');
  },

  /**
   * Build current venue context for the AI
   * @private
   * @returns {string}
   */
  _buildContext() {
    const attendance = AppState.get('currentAttendance');
    const density = AppState.get('overallCrowdDensity');
    const queues = AppState.get('queues');
    const seat = Config.venue.userSeat;

    // Find shortest and longest queues
    const sortedQueues = [...queues].sort((a, b) => a.waitMinutes - b.waitMinutes);
    const shortestFood = sortedQueues.find(q => q.type === 'food');
    const longestFood = [...sortedQueues].reverse().find(q => q.type === 'food');

    return `
Attendance: ${Format.compactNumber(attendance)} / ${Format.compactNumber(Config.venue.capacity)} (${density}% capacity)
User Seat: Section ${seat.section}, Row ${seat.row}, Seat ${seat.seat}
Event: ${Config.venue.currentEvent}
Time to kickoff: ${Format.countdown(Config.venue.eventTime).hours}h ${Format.countdown(Config.venue.eventTime).minutes}m

Queue Status (sorted by wait time):
${sortedQueues.map(q => `- ${q.name}: ${q.waitMinutes} min wait (${q.trend})`).join('\n')}

Shortest food queue: ${shortestFood?.name} (${shortestFood?.waitMinutes} min)
Longest food queue: ${longestFood?.name} (${longestFood?.waitMinutes} min)

Active orders: ${AppState.get('activeOrders').length}
Cart items: ${AppState.getCartCount()}
    `.trim();
  },

  /**
   * Get a summary of conversation so far
   * @private
   * @returns {string}
   */
  _getConversationSummary() {
    const recent = this.conversationHistory.slice(-6);
    return recent.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.parts[0].text.substring(0, 200)}`
    ).join('\n');
  },

  /**
   * Fallback responses when API is unavailable
   * @private
   * @param {string} message - User message
   * @returns {string}
   */
  _getFallbackResponse(message) {
    const msg = message.toLowerCase();
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(q => q.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];
    const shortestRestroom = [...queues].filter(q => q.type === 'restroom').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

    // Smart keyword matching
    if (msg.includes('food') || msg.includes('eat') || msg.includes('hungry') || msg.includes('biryani') || msg.includes('pizza') || msg.includes('samosa') || msg.includes('chaat')) {
      return `🍛 Great question! Right now, the shortest food queue is at **${shortestFood.name}** with just a **${shortestFood.waitMinutes} minute** wait.\n\nI'd recommend heading there quickly — the queue at Pizza Point is ${queues.find(q => q.id === 'food-3')?.waitMinutes} minutes and rising!\n\nYou can also pre-order from the **Order** tab to skip the line entirely. 😊`;
    }

    if (msg.includes('bathroom') || msg.includes('restroom') || msg.includes('toilet') || msg.includes('washroom')) {
      return `🚻 The closest restroom with the shortest wait is **${shortestRestroom.name}** — only **${shortestRestroom.waitMinutes} min** wait time!\n\nTip: Upper deck restrooms (Section 310) tend to be less crowded during pre-game. Currently only ${queues.find(q => q.id === 'rest-4')?.waitMinutes} min wait.`;
    }

    if (msg.includes('crowd') || msg.includes('busy') || msg.includes('packed')) {
      const density = AppState.get('overallCrowdDensity');
      const level = Format.crowdLevel(density);
      return `📊 The venue is currently at **${density}% capacity** — ${level.label} crowd level.\n\nThe least crowded areas right now are around the upper deck sections (300-level). The concourse near Gate E also has less foot traffic.\n\nWant me to help you navigate to a quieter area?`;
    }

    if (msg.includes('wait') || msg.includes('queue') || msg.includes('line')) {
      const sorted = [...queues].sort((a, b) => a.waitMinutes - b.waitMinutes).slice(0, 3);
      return `⏱️ Here are the **shortest queues** right now:\n\n${sorted.map((q, i) => `${i + 1}. ${q.icon} ${q.name} — **${q.waitMinutes} min** (${q.trend})`).join('\n')}\n\nI can navigate you to any of these! Just ask.`;
    }

    if (msg.includes('help') || msg.includes('what can') || msg.includes('features')) {
      return `👋 I'm your **VenueFlow AI Concierge**! Here's what I can help with:\n\n🗺️ **Navigate** — Find your way around the venue\n🍛 **Food** — Find shortest food queues & pre-order\n🚻 **Restrooms** — Nearest available restrooms\n📊 **Crowd Info** — Real-time crowd density\n⏱️ **Wait Times** — Queue estimates for everything\n📅 **Schedule** — Event timeline & upcoming activities\n🚨 **Emergency** — Safety info & evacuation routes\n\nJust ask me anything! 😊`;
    }

    if (msg.includes('emergency') || msg.includes('help me') || msg.includes('danger') || msg.includes('medical')) {
      return `🚨 **Emergency Resources:**\n\n🛡️ Stadium Security: **079-2685-0100**\n🚑 Emergency Helpline: **112**\n🏥 Ambulance: **108**\n🏥 First Aid Stations: Gate A & Gate D\n\nThe nearest First Aid station to your Section ${Config.venue.userSeat.section} is at **Gate A** (~2 min walk).\n\nDo you need me to show you the way to the nearest exit or first aid station?`;
    }

    if (msg.includes('event') || msg.includes('schedule') || msg.includes('match') || msg.includes('game') || msg.includes('start') || msg.includes('ipl')) {
      const countdown = Format.countdown(Config.venue.eventTime);
      return `🏏 **${Config.venue.currentEvent}**\n\n⏰ First ball in: **${countdown.hours}h ${countdown.minutes}m**\n\nUpcoming:\n${Config.schedule.filter(e => e.status === 'upcoming').slice(0, 3).map(e => `• ${e.title} — ${Format.time(e.time)}`).join('\n')}\n\nWant me to add the match to your Google Calendar?`;
    }

    if (msg.includes('seat') || msg.includes('section') || msg.includes('where am i')) {
      const seat = Config.venue.userSeat;
      return `📍 You're in **${Format.seat(seat.section, seat.row, seat.seat)}** (Lower Bowl)\n\nNearest amenities:\n🍛 Desi Dhaba — 1 min walk\n🚻 Restrooms (Sec 130) — 2 min walk\n🏥 First Aid — Gate A, 3 min walk\n\nWant me to navigate you somewhere?`;
    }

    // Default response
    return `Thanks for your message! I'm here to help you have the best experience at **${Config.venue.name}** today. 🏟️\n\nHere are some things you can ask me:\n• "Where should I eat?" — I'll find the shortest food queue\n• "Nearest restroom?" — Real-time wait times\n• "How crowded is it?" — Live crowd density\n• "When's kickoff?" — Event schedule\n\nWhat would you like to know?`;
  },

  /**
   * Get suggested quick prompts based on context
   * @returns {string[]}
   */
  getSuggestions() {
    const density = AppState.get('overallCrowdDensity');
    const queues = AppState.get('queues');
    const shortestFood = [...queues].filter(q => q.type === 'food').sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

    const suggestions = [
      '🍔 Where should I eat?',
      '🚻 Nearest restroom?',
      '📊 How crowded is it?',
      '🏈 When\'s kickoff?'
    ];

    // Add contextual suggestions
    if (density > 75) {
      suggestions.unshift('🏃 Find a quiet area');
    }
    if (shortestFood && shortestFood.waitMinutes <= 5) {
      suggestions.unshift(`⚡ ${shortestFood.name} - ${shortestFood.waitMinutes}m wait!`);
    }

    return suggestions.slice(0, 5);
  },

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
};
