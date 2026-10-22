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
      kicker: 'Điểm bắt đầu · DARE TO S-PEAK',
      title: 'Bắt đầu bằng sự rõ ràng và tự tin.',
      need: 'Nói rõ ràng và tự tin hơn về chuyên môn của mình.',
      description: 'Làm rõ điều muốn truyền đạt, xây một khung có thể thực hành và dùng phản hồi để tinh chỉnh cách nói.',
      path: '/chuong-trinh/dare-to-speak/'
    },
    speak: {
      kicker: 'Bản sắc · Chương trình S-PEAK',
      title: 'Tìm ra cách nói mang dấu ấn của chính bạn.',
      need: 'Phát triển phong cách nói tự nhiên và nhất quán với con người của mình.',
      description: 'Quan sát bản thân, hiểu người nghe và chuyển điều bạn tin thành một cách thể hiện có chủ đích.',
      path: '/chuong-trinh/s-peak/'
    },
    keynote: {
      kicker: 'Bài nói chủ lực · S-PEAK Keynote',
      title: 'Biến chuyên môn thành một keynote có sức nhớ.',
      need: 'Xây một keynote hoặc Signature Talk từ chuyên môn của mình.',
      description: 'Lựa chọn ý tưởng cốt lõi, phát triển cấu trúc và tinh chỉnh trải nghiệm bạn muốn người nghe mang theo.',
      path: 'https://www.daretospeak.vn/s-peak/',
      external: true
    },
    expert: {
      kicker: 'Ứng dụng thương mại · Expert to Client',
      title: 'Từ chuyên môn thật đến bài pitch có cấu trúc.',
      need: 'Kết nối bài nói với khách hàng và một bước tiếp theo rõ ràng.',
      description: 'Làm rõ khách hàng, kết nối nhu cầu với dịch vụ và thực hành một lời mời phù hợp.',
      path: '/expert-to-client/',
      external: true
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
    action.href = program.path;
    if (program.external) {
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
    } else {
      action.removeAttribute('target');
      action.removeAttribute('rel');
    }
    action.setAttribute('aria-label', `Khám phá ${program.kicker.split(' · ').pop()}`);

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
