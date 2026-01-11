// Utility
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = $('.nav-toggle');
  const navList = $('.nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-list a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Product filter chips
  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      $$('.product').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Accordion
  $$('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // Simple cart (client-side only)
  const cartFab = $('#cart-fab');
  const cartDialog = $('#cart-dialog');
  const cartItemsEl = $('.cart-items');
  const cartTotalEl = $('.cart-total');
  const cartCountEl = $('.cart-count');
  const closeBtn = $('.btn-close');

  const cart = [];

  function renderCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div><strong>${item.name}</strong><div class="muted">GHS ${item.price}</div></div>
        <div class="qty">
          <button aria-label="Decrease">-</button>
          <span>${item.qty}</span>
          <button aria-label="Increase">+</button>
        </div>
        <button class="btn btn-sm btn-ghost" aria-label="Remove">Remove</button>
      `;
      const [decBtn, incBtn] = row.querySelectorAll('.qty button');
      const removeBtn = row.querySelector('.btn-ghost');

      decBtn.addEventListener('click', () => {
        item.qty = Math.max(1, item.qty - 1);
        update();
      });
      incBtn.addEventListener('click', () => {
        item.qty += 1;
        update();
      });
      removeBtn.addEventListener('click', () => {
        cart.splice(idx, 1);
        update();
      });

      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = `GHS ${total}`;
    cartCountEl.textContent = String(cart.reduce((n, i) => n + i.qty, 0));
  }

  function update() {
    renderCart();
    // Persist in localStorage
    localStorage.setItem('nabes-cart', JSON.stringify(cart));
  }

  // Load cart from storage
  try {
    const saved = JSON.parse(localStorage.getItem('nabes-cart') || '[]');
    if (Array.isArray(saved)) {
      saved.forEach(i => cart.push(i));
      renderCart();
    }
  } catch {}

  // Add to cart buttons
  $$('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price || 0);
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty += 1;
      else cart.push({ name, price, qty: 1 });
      update();
      // Small feedback
      btn.textContent = 'Added ✓';
      setTimeout(() => (btn.textContent = 'Add'), 900);
    });
  });

  // Cart dialog open/close
  if (cartFab && cartDialog) {
    cartFab.addEventListener('click', () => {
      if (typeof cartDialog.showModal === 'function') {
        cartDialog.showModal();
      } else {
        cartDialog.setAttribute('open', 'open'); // fallback
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartDialog.close();
    });
  }

  // Contact form validation (demo)
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const message = $('#message').value.trim();

      let ok = true;
      const emailOk = /\S+@\S+\.\S+/.test(email);

      const setErr = (id, msg) => {
        const row = form.querySelector(`#${id}`).closest('.form-row');
        row.querySelector('.error').textContent = msg || '';
        if (msg) ok = false;
      };

      setErr('name', name ? '' : 'Please enter your name.');
      setErr('email', emailOk ? '' : 'Enter a valid email.');
      setErr('message', message ? '' : 'Please write a message.');

      if (!ok) return;

      $('.form-status').textContent = 'Thanks! We will get back to you shortly.';
      form.reset();
    });
  }
});