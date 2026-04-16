let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  checkSessionAndLoad();
  initLogout();
  initEditActions();
});

async function checkSessionAndLoad() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    
    if (data.user) {
      currentUser = data.user;
      populateDetails();
      fetchOrders();
    } else {
      window.location.href = '/auth';
    }
  } catch (err) {
    console.error('Session check failed', err);
    window.location.href = '/auth';
  }
}

function populateDetails() {
  document.getElementById('display-email').textContent = currentUser.email;
  
  document.getElementById('display-name').textContent = currentUser.name;
  document.getElementById('input-name').value = currentUser.name;
  
  document.getElementById('display-phone').textContent = currentUser.phone;
  document.getElementById('input-phone').value = currentUser.phone;
  
  document.getElementById('display-address').textContent = currentUser.address;
  document.getElementById('input-address').value = currentUser.address;
}

function initLogout() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  });
}

// Inline Editing Logic
function initEditActions() {
  const editableRows = document.querySelectorAll('.editable-row');
  
  editableRows.forEach(row => {
    const editBtn = row.querySelector('.edit-btn');
    const saveBtn = row.querySelector('.save-btn');
    const cancelBtn = row.querySelector('.cancel-btn');
    
    const displayVal = row.querySelector('.detail-value');
    const inputField = row.querySelector('.detail-input');
    const saveActions = row.querySelector('.save-actions');
    
    const fieldType = row.dataset.field;

    editBtn.addEventListener('click', () => {
      // Toggle to edit mode
      displayVal.classList.add('hidden');
      inputField.classList.remove('hidden');
      editBtn.classList.add('hidden');
      saveActions.classList.remove('hidden');
      inputField.focus();
    });

    cancelBtn.addEventListener('click', () => {
      // Revert to view mode without saving
      inputField.value = currentUser[fieldType]; // reset value
      hideEditMode();
    });

    saveBtn.addEventListener('click', async () => {
      const newVal = inputField.value.trim();
      if (!newVal) {
        showToast('Field cannot be empty', 'error');
        return;
      }
      
      // Optistic update
      displayVal.textContent = newVal;
      hideEditMode();
      
      // Gather payload
      const payload = {
        name: document.getElementById('input-name').value,
        phone: document.getElementById('input-phone').value,
        address: document.getElementById('input-address').value
      };
      
      try {
        const res = await fetch('/api/account', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (res.ok && result.success) {
          currentUser = result.user; // update local ref
          showToast('Changes saved!', 'success');
        } else {
          showToast(result.error || 'Failed to update', 'error');
          // Revert on failure
          populateDetails();
        }
      } catch (err) {
        showToast('Server error', 'error');
        populateDetails();
      }
    });

    function hideEditMode() {
      inputField.classList.add('hidden');
      displayVal.classList.remove('hidden');
      saveActions.classList.add('hidden');
      editBtn.classList.remove('hidden');
    }
  });
}

// Orders fetching
async function fetchOrders() {
  const container = document.getElementById('orders-container');
  
  try {
    const res = await fetch('/api/orders/mine');
    const data = await res.json();
    
    if (res.ok && data.orders) {
      renderOrders(data.orders);
    } else {
      container.innerHTML = `<div class="empty-orders">Could not load orders.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-orders">Server connection error.</div>`;
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  
  if (orders.length === 0) {
    container.innerHTML = `<div class="empty-orders">No orders yet — go place your first order!</div>`;
    return;
  }
  
  container.innerHTML = ''; // clear skeleton
  
  orders.forEach(order => {
    const items = JSON.parse(order.items);
    // Summarize items
    const summaryText = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    
    const dateStr = new Date(order.created_at).toLocaleDateString('en-PK', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    
    const statusClass = order.status.split(' ')[0].toLowerCase(); // E.g., pending, preparing, cancelled

    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="order-header">
        <span class="order-number">#${order.order_number}</span>
        <span class="order-date">${dateStr}</span>
      </div>
      <div class="order-items">
        ${summaryText}
      </div>
      <div class="order-footer">
        <span class="order-total">Rs. ${parseFloat(order.total_price).toLocaleString()}</span>
        <span class="order-status status-${statusClass}">${order.status}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Toast Notification
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show toast-${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
