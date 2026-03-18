document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
  initAdminLogin();
  initLogout();
  initTabs();
  initSearch();
});

let allOrders = [];
let allAccounts = [];

// --- Auth ---
async function checkAdminSession() {
  try {
    const res = await fetch('/api/admin/session');
    const data = await res.json();
    if (data.admin) {
      document.getElementById('admin-dashboard').classList.remove('hidden');
      loadAdminData();
    } else {
      document.getElementById('admin-login-overlay').classList.remove('hidden');
    }
  } catch (err) {
    console.error('Check failed', err);
    document.getElementById('admin-login-overlay').classList.remove('hidden');
  }
}

function initAdminLogin() {
  const form = document.getElementById('admin-login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-login-btn');
    const load = btn.querySelector('.loader');
    const txt = btn.querySelector('.btn-text');
    const errObj = document.getElementById('admin-error');
    
    errObj.textContent = '';
    txt.classList.add('hidden');
    load.classList.remove('hidden');
    btn.disabled = true;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('admin-user').value,
          password: document.getElementById('admin-pass').value
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        document.getElementById('admin-login-overlay').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminData();
      } else {
        errObj.textContent = data.error || 'Login failed';
      }
    } catch(err) {
      errObj.textContent = 'Server err';
    } finally {
      txt.classList.remove('hidden');
      load.classList.add('hidden');
      btn.disabled = false;
    }
  });
}

function initLogout() {
  document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  });
}

// --- Dashboard Logic ---
function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.tab-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

async function loadAdminData() {
  // Fetch orders
  try {
    const oRes = await fetch('/api/admin/orders');
    const oData = await oRes.json();
    allOrders = oData.orders || [];
    renderOrders(allOrders);
  } catch(e) { console.error('Orders failed'); }

  // Fetch accounts
  try {
    const aRes = await fetch('/api/admin/accounts');
    const aData = await aRes.json();
    allAccounts = aData.accounts || [];
    renderAccounts(allAccounts);
  } catch(e) { console.error('Accounts failed'); }
}

function renderOrders(ordersArray) {
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = '';

  ordersArray.forEach((order, index) => {
    const dateStr = new Date(order.created_at).toLocaleString();
    const items = JSON.parse(order.items);
    const itemsHtml = items.map(i => `<div>${i.quantity}x ${i.name}</div>`).join('');

    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.05}s`; // staggered
    tr.innerHTML = `
      <td><strong>#${order.order_number}</strong></td>
      <td>${dateStr}</td>
      <td class="customer-info">
        <p><strong>${order.customer_name}</strong></p>
        <p>${order.customer_phone}</p>
        <p>${order.customer_address}</p>
      </td>
      <td>
        <div class="items-list">${itemsHtml}</div>
      </td>
      <td><strong>Rs. ${order.total_price}</strong></td>
      <td>
        <select class="status-select" data-id="${order.id}" data-val="${order.status}">
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
          <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach status change listeners
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      
      try {
        const res = await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
          e.target.dataset.val = newStatus;
        } else {
          alert('Failed to update status');
          e.target.value = e.target.dataset.val; // revert
        }
      } catch(err) {
        alert('Err');
        e.target.value = e.target.dataset.val;
      }
    });
  });
}

function renderAccounts(accountsArray) {
  const tbody = document.getElementById('accounts-tbody');
  tbody.innerHTML = '';

  accountsArray.forEach((acc, index) => {
    const dateStr = new Date(acc.created_at).toLocaleDateString();
    
    // Main Row
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.05}s`;
    tr.innerHTML = `
      <td>${acc.id}</td>
      <td>${dateStr}</td>
      <td><strong>${acc.name}</strong></td>
      <td>
        <div style="font-size:0.9rem">${acc.email}</div>
        <div style="font-size:0.9rem; color:#666">${acc.phone}</div>
      </td>
      <td style="max-width: 200px; font-size:0.9rem">${acc.address}</td>
      <td><span style="font-size:1.1rem; font-weight:700; color:var(--primary)">${acc.total_orders}</span></td>
      <td>
        ${acc.total_orders > 0 ? `<button class="expand-btn" data-id="${acc.id}">View Orders ▾</button>` : '<span style="color:#aaa;font-size:0.8rem">No orders</span>'}
      </td>
    `;
    tbody.appendChild(tr);

    // Expandable Orders Row
    if (acc.total_orders > 0) {
      const expTr = document.createElement('tr');
      expTr.className = `expanded-row hidden-row expand-${acc.id}`;
      // Find orders for this account
      const userOrders = allOrders.filter(o => o.account_id === acc.id);
      let orderListHTML = userOrders.map(o => `<li><strong>#${o.order_number}</strong> - Rs. ${o.total_price} - ${o.status}</li>`).join('');
      
      expTr.innerHTML = `
        <td colspan="7">
          <h4>Order History for ${acc.name}</h4>
          <ul style="margin-top:10px; font-size:0.9rem; line-height:1.6">
            ${orderListHTML}
          </ul>
        </td>
      `;
      tbody.appendChild(expTr);
    }
  });

  // Attach expand listeners
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const row = document.querySelector(`.expand-${id}`);
      if(row) {
        row.classList.toggle('hidden-row');
        e.target.innerHTML = row.classList.contains('hidden-row') ? 'View Orders ▾' : 'Hide Orders ▴';
      }
    });
  });
}

// Search Logic
function initSearch() {
  document.getElementById('search-orders').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allOrders.filter(o => 
      o.customer_name.toLowerCase().includes(term) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
      o.order_number.toLowerCase().includes(term) ||
      o.customer_phone.includes(term)
    );
    renderOrders(filtered);
  });

  document.getElementById('search-accounts').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allAccounts.filter(a => 
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.phone.includes(term)
    );
    renderAccounts(filtered);
  });
}
