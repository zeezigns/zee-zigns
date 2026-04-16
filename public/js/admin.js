document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
  initAdminLogin();
  initLogout();
  initTabs();
  initSearch();
  initStoreManager();
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
          <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="btn-accent del-order-btn" data-id="${order.id}" style="padding: 4px 10px; font-size: 0.8rem; border-color: #ff5b5b; color: #ff5b5b;">Delete</button>
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

  // Attach delete listeners
  document.querySelectorAll('.del-order-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      if (confirm('Are you absolutely sure you want to permanently delete this order? This cannot be undone.')) {
        try {
          const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
          if(res.ok) {
             // Refresh UI
             loadAdminData();
          } else {
             alert('Failed to delete order.');
          }
        } catch(err) {
          alert('Error deleting order.');
        }
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

// ---- Store Manager ----
function initStoreManager() {
  const form = document.getElementById('add-product-form');
  const editForm = document.getElementById('edit-product-form');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editOverlay = document.getElementById('edit-product-overlay');
  
  if (!form) return;

  renderCatalog();       // Initial load
  initHeroManager();     // Load hero slider manager
  initDiscountManager(); // Load discount manager

  // Add Product Form Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('add-product-msg');
    const name = document.getElementById('new-product-name').value.trim();
    const category = document.getElementById('new-product-category').value;
    const price = parseInt(document.getElementById('new-product-price').value);
    const desc = document.getElementById('new-product-desc').value.trim();
    const img = document.getElementById('new-product-img').value.trim();

    if (!name || !category || !price) {
      msg.textContent = '❌ Please fill all required fields.';
      msg.style.color = '#ff5b5b';
      return;
    }

    // Save directly to the unified master catalog
    let masterCatalog = JSON.parse(localStorage.getItem('zz_all_products') || '{}');
    if (!masterCatalog[category]) masterCatalog[category] = [];
    
    masterCatalog[category].push({ id: `item_${Date.now()}`, name, category, price, desc, img });
    localStorage.setItem('zz_all_products', JSON.stringify(masterCatalog));

    msg.textContent = `✅ "${name}" added to ${category}!`;
    msg.style.color = '#00d280';
    form.reset();
    document.getElementById('new-product-price').value = 2500;

    renderCatalog(); // Refresh list

    setTimeout(() => { msg.textContent = ''; }, 4000);
  });

  // Edit Product Modal Listeners
  cancelEditBtn.addEventListener('click', () => {
    editOverlay.classList.add('hidden');
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const oldCat = document.getElementById('edit-product-old-category').value;
    const name = document.getElementById('edit-product-name').value.trim();
    const category = document.getElementById('edit-product-category').value;
    const price = parseInt(document.getElementById('edit-product-price').value);
    const desc = document.getElementById('edit-product-desc').value.trim();
    const img = document.getElementById('edit-product-img').value.trim();

    let masterCatalog = JSON.parse(localStorage.getItem('zz_all_products') || '{}');
    
    // Find the item in the old category and remove it
    if (masterCatalog[oldCat]) {
      const idx = masterCatalog[oldCat].findIndex(i => i.id === id);
      if (idx > -1) {
        masterCatalog[oldCat].splice(idx, 1);
      }
    }

    // Push it to the new category (or same category if unmodified)
    if (!masterCatalog[category]) masterCatalog[category] = [];
    masterCatalog[category].push({ id, name, category, price, desc, img });

    localStorage.setItem('zz_all_products', JSON.stringify(masterCatalog));
    
    editOverlay.classList.add('hidden');
    renderCatalog();
    setTimeout(() => alert('Product updated successfully!'), 100);
  });
}

function renderCatalog() {
  const tbody = document.getElementById('catalog-tbody');
  if (!tbody) return;
  
  const masterCatalog = JSON.parse(localStorage.getItem('zz_all_products') || '{}');
  tbody.innerHTML = '';

  let hasItems = false;

  Object.keys(masterCatalog).forEach(catKey => {
    const items = masterCatalog[catKey];
    if (!Array.isArray(items)) return;

    items.forEach(item => {
      hasItems = true;
      const tr = document.createElement('tr');
      // For images, safely encode path
      const imgSrc = item.img ? `/images/${encodeURIComponent(item.img)}` : '';
      const imgHtml = imgSrc ? `<img src="${imgSrc}" style="width:50px; height:auto; border-radius:4px;">` : `<span style="color:#666">No Img</span>`;

      tr.innerHTML = `
        <td>${imgHtml}</td>
        <td><strong>${item.name}</strong></td>
        <td style="text-transform:capitalize;">${catKey}</td>
        <td>Rs. ${item.price}</td>
        <td>
          <button class="btn-accent edit-item-btn" style="padding: 4px 10px; font-size: 0.8rem;" 
                  data-id="${item.id}" data-cat="${catKey}">Edit</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });

  if (!hasItems) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#666;padding:20px;">No items in local catalog. Start the storefront to initialize defaults.</td></tr>`;
  } else {
    // Attach edit listeners
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const catList = masterCatalog[e.target.dataset.cat] || [];
        const itemObj = catList.find(i => i.id === id);
        
        if (itemObj) {
          openEditModal(itemObj, e.target.dataset.cat);
        }
      });
    });
  }
}

function openEditModal(item, categoryKey) {
  document.getElementById('edit-product-id').value = item.id;
  document.getElementById('edit-product-old-category').value = categoryKey;
  
  document.getElementById('edit-product-name').value = item.name || '';
  document.getElementById('edit-product-category').value = categoryKey;
  document.getElementById('edit-product-price').value = item.price || 2500;
  document.getElementById('edit-product-desc').value = item.desc || '';
  document.getElementById('edit-product-img').value = item.img || '';

  document.getElementById('edit-product-overlay').classList.remove('hidden');
}

// ---- Hero Slider Manager ----
function initHeroManager() {
  const tbody = document.getElementById('hero-slider-tbody');
  const addBtn = document.getElementById('add-hero-btn');
  const overlay = document.getElementById('hero-slide-overlay');
  const form = document.getElementById('hero-slide-form');
  const cancelBtn = document.getElementById('cancel-hero-btn');
  if(!tbody) return;

  function renderHeroSlides() {
    let slidesData = JSON.parse(localStorage.getItem('zz_hero_slides') || '[]');
    tbody.innerHTML = '';
    
    if (slidesData.length === 0) {
       tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#666;padding:20px;">No hero slides active.</td></tr>`;
       return;
    }

    slidesData.forEach((slide) => {
      const tr = document.createElement('tr');
      const imgSrc = slide.img ? `/images/${encodeURIComponent(slide.img)}` : '';
      const imgHtml = imgSrc ? `<img src="${imgSrc}" style="width:80px; height:45px; object-fit:cover; border-radius:4px; background:#111;">` : `<span style="color:#666">No Img</span>`;
      
      tr.innerHTML = `
        <td>${imgHtml}</td>
        <td><strong>${slide.title}</strong><br><small style="color:#999">${slide.subtitle}</small></td>
        <td style="text-transform:capitalize;">${slide.size}</td>
        <td>
          <button class="btn-accent edit-hero-btn" style="padding: 4px 10px; font-size: 0.8rem;" data-id="${slide.id}">Edit</button>
          <button class="btn-accent del-hero-btn" style="padding: 4px 10px; font-size: 0.8rem; border-color: #ff5b5b; color: #ff5b5b;" data-id="${slide.id}">X</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-hero-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const slide = slidesData.find(s => s.id === id);
        if(slide) {
          document.getElementById('hero-slide-id').value = slide.id;
          document.getElementById('hero-slide-title-input').value = slide.title;
          document.getElementById('hero-slide-subtitle').value = slide.subtitle;
          const imgInput = document.getElementById('hero-slide-img');
          imgInput.value = slide.img;
          
          document.getElementById('hero-modal-title').textContent = 'Edit Hero Slide';
          
          // Load Layout Settings
          const bgSize = slide.size || 'cover';
          const bgPos = slide.pos || '50% 50%';
          document.getElementById('hero-hidden-bgsize').value = bgSize;
          document.getElementById('hero-hidden-bgpos').value = bgPos;
          
          // Recreate Preview State
          const layer = document.getElementById('hero-preview-layer');
          const scaleSlider = document.getElementById('hero-slide-scale');
          const scaleReadout = document.getElementById('hero-scale-readout');
          
          layer.style.backgroundImage = slide.img ? `url('/images/${encodeURIComponent(slide.img)}')` : 'none';
          layer.style.backgroundSize = bgSize;
          layer.style.backgroundPosition = bgPos;
          
          // Parse scale float to slider value if it's a percentage, else default 100 for 'cover'
          if(bgSize.includes('%')) {
             scaleSlider.value = parseInt(bgSize);
             scaleReadout.textContent = parseInt(bgSize) + '%';
          } else {
             scaleSlider.value = 100;
             scaleReadout.textContent = '100% (Cover/Auto)';
          }
          
          // Reset tracking globals
          posX = 50; posY = 50;
          if(bgPos.includes('%')) {
             const parts = bgPos.split(' ');
             posX = parseFloat(parts[0]) || 50;
             posY = parseFloat(parts[1]) || 50;
          }

          overlay.classList.remove('hidden');
        }
      });
    });

    document.querySelectorAll('.del-hero-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm('Are you sure you want to delete this slide?')) {
          slidesData = slidesData.filter(s => s.id !== e.target.dataset.id);
          localStorage.setItem('zz_hero_slides', JSON.stringify(slidesData));
          renderHeroSlides();
        }
      });
    });
  }

  let isDragging = false;
  let startX, startY;
  let posX = 50, posY = 50; // default 50%
  const workspace = document.getElementById('hero-preview-workspace');
  const layer = document.getElementById('hero-preview-layer');
  const zoomSlider = document.getElementById('hero-slide-scale');
  const imgInput = document.getElementById('hero-slide-img');
  
  // Realtime image refresh
  imgInput.addEventListener('input', (e) => {
    layer.style.backgroundImage = `url('/images/${encodeURIComponent(e.target.value.trim())}')`;
  });

  // Zoom logic
  zoomSlider.addEventListener('input', (e) => {
     let sizeStr = `${e.target.value}%`;
     layer.style.backgroundSize = sizeStr;
     document.getElementById('hero-hidden-bgsize').value = sizeStr;
     document.getElementById('hero-scale-readout').textContent = sizeStr;
  });

  // Pan logic
  workspace.addEventListener('mousedown', (e) => {
    isDragging = true;
    workspace.style.cursor = 'grabbing';
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    workspace.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    
    // Calculate difference (mouse movement)
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Convert pixel movement to a rough percentage of the workspace box (inverse logic for panning)
    // Moving mouse left (dx < 0) means image moves left, position % goes down.
    const width = workspace.offsetWidth;
    const height = workspace.offsetHeight;
    
    // Sensitivity factor
    const sx = (dx / width) * 100 * 0.4;
    const sy = (dy / height) * 100 * 0.4;
    
    posX = Math.min(Math.max(posX + sx, -50), 150); // allow panning off edges
    posY = Math.min(Math.max(posY + sy, -50), 150);
    
    const posStr = `${posX.toFixed(1)}% ${posY.toFixed(1)}%`;
    layer.style.backgroundPosition = posStr;
    document.getElementById('hero-hidden-bgpos').value = posStr;
    
    // Reset start
    startX = e.clientX;
    startY = e.clientY;
  });


  addBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('hero-slide-id').value = '';
    document.getElementById('hero-modal-title').textContent = 'Add Hero Slide';
    layer.style.backgroundImage = 'none';
    posX = 50; posY = 50;
    document.getElementById('hero-hidden-bgpos').value = '50% 50%';
    document.getElementById('hero-hidden-bgsize').value = '100%';
    zoomSlider.value = 100;
    layer.style.backgroundSize = '100%';
    layer.style.backgroundPosition = '50% 50%';
    overlay.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => overlay.classList.add('hidden'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let slidesData = JSON.parse(localStorage.getItem('zz_hero_slides') || '[]');
    const id = document.getElementById('hero-slide-id').value;
    const newSlide = {
      id: id || `slide_${Date.now()}`,
      title: document.getElementById('hero-slide-title-input').value,
      subtitle: document.getElementById('hero-slide-subtitle').value,
      img: document.getElementById('hero-slide-img').value,
      size: document.getElementById('hero-hidden-bgsize').value,
      pos: document.getElementById('hero-hidden-bgpos').value
    };

    if (id) {
      const idx = slidesData.findIndex(s => s.id === id);
      if(idx > -1) slidesData[idx] = newSlide;
    } else {
      slidesData.push(newSlide);
    }
    localStorage.setItem('zz_hero_slides', JSON.stringify(slidesData));
    overlay.classList.add('hidden');
    renderHeroSlides();
  });

  renderHeroSlides();
}

// ---- Discount Manager ----
function initDiscountManager() {
  const applyBtn    = document.getElementById('apply-discount-btn');
  const removeBtn   = document.getElementById('remove-discounts-btn');
  const scopeInputs = document.querySelectorAll('input[name="d-scope"]');
  const catGroup    = document.getElementById('d-cat-group');
  const feedbackEl  = document.getElementById('discount-feedback-msg');

  if (!applyBtn) return;

  // --- Live active-discounts display ---
  function renderActiveDiscounts() {
    const display  = document.getElementById('active-discounts-list');
    const badge    = document.getElementById('discount-active-badge');
    const discounts = JSON.parse(localStorage.getItem('zz_discounts') || '{}');

    let html = '';
    let hasActive = false;

    // Store-wide discount
    if (discounts.store && discounts.store.active) {
      hasActive = true;
      const d     = discounts.store;
      const label = d.type === 'flat' ? `Rs. ${d.value.toLocaleString()} flat off each item` : `${d.value}% off each item`;
      html += `
        <div class="discount-active-item">
          <div>
            <span class="discount-scope-label">🌐 Whole Store</span>
            <span class="discount-value-label">${label}</span>
          </div>
          <button class="discount-remove-one-btn" data-scope="store">✕ Remove</button>
        </div>`;
    }

    // Per-category discounts
    const catDiscounts = discounts.categories || {};
    Object.keys(catDiscounts).forEach(cat => {
      const d = catDiscounts[cat];
      if (d && d.active) {
        hasActive = true;
        const label = d.type === 'flat' ? `Rs. ${d.value.toLocaleString()} flat off` : `${d.value}% off`;
        const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
        html += `
          <div class="discount-active-item">
            <div>
              <span class="discount-scope-label">📂 ${catName}</span>
              <span class="discount-value-label">${label}</span>
            </div>
            <button class="discount-remove-one-btn" data-scope="category" data-cat="${cat}">✕ Remove</button>
          </div>`;
      }
    });

    if (hasActive) {
      display.innerHTML = `<div class="discount-active-header">Active Discounts</div>${html}`;
      badge.style.display = 'block';
    } else {
      display.innerHTML = `<p style="color:#555;font-size:0.85rem;margin-bottom:4px;">No active discounts — prices show at full price.</p>`;
      badge.style.display = 'none';
    }

    // Attach per-item remove listeners
    document.querySelectorAll('.discount-remove-one-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = JSON.parse(localStorage.getItem('zz_discounts') || '{}');
        if (btn.dataset.scope === 'store') {
          delete d.store;
        } else {
          if (d.categories) delete d.categories[btn.dataset.cat];
        }
        localStorage.setItem('zz_discounts', JSON.stringify(d));
        renderActiveDiscounts();
        showFeedback('Discount removed.', false);
      });
    });
  }

  // --- Scope toggle: show/hide category selector ---
  scopeInputs.forEach(input => {
    input.addEventListener('change', () => {
      catGroup.style.display = input.value === 'category' ? 'block' : 'none';
    });
  });

  // --- Apply button ---
  applyBtn.addEventListener('click', () => {
    const scope = document.querySelector('input[name="d-scope"]:checked').value;
    const dType = document.getElementById('d-type').value;
    const dVal  = parseFloat(document.getElementById('d-value').value);

    if (isNaN(dVal) || dVal <= 0) {
      showFeedback('❌ Please enter a valid discount value.', true);
      return;
    }
    if (dType === 'percent' && dVal > 100) {
      showFeedback('❌ Percentage discount cannot exceed 100%.', true);
      return;
    }

    const discounts   = JSON.parse(localStorage.getItem('zz_discounts') || '{}');
    const discountObj = { type: dType, value: dVal, active: true };

    if (scope === 'store') {
      discounts.store = discountObj;
    } else {
      const cat = document.getElementById('d-category').value;
      if (!discounts.categories) discounts.categories = {};
      discounts.categories[cat] = discountObj;
    }

    localStorage.setItem('zz_discounts', JSON.stringify(discounts));
    renderActiveDiscounts();

    const targetLabel = scope === 'store' ? 'whole store' : document.getElementById('d-category').value;
    const valLabel    = dType === 'flat' ? `Rs. ${dVal.toLocaleString()} off` : `${dVal}% off`;
    showFeedback(`✅ Applied: ${valLabel} on ${targetLabel}. Refresh the storefront to see prices update.`, false);
    document.getElementById('d-value').value = '';
  });

  // --- Remove All button ---
  removeBtn.addEventListener('click', () => {
    if (confirm('Remove ALL active discounts from the store?')) {
      localStorage.removeItem('zz_discounts');
      renderActiveDiscounts();
      showFeedback('✅ All discounts removed.', false);
    }
  });

  function showFeedback(msg, isError) {
    feedbackEl.textContent = msg;
    feedbackEl.style.color = isError ? '#ff5b5b' : '#00d280';
    setTimeout(() => { feedbackEl.textContent = ''; }, 5000);
  }

  // Initial render
  renderActiveDiscounts();
}
