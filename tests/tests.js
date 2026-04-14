/* ============================================
   VenueFlow Unit Tests
   Tests for state, formatting, routing,
   queue predictions, and utilities
   ============================================ */

const TestRunner = {
  results: [],
  totalPassed: 0,
  totalFailed: 0,

  /**
   * Assert equality
   */
  assertEqual(actual, expected, testName) {
    const passed = actual === expected;
    this.results.push({ testName, passed, actual, expected });
    if (passed) this.totalPassed++;
    else this.totalFailed++;
    return passed;
  },

  /**
   * Assert truthy
   */
  assertTrue(value, testName) {
    return this.assertEqual(!!value, true, testName);
  },

  /**
   * Assert falsy
   */
  assertFalse(value, testName) {
    return this.assertEqual(!!value, false, testName);
  },

  /**
   * Assert type
   */
  assertType(value, type, testName) {
    return this.assertEqual(typeof value, type, testName);
  },

  /**
   * Assert array length
   */
  assertLength(arr, length, testName) {
    return this.assertEqual(arr.length, length, testName);
  },

  /**
   * Assert value is within range
   */
  assertInRange(value, min, max, testName) {
    const passed = value >= min && value <= max;
    this.results.push({ testName, passed, actual: value, expected: `${min}-${max}` });
    if (passed) this.totalPassed++;
    else this.totalFailed++;
    return passed;
  },

  /**
   * Run a named test suite
   */
  suite(name, fn) {
    const startIdx = this.results.length;
    console.log(`\n📋 Suite: ${name}`);
    fn();
    const suiteResults = this.results.slice(startIdx);
    this._renderSuite(name, suiteResults);
  },

  /**
   * Render test suite output
   */
  _renderSuite(name, results) {
    const output = document.getElementById('test-output');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    const html = `
      <div class="test-suite">
        <div class="suite-header">${name} (${passed}/${total})</div>
        ${results.map(r => `
          <div class="test-case ${r.passed ? 'pass' : 'fail'}">
            <span class="icon">${r.passed ? '✅' : '❌'}</span>
            <span>${r.testName}</span>
            ${!r.passed ? `<span style="margin-left: auto; font-size: 11px; opacity: 0.7;">Expected: ${r.expected}, Got: ${r.actual}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    output.insertAdjacentHTML('beforeend', html);
  },

  /**
   * Show final summary
   */
  showSummary() {
    const summary = document.getElementById('test-summary');
    const allPass = this.totalFailed === 0;
    summary.innerHTML = `
      <div class="summary ${allPass ? 'all-pass' : 'has-fail'}">
        ${allPass ? '🎉' : '⚠️'} <strong>${this.totalPassed + this.totalFailed} tests run:</strong>
        <span style="color: #10b981;">${this.totalPassed} passed</span>,
        <span style="color: ${this.totalFailed > 0 ? '#ef4444' : '#10b981'};">${this.totalFailed} failed</span>
      </div>
    `;
    console.log(`\n${'━'.repeat(40)}`);
    console.log(`Results: ${this.totalPassed} passed, ${this.totalFailed} failed`);
  }
};

// ══════════════════════════════════════════
// Test Suites
// ══════════════════════════════════════════

// ── Format Utilities ──
TestRunner.suite('Format Utilities', () => {
  // waitTime
  TestRunner.assertEqual(Format.waitTime(0.5), '< 1 min', 'waitTime: sub-minute');
  TestRunner.assertEqual(Format.waitTime(5), '5 min', 'waitTime: 5 minutes');
  TestRunner.assertEqual(Format.waitTime(90), '1h 30m', 'waitTime: 90 minutes');
  TestRunner.assertEqual(Format.waitTime(60), '1h', 'waitTime: exactly 1 hour');

  // currency
  TestRunner.assertEqual(Format.currency(12.99), '$12.99', 'currency: $12.99');
  TestRunner.assertEqual(Format.currency(0), '$0.00', 'currency: zero');

  // compactNumber
  TestRunner.assertEqual(Format.compactNumber(500), '500', 'compactNumber: < 1K');
  TestRunner.assertEqual(Format.compactNumber(1500), '1.5K', 'compactNumber: 1.5K');
  TestRunner.assertEqual(Format.compactNumber(82500), '82.5K', 'compactNumber: 82.5K');

  // percentage
  TestRunner.assertEqual(Format.percentage(72), '72%', 'percentage: 72%');
  TestRunner.assertEqual(Format.percentage(0.85), '85%', 'percentage: 0.85 → 85%');

  // distance
  TestRunner.assertEqual(Format.distance(50), '50m', 'distance: 50m');
  TestRunner.assertEqual(Format.distance(350), '350m', 'distance: 350m');
  TestRunner.assertEqual(Format.distance(1500), '1.5km', 'distance: 1.5km');

  // crowdLevel
  TestRunner.assertEqual(Format.crowdLevel(20).label, 'Low', 'crowdLevel: 20% = Low');
  TestRunner.assertEqual(Format.crowdLevel(50).label, 'Moderate', 'crowdLevel: 50% = Moderate');
  TestRunner.assertEqual(Format.crowdLevel(75).label, 'High', 'crowdLevel: 75% = High');
  TestRunner.assertEqual(Format.crowdLevel(90).label, 'Very High', 'crowdLevel: 90% = Very High');

  // waitStatus
  TestRunner.assertEqual(Format.waitStatus(3), 'success', 'waitStatus: 3 min = success');
  TestRunner.assertEqual(Format.waitStatus(10), 'warning', 'waitStatus: 10 min = warning');
  TestRunner.assertEqual(Format.waitStatus(20), 'danger', 'waitStatus: 20 min = danger');

  // truncate
  TestRunner.assertEqual(Format.truncate('Hello', 10), 'Hello', 'truncate: short string');
  TestRunner.assertEqual(Format.truncate('Hello World!', 8), 'Hello...', 'truncate: long string');

  // seat
  TestRunner.assertEqual(Format.seat('134', 'H', '12'), 'Section 134 · Row H · Seat 12', 'seat: formatting');

  // countdown
  const futureDate = new Date(Date.now() + 3661000); // 1h 1m 1s
  const cd = Format.countdown(futureDate);
  TestRunner.assertFalse(cd.expired, 'countdown: not expired for future date');
  TestRunner.assertEqual(cd.hours, '01', 'countdown: hours');

  const pastDate = new Date(Date.now() - 1000);
  TestRunner.assertTrue(Format.countdown(pastDate).expired, 'countdown: expired for past date');
});

// ── State Management ──
TestRunner.suite('State Management', () => {
  // Get/Set
  AppState.set('_test_value', 42);
  TestRunner.assertEqual(AppState.get('_test_value'), 42, 'state: get/set basic value');

  // Nested paths
  AppState.set('_test.nested.value', 'hello');
  TestRunner.assertEqual(AppState.get('_test.nested.value'), 'hello', 'state: nested get/set');

  // Subscriber notifications
  let subscriberCalled = false;
  let receivedValue = null;
  const unsub = AppState.subscribe('_test_sub', (val) => {
    subscriberCalled = true;
    receivedValue = val;
  });
  AppState.set('_test_sub', 'test123');
  TestRunner.assertTrue(subscriberCalled, 'state: subscriber called on set');
  TestRunner.assertEqual(receivedValue, 'test123', 'state: subscriber receives correct value');

  // Unsubscribe
  unsub();
  subscriberCalled = false;
  AppState.set('_test_sub', 'changed');
  TestRunner.assertFalse(subscriberCalled, 'state: unsubscribe works');

  // Cart operations
  const testItem = { id: '_test_item', name: 'Test Burger', price: 10.00, emoji: '🍔', prepTime: 5 };
  
  // Clear cart first
  AppState.set('cart', []);
  AppState.addToCart(testItem);
  TestRunner.assertEqual(AppState.getCartCount(), 1, 'cart: add item count');
  TestRunner.assertEqual(AppState.getCartTotal(), 10.00, 'cart: total after add');

  AppState.addToCart(testItem);
  TestRunner.assertEqual(AppState.getCartCount(), 2, 'cart: add same item increases quantity');
  TestRunner.assertEqual(AppState.getCartTotal(), 20.00, 'cart: total after double');

  AppState.updateCartQuantity('_test_item', 5);
  TestRunner.assertEqual(AppState.getCartCount(), 5, 'cart: update quantity');
  TestRunner.assertEqual(AppState.getCartTotal(), 50.00, 'cart: total after quantity update');

  AppState.removeFromCart('_test_item');
  TestRunner.assertEqual(AppState.getCartCount(), 0, 'cart: remove item');
  TestRunner.assertEqual(AppState.getCartTotal(), 0, 'cart: total after remove');

  // Merge
  AppState.set('_test_merge', { a: 1, b: 2 });
  AppState.merge('_test_merge', { b: 3, c: 4 });
  TestRunner.assertEqual(AppState.get('_test_merge').a, 1, 'state: merge preserves existing');
  TestRunner.assertEqual(AppState.get('_test_merge').b, 3, 'state: merge overwrites');
  TestRunner.assertEqual(AppState.get('_test_merge').c, 4, 'state: merge adds new');
});

// ── DOM Utilities ──
TestRunner.suite('DOM Utilities', () => {
  // createElement
  const el = DOM.create('div', { className: 'test-class', id: 'test-el' }, 'Hello');
  TestRunner.assertEqual(el.tagName, 'DIV', 'DOM.create: correct tag');
  TestRunner.assertEqual(el.className, 'test-class', 'DOM.create: className applied');
  TestRunner.assertEqual(el.id, 'test-el', 'DOM.create: id applied');
  TestRunner.assertEqual(el.textContent, 'Hello', 'DOM.create: text content');

  // createElement with dataset
  const el2 = DOM.create('button', { dataset: { action: 'test' } });
  TestRunner.assertEqual(el2.dataset.action, 'test', 'DOM.create: dataset applied');

  // debounce
  TestRunner.assertType(DOM.debounce(() => {}), 'function', 'debounce: returns function');

  // throttle
  TestRunner.assertType(DOM.throttle(() => {}), 'function', 'throttle: returns function');

  // skeleton
  const skeleton = DOM.skeleton(3);
  TestRunner.assertTrue(skeleton.includes('skeleton-text'), 'skeleton: contains skeleton class');

  // $ selector
  document.body.appendChild(el);
  TestRunner.assertTrue(DOM.$('#test-el') !== null, 'DOM.$: finds element by id');
  document.body.removeChild(el);
});

// ── Config Validation ──
TestRunner.suite('Configuration', () => {
  // Venue config
  TestRunner.assertType(Config.venue.name, 'string', 'config: venue name is string');
  TestRunner.assertTrue(Config.venue.capacity > 0, 'config: venue capacity > 0');
  TestRunner.assertTrue(Config.venue.gates.length > 0, 'config: venue has gates');

  // Menu
  TestRunner.assertTrue(Config.menu.length > 0, 'config: menu has items');
  TestRunner.assertTrue(Config.menu.every(m => m.price > 0), 'config: all menu items have price');
  TestRunner.assertTrue(Config.menu.every(m => m.id), 'config: all menu items have id');
  TestRunner.assertTrue(Config.menu.every(m => m.name), 'config: all menu items have name');
  TestRunner.assertTrue(Config.menu.every(m => m.prepTime > 0), 'config: all menu items have prep time');

  // POIs
  TestRunner.assertTrue(Config.pois.length > 0, 'config: has POIs');
  TestRunner.assertTrue(Config.pois.every(p => p.lat && p.lng), 'config: all POIs have coordinates');
  TestRunner.assertTrue(Config.pois.every(p => p.type), 'config: all POIs have type');

  // Schedule
  TestRunner.assertTrue(Config.schedule.length > 0, 'config: has schedule events');
  TestRunner.assertTrue(Config.schedule.every(e => e.title && e.time), 'config: schedule events have title and time');

  // Emergency
  TestRunner.assertTrue(Config.emergency.contacts.length > 0, 'config: has emergency contacts');
  TestRunner.assertType(Config.emergency.evacuationMessage, 'string', 'config: evacuation message exists');

  // Gemini config
  TestRunner.assertType(Config.gemini.systemPrompt, 'string', 'config: Gemini system prompt exists');
  TestRunner.assertTrue(Config.gemini.systemPrompt.length > 50, 'config: Gemini prompt is detailed');

  // Maps
  TestRunner.assertType(Config.maps.defaultCenter.lat, 'number', 'config: maps center lat is number');
  TestRunner.assertType(Config.maps.defaultCenter.lng, 'number', 'config: maps center lng is number');
});

// ── Initial State Validation ──
TestRunner.suite('Initial State', () => {
  const queues = AppState.get('queues');
  TestRunner.assertTrue(queues.length > 0, 'state: queues populated');
  TestRunner.assertTrue(queues.every(q => q.waitMinutes >= 0), 'state: all queues have wait times');
  TestRunner.assertTrue(queues.every(q => ['food', 'restroom', 'gate'].includes(q.type)), 'state: all queues have valid type');
  TestRunner.assertTrue(queues.every(q => ['rising', 'falling', 'stable'].includes(q.trend)), 'state: all queues have valid trend');

  const attendance = AppState.get('currentAttendance');
  TestRunner.assertTrue(attendance > 0, 'state: attendance > 0');
  TestRunner.assertTrue(attendance <= Config.venue.capacity, 'state: attendance <= capacity');

  const density = AppState.get('overallCrowdDensity');
  TestRunner.assertInRange(density, 0, 100, 'state: density 0-100');

  const zones = AppState.get('crowdZones');
  TestRunner.assertTrue(zones.length > 0, 'state: crowd zones populated');
  TestRunner.assertTrue(zones.every(z => z.lat && z.lng && z.weight), 'state: zones have lat/lng/weight');

  TestRunner.assertTrue(Array.isArray(AppState.get('cart')), 'state: cart is array');
  TestRunner.assertTrue(Array.isArray(AppState.get('activeOrders')), 'state: activeOrders is array');
  TestRunner.assertTrue(Array.isArray(AppState.get('chatHistory')), 'state: chatHistory is array');
  TestRunner.assertTrue(Array.isArray(AppState.get('notifications')), 'state: notifications is array');
});

// ── Gemini Service ──
TestRunner.suite('Gemini AI Service', () => {
  // Fallback responses
  const foodResponse = GeminiService._getFallbackResponse('Where can I get food?');
  TestRunner.assertTrue(foodResponse.length > 0, 'gemini: food query returns response');
  TestRunner.assertTrue(foodResponse.includes('Grill') || foodResponse.includes('food') || foodResponse.includes('queue'), 'gemini: food response is relevant');

  const restroomResponse = GeminiService._getFallbackResponse('Where is the nearest bathroom?');
  TestRunner.assertTrue(restroomResponse.includes('Restroom') || restroomResponse.includes('restroom'), 'gemini: restroom response is relevant');

  const crowdResponse = GeminiService._getFallbackResponse('How crowded is it?');
  TestRunner.assertTrue(crowdResponse.includes('%') || crowdResponse.includes('capacity'), 'gemini: crowd response has stats');

  const helpResponse = GeminiService._getFallbackResponse('What can you help with?');
  TestRunner.assertTrue(helpResponse.includes('Navigate') || helpResponse.includes('help'), 'gemini: help response lists features');

  const emergencyResponse = GeminiService._getFallbackResponse('I need medical help!');
  TestRunner.assertTrue(emergencyResponse.includes('911') || emergencyResponse.includes('emergency') || emergencyResponse.includes('Emergency'), 'gemini: emergency response has contacts');

  // Suggestions
  const suggestions = GeminiService.getSuggestions();
  TestRunner.assertTrue(suggestions.length > 0, 'gemini: suggestions not empty');
  TestRunner.assertTrue(suggestions.length <= 5, 'gemini: max 5 suggestions');

  // History management
  GeminiService.clearHistory();
  TestRunner.assertLength(GeminiService.conversationHistory, 0, 'gemini: clear history works');
});

// ── Calendar Service ──
TestRunner.suite('Calendar Service', () => {
  // Share link generation
  const link = CalendarService.getShareLink({
    title: 'Test Event',
    start: new Date().toISOString()
  });
  TestRunner.assertTrue(link.includes('calendar.google.com'), 'calendar: share link is Google Calendar URL');
  TestRunner.assertTrue(link.includes('Test+Event') || link.includes('Test%20Event'), 'calendar: share link contains event title');
});

// ── Accessibility ──
TestRunner.suite('Accessibility', () => {
  TestRunner.assertType(A11y.screenReaderMode, 'boolean', 'a11y: screenReaderMode is boolean');
  TestRunner.assertType(A11y.highContrastMode, 'boolean', 'a11y: highContrastMode is boolean');
  TestRunner.assertType(A11y.announce, 'function', 'a11y: announce function exists');
  TestRunner.assertType(A11y.speak, 'function', 'a11y: speak function exists');
  TestRunner.assertType(A11y.trapFocus, 'function', 'a11y: trapFocus function exists');
  TestRunner.assertType(A11y.toggleHighContrast, 'function', 'a11y: toggleHighContrast function exists');
  TestRunner.assertType(A11y.toggleLargeText, 'function', 'a11y: toggleLargeText function exists');
});

// ══════════════════════════════════════════
// Run Summary
// ══════════════════════════════════════════
TestRunner.showSummary();
