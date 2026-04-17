/* ============================================
   VenueFlow Wallet View
   Digital ticket, parking, listings, and payments
   ============================================ */

const WalletView = {
  _showAddPaymentForm: false,
  _unsubscribeFns: [],

  render() {
    const container = DOM.$('#view-wallet');
    if (!container) return;

    const seat = Config.venue.userSeat;
    const orderHistory = AppState.get('orderHistory');
    const totalSpent = orderHistory.reduce((sum, order) => sum + (order.total || 0), 0);
    const paymentMethods = AppState.get('wallet.paymentMethods');
    const listings = AppState.get('wallet.listings');

    container.innerHTML = `
      <div class="relative min-h-screen pt-24 pb-32 space-y-8 flex flex-col items-center">
        <section class="relative group w-full max-w-md px-6 animate-fade-in-up">
          <div class="absolute -inset-1 kinetic-gradient rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative bg-zinc-900/80 rounded-[2rem] overflow-hidden flex flex-col border border-white/10">
            <div class="p-6 bg-zinc-800/50 flex justify-between items-start border-b border-white/5">
              <div>
                <p class="text-secondary font-headline text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-neon-cyan">Upcoming ticket</p>
                <h2 class="font-headline text-2xl font-black tracking-tighter leading-none mb-2 uppercase">${Config.venue.teams.home} <span class="text-primary italic text-neon-fuchsia">VS</span> ${Config.venue.teams.away}</h2>
                <div class="flex gap-2">
                  <span class="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-secondary/30">${Config.venue.parking.entryGate} active</span>
                </div>
              </div>
              <div class="text-right">
                <p class="font-headline font-black text-xl text-primary text-neon-fuchsia">${new Date(Config.venue.eventTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</p>
                <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">${new Date(Config.venue.eventTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              </div>
            </div>

            <div class="p-8 flex flex-col items-center bg-white relative">
              <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary m-2"></div>
              <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary m-2"></div>
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary m-2"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary m-2"></div>
              <div class="bg-white p-2">
                <img alt="Large QR Code" class="w-56 h-56" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqzCUxBn-UgX_PLdM0J9asy6lZ6Rrs1iPLcx89hYOpJo31fOXlg9KFEqIrU5GWFLVnHE9BrbeWGTCe_xwwZ_pcyJ8V-boxelH8oVki7EiUuUIGgv6fF0y9cn0qFjv7WHXhiWbPtqGYXSZdJMpirGDHRbeSrtoAyZOazgWl9EjH3u9ipcrW3a7DqK3ApcmQxHUKAWx2anp8lxnFV4kiXbKjHTjjHA_WCaoJLldoi3vQ_3C4cR7IXx3pZTfZxecfITgJF4BDFLYWz8W7">
              </div>
              <p class="mt-6 text-zinc-900/60 font-headline text-[10px] tracking-[0.4em] font-black uppercase">Scan at the gate</p>
            </div>

            <div class="p-6 bg-zinc-800/80 grid grid-cols-3 gap-1">
              <div class="flex flex-col items-center border-r border-white/10">
                <span class="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Section</span>
                <span class="font-headline text-3xl font-black text-secondary tracking-tighter text-neon-cyan">${seat.section}</span>
              </div>
              <div class="flex flex-col items-center border-r border-white/10">
                <span class="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Row</span>
                <span class="font-headline text-3xl font-black text-secondary tracking-tighter text-neon-cyan">${seat.row}</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Seat</span>
                <span class="font-headline text-3xl font-black text-secondary tracking-tighter text-neon-cyan">${seat.seat}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-2 gap-4 w-full max-w-md px-6 animate-fade-in-up" style="animation-delay: 80ms;">
          <button class="bg-primary text-white rounded-full py-4 px-6 flex items-center justify-center gap-2 font-headline font-black text-xs tracking-widest neon-pulse-fuchsia active:scale-95 transition-all uppercase border border-white/20" id="btn-wallet-transfer">
            <span class="material-symbols-outlined text-sm">share</span>
            Transfer
          </button>
          <button class="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-full py-4 px-6 flex items-center justify-center gap-2 font-headline font-black text-xs tracking-widest hover:bg-zinc-800 active:scale-95 transition-all uppercase" id="btn-wallet-sell">
            <span class="material-symbols-outlined text-sm">sell</span>
            List Ticket
          </button>
        </div>

        ${orderHistory.length > 0 ? `
          <section class="w-full max-w-md px-6 animate-fade-in-up" style="animation-delay: 140ms;">
            <div class="flex justify-between items-end mb-4 px-2">
              <h3 class="font-headline font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-500" style="font-variation-settings: 'FILL' 1;">receipt_long</span>
                Spend Log
              </h3>
              <span class="text-emerald-500 font-bold text-[10px] tracking-widest uppercase text-neon-cyan">${Format.currency(totalSpent)}</span>
            </div>
            <div class="space-y-2">
              ${orderHistory.slice(0, 3).map(order => `
                <div class="glass-cyber rounded-2xl p-3 border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">${order.items?.[0]?.emoji || '🛒'}</span>
                    <div>
                      <p class="font-black text-white text-xs uppercase tracking-tight">${order.id}</p>
                      <p class="text-[9px] text-zinc-500 font-bold">${order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <span class="font-black text-secondary text-neon-cyan text-sm">${Format.currency(order.total || 0)}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <section class="w-full max-w-md px-6 animate-fade-in-up" style="animation-delay: 200ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic text-neon-fuchsia">Parking Permit</h3>
            <span class="text-secondary font-bold text-[10px] tracking-widest uppercase text-neon-cyan">${Config.venue.parking.lot}</span>
          </div>
          <div class="glass-cyber rounded-[2rem] p-6 border-l-4 border-l-secondary flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
                <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">directions_car</span>
              </div>
              <span class="font-headline font-black tracking-tight text-sm uppercase">${Config.venue.parking.vehicleLabel}</span>
            </div>
            <div class="relative overflow-hidden rounded-xl bg-zinc-300/10 p-2">
              <img alt="Parking Barcode" class="h-16 w-full object-cover invert opacity-90 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfHXq1U8EmnwsG3E2GxS5AvJqIOgfP3-hv92ih_BX1jwNO_0ZIFgYo4-TWXJffA-lhAY-XKPf7-grVnvpm1agA954Oh8LVj9cmTdgxUrQOOCSAG7psWIKdkmwwrZwQDtcwXd3L0mmq1CjQSgaAKfeuLaT59vLSmrIVlAhxadKBeyIQk1n0hdygx60R_NDQNJr1lLg6ROACWMM5weTOw_6H3fa_1b1TO_3xd1SYpZAC_STV4G7tFUtVp1cLIPI6AMJDq1Y-hbEtukaz">
            </div>
          </div>
        </section>

        <section class="w-full max-w-md px-6 animate-fade-in-up" style="animation-delay: 260ms;">
          <div class="flex justify-between items-end mb-4 px-2">
            <h3 class="font-headline font-black text-lg tracking-tight uppercase italic">Wallet Core</h3>
            <button class="text-secondary font-black text-[10px] tracking-widest uppercase flex items-center gap-1 hover:text-white transition-colors" id="btn-add-payment">
              <span class="material-symbols-outlined text-sm">add_circle</span>
              Add Payment
            </button>
          </div>
          <div class="space-y-3">
            ${paymentMethods.map(method => `
              <button class="w-full glass-cyber rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-zinc-800 transition-colors group border ${method.default ? 'border-primary/30 bg-primary/5' : 'border-zinc-800'}" data-payment-method="${method.id}">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-9 bg-zinc-950 border border-white/10 rounded-md flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 ${method.default ? 'bg-gradient-to-tr from-fuchsia-500/10 to-transparent' : 'bg-gradient-to-tr from-white/5 to-transparent'}"></div>
                    <span class="text-white font-black italic text-[9px] relative z-10 tracking-widest">${method.brand}</span>
                  </div>
                  <div class="text-left">
                    <p class="font-black text-xs uppercase tracking-tight">${method.label}</p>
                    <p class="text-zinc-500 text-[10px] font-bold">•••• ${method.last4} · EXP ${method.expMonth}/${method.expYear}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  ${method.default ? '<span class="bg-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/30 uppercase tracking-widest">Default</span>' : '<span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.16em]">Set default</span>'}
                  <span class="material-symbols-outlined text-zinc-600 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </button>
            `).join('')}
          </div>
        </section>

        ${listings.length > 0 ? `
          <section class="w-full max-w-md px-6 animate-fade-in-up" style="animation-delay: 320ms;">
            <div class="flex justify-between items-end mb-4 px-2">
              <h3 class="font-headline font-black text-lg tracking-tight uppercase italic">Marketplace</h3>
              <span class="text-zinc-500 font-bold text-[10px] tracking-widest uppercase">${listings.length} active</span>
            </div>
            <div class="space-y-3">
              ${listings.map(listing => `
                <div class="glass-cyber rounded-[1.5rem] p-4 border-white/5">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p class="font-headline font-black text-sm uppercase tracking-tight text-white">${listing.event}</p>
                      <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.16em]">${listing.seat}</p>
                    </div>
                    <span class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.16em]">${listing.status}</span>
                  </div>
                  <div class="flex items-end justify-between gap-3">
                    <div>
                      <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.16em]">Listing ID</p>
                      <p class="font-headline font-black text-white text-xs">${listing.id}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.16em]">Asking price</p>
                      <p class="font-headline font-black text-primary text-neon-fuchsia">${Format.currency(listing.price)}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${this._showAddPaymentForm ? this._renderAddPaymentModal() : ''}
      </div>
    `;

    this._bindEvents(container);
    this._subscribeToUpdates();
  },

  /**
   * Render the add-payment modal
   * @returns {string}
   * @private
   */
  _renderAddPaymentModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center" id="payment-modal">
        <div class="glass-cyber rounded-t-[2.5rem] w-full max-w-md bg-zinc-950/95 border-t-2 border-fuchsia-500/30 p-6 animate-slide-up">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="font-headline font-black text-2xl italic tracking-tighter uppercase text-white">Add Payment<span class="text-secondary text-neon-cyan">_Method</span></h2>
              <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.18em] mt-2">Store a card for faster checkout</p>
            </div>
            <button class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white" id="btn-close-payment">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <form class="space-y-4" id="wallet-payment-form">
            <div>
              <label class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em] block mb-2" for="payment-label">Nickname</label>
              <input class="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white px-4 py-3 outline-none focus:border-primary/40" id="payment-label" maxlength="32" placeholder="Personal Node 02" required type="text">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em] block mb-2" for="payment-brand">Brand</label>
                <select class="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white px-4 py-3 outline-none focus:border-primary/40" id="payment-brand">
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="RUPAY">RuPay</option>
                  <option value="AMEX">Amex</option>
                </select>
              </div>
              <div>
                <label class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em] block mb-2" for="payment-number">Card number</label>
                <input class="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white px-4 py-3 outline-none focus:border-primary/40" id="payment-number" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" required type="text">
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-1">
                <label class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em] block mb-2" for="payment-exp-month">Exp month</label>
                <input class="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white px-4 py-3 outline-none focus:border-primary/40" id="payment-exp-month" inputmode="numeric" maxlength="2" placeholder="08" required type="text">
              </div>
              <div class="col-span-1">
                <label class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em] block mb-2" for="payment-exp-year">Exp year</label>
                <input class="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white px-4 py-3 outline-none focus:border-primary/40" id="payment-exp-year" inputmode="numeric" maxlength="2" placeholder="29" required type="text">
              </div>
              <label class="col-span-1 flex items-end gap-2 rounded-2xl bg-zinc-900 border border-white/10 px-4 py-3 text-white cursor-pointer">
                <input class="accent-fuchsia-500" id="payment-default" type="checkbox">
                <span class="text-[10px] font-bold uppercase tracking-[0.16em]">Default</span>
              </label>
            </div>

            <button class="w-full bg-primary text-black rounded-full py-4 font-headline font-black tracking-[0.2em] uppercase neon-pulse-fuchsia active:scale-95 transition-transform flex items-center justify-center gap-2" type="submit">
              <span class="material-symbols-outlined text-sm font-bold">credit_card</span>
              Save Method
            </button>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Create a share payload for the live ticket
   * @returns {{ title: string, text: string, url: string }}
   * @private
   */
  _buildTransferPayload() {
    const seatLabel = Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat);
    const baseUrl = window.location.href.split('#')[0];

    return {
      title: `${Config.venue.currentEvent} ticket`,
      text: `${Config.venue.currentEvent}\n${seatLabel}\nOpen the wallet view to scan at the gate.`,
      url: `${baseUrl}#wallet`
    };
  },

  /**
   * Share the ticket transfer payload
   * @returns {Promise<void>}
   * @private
   */
  async _transferTicket() {
    const payload = this._buildTransferPayload();

    if (navigator.share) {
      try {
        await navigator.share(payload);
        DOM.toast('Ticket transfer details shared', 'success');
        return;
      } catch (error) {
        // Fall back to clipboard.
      }
    }

    const copied = await DOM.copyText(`${payload.text}\n${payload.url}`);
    DOM.toast(copied ? 'Ticket transfer details copied' : 'Unable to copy transfer details', copied ? 'success' : 'warning');
  },

  /**
   * Create or reuse a marketplace listing
   * @private
   */
  _listTicket() {
    const existingListing = AppState.get('wallet.listings').find(listing => listing.status === 'listed');
    if (existingListing) {
      DOM.toast(`Ticket already listed as ${existingListing.id}`, 'info');
      return;
    }

    const listing = AppState.addTicketListing({
      event: Config.venue.currentEvent,
      seat: Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat),
      price: 3499
    });

    DOM.toast(`Marketplace listing ${listing.id} created`, 'success');
  },

  /**
   * Save the add-payment form
   * @param {SubmitEvent} event - Form submit event
   * @private
   */
  _savePaymentMethod(event) {
    event.preventDefault();

    const label = DOM.$('#payment-label')?.value.trim();
    const brand = DOM.$('#payment-brand')?.value.trim();
    const number = (DOM.$('#payment-number')?.value || '').replace(/\D/g, '');
    const expMonth = DOM.$('#payment-exp-month')?.value.trim();
    const expYear = DOM.$('#payment-exp-year')?.value.trim();
    const isDefault = Boolean(DOM.$('#payment-default')?.checked);

    if (!label || number.length < 4 || !expMonth || !expYear) {
      DOM.toast('Enter a nickname, card number, and expiry date', 'warning');
      return;
    }

    const monthNumber = Number(expMonth);
    if (monthNumber < 1 || monthNumber > 12) {
      DOM.toast('Use a valid expiry month', 'warning');
      return;
    }

    AppState.addPaymentMethod({
      label,
      brand,
      last4: number.slice(-4),
      expMonth,
      expYear,
      default: isDefault
    });

    this._showAddPaymentForm = false;
    DOM.toast('Payment method added', 'success');
  },

  /**
   * Bind events
   * @param {Element} container - View container
   * @private
   */
  _bindEvents(container) {
    DOM.$('#btn-wallet-transfer', container)?.addEventListener('click', () => {
      this._transferTicket();
    });

    DOM.$('#btn-wallet-sell', container)?.addEventListener('click', () => {
      this._listTicket();
    });

    DOM.$('#btn-add-payment', container)?.addEventListener('click', () => {
      this._showAddPaymentForm = true;
      this.render();
    });

    DOM.$$('[data-payment-method]', container).forEach(button => {
      button.addEventListener('click', () => {
        AppState.setDefaultPaymentMethod(button.dataset.paymentMethod);
        DOM.toast('Default payment method updated', 'success');
      });
    });

    DOM.$('#btn-close-payment', container)?.addEventListener('click', () => {
      this._showAddPaymentForm = false;
      this.render();
    });

    const paymentModal = DOM.$('#payment-modal', container);
    if (paymentModal) {
      paymentModal.addEventListener('click', event => {
        if (event.target === paymentModal) {
          this._showAddPaymentForm = false;
          this.render();
        }
      });
    }

    DOM.$('#wallet-payment-form', container)?.addEventListener('submit', formEvent => {
      this._savePaymentMethod(formEvent);
    });
  },

  /**
   * Subscribe to wallet-related state changes
   * @private
   */
  _subscribeToUpdates() {
    this._unsubscribe();
    this._unsubscribeFns = [
      AppState.subscribe('orderHistory', () => this.render()),
      AppState.subscribe('wallet.paymentMethods', () => this.render()),
      AppState.subscribe('wallet.listings', () => this.render())
    ];
  },

  /**
   * Clear state subscriptions
   * @private
   */
  _unsubscribe() {
    this._unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this._unsubscribeFns = [];
  },

  destroy() {
    this._unsubscribe();
  }
};
