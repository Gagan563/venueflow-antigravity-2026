/* ============================================
   VenueFlow Configuration
   API keys, Firebase config, venue data
   ============================================ */

const Config = {
  // ── Google Maps ──
  maps: {
    apiKey: 'AIzaSyBPiFzlSjra7uvioKy6GRsgY1WJ2btKO7o',
    defaultCenter: { lat: 40.8135, lng: -74.0745 }, // MetLife Stadium
    defaultZoom: 17,
    mapId: 'venueflow-map'
  },

  // ── Gemini AI ──
  gemini: {
    apiKey: 'AIzaSyBPiFzlSjra7uvioKy6GRsgY1WJ2btKO7o',
    model: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: `You are VenueFlow AI, a smart stadium assistant at MetLife Stadium. You help attendees navigate the venue, find food, avoid crowds, and have the best experience possible.

Your knowledge includes:
- Venue layout: Gates A-F, Sections 100-300, Concession stands on every level
- Food vendors: Gridiron Grill (burgers), Stadium Sushi, Pizza Corner, Taco Stand, Beer Garden
- Facilities: Restrooms near every section, First Aid at Gates A and D, Guest Services at Gate B
- Current game: NFL match day, capacity ~82,500

Guidelines:
- Be concise, friendly, and helpful
- Provide specific directions when possible (e.g., "Turn left past Section 120")
- Suggest alternatives when wait times are high
- Prioritize safety in emergency situations
- Use emojis sparingly for a friendly tone`
  },

  // ── Firebase ──
  firebase: {
    apiKey: 'AIzaSyAiENvPHGkaBiYlXCaLTF7NOvdMotIxhoQ',
    authDomain: 'physical-event-app.firebaseapp.com',
    databaseURL: 'https://physical-event-app-default-rtdb.firebaseio.com',
    projectId: 'physical-event-app',
    storageBucket: 'physical-event-app.firebasestorage.app',
    messagingSenderId: '183933052847',
    appId: '1:183933052847:web:05ace14c81d541780d315a',
    measurementId: 'G-E3H9M2F75P'
  },

  // ── Venue Data ──
  venue: {
    name: 'MetLife Stadium',
    location: 'East Rutherford, NJ',
    capacity: 82500,
    currentEvent: 'NFL Sunday — Giants vs Eagles',
    eventTime: new Date(Date.now() + 2 * 3600000).toISOString(), // 2 hours from now
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: {
      lower: { range: [100, 149], label: 'Lower Bowl' },
      mezzanine: { range: [200, 249], label: 'Mezzanine' },
      upper: { range: [300, 349], label: 'Upper Deck' }
    },
    userSeat: { section: '134', row: 'H', seat: '12' }
  },

  // ── Points of Interest ──
  pois: [
    { id: 'gate-a', name: 'Gate A', type: 'gate', lat: 40.8142, lng: -74.0760, icon: '🚪' },
    { id: 'gate-b', name: 'Gate B', type: 'gate', lat: 40.8150, lng: -74.0745, icon: '🚪' },
    { id: 'gate-c', name: 'Gate C', type: 'gate', lat: 40.8145, lng: -74.0728, icon: '🚪' },
    { id: 'gate-d', name: 'Gate D', type: 'gate', lat: 40.8130, lng: -74.0728, icon: '🚪' },
    { id: 'gate-e', name: 'Gate E', type: 'gate', lat: 40.8120, lng: -74.0740, icon: '🚪' },
    { id: 'gate-f', name: 'Gate F', type: 'gate', lat: 40.8125, lng: -74.0758, icon: '🚪' },
    { id: 'food-1', name: 'Gridiron Grill', type: 'food', lat: 40.8138, lng: -74.0752, icon: '🍔' },
    { id: 'food-2', name: 'Stadium Sushi', type: 'food', lat: 40.8140, lng: -74.0738, icon: '🍣' },
    { id: 'food-3', name: 'Pizza Corner', type: 'food', lat: 40.8130, lng: -74.0735, icon: '🍕' },
    { id: 'food-4', name: 'Taco Stand', type: 'food', lat: 40.8125, lng: -74.0748, icon: '🌮' },
    { id: 'food-5', name: 'Beer Garden', type: 'food', lat: 40.8135, lng: -74.0760, icon: '🍺' },
    { id: 'rest-1', name: 'Restrooms (Sec 110)', type: 'restroom', lat: 40.8143, lng: -74.0755, icon: '🚻' },
    { id: 'rest-2', name: 'Restrooms (Sec 130)', type: 'restroom', lat: 40.8136, lng: -74.0732, icon: '🚻' },
    { id: 'rest-3', name: 'Restrooms (Sec 220)', type: 'restroom', lat: 40.8147, lng: -74.0740, icon: '🚻' },
    { id: 'rest-4', name: 'Restrooms (Sec 310)', type: 'restroom', lat: 40.8128, lng: -74.0750, icon: '🚻' },
    { id: 'aid-1', name: 'First Aid (Gate A)', type: 'medical', lat: 40.8141, lng: -74.0762, icon: '🏥' },
    { id: 'aid-2', name: 'First Aid (Gate D)', type: 'medical', lat: 40.8129, lng: -74.0730, icon: '🏥' },
    { id: 'guest', name: 'Guest Services', type: 'info', lat: 40.8149, lng: -74.0747, icon: 'ℹ️' }
  ],

  // ── Concession Menu ──
  menu: [
    { id: 'm1', name: 'Classic Burger', vendor: 'Gridiron Grill', price: 12.99, category: 'food', emoji: '🍔', popular: true, prepTime: 8 },
    { id: 'm2', name: 'Cheese Fries', vendor: 'Gridiron Grill', price: 8.99, category: 'food', emoji: '🍟', popular: false, prepTime: 5 },
    { id: 'm3', name: 'Hot Dog', vendor: 'Gridiron Grill', price: 7.99, category: 'food', emoji: '🌭', popular: true, prepTime: 3 },
    { id: 'm4', name: 'Spicy Tuna Roll', vendor: 'Stadium Sushi', price: 14.99, category: 'food', emoji: '🍣', popular: false, prepTime: 10 },
    { id: 'm5', name: 'Pepperoni Pizza', vendor: 'Pizza Corner', price: 9.99, category: 'food', emoji: '🍕', popular: true, prepTime: 7 },
    { id: 'm6', name: 'Loaded Nachos', vendor: 'Taco Stand', price: 11.99, category: 'food', emoji: '🧀', popular: true, prepTime: 6 },
    { id: 'm7', name: 'Street Tacos (3)', vendor: 'Taco Stand', price: 10.99, category: 'food', emoji: '🌮', popular: false, prepTime: 8 },
    { id: 'm8', name: 'Chicken Wings', vendor: 'Gridiron Grill', price: 13.99, category: 'food', emoji: '🍗', popular: true, prepTime: 12 },
    { id: 'm9', name: 'Draft Beer', vendor: 'Beer Garden', price: 11.99, category: 'drink', emoji: '🍺', popular: true, prepTime: 2 },
    { id: 'm10', name: 'Craft IPA', vendor: 'Beer Garden', price: 13.99, category: 'drink', emoji: '🍻', popular: false, prepTime: 2 },
    { id: 'm11', name: 'Soda (Large)', vendor: 'All Vendors', price: 5.99, category: 'drink', emoji: '🥤', popular: false, prepTime: 1 },
    { id: 'm12', name: 'Water Bottle', vendor: 'All Vendors', price: 4.99, category: 'drink', emoji: '💧', popular: false, prepTime: 1 },
    { id: 'm13', name: 'Lemonade', vendor: 'All Vendors', price: 6.99, category: 'drink', emoji: '🍋', popular: false, prepTime: 2 },
    { id: 'm14', name: 'Soft Pretzel', vendor: 'Pizza Corner', price: 6.99, category: 'snack', emoji: '🥨', popular: true, prepTime: 3 },
    { id: 'm15', name: 'Popcorn', vendor: 'All Vendors', price: 7.99, category: 'snack', emoji: '🍿', popular: false, prepTime: 2 },
    { id: 'm16', name: 'Ice Cream', vendor: 'All Vendors', price: 6.99, category: 'snack', emoji: '🍦', popular: false, prepTime: 3 }
  ],

  // ── Event Schedule ──
  schedule: [
    { id: 'e1', title: 'Gates Open', time: new Date(Date.now() - 3600000).toISOString(), status: 'completed', type: 'logistics' },
    { id: 'e2', title: 'Pre-Game Show', time: new Date(Date.now() - 1800000).toISOString(), status: 'completed', type: 'entertainment' },
    { id: 'e3', title: 'National Anthem', time: new Date(Date.now() + 1800000).toISOString(), status: 'upcoming', type: 'ceremony' },
    { id: 'e4', title: 'Kickoff — Giants vs Eagles', time: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'upcoming', type: 'main' },
    { id: 'e5', title: 'Halftime Show', time: new Date(Date.now() + 3.5 * 3600000).toISOString(), status: 'upcoming', type: 'entertainment' },
    { id: 'e6', title: 'Fan Giveaway Draw', time: new Date(Date.now() + 3.75 * 3600000).toISOString(), status: 'upcoming', type: 'promo' },
    { id: 'e7', title: 'Game Ends (Estimated)', time: new Date(Date.now() + 5 * 3600000).toISOString(), status: 'upcoming', type: 'main' },
    { id: 'e8', title: 'Post-Game Fireworks', time: new Date(Date.now() + 5.25 * 3600000).toISOString(), status: 'upcoming', type: 'entertainment' }
  ],

  // ── Emergency Contacts ──
  emergency: {
    contacts: [
      { name: 'Stadium Security', number: '201-555-0100', icon: '🛡️' },
      { name: 'Medical Emergency', number: '911', icon: '🚑' },
      { name: 'Guest Services', number: '201-555-0200', icon: 'ℹ️' },
      { name: 'Lost & Found', number: '201-555-0300', icon: '🔍' },
      { name: 'Parking Assistance', number: '201-555-0400', icon: '🅿️' }
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
