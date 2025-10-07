import { subscribe, getState, closeCustomizer, onCustomizerToggle, formatMoney, addToCart } from '../lib/store';
import { getDrinkById } from '../lib/menuData';

type Current = {
  drinkId: string;
  name: string;
  base: number;
  size: 'S' | 'M' | 'L';
  milk: 'Whole' | 'Oat' | 'Almond';
  sweetness: number;
  temp: 'Hot' | 'Iced';
  addOns: string[];
  qty: number;
};

const sizeDelta: Record<string, number> = { S: 0, M: 0.5, L: 1 };
const addOnPrice = 0.75;
const altMilkDelta = 0.5;

// PUBLIC_INTERFACE
export function mountCustomizer(root: HTMLElement) {
  /** Mounts the customizer sidebar and wires events. */
  const nameEl = root.querySelector('#cust-name') as HTMLElement;
  const body = root.querySelector('#cust-content') as HTMLElement;
  const priceEl = root.querySelector('#cust-price') as HTMLElement;
  const btnClose = root.querySelector('#cust-close') as HTMLButtonElement;
  const btnAdd = root.querySelector('#cust-add') as HTMLButtonElement;

  let current: Current = {
    drinkId: '',
    name: '',
    base: 0,
    size: 'M',
    milk: 'Whole',
    sweetness: 50,
    temp: 'Hot',
    addOns: [],
    qty: 1,
  };

  function computePrice(): number {
    const sizeAdd = sizeDelta[current.size] || 0;
    const milkAdd = current.milk !== 'Whole' ? altMilkDelta : 0;
    const addOnsAdd = (current.addOns?.length || 0) * addOnPrice;
    const single = current.base + sizeAdd + milkAdd + addOnsAdd;
    return single * current.qty;
  }

  function updatePrice() {
    if (priceEl) priceEl.textContent = formatMoney(computePrice());
  }

  function render() {
    const { customizer } = getState();
    root.classList.toggle('open', !!customizer.open);
    if (!customizer.open || !customizer.drinkId) return;

    const drink = getDrinkById(customizer.drinkId);
    if (!drink) return;
    if (nameEl) nameEl.textContent = `Customize - ${drink.name}`;
    current = { ...current, drinkId: drink.id, name: drink.name, base: drink.basePrice };

    if (body) {
      body.innerHTML = `
        <div>
          <div class="section-title">Size</div>
          <div style="display:flex; gap:8px;">
            ${['S','M','L'].map(s=>`<button class="btn ${current.size===s?'btn-secondary':'btn-ghost'}" data-k="size" data-v="${s}">${s}</button>`).join('')}
          </div>
        </div>
        <div>
          <div class="section-title">Milk</div>
          <select class="select" id="milk">
            ${['Whole','Oat','Almond'].map(m=>`<option ${current.milk===m?'selected':''}>${m}</option>`).join('')}
          </select>
          <div class="helper">Oat/Almond +$${altMilkDelta.toFixed(2)}</div>
        </div>
        <div>
          <div class="section-title">Sweetness</div>
          <input type="range" id="sweet" min="0" max="100" value="${current.sweetness}" />
          <div class="helper"><span id="sweet-val">${current.sweetness}</span>%</div>
        </div>
        <div>
          <div class="section-title">Temperature</div>
          <div style="display:flex; gap:8px;">
            ${['Hot','Iced'].map(t=>`<button class="btn ${current.temp===t?'btn-secondary':'btn-ghost'}" data-k="temp" data-v="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <div>
          <div class="section-title">Add-ons</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${['Extra shot','Vanilla','Caramel','Mocha'].map(a=>{
              const on = current.addOns.includes(a);
              return `<button class="btn ${on?'btn-secondary':'btn-ghost'}" data-k="add" data-v="${a}">${a} ${on? '✓':''}</button>`;
            }).join('')}
          </div>
          <div class="helper">+$${addOnPrice.toFixed(2)} each</div>
        </div>
        <div>
          <div class="section-title">Quantity</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-ghost" data-k="qty" data-v="-1">-</button>
            <strong>${current.qty}</strong>
            <button class="btn btn-ghost" data-k="qty" data-v="+1">+</button>
          </div>
        </div>
      `;
    }
    updatePrice();
  }

  function onClick(e: Event) {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    const k = t.getAttribute('data-k');
    const v = t.getAttribute('data-v');
    if (!k) return;
    if (k === 'size' && v) current.size = v as Current['size'];
    if (k === 'temp' && v) current.temp = v as Current['temp'];
    if (k === 'add' && v) {
      const exists = current.addOns.includes(v);
      current.addOns = exists ? current.addOns.filter((x) => x !== v) : [...current.addOns, v];
    }
    if (k === 'qty' && v) {
      current.qty = Math.max(1, current.qty + (v === '+1' ? 1 : -1));
    }
    render();
  }

  function onInput(e: Event) {
    const t = e.target as HTMLInputElement | HTMLSelectElement | null;
    if (!t) return;
    if (t.id === 'sweet') {
      current.sweetness = Number((t as HTMLInputElement).value);
      const sv = root.querySelector('#sweet-val') as HTMLElement | null;
      if (sv) sv.textContent = String(current.sweetness);
    }
    if (t.id === 'milk') current.milk = (t as HTMLSelectElement).value as Current['milk'];
    updatePrice();
  }

  function onAdd() {
    addToCart({
      name: current.name,
      size: current.size,
      milk: current.milk,
      sweetness: current.sweetness,
      temp: current.temp,
      addOns: current.addOns,
      qty: current.qty,
      base: current.base,
    });
    closeCustomizer();
  }

  subscribe(render);
  onCustomizerToggle(render);
  render();

  if (btnClose) btnClose.addEventListener('click', () => closeCustomizer());
  if (body) {
    body.addEventListener('click', onClick);
    body.addEventListener('input', onInput as any);
  }
  if (btnAdd) btnAdd.addEventListener('click', onAdd);
}
