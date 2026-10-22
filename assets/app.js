(() => {
  'use strict';

  const header = document.querySelector('[data-site-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const setMenu = (open) => {
    if (!header || !menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('.sr-only').textContent = open ? 'Đóng menu' : 'Mở menu';
    navigation.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('menu-open', open);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });

  const ecosystem = document.querySelector('[data-ecosystem]');
  if (!ecosystem) return;

  const programs = {
    dare: {
      kicker: 'Khóa học · DARE TO S-PEAK',
      title: 'Bắt đầu bằng sự rõ ràng và tự tin.',
      need: 'Nói rõ ràng và tự tin hơn về chuyên môn của mình.',
      description: 'Làm rõ điều muốn truyền đạt, xây một khung có thể thực hành và dùng phản hồi để tinh chỉnh cách nói.',
      path: 'https://www.daretospeak.vn/',
      external: true
    },
    speak: {
      kicker: 'Chuyên sâu · S-PEAK Keynote Masterclass',
      title: 'Biến chuyên môn thành một keynote có sức nhớ.',
      need: 'Xây một keynote hoặc Signature Talk từ chuyên môn của mình.',
      description: 'Lựa chọn ý tưởng cốt lõi, phát triển cấu trúc và tinh chỉnh trải nghiệm bạn muốn người nghe mang theo.',
      path: 'https://www.daretospeak.vn/s-peak/',
      external: true
    },
    keynote: {
      kicker: 'Group Coaching · S-PEAK Signature Program',
      title: 'Giúp bạn sở hữu một chương trình đào tạo Signature từ chính chuyên môn của mình.',
      need: 'Xây dựng một chương trình đào tạo Signature độc bản từ chính chuyên môn của bạn.',
      description: 'Cùng nhóm đồng hành để biến chuyên môn của bạn thành một chương trình đào tạo mang dấu ấn riêng. Để lại thông tin để được tư vấn chi tiết.',
      form: true,
      cta: 'Nhận tư vấn chi tiết'
    },
    expert: {
      kicker: '1-1 Coaching & Mentoring',
      title: 'Đồng hành để bạn phát triển và sống bền vững với nghề chuyên gia.',
      need: 'Xây dựng sự nghiệp chuyên gia bền vững: không chỉ ở việc nói, mà còn ở chương trình của riêng mình và cách làm việc với khách hàng.',
      description: 'Được đồng hành riêng để xây dựng chương trình của bạn, làm việc hiệu quả với khách hàng và phát triển sự nghiệp chuyên gia lâu dài.',
      form: true,
      cta: 'Nhận tư vấn chi tiết'
    }
  };

  const nodes = Array.from(ecosystem.querySelectorAll('[data-program]'));
  const lines = Array.from(ecosystem.querySelectorAll('[data-line]'));
  const flyout = ecosystem.querySelector('#program-flyout');
  const closeButton = ecosystem.querySelector('.flyout-close');
  const kicker = ecosystem.querySelector('[data-flyout-kicker]');
  const title = ecosystem.querySelector('[data-flyout-title]');
  const need = ecosystem.querySelector('[data-flyout-need]');
  const description = ecosystem.querySelector('[data-flyout-description]');
  const action = ecosystem.querySelector('[data-flyout-action]');
  const status = ecosystem.querySelector('[data-ecosystem-status]');
  const hint = ecosystem.querySelector('[data-ecosystem-hint]');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let activeKey = null;
  let pinnedKey = null;
  let hideTimer = null;

  const cancelHide = () => {
    if (hideTimer !== null) window.clearTimeout(hideTimer);
    hideTimer = null;
  };

  const updateHint = () => {
    if (!hint) return;
    hint.textContent = finePointer.matches
      ? 'Hover để khám phá · Click để giữ box'
      : 'Chạm để khám phá';
  };

  const renderProgram = (key, announce = false) => {
    const program = programs[key];
    if (!program || !flyout) return;

    cancelHide();
    activeKey = key;

    nodes.forEach((node) => {
      const selected = node.dataset.program === key;
      node.classList.toggle('is-active', selected);
      node.setAttribute('aria-expanded', String(selected));
    });

    lines.forEach((line) => {
      line.classList.toggle('is-active', line.dataset.line === key);
    });

    kicker.textContent = program.kicker;
    title.textContent = program.title;
    need.textContent = program.need;
    description.textContent = program.description;
    action.firstChild.textContent = program.cta ? `${program.cta} ` : 'Khám phá chương trình ';
    if (program.form) {
      action.href = '#tu-van';
      action.dataset.openConsult = program.kicker;
      action.removeAttribute('target');
      action.removeAttribute('rel');
    } else {
      delete action.dataset.openConsult;
      action.href = program.path;
    }
    if (program.form) {
      // handled by the consultation dialog
    } else if (program.external) {
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
    } else {
      action.removeAttribute('target');
      action.removeAttribute('rel');
    }
    action.setAttribute('aria-label', `${program.cta || 'Khám phá'} ${program.kicker.split(' · ').pop()}`);

    flyout.dataset.activeProgram = key;
    flyout.classList.add('is-visible');
    flyout.setAttribute('aria-hidden', 'false');

    if (announce && status) {
      status.textContent = `Đã mở thông tin ${program.kicker.replace(' · ', ': ')}`;
    }
  };

  const hideProgram = (force = false) => {
    cancelHide();

    if (pinnedKey && !force) {
      renderProgram(pinnedKey, false);
      return;
    }

    activeKey = null;
    if (force) pinnedKey = null;

    flyout.classList.remove('is-visible');
    flyout.setAttribute('aria-hidden', 'true');
    delete flyout.dataset.activeProgram;

    nodes.forEach((node) => {
      node.classList.remove('is-active');
      node.setAttribute('aria-expanded', 'false');
    });
    lines.forEach((line) => line.classList.remove('is-active'));
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimer = window.setTimeout(() => hideProgram(false), 280);
  };

  nodes.forEach((node) => {
    const key = node.dataset.program;

    node.addEventListener('mouseenter', () => {
      if (finePointer.matches) renderProgram(key, false);
    });

    node.addEventListener('mouseleave', () => {
      if (finePointer.matches) scheduleHide();
    });

    node.addEventListener('focus', () => renderProgram(key, true));

    node.addEventListener('click', () => {
      if (pinnedKey === key) {
        hideProgram(true);
        if (status) status.textContent = 'Đã đóng thông tin chương trình.';
        return;
      }

      pinnedKey = key;
      renderProgram(key, true);
    });
  });

  flyout.addEventListener('mouseenter', cancelHide);
  flyout.addEventListener('mouseleave', () => {
    if (finePointer.matches) scheduleHide();
  });

  ecosystem.addEventListener('focusout', () => {
    window.setTimeout(() => {
      const focused = document.activeElement;
      const isNode = nodes.includes(focused);
      const isInsideFlyout = flyout.contains(focused);
      if (!isNode && !isInsideFlyout) hideProgram(false);
    }, 0);
  });

  closeButton.addEventListener('click', () => {
    const node = nodes.find((item) => item.dataset.program === activeKey);
    if (node) node.focus();
    hideProgram(true);
    if (status) status.textContent = 'Đã đóng thông tin chương trình.';
  });

  ecosystem.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !activeKey) return;
    const node = nodes.find((item) => item.dataset.program === activeKey);
    if (node) node.focus();
    hideProgram(true);
  });

  updateHint();
  finePointer.addEventListener('change', updateHint);
})();


(() => {
  // Google Apps Script: ghi vào Google Sheet và gửi email báo cho Nam.
  const CONSULT_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0K1bEgpm9I2_UFMfG2oFrMOX-qqwEd_oIObAH7YaGtAIgOI7fxDD-uRW3Q2gydK2O/exec';
  const dialog = document.getElementById('consult-dialog');
  const form = document.getElementById('consult-form');
  if (!dialog || !form) return;

  const programField = form.querySelector('[name="program"]');
  const statusEl = form.querySelector('[data-consult-status]');
  const submit = form.querySelector('button[type="submit"]');

  const setStatus = (text, isError) => {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', Boolean(isError));
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-consult]');
    if (!trigger) return;
    event.preventDefault();
    const wanted = trigger.dataset.openConsult.split(' · ').pop().toLowerCase();
    const match = Array.from(programField.options).find((o) => o.value && o.value.toLowerCase().includes(wanted.replace('1-1 coaching & mentoring', '1-1 coaching')));
    programField.value = match ? match.value : '';
    setStatus('');
    dialog.showModal();
    form.querySelector('input[name="name"]').focus();
  });

  dialog.querySelector('[data-consult-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!CONSULT_ENDPOINT) {
      setStatus('Biểu mẫu chưa được kết nối nên thông tin chưa được gửi đi. Vui lòng liên hệ qua Fanpage S-PEAK.', true);
      return;
    }
    submit.disabled = true;
    setStatus('Đang gửi thông tin…');
    try {
      const response = await fetch(CONSULT_ENDPOINT, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form))
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error('submit failed');
      form.reset();
      setStatus('Cảm ơn bạn! S-PEAK đã nhận thông tin và sẽ liên hệ tư vấn sớm.');
    } catch (error) {
      setStatus('Chưa gửi được thông tin. Vui lòng thử lại hoặc liên hệ qua Fanpage S-PEAK.', true);
    } finally {
      submit.disabled = false;
    }
  });
})();
