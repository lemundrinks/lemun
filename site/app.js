const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
if (menu && nav) {
  menu.hidden = false;
  const mobile = window.matchMedia('(max-width: 700px)');
  function syncMenu() { nav.hidden = mobile.matches; menu.setAttribute('aria-expanded', String(!nav.hidden)); }
  syncMenu();
  mobile.addEventListener('change', syncMenu);
  menu.addEventListener('click', () => { nav.hidden = !nav.hidden; menu.setAttribute('aria-expanded', String(!nav.hidden)); });
  nav.addEventListener('click', e => { if (e.target.closest('a') && mobile.matches) { nav.hidden = true; menu.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobile.matches && !nav.hidden) { nav.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
}
const filters = document.querySelector('#drink-filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', e => {
    const button = e.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let count = 0;
    document.querySelectorAll('.product').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
    document.querySelector('#drink-count').textContent = `${count} drinks shown.`;
  });
}
const city = document.querySelector('#city');
if (city) {
  city.parentElement.hidden = false;
  city.addEventListener('change', () => {
    let count = 0;
    document.querySelectorAll('[data-city]').forEach(card => { card.hidden = city.value !== 'all' && card.dataset.city !== city.value; if (!card.hidden) count++; });
    document.querySelector('#retailer-count').textContent = `${count} locations shown.`;
  });
}
const form = document.querySelector('#inquiry-form');
if (form) {
  form.hidden = false;
  document.querySelectorAll('[data-inquiry], [data-product]').forEach(a => a.addEventListener('click', () => {
    document.querySelector('#inquiry-type').value = a.dataset.inquiry || 'Product availability / ordering';
    if (a.dataset.product) document.querySelector('#message').value = `I'd like to learn more about ${a.dataset.product}. Please share current availability, ingredients, sizes, and pricing.`;
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Lemun inquiry: ${data.get('type')}`;
    const body = `Name: ${String(data.get('name')).trim()}\nEmail: ${data.get('email')}\nBusiness: ${String(data.get('business')).trim() || 'Not provided'}\nInterest: ${data.get('type')}\n\n${String(data.get('message')).trim()}`;
    document.querySelector('#draft-text').value = `To: sales@lemundrinks.com\nSubject: ${subject}\n\n${body}`;
    document.querySelector('#draft').hidden = false;
    document.querySelector('#form-status').textContent = 'Your draft is ready. Review and send it in your email app, or copy it below. This inquiry has not been sent.';
    window.location.href = `mailto:sales@lemundrinks.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.querySelector('#copy').addEventListener('click', async () => {
    const draft = document.querySelector('#draft-text');
    try { await navigator.clipboard.writeText(draft.value); document.querySelector('#form-status').textContent = 'Draft copied. Paste it into your email app and send it to Lemun.'; }
    catch { draft.focus(); draft.select(); document.querySelector('#form-status').textContent = 'Select and copy the draft, then paste it into your email app.'; }
  });
}
