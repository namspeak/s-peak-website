(() => {
  'use strict';
  const data = window.BOOK_DEMO;
  const $ = (id) => document.getElementById(id);
  const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const textElement = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
  const toc = $('table-of-contents');
  data.chapters.forEach((chapter, i) => {
    const item = document.createElement('details');
    if (i === 0) item.open = true;
    const summary = document.createElement('summary');
    summary.append(textElement('span', chapter.number, 'chapter-index'), textElement('span', chapter.title), textElement('span', '+', 'details-toggle'));
    summary.lastChild.setAttribute('aria-hidden', 'true');
    item.append(summary, textElement('p', chapter.description));
    toc.append(item);
  });
  $('reader-notice').textContent = data.notice;
  data.sample.forEach((section) => {
    const el = document.createElement('section'); el.className = 'sample-section';
    el.append(textElement('p', section.label, 'sample-label'), textElement('h3', section.title));
    section.paragraphs.forEach((p) => el.append(textElement('p', p)));
    $('sample-content').append(el);
  });

  const openers = new WeakMap();
  function openDialog(dialog, opener) {
    openers.set(dialog, opener || document.activeElement);
    dialog.showModal(); document.body.classList.add('dialog-open');
    const scroll = dialog.querySelector('.reader-scroll'); if (scroll) scroll.scrollTop = 0;
  }
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => $(button.dataset.closeDialog).close());
  });
  document.querySelectorAll('[data-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = $(button.dataset.openDialog);
      if (dialog && !dialog.open) openDialog(dialog, button);
    });
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
      openers.get(dialog)?.focus();
    });
    dialog.addEventListener('click', (event) => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
  });

  const previewForm = $('preview-form'); const previewButton = $('preview-submit');
  previewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!previewForm.reportValidity() || previewButton.disabled) return;
    previewButton.disabled = true; previewButton.textContent = 'Đang mở bản đọc thử…';
    $('preview-status').textContent = '';
    window.setTimeout(() => {
      previewButton.disabled = false; previewButton.replaceChildren(document.createTextNode('Nhận bản đọc thử '), textElement('span', '↗'));
      previewButton.lastChild.setAttribute('aria-hidden', 'true');
      openDialog($('reading-dialog'), previewButton);
    }, 250);
  });

  const quantity = $('quantity'); const minus = $('quantity-minus'); const plus = $('quantity-plus');
  function selectedQuantity() { const n = Number(quantity.value); return Number.isSafeInteger(n) && n >= 1 && n <= Math.floor(Number.MAX_SAFE_INTEGER / 150000) ? n : 1; }
  function updateQuantity(normalize = false) {
    const n = selectedQuantity(); if (normalize) quantity.value = String(n);
    minus.disabled = n <= 1;
    $('summary-quantity').textContent = '× ' + n;
    $('subtotal').textContent = money(n * 150000);
    $('order-total').replaceChildren(document.createTextNode(money(n * 150000) + ' '), textElement('small', '+ phí giao'));
  }
  minus.addEventListener('click', () => { quantity.value = String(Math.max(1, selectedQuantity() - 1)); updateQuantity(true); });
  plus.addEventListener('click', () => { quantity.value = String(selectedQuantity() + 1); updateQuantity(true); });
  quantity.addEventListener('input', () => updateQuantity()); quantity.addEventListener('blur', () => updateQuantity(true)); updateQuantity(true);

  const fields = [
    { input: $('customer-name'), error: $('name-error'), validate: (v) => v.trim().length > 0, message: 'Vui lòng nhập họ tên người nhận.' },
    { input: $('customer-phone'), error: $('phone-error'), validate: (v) => /^[+\d][\d\s().-]{7,24}$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 8, message: 'Vui lòng kiểm tra số điện thoại nhận sách.' },
    { input: $('customer-address'), error: $('address-error'), validate: (v) => v.trim().length > 0, message: 'Vui lòng nhập địa chỉ nhận sách.' }
  ];
  function validateField(field, force = false) {
    const valid = field.validate(field.input.value);
    if (force || field.input.getAttribute('aria-invalid') === 'true') { field.input.setAttribute('aria-invalid', String(!valid)); field.error.textContent = valid ? '' : field.message; }
    return valid;
  }
  fields.forEach((field) => field.input.addEventListener('input', () => validateField(field)));
  $('order-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if ($('order-submit').disabled) return;
    updateQuantity(true);
    const validity = fields.map((field) => validateField(field, true));
    if (validity.some((v) => !v)) { $('order-status').textContent = 'Vui lòng kiểm tra các mục được đánh dấu.'; fields[validity.indexOf(false)].input.focus(); return; }
    $('order-status').textContent = '';
    const n = selectedQuantity();
    const rows = [ ['Người nhận', $('customer-name').value.trim()], ['Điện thoại', $('customer-phone').value.trim()], ['Địa chỉ', $('customer-address').value.trim()], ['Sách', data.title], ['Số lượng', String(n)], ['Tiền sách', money(n * 150000)], ['Phí giao', 'Chưa xác định'], ['Tổng cuối', 'Chưa xác định — cần phí giao'] ];
    if ($('customer-note').value.trim()) rows.splice(3, 0, ['Ghi chú', $('customer-note').value.trim()]);
    $('confirmation-details').replaceChildren();
    rows.forEach(([label, value]) => { const row = document.createElement('div'); row.append(textElement('dt', label), textElement('dd', value)); $('confirmation-details').append(row); });
    const orderDialog = $('order-dialog');
    const originalOpener = openers.get(orderDialog) || $('order-submit');
    if (orderDialog.open) orderDialog.close();
    openDialog($('confirmation-dialog'), originalOpener);
  });
})();
