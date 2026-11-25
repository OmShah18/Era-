/**
 * Form behaviour. The original site posts to Webflow's form backend via webflow.js; this
 * reimplements the same UI contract (`.w-form` > form + `.w-form-done` + `.w-form-fail`)
 * and posts to `PUBLIC_FORM_ENDPOINT` (any JSON-accepting endpoint: Formspree, a CRM
 * webhook, your own API…). See README.
 */
const ENDPOINT: string | undefined = import.meta.env.PUBLIC_FORM_ENDPOINT;

export function initForm() {
  // Styled <a data-form-btn> acts as the submit button and shows a sending state.
  document.querySelectorAll<HTMLElement>('[data-form-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = btn.closest('form');
      if (!form) return;
      const labels = btn.querySelectorAll<HTMLElement>('[hover="text"]');
      const showSending = () => labels.forEach((l) => (l.textContent = 'Sending...'));
      form.addEventListener('submit', showSending, { once: true });
      form.requestSubmit();
    });
  });

  // Floating labels.
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.input_field').forEach((field) => {
    const label = field.parentElement?.querySelector('.input_label');
    if (!label) return;
    field.addEventListener('focusin', () => label.classList.add('focused'));
    field.addEventListener('focusout', () => {
      if (!field.value.trim()) label.classList.remove('focused');
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => (input.value = input.value.replace(/[^\d+\-]/g, '')));
  });

  document.querySelectorAll<HTMLInputElement>('input[name="Name"]').forEach((input) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[\d!@#$%^&*()_+=\[\]{};:'"\\|,.<>/?~`]/g, '');
    });
  });
}

export function initUtmFields() {
  const title = document.querySelector<HTMLInputElement>('input[name="title"]');
  if (title) title.value = 'Deal from Era';
  const params = new URLSearchParams(window.location.search);
  const values: Record<string, string> = {
    utm_source: params.get('utm_source') ?? '',
    utm_medium: params.get('utm_medium') ?? '',
    utm_campaign: params.get('utm_campaign') ?? '',
    utm_content: params.get('utm_content') ?? '',
    utm_url: params.get('utm_url') ?? '',
    page_url: window.location.href,
  };
  Object.entries(values).forEach(([name, value]) => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (input) input.value = value;
  });
}

const bound = new WeakSet<HTMLFormElement>();

/** Replacement for webflow.js form handling. */
export function initFormSubmission() {
  document.querySelectorAll<HTMLElement>('.w-form').forEach((wrapper) => {
    const form = wrapper.querySelector('form');
    if (!form || bound.has(form)) return;
    bound.add(form);
    const done = wrapper.querySelector<HTMLElement>('.w-form-done');
    const fail = wrapper.querySelector<HTMLElement>('.w-form-fail');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (fail) fail.style.display = 'none';
      const data = Object.fromEntries(new FormData(form).entries());
      const payload = { form: form.dataset.name ?? form.name, ...data };

      let ok = false;
      if (ENDPOINT) {
        try {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          });
          ok = res.ok;
        } catch {
          ok = false;
        }
      } else if (import.meta.env.DEV) {
        console.warn('[forms] PUBLIC_FORM_ENDPOINT is not set; simulating a successful submission.', payload);
        ok = true;
      }

      if (ok) {
        form.style.display = 'none';
        if (done) done.style.display = 'block';
      } else {
        if (fail) fail.style.display = 'block';
        form.querySelectorAll<HTMLElement>('[data-form-btn] [hover="text"]').forEach((l) => (l.textContent = 'Submit'));
      }
    });
  });
}

/** Custom dropdown (`[data-select=""]`) used by listing filters. */
export function initSelect() {
  document.querySelectorAll<HTMLElement>('[data-select=""]').forEach((select) => {
    const btn = select.querySelector('[data-select="btn"]');
    const values = select.querySelectorAll('[data-select="value"]');
    const items = select.querySelectorAll('[data-select="item"]');
    const placeholder = values[0]?.textContent ?? '';

    const sync = () => {
      const active = [...items].filter((i) => i.classList.contains('is-active'));
      const first = active[0]?.textContent?.trim() ?? '';
      const text = !active.length ? placeholder : active.length === 1 ? first : `${first} +${active.length - 1}`;
      values.forEach((v) => (v.textContent = text));
    };

    btn?.addEventListener('click', () => select.classList.toggle('is-open'));
    items.forEach((item) =>
      item.addEventListener('click', () => {
        select.classList.remove('is-open');
        requestAnimationFrame(sync);
      }),
    );
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target as Node)) select.classList.remove('is-open');
    });
    sync();
  });
}
