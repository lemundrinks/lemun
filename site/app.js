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
  const submitButton = form.querySelector('[type="submit"]');
  const status = document.querySelector('#form-status');
  const accessKey = form.elements.namedItem('access_key');
  const configured = () => Boolean(accessKey.value.trim());
  submitButton.disabled = !configured();
  if (!configured()) status.textContent = 'Online inquiries are being connected. Please email sales@lemundrinks.com or call us in the meantime.';
  const revealStatus = () => {
    status.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    status.focus({ preventScroll: true });
  };
  form.addEventListener('invalid', event => {
    status.dataset.state = 'error';
    status.textContent = 'Please complete the required fields and enter a valid email address before sending.';
  }, true);
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!configured()) {
      status.textContent = 'Please email sales@lemundrinks.com while online inquiries are being connected.';
      return;
    }
    if (form.elements.namedItem('botcheck').checked) return;
    const data = new FormData(form);
    const payload = {
      access_key: accessKey.value.trim(),
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      type: data.get('type'),
      business: String(data.get('business') || '').trim(),
      message: String(data.get('message')).trim(),
      subject: `Lemun inquiry: ${data.get('type')}`,
      from_name: 'Lemun website'
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    sending = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your inquiry…';
    status.dataset.state = 'sending';
    revealStatus();
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission not accepted');
      form.reset();
      status.textContent = 'Thank you! Your inquiry has been submitted. Lemun will reply to the email address you provided.';
      status.dataset.state = 'success';
      revealStatus();
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'We could not confirm your submission in time. Your entries are still here. Please email sales@lemundrinks.com if you need help.'
        : 'Your inquiry could not be confirmed. Your entries are still here—please try again or email sales@lemundrinks.com.';
      status.dataset.state = 'error';
      revealStatus();
    } finally {
      clearTimeout(timeout);
      sending = false;
      submitButton.disabled = !configured();
      submitButton.textContent = 'Send inquiry ↗';
      form.removeAttribute('aria-busy');
    }
  });
}

// Enhance the ingredient lists with a native, keyboard-accessible modal.
const ingredientDialog = document.querySelector('#ingredient-dialog');
if (ingredientDialog && typeof ingredientDialog.showModal === 'function') {
  let ingredientTrigger;
  document.querySelectorAll('.product').forEach(card => {
    const details = card.querySelector('.ingredients');
    if (!details) return;
    const name = card.querySelector('h3').textContent;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ingredient-trigger';
    trigger.textContent = 'What’s inside';
    trigger.setAttribute('aria-label', `What’s inside ${name}`);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'ingredient-dialog');
    details.before(trigger);
    details.hidden = true;
    trigger.addEventListener('click', () => {
      ingredientTrigger = trigger;
      document.querySelector('#ingredient-title').textContent = name;
      const sourceImage = card.querySelector('.product-photo img');
      const image = document.querySelector('#ingredient-image');
      image.src = sourceImage.getAttribute('src');
      image.alt = sourceImage.alt;
      document.querySelector('#ingredient-list').replaceChildren(...Array.from(details.querySelectorAll('li'), li => li.cloneNode(true)));
      ingredientDialog.dataset.tone = card.classList[1];
      ingredientDialog.showModal();
      document.body.classList.add('ingredient-modal-open');
    });
  });
  ingredientDialog.querySelector('.ingredient-close').addEventListener('click', () => ingredientDialog.close());
  ingredientDialog.addEventListener('click', event => {
    if (event.target !== ingredientDialog) return;
    const bounds = ingredientDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) ingredientDialog.close();
  });
  ingredientDialog.addEventListener('close', () => {
    document.body.classList.remove('ingredient-modal-open');
    ingredientTrigger?.focus();
  });
}
