/* ============================================
   VenueFlow Configuration
   API keys, Firebase config, venue data
   ============================================ */

const RuntimeConfig = window.__VENUEFLOW_RUNTIME__ || {};
const runtimeMaps = RuntimeConfig.maps || {};
const runtimeGemini = RuntimeConfig.gemini || {};
const runtimeFirebase = RuntimeConfig.firebase || {};

const Config = {
  // ── Google Maps ──
  maps: {
    apiKey: runtimeMaps.apiKey || '',
    defaultCenter: { lat: 23.0925, lng: 72.5974 }, // Narendra Modi Stadium, Ahmedabad
    defaultZoom: 17,
    mapId: 'venueflow-map'
  },

  // ── Gemini AI ──
  gemini: {
    apiKey: runtimeGemini.apiKey || '',
    model: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: `You are VenueFlow AI, a smart stadium assistant at Narendra Modi Stadium, Ahmedabad. You help attendees navigate the venue, find food, avoid crowds, and have the best experience possible.

Your knowledge includes:
- Venue layout: Gates A-F, Sections 100-300, Concession stands on every level
- Food vendors: Desi Dhaba (Indian street food), Chaat Corner, Pizza Point, Biryani House, Lassi Bar
- Facilities: Restrooms near every section, First Aid at Gates A and D, Guest Services at Gate B
- Current match: IPL match day, capacity ~1,32,000

Guidelines:
- Be concise, friendly, and helpful
- Provide specific directions when possible (e.g., "Turn left past Section 120")
- Suggest alternatives when wait times are high
- Prioritize safety in emergency situations
- Use emojis sparingly for a friendly tone`
  },

  // ── Firebase ──
  firebase: {
    apiKey: runtimeFirebase.apiKey || '',
    authDomain: runtimeFirebase.authDomain || 'physical-event-app.firebaseapp.com',
    databaseURL: runtimeFirebase.databaseURL || 'https://physical-event-app-default-rtdb.firebaseio.com',
    projectId: runtimeFirebase.projectId || 'physical-event-app',
    storageBucket: runtimeFirebase.storageBucket || 'physical-event-app.firebasestorage.app',
    messagingSenderId: runtimeFirebase.messagingSenderId || '183933052847',
    appId: runtimeFirebase.appId || '1:183933052847:web:05ace14c81d541780d315a',
    measurementId: runtimeFirebase.measurementId || 'G-E3H9M2F75P'
  },

  // ── Venue Data ──
  venue: {
    name: 'Narendra Modi Stadium',
    location: 'Ahmedabad, Gujarat',
    capacity: 132000,
    teams: {
      home: 'Gujarat Titans',
      away: 'Mumbai Indians'
    },
    currentEvent: 'IPL 2026 — Gujarat Titans vs Mumbai Indians',
    eventTime: new Date(Date.now() + 2 * 3600000).toISOString(), // 2 hours from now
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    parking: {
      lot: 'Lot C Blue',
      vehicleLabel: 'Sofi Premier X',
      entryGate: 'Gate 4'
    },
    sections: {
      lower: { range: [100, 149], label: 'Lower Bowl' },
      mezzanine: { range: [200, 249], label: 'Mezzanine' },
      upper: { range: [300, 349], label: 'Upper Deck' }
    },
    userSeat: { section: '134', row: 'H', seat: '12' }
  },

  // ── Points of Interest ──
  pois: [
    { id: 'gate-a', name: 'Gate A', type: 'gate', lat: 23.0935, lng: 72.5960, icon: '🚪' },
    { id: 'gate-b', name: 'Gate B', type: 'gate', lat: 23.0940, lng: 72.5975, icon: '🚪' },
    { id: 'gate-c', name: 'Gate C', type: 'gate', lat: 23.0935, lng: 72.5990, icon: '🚪' },
    { id: 'gate-d', name: 'Gate D', type: 'gate', lat: 23.0920, lng: 72.5990, icon: '🚪' },
    { id: 'gate-e', name: 'Gate E', type: 'gate', lat: 23.0915, lng: 72.5975, icon: '🚪' },
    { id: 'gate-f', name: 'Gate F', type: 'gate', lat: 23.0920, lng: 72.5960, icon: '🚪' },
    { id: 'food-1', name: 'Desi Dhaba', type: 'food', lat: 23.0930, lng: 72.5968, icon: '🍛' },
    { id: 'food-2', name: 'Chaat Corner', type: 'food', lat: 23.0932, lng: 72.5980, icon: '🥘' },
    { id: 'food-3', name: 'Pizza Point', type: 'food', lat: 23.0922, lng: 72.5985, icon: '🍕' },
    { id: 'food-4', name: 'Biryani House', type: 'food', lat: 23.0918, lng: 72.5970, icon: '🍚' },
    { id: 'food-5', name: 'Lassi Bar', type: 'food', lat: 23.0928, lng: 72.5962, icon: '🥛' },
    { id: 'rest-1', name: 'Restrooms (Sec 110)', type: 'restroom', lat: 23.0936, lng: 72.5965, icon: '🚻' },
    { id: 'rest-2', name: 'Restrooms (Sec 130)', type: 'restroom', lat: 23.0928, lng: 72.5988, icon: '🚻' },
    { id: 'rest-3', name: 'Restrooms (Sec 220)', type: 'restroom', lat: 23.0938, lng: 72.5978, icon: '🚻' },
    { id: 'rest-4', name: 'Restrooms (Sec 310)', type: 'restroom', lat: 23.0920, lng: 72.5968, icon: '🚻' },
    { id: 'aid-1', name: 'First Aid (Gate A)', type: 'medical', lat: 23.0934, lng: 72.5958, icon: '🏥' },
    { id: 'aid-2', name: 'First Aid (Gate D)', type: 'medical', lat: 23.0919, lng: 72.5992, icon: '🏥' },
    { id: 'guest', name: 'Guest Services', type: 'info', lat: 23.0941, lng: 72.5977, icon: 'ℹ️' }
  ],

  // ── Concession Menu ──
  menu: [
    { id: 'm1', name: 'Vada Pav', vendor: 'Desi Dhaba', price: 99, category: 'food', emoji: '🍛', popular: true, prepTime: 5 },
    { id: 'm2', name: 'Pav Bhaji', vendor: 'Desi Dhaba', price: 199, category: 'food', emoji: '🥘', popular: false, prepTime: 6 },
    { id: 'm3', name: 'Samosa (2pc)', vendor: 'Chaat Corner', price: 79, category: 'food', emoji: '🥟', popular: true, prepTime: 3 },
    { id: 'm4', name: 'Paneer Tikka', vendor: 'Desi Dhaba', price: 299, category: 'food', emoji: '🍢', popular: false, prepTime: 10 },
    { id: 'm5', name: 'Margherita Pizza', vendor: 'Pizza Point', price: 249, category: 'food', emoji: '🍕', popular: true, prepTime: 7 },
    { id: 'm6', name: 'Chicken Biryani', vendor: 'Biryani House', price: 349, category: 'food', emoji: '🍚', popular: true, prepTime: 8 },
    { id: 'm7', name: 'Dahi Puri', vendor: 'Chaat Corner', price: 129, category: 'food', emoji: '🥘', popular: false, prepTime: 4 },
    { id: 'm8', name: 'Chicken Tandoori', vendor: 'Desi Dhaba', price: 399, category: 'food', emoji: '🍗', popular: true, prepTime: 12 },
    { id: 'm9', name: 'Masala Chai', vendor: 'Lassi Bar', price: 49, category: 'drink', emoji: '☕', popular: true, prepTime: 2 },
    { id: 'm10', name: 'Mango Lassi', vendor: 'Lassi Bar', price: 99, category: 'drink', emoji: '🥛', popular: false, prepTime: 2 },
    { id: 'm11', name: 'Thumbs Up (Large)', vendor: 'All Vendors', price: 59, category: 'drink', emoji: '🥤', popular: false, prepTime: 1 },
    { id: 'm12', name: 'Water Bottle', vendor: 'All Vendors', price: 30, category: 'drink', emoji: '💧', popular: false, prepTime: 1 },
    { id: 'm13', name: 'Fresh Lime Soda', vendor: 'All Vendors', price: 79, category: 'drink', emoji: '🍋', popular: false, prepTime: 2 },
    { id: 'm14', name: 'Bhel Puri', vendor: 'Chaat Corner', price: 89, category: 'snack', emoji: '🥜', popular: true, prepTime: 3 },
    { id: 'm15', name: 'Popcorn', vendor: 'All Vendors', price: 149, category: 'snack', emoji: '🍿', popular: false, prepTime: 2 },
    { id: 'm16', name: 'Kulfi', vendor: 'All Vendors', price: 79, category: 'snack', emoji: '🍦', popular: false, prepTime: 3 }
  ],

  // ── Event Schedule ──
  schedule: [
    { id: 'e1', title: 'Gates Open', time: new Date(Date.now() - 3600000).toISOString(), status: 'completed', type: 'logistics' },
    { id: 'e2', title: 'Pre-Match Entertainment', time: new Date(Date.now() - 1800000).toISOString(), status: 'completed', type: 'entertainment' },
    { id: 'e3', title: 'National Anthem', time: new Date(Date.now() + 1800000).toISOString(), status: 'upcoming', type: 'ceremony' },
    { id: 'e4', title: 'First Ball — GT vs MI', time: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'upcoming', type: 'main' },
    { id: 'e5', title: 'Strategic Timeout / Innings Break', time: new Date(Date.now() + 3.5 * 3600000).toISOString(), status: 'upcoming', type: 'entertainment' },
    { id: 'e6', title: 'Fan Cam & Lucky Draw', time: new Date(Date.now() + 3.75 * 3600000).toISOString(), status: 'upcoming', type: 'promo' },
    { id: 'e7', title: 'Match Ends (Estimated)', time: new Date(Date.now() + 5 * 3600000).toISOString(), status: 'upcoming', type: 'main' },
    { id: 'e8', title: 'Post-Match Fireworks', time: new Date(Date.now() + 5.25 * 3600000).toISOString(), status: 'upcoming', type: 'entertainment' }
  ],

  // ── Emergency Contacts ──
  emergency: {
    contacts: [
      { name: 'Stadium Security', number: '079-2685-0100', icon: '🛡️' },
      { name: 'Emergency Helpline', number: '112', icon: '🚑' },
      { name: 'Ambulance', number: '108', icon: '🏥' },
      { name: 'Guest Services', number: '079-2685-0200', icon: 'ℹ️' },
      { name: 'Lost & Found', number: '079-2685-0300', icon: '🔍' },
      { name: 'Parking Assistance', number: '079-2685-0400', icon: '🅿️' }
    ],
    evacuationMessage: 'Please proceed calmly to the nearest exit. Follow the illuminated signs and staff directions. Do not use elevators.',
    safetyTips: [
      'Know your nearest exit before the event starts',
      'Keep your phone charged for emergency alerts',
      'Stay hydrated — free water stations at all First Aid locations',
      'Report any suspicious activity to security immediately',
      'Keep an eye on children at all times in crowded areas'
    ]
  }
};
