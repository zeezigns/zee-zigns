const DELIVERY_FEE = 150;
let currentUser = null;
let cartItems = [];
let cartTotal = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  checkSession();
  
  document.getElementById('place-order-user').addEventListener('click', placeOrderLogged);
  document.getElementById('guest-order-form').addEventListener('submit', placeOrderGuest);
});

function loadCart() {
  cartItems = JSON.parse(localStorage.getItem('aa_cart')) || [];
  
  if (cartItems.length === 0) {
    document.getElementById('empty-cart-view').classList.remove('hidden');
  } else {
    document.getElementById('checkout-view').classList.remove('hidden');
    renderCart();
  }
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  list.innerHTML = '';
  let subtotal = 0;

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Format options string
    let optsArray = [];
    if (item.options) {
      for (const [k, v] of Object.entries(item.options)) {
        optsArray.push(`${k}: ${v}`);
      }
    }
    const optionsText = optsArray.length ? optsArray.join(' | ') : '';

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="item-left">
        <div class="item-name">${item.name}</div>
        ${optionsText ? `<div class="item-options">${optionsText}</div>` : ''}
        <div class="item-qty">Qty: ${item.quantity} × Rs. ${item.price}</div>
      </div>
      <div class="item-price">Rs. ${itemTotal}</div>
    `;
    list.appendChild(div);
  });

  cartTotal = subtotal + DELIVERY_FEE;
  
  document.getElementById('cart-subtotal').textContent = `Rs. ${subtotal}`;
  document.getElementById('cart-total').textContent = `Rs. ${cartTotal}`;
}

async function checkSession() {
  if (cartItems.length === 0) return;

  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    
    if (data.user) {
      currentUser = data.user;
      document.getElementById('logged-in-checkout').classList.remove('hidden');
      document.getElementById('user-name').textContent = currentUser.name;
      document.getElementById('user-phone').textContent = currentUser.phone;
      document.getElementById('user-address').textContent = currentUser.address;
    } else {
      document.getElementById('guest-checkout').classList.remove('hidden');
    }
  } catch (err) {
    console.error('Session check failed', err);
    document.getElementById('guest-checkout').classList.remove('hidden');
  }
}

async function placeOrderLogged() {
  setLoading(document.getElementById('place-order-user'), true);
  
  const orderDetails = {
    customer_name: currentUser.name,
    customer_email: currentUser.email,
    customer_phone: currentUser.phone,
    customer_address: currentUser.address,
    items: JSON.stringify(cartItems),
    total_price: cartTotal
  };

  await submitOrder(orderDetails);
}

async function placeOrderGuest(e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-guest');
  setLoading(btn, true);

  const phone = document.getElementById('g-phone').value;
  const altPhone = document.getElementById('g-alt-phone').value;
  const combinedPhone = altPhone ? `${phone} / ${altPhone}` : phone;

  const orderDetails = {
    customer_name: document.getElementById('g-name').value,
    customer_email: document.getElementById('g-email').value || null,
    customer_phone: combinedPhone,
    customer_address: document.getElementById('g-address').value,
    items: JSON.stringify(cartItems),
    total_price: cartTotal
  };

  await submitOrder(orderDetails);
}

async function submitOrder(orderDetails) {
  const errorMsg = document.getElementById('checkout-error');
  if (errorMsg) errorMsg.textContent = '';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderDetails)
    });
    
    const result = await res.json();
    
    if (res.ok && result.success) {
      // Clear cart
      localStorage.removeItem('aa_cart');
      
      // Show success
      document.getElementById('success-order-num').textContent = `#${result.orderNumber}`;
      document.getElementById('success-overlay').classList.remove('hidden');
    } else {
      showError(result.error || 'Failed to place order.');
    }
  } catch (err) {
    showError('Server connection error. Please try again.');
  }
}

function showError(msg) {
  const errorMsg = document.getElementById('checkout-error');
  if (errorMsg) {
    errorMsg.textContent = msg;
  } else {
    alert(msg);
  }
  setLoading(document.getElementById('place-order-user'), false);
  setLoading(document.getElementById('place-order-guest'), false);
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.loader');
  
  if (isLoading) {
    text.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;
  } else {
    text.classList.remove('hidden');
    loader.classList.add('hidden');
    btn.disabled = false;
  }
}
