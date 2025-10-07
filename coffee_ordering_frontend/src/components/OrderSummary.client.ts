import { subscribe, getState } from '../lib/store';

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

// PUBLIC_INTERFACE
export function mountOrderSummary(root: HTMLElement) {
  /** Mounts and renders the order summary totals and items. */
  const itemsEl = root.querySelector('#order-items') as HTMLElement;
  const subEl = root.querySelector('#sum-sub') as HTMLElement;
  const taxEl = root.querySelector('#sum-tax') as HTMLElement;
  const totEl = root.querySelector('#sum-total') as HTMLElement;

  function render() {
    const { cart, subtotal, tax, total } = getState();
    if (itemsEl) {
      itemsEl.innerHTML = '';
      if (cart.length === 0) {
        const d = document.createElement('div');
        d.className = 'helper';
        d.textContent = 'Your cart is empty.';
        itemsEl.appendChild(d);
      } else {
        cart.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'card';
          row.style.padding = '10px';
          row.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
              <div>
                <strong>${item.name}</strong>
                <div class="helper">${item.size}, ${item.milk}, ${item.temp}, sweet ${item.sweetness}%</div>
                <div class="helper">${item.addOns.join(', ') || 'no add-ons'}</div>
              </div>
              <div style="text-align:right;">
                <div>Qty: ${item.qty}</div>
                <div class="price">${formatMoney(item.total)}</div>
              </div>
            </div>
          `;
          itemsEl.appendChild(row);
        });
      }
    }
    if (subEl) subEl.textContent = formatMoney(subtotal);
    if (taxEl) taxEl.textContent = formatMoney(tax);
    if (totEl) totEl.textContent = formatMoney(total);
  }

  subscribe(render);
  render();
}
