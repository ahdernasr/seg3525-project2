/* ===== HAMBURGER MENU ===== */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Set active nav link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ===== TYPING ANIMATION (hero) =====
  const typedEl = document.getElementById('typed-heading');
  if (typedEl) {
    const text = 'Build Your Dream PC';
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        typedEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 60 + Math.random() * 40);
      }
    }
    setTimeout(typeChar, 400);
  }

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    switch(e.key.toLowerCase()) {
      case 'h': window.location.href = 'index.html'; break;
      case 's': window.location.href = 'services.html'; break;
      case 'b': window.location.href = 'booking.html'; break;
    }
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      q.parentElement.classList.toggle('open');
    });
  });

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      contactForm.querySelectorAll('[required]').forEach(input => {
        const group = input.closest('.form-group');
        if (!input.value.trim()) {
          group.classList.add('has-error');
          valid = false;
        } else {
          group.classList.remove('has-error');
        }
      });
      const emailInput = contactForm.querySelector('[type="email"]');
      if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        emailInput.closest('.form-group').classList.add('has-error');
        valid = false;
      }
      if (valid) {
        showToast('> message_sent — we\'ll get back to you soon.');
        contactForm.reset();
      }
    });
  }

  // ===== BOOKING MULTI-STEP FORM =====
  initBookingForm();

  // ===== CONFIRMATION PAGE =====
  initConfirmation();
});

/* ===== TOAST ===== */
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ===== BOOKING FORM ===== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 4;
  let selectedService = null;

  const params = new URLSearchParams(location.search);
  const preselect = params.get('service');

  const services = {
    'custom-build': 'Custom PC Build',
    'diagnostics': 'PC Diagnostics',
    'gpu-upgrade': 'GPU Upgrade Installation',
    'ram-storage': 'RAM/Storage Upgrade',
    'virus-removal': 'Virus Removal & OS Install',
    'cable-management': 'Cable Management & Cleanup'
  };

  function updateProgressBar(step) {
    const pct = Math.round((step / totalSteps) * 100);
    const totalBlocks = 20;
    const filled = Math.round((step / totalSteps) * totalBlocks);
    const barEl = document.getElementById('progressBar');
    const pctEl = document.getElementById('progressPct');
    if (barEl) {
      let html = '';
      for (let i = 0; i < totalBlocks; i++) {
        html += `<span class="block ${i < filled ? 'filled' : 'empty'}">${i < filled ? '█' : '░'}</span>`;
      }
      barEl.innerHTML = html;
    }
    if (pctEl) pctEl.textContent = pct + '%';
  }

  function showStep(n) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${n}"]`).classList.add('active');
    document.querySelectorAll('.progress-step').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i + 1 === n) s.classList.add('active');
      else if (i + 1 < n) s.classList.add('done');
    });
    document.querySelectorAll('.progress-line').forEach((l, i) => {
      l.classList.toggle('active', i + 1 < n);
    });
    updateProgressBar(n);
  }

  // Service selection
  document.querySelectorAll('.service-option').forEach(opt => {
    if (preselect && opt.dataset.service === preselect) {
      opt.classList.add('selected');
      selectedService = preselect;
    }
    opt.addEventListener('click', () => {
      document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedService = opt.dataset.service;
    });
  });

  // Navigation
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 1 && !selectedService) {
        showToast('ERR: please select a service.');
        return;
      }
      if (currentStep === 2 && !validateStep2()) return;
      if (currentStep === 3 && !validateStep3()) return;
      if (currentStep === 3) populateReview();
      currentStep = Math.min(currentStep + 1, totalSteps);
      showStep(currentStep);
    });
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 1);
      showStep(currentStep);
    });
  });

  function validateStep2() {
    let valid = true;
    const date = document.getElementById('bookDate');
    const time = document.getElementById('bookTime');
    [date, time].forEach(input => {
      const g = input.closest('.form-group');
      if (!input.value) { g.classList.add('has-error'); valid = false; }
      else g.classList.remove('has-error');
    });
    if (date.value) {
      const selected = new Date(date.value);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) {
        date.closest('.form-group').classList.add('has-error');
        valid = false;
      }
    }
    return valid;
  }

  function validateStep3() {
    let valid = true;
    ['clientName','clientEmail','clientPhone','bikeType'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      const g = input.closest('.form-group');
      if (!input.value.trim()) { g.classList.add('has-error'); valid = false; }
      else g.classList.remove('has-error');
    });
    const email = document.getElementById('clientEmail');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.closest('.form-group').classList.add('has-error');
      valid = false;
    }
    return valid;
  }

  function populateReview() {
    const svcName = services[selectedService] || selectedService;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const phone = document.getElementById('clientPhone').value;
    const pcType = document.getElementById('bikeType').value;
    const notes = document.getElementById('bookNotes')?.value || '';

    document.getElementById('revService').textContent = svcName;
    document.getElementById('revDate').textContent = new Date(date).toLocaleDateString('en-CA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('revTime').textContent = time;
    document.getElementById('revName').textContent = name;
    document.getElementById('revEmail').textContent = email;
    document.getElementById('revPhone').textContent = phone;
    document.getElementById('revPc').textContent = pcType;

    sessionStorage.setItem('booking', JSON.stringify({
      service: svcName, date, time, name, email, phone, pcType, notes,
      ref: 'BB-' + Math.random().toString(36).substring(2,8).toUpperCase()
    }));
  }

  const submitBtn = document.getElementById('submitBooking');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      window.location.href = 'confirmation.html';
    });
  }

  showStep(1);
}

/* ===== CONFIRMATION ===== */
function initConfirmation() {
  const box = document.querySelector('.confirm-box');
  if (!box) return;
  const data = JSON.parse(sessionStorage.getItem('booking') || 'null');
  if (!data) {
    box.innerHTML = '<div style="padding:100px 0;text-align:center;font-family:var(--mono)"><h1 style="color:var(--amber)">404: no booking found</h1><p style="color:var(--text-muted);margin:16px 0 32px">It looks like you haven\'t made a booking yet.<br>Run <span style="color:var(--accent)">book_service</span> to get started.</p><a href="booking.html" class="btn btn-primary">[ BOOK NOW ]</a></div>';
    return;
  }
  document.getElementById('confRef').textContent = data.ref;
  document.getElementById('confService').textContent = data.service;
  document.getElementById('confDate').textContent = new Date(data.date).toLocaleDateString('en-CA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('confTime').textContent = data.time;
  document.getElementById('confName').textContent = data.name;
  document.getElementById('confEmail').textContent = data.email;
  document.getElementById('confPhone').textContent = data.phone;
  document.getElementById('confPc').textContent = data.pcType;

  const calBtn = document.getElementById('calendarBtn');
  if (calBtn) {
    const start = data.date.replace(/-/g,'') + 'T' + data.time.replace(':','') + '00';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=ByteBox+Ottawa+-+${encodeURIComponent(data.service)}&dates=${start}/${start}&location=245+Rue+Rideau,+Ottawa`;
    calBtn.href = url;
  }
}
