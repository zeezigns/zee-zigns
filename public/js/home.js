document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initSlider();
  initLocation();
  initProducts();
  initCart();
  checkSession();
  initModal();
});

// --- User Session ---
async function checkSession() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    const actionContainer = document.getElementById('header-right-actions');
    
    if (data.user) {
      actionContainer.innerHTML = `<a href="/account" class="user-email-link">${data.user.email}</a>`;
    } else {
      actionContainer.innerHTML = `<a href="/auth" class="btn-primary" id="auth-link">Login / Sign Up</a>`;
    }
  } catch (err) {
    console.error('Session check failed', err);
  }
}

// --- Header Scroll Effect ---
function initHeader() {
  const header = document.getElementById('main-header');
  const catNav = document.getElementById('category-nav');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Adjust category nav stickiness
    if (window.scrollY > 400 && window.innerWidth > 600) {
       // Offset slightly on scroll
    }
  });
}

// --- Hero Slider ---
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (index + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  document.getElementById('slider-next').addEventListener('click', nextSlide);
  document.getElementById('slider-prev').addEventListener('click', prevSlide);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Auto advance every 5s
  function startSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  document.getElementById('hero-slider').addEventListener('mouseenter', () => clearInterval(slideInterval));
  document.getElementById('hero-slider').addEventListener('mouseleave', startSlide);

  startSlide();
}

// --- Location Logic ---
function initLocation() {
  const selectBtn = document.getElementById('select-area-btn');
  const trackBtn = document.getElementById('track-location-btn');
  const dropdown = document.getElementById('location-dropdown');
  const areaListWrap = document.getElementById('area-list');
  const statusDiv = document.getElementById('location-status');

  const areas = [
    'Bahria Town', 'Baldia Town', 'Clifton', 'Defence (DHA)', 'FB Area', 
    'Gadap Town', 'Gulberg', 'Gulistan-e-Johar', 'Gulshan-e-Iqbal', 
    'Jamshed Town', 'Keamari', 'Korangi', 'Landhi', 'Liaquatabad', 
    'Lyari', 'Malir', 'Nazimabad', 'New Karachi', 'North Karachi', 
    'North Nazimabad', 'Orangi Town', 'PECHS', 'Saddar', 'Scheme 33', 
    'Shah Faisal Town', 'SITE Area', 'Surjani Town', 'Tariq Road'
  ].sort();

  areas.forEach(area => {
    const li = document.createElement('li');
    li.textContent = area;
    li.addEventListener('click', () => {
      selectBtn.innerHTML = `📍 ${area} ▾`;
      dropdown.classList.remove('open');
      statusDiv.textContent = `Selected location: ${area}`;
    });
    areaListWrap.appendChild(li);
  });

  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent document listener from immediately closing it
    dropdown.classList.toggle('open');
  });

  // Stop clicks inside dropdown from bubbling to document
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // Close dropdown if clicked outside
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  // Geolocation
  trackBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      statusDiv.textContent = 'Detecting location...';
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            statusDiv.textContent = 'Resolving area name...';
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await res.json();
            const area = data.address.suburb || data.address.village || data.address.neighbourhood || data.address.residential || data.address.city_district || 'Karachi Area';
            statusDiv.textContent = `📍 Area: ${area} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
            selectBtn.innerHTML = `📍 ${area} ▾`;
            dropdown.classList.remove('open');
          } catch(err) {
            statusDiv.textContent = `📍 Location detected: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            selectBtn.innerHTML = `📍 GPS Location ▾`;
          }
        },
        error => {
          statusDiv.textContent = '❌ Could not detect location. Please select an area manually.';
        }
      );
    } else {
      statusDiv.textContent = 'Geolocation not supported by browser.';
    }
  });
}

// --- Products Logic ---
const productsData = {
  burgers: [
    { id: 'b1', name: 'Classic AA Burger', price: 650, desc: 'Single smash patty, cheese, AA sauce, lettuce, tomato.', img: 'Classic Burger.jpg' },
    { id: 'b2', name: 'Double Smash Burger', price: 900, desc: 'Double beef patties, double cheese, caramelized onions.', img: 'Double Smash.jpg' },
    { id: 'b3', name: 'Crispy Chicken Burger', price: 700, desc: 'Crispy fried chicken thigh, spicy mayo, pickles.', img: 'Crispy Chicken.jpg' },
    { id: 'b4', name: 'Spicy Jalapeño Burger', price: 750, desc: 'Beef patty, jalapeños, spicy hot sauce, cheddar.', img: 'Spicy Jalapeno.jpg' },
    { id: 'b5', name: 'BBQ Bacon Stack', price: 1050, desc: 'Beef patty, beef bacon strips, BBQ sauce, onion rings.', img: 'Bacon Stack Burger.jpg' },
    { id: 'b6', name: 'Mushroom Swiss Burger', price: 850, desc: 'Beef patty, sautéed mushrooms, swiss cheese.', img: 'Mushroom Swiss Burger.jpg' }
  ],
  drinks: [
    { id: 'd1', name: 'Classic Cola', price: 150, desc: 'Ice cold classic cola.', img: 'Coke.jpg' },
    { id: 'd2', name: 'Lemon Crush', price: 200, desc: 'Fresh mint and lemon iced cooler.', img: 'Lemon Crush.jpg' },
    { id: 'd3', name: 'Mango Shake', price: 400, desc: 'Thick mango milkshake.', img: 'Mango Shake.jpg' },
    { id: 'd4', name: 'Chocolate Milkshake', price: 450, desc: 'Rich chocolate shake with whipped cream.', img: 'Chocolate Milkshake.jpg' }
  ],
  fries: [
    { id: 'f1', name: 'Regular Fries', price: 300, desc: 'Skin-on crispy salted fries.', img: 'Regular Fries.jpg' },
    { id: 'f2', name: 'Loaded Cheese Fries', price: 550, desc: 'Fries topped with melted cheese sauce and jalapeños.', img: 'Loaded Cheese Fries.jpg' },
    { id: 'f3', name: 'Spicy Masala Fries', price: 350, desc: 'Crispy fries tossed in our secret spicy masala.', img: 'Spicy Masala Fries.jpg' },
    { id: 'f4', name: 'Waffle Fries', price: 400, desc: 'Crispy waffle cut potatoes.', img: 'Waffle Fries.jpg' }
  ],
  combos: [
    { id: 'c1', name: 'Family Feast', price: 2800, desc: '4 burgers, 4 regular drinks, 2 large fries.', img: 'Family Feast (4 burgers, 4 drinks, 2 large fries).jpg' },
    { id: 'c2', name: 'Weekend Special', price: 1500, desc: '2 double smash burgers, 2 drinks, 1 loaded fry.', img: 'Weekend Special (2 double smash, 2 drinks, 1 loaded fry).jpg' }
  ],
  midnight: [
    { id: 'm1', name: 'Midnight Smash Deal', price: 999, desc: '2 classic burgers + 2 drinks. Available after 11PM.', img: 'Afternight deal.jpg' },
    { id: 'm2', name: 'After-Hours Special', price: 850, desc: '1 double smash, large fries. Available after 11PM.', img: 'Afternight deal.jpg' }
  ]
};

function initProducts() {
  const grid = document.getElementById('products-grid');
  const tabs = document.querySelectorAll('.tab-btn');
  
  function renderCategory(category) {
    grid.innerHTML = ''; // Clear current
    const items = productsData[category] || [];
    
    // Check if it's midnight
    const hour = new Date().getHours();
    const isMidnight = hour >= 23 || hour < 4;

    items.forEach((item, index) => {
      const isLocked = category === 'midnight' && !isMidnight;
      
      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <div class="product-img-wrapper" style="background-color: ${stringToColor(item.name)}">
          ${item.img ? `<img src="/images/${encodeURIComponent(item.img)}" alt="${item.name}" class="product-img" loading="lazy">` : ''}
          ${isLocked ? '<span class="locked-item" title="Available after 11 PM">🔒 11 PM</span>' : ''}
        </div>
        <div class="product-info">
          <h4 class="product-title">${item.name}</h4>
          <p class="product-desc">${item.desc}</p>
          <div class="product-footer">
            <span class="product-price">Rs. ${item.price}</span>
            <button class="add-btn" aria-label="Add to cart" tabindex="-1">+</button>
          </div>
        </div>
      `;
      
      if (!isLocked) {
        card.addEventListener('click', () => openModal(item, category));
      } else {
        card.style.opacity = '0.6'; // overrides animation start opacity
        card.style.animationFillMode = 'none';
        card.style.animation = 'none';
        card.style.opacity = '0.6';
        card.style.cursor = 'not-allowed';
      }

      // Stagger each card
      card.style.animationDelay = `${index * 0.06}s`;
      grid.appendChild(card);
    });
  }

  // Handle Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCategory(tab.dataset.category);
    });
  });

  // Initial render
  renderCategory('burgers');
}

// Generate slight color variation for placeholder image
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c + '22'; // slight transparency
}

// --- Modal Logic ---
let currentItem = null;
let currentQty = 1;

function openModal(item, category) {
  currentItem = item;
  currentQty = 1;
  document.getElementById('qty-value').textContent = currentQty;
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-description').textContent = item.desc;
  document.getElementById('modal-price').textContent = `Rs. ${item.price}`;
  const modalImg = document.getElementById('modal-image');
  if (item.img) {
    modalImg.style.backgroundImage = `url('/images/${encodeURIComponent(item.img)}')`;
    modalImg.style.backgroundSize = 'cover';
    modalImg.style.backgroundPosition = 'center';
  } else {
    modalImg.style.backgroundImage = 'none';
    modalImg.style.backgroundColor = stringToColor(item.name);
  }
  
  // Inject options based on category
  const optionsDiv = document.getElementById('modal-options');
  optionsDiv.innerHTML = '';
  
  if (category === 'burgers' || category === 'midnight') {
    optionsDiv.innerHTML = `
      <div class="option-group">
        <label>Spice Level</label>
        <select id="opt-spice">
          <option value="Mild">Mild</option>
          <option value="Medium" selected>Medium</option>
          <option value="Extra Hot">Extra Hot</option>
        </select>
      </div>
    `;
  } else if (category === 'drinks') {
    optionsDiv.innerHTML = `
      <div class="option-group">
        <label>Size</label>
        <select id="opt-size">
          <option value="Regular" selected>Regular</option>
          <option value="Large (+Rs. 100)">Large (+Rs. 100)</option>
        </select>
      </div>
      <div class="option-group">
        <label>Ice</label>
        <select id="opt-ice">
          <option value="Normal">Normal</option>
          <option value="Less Ice">Less Ice</option>
          <option value="No Ice">No Ice</option>
        </select>
      </div>
    `;
  }

  const overlay = document.getElementById('product-modal-overlay');
  overlay.classList.add('open');
}

function initModal() {
  const overlay = document.getElementById('product-modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const addBtn = document.getElementById('add-to-cart-btn');

  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  qtyMinus.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      document.getElementById('qty-value').textContent = currentQty;
    }
  });

  qtyPlus.addEventListener('click', () => {
    currentQty++;
    document.getElementById('qty-value').textContent = currentQty;
  });

  addBtn.addEventListener('click', () => {
    if (!currentItem) return;
    
    // Gather options
    const options = {};
    const spice = document.getElementById('opt-spice');
    if (spice) options.Spice = spice.value;
    const size = document.getElementById('opt-size');
    if (size) options.Size = size.value;
    const ice = document.getElementById('opt-ice');
    if (ice) options.Ice = ice.value;

    addToCart(currentItem, currentQty, options);
    overlay.classList.remove('open');
  });
}

// initModal moved to DOMContentLoaded
// --- Cart Logic ---
function initCart() {
  updateCartBadge();
}

function addToCart(item, qty, options) {
  let cart = JSON.parse(localStorage.getItem('aa_cart')) || [];
  
  // Create unique signature based on options
  const optionsStr = JSON.stringify(options);
  const existingIndex = cart.findIndex(c => c.id === item.id && JSON.stringify(c.options) === optionsStr);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      options: options
    });
  }
  
  localStorage.setItem('aa_cart', JSON.stringify(cart));
  updateCartBadge();
  animateCartIcon();
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('aa_cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalItems;
}

function animateCartIcon() {
  const cartBtn = document.getElementById('cart-btn');
  cartBtn.classList.remove('cart-bounce');
  void cartBtn.offsetWidth; // trigger reflow
  cartBtn.classList.add('cart-bounce');
}
