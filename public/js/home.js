document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initSlider();
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
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// --- Hero Slider ---
const HERO_SLIDES_VERSION = 2; // bump to reset stale localStorage slide cache
const defaultHeroSlides = [
  { id: 'slide1', title: 'Wear the Vibe.', subtitle: 'Custom streetwear designed for Gen-Z.', img: 'Butter Paper BG.png', size: 'cover', pos: '50% 50%' },
  { id: 'slide2', title: 'Dark Knight Collection', subtitle: 'Premium DC universe streetwear tees.', img: 'Batman Shirt Mockup.png', size: 'contain', pos: '50% 50%' },
  { id: 'slide3', title: 'Anime Drops', subtitle: 'Your favorite characters. On your chest.', img: 'Goku Shirt Mockup.png', size: 'contain', pos: '50% 50%' }
];

function initSlider() {
  const content = document.getElementById('slider-content');
  const dotsContainer = document.getElementById('slider-dots');
  
  if (!content || !dotsContainer) return;

  // Initialize from LocalStorage — reset if version is outdated
  let slidesData = JSON.parse(localStorage.getItem('zz_hero_slides'));
  const slidesVersion = parseInt(localStorage.getItem('zz_hero_slides_v') || '0');
  if (!slidesData || slidesData.length === 0 || slidesVersion < HERO_SLIDES_VERSION) {
    slidesData = defaultHeroSlides;
    localStorage.setItem('zz_hero_slides', JSON.stringify(slidesData));
    localStorage.setItem('zz_hero_slides_v', HERO_SLIDES_VERSION.toString());
  }

  content.innerHTML = '';
  dotsContainer.innerHTML = '';

  // Generate DOM
  slidesData.forEach((slide, index) => {
    // Generate slide
    const slideDiv = document.createElement('div');
    slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
    slideDiv.style.backgroundImage = `url('/images/${encodeURIComponent(slide.img)}')`;
    slideDiv.style.backgroundSize = slide.size || 'cover';
    slideDiv.style.backgroundPosition = slide.pos || 'center';
    slideDiv.style.backgroundRepeat = 'no-repeat';

    slideDiv.innerHTML = `
      <div class="slide-overlay">
        <h2>${slide.title}</h2>
        <p>${slide.subtitle}</p>
      </div>
    `;
    content.appendChild(slideDiv);

    // Generate dot
    const dotSpan = document.createElement('span');
    dotSpan.className = `dot ${index === 0 ? 'active' : ''}`;
    dotsContainer.appendChild(dotSpan);
  });

  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  const nextBtn = document.getElementById('slider-next');
  const prevBtn = document.getElementById('slider-prev');
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

  function startSlide() { slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000); }
  const slider = document.getElementById('hero-slider');
  slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
  slider.addEventListener('mouseleave', startSlide);
  startSlide();
}

// --- Products Data ---
const defaultProductsData = {
  anime: [
    {
      id: 'a1', name: 'Demon Slayer — Tanjiro', price: 2500,
      desc: 'Tanjiro Kamado breathing form graphic print on premium black cotton tee.',
      img: 'Demon Slayer Shirt Mockup.png'
    },
    {
      id: 'a2', name: 'Jujutsu Kaisen — Gojo', price: 2500,
      desc: 'Gojo Satoru "Hollow Purple" technique graphic on oversized streetwear tee.',
      img: 'Gojo Shirt Mockup.jpeg'
    },
    {
      id: 'a3', name: 'Attack on Titan — Eren', price: 2500,
      desc: 'Eren Yeager in his rumbling arc — Founding Titan power art.',
      img: 'Eren 2 Shirt Mockup.jpeg'
    },
    {
      id: 'a4', name: 'Dragon Ball Z — Goku Base', price: 2500,
      desc: 'Son Goku in his iconic base form stance — classic Dragon Ball Z art.',
      img: 'Goku Shirt Mockup.png'
    },
    {
      id: 'a5', name: 'Naruto — Itachi Uchiha', price: 2500,
      desc: 'Itachi Uchiha Mangekyo Sharingan art — Anbu Black Ops aesthetic.',
      img: 'Itachi Shirt Mockup.png'
    },
    {
      id: 'a6', name: 'Solo Levelling — Sung Jin Woo', price: 2500,
      desc: 'Shadow Monarch Sung Jin Woo — Shadow Army graphic print.',
      img: 'Solo Levelling Shirt Mockup.png'
    },
    {
      id: 'a7', name: 'One Piece — Luffy', price: 2500,
      desc: 'Monkey D. Luffy Gear 5 — Straw Hat Pirates banner tee.',
      img: 'Luffy Shirt Mockup.png'
    },
    {
      id: 'a8', name: 'Berserk — Guts', price: 2500,
      desc: 'Guts the Black Swordsman with Dragonslayer — Berserk dark graphic.',
      img: 'Berserk Shirt Mockup.png'
    },
    {
      id: 'a9', name: 'JJK — Itadori Yuji', price: 2500,
      desc: 'Itadori Yuji in battle pose — Jujutsu Kaisen graphic print.',
      img: 'Itadori Shirt Mockup.png'
    },
    {
      id: 'a10', name: 'JJK — Sukuna', price: 2500,
      desc: 'Ryomen Sukuna, King of Curses — four eyes, four arms, full power.',
      img: 'Sukuna Shirt Mockup.png'
    },
    {
      id: 'a11', name: 'JJK — Maki Zenin', price: 2500,
      desc: 'Maki Zenin — Zero cursed energy, unlimited strength graphic.',
      img: 'Maki Shirt Mockup.png'
    },
    {
      id: 'a12', name: 'Naruto — One Piece Crossover', price: 2500,
      desc: 'Classic Naruto orange jumpsuit art — retro ninja design.',
      img: 'Simple Naruto Shirt Mockup.png'
    },
    {
      id: 'a13', name: 'Naruto — Yellow Flash', price: 2500,
      desc: 'Minato Namikaze, the Yellow Flash of the Leaf — Rasengan pose.',
      img: 'Yellow Naruto Shirt Mockup.png'
    },
    {
      id: 'a14', name: 'Naruto — White Snow', price: 2500,
      desc: 'Anbu-style Naruto in white — clean, rare aesthetic print.',
      img: 'White Naruto Shirt Mockup.png'
    },
    {
      id: 'a15', name: 'Naruto — Sharingan Eyes', price: 2500,
      desc: 'Three Uchiha Sharingan eyes pattern — Obito, Sasuke, Itachi.',
      img: 'Sharingans Shirt Mockup.jpeg'
    },
    {
      id: 'a16', name: 'Naruto — Madara Uchiha', price: 2500,
      desc: 'Madara Uchiha — Eternal Mangekyo Sharingan awakened art.',
      img: 'Madara Shirt Mockup.png'
    },
    {
      id: 'a17', name: 'One Piece — Crew Art', price: 2500,
      desc: 'Thousand Sunny crew graphic — the full Straw Hat Pirates lineup.',
      img: 'One Piece Shirt Mockup.png'
    },
    {
      id: 'a18', name: 'Attack on Titan — Eren V2', price: 2500,
      desc: 'Eren Jaeger Survey Corps titan shifter alternate art.',
      img: 'Eren Shirt Mockup.jpeg'
    }
  ],
  marvel: [
    {
      id: 'm1', name: 'Deadpool — Maximum Effort', price: 2500,
      desc: 'Wade Wilson — Deadpool mercenary with katanas graphic. Maximum effort.',
      img: 'Deadpool Shirt Mockup.png'
    },
    {
      id: 'm2', name: 'Spider-Gwen', price: 2500,
      desc: 'Gwen Stacy Spider-Woman — Ghost Spider neon aesthetic streetwear.',
      img: 'Spiderman-Gwen Shirt Mockup.png'
    },
    {
      id: 'm3', name: 'Wolverine — Adamantium', price: 2500,
      desc: 'Logan in his classic X-Men yellow suit — adamantium claws extended.',
      img: 'Wolverine Shirt Mockup.png'
    }
  ],
  dc: [
    {
      id: 'd1', name: 'Batman — Dark Knight', price: 2500,
      desc: 'The Caped Crusader — Gotham City vigilante premium dark graphic tee.',
      img: 'Batman Shirt Mockup.png'
    }
  ],
  hogwarts: [
    {
      id: 'h1', name: 'Hogwarts School Crest', price: 2500,
      desc: 'Official Hogwarts School of Witchcraft & Wizardry all-house crest design.',
      img: 'Hogwarts Shirt Mockup.png'
    },
    {
      id: 'h2', name: 'Gryffindor — House of Courage', price: 2500,
      desc: 'Gryffindor house crest — brave hearts, lion heart, Dumbledore\'s Army.',
      img: 'Gryffindor Shirt Mockup.png'
    },
    {
      id: 'h3', name: 'Slytherin — House of Ambition', price: 2500,
      desc: 'Slytherin house crest — pure blood, cunning, the Chamber of Secrets.',
      img: 'Slytherin Shirt Mockup.png'
    },
    {
      id: 'h4', name: 'Ravenclaw — House of Wisdom', price: 2500,
      desc: 'Ravenclaw house crest — wit beyond measure is man\'s greatest treasure.',
      img: 'Ravenclaw Shirt Mockup.png'
    },
    {
      id: 'h5', name: 'Hufflepuff — House of Loyalty', price: 2500,
      desc: 'Hufflepuff house crest — hard work, patience, loyalty, fair play.',
      img: 'Hufflepuff Shirt Mockup.png'
    }
  ],
  cars: [
    {
      id: 'c1', name: 'BMW M-Series', price: 2500,
      desc: 'BMW M Performance badge / vehicle art — for the car enthusiast who wears their passion.',
      img: 'BMW Shirt Mockup.png'
    },
    {
      id: 'c2', name: 'Lamborghini — Raging Bull', price: 2500,
      desc: 'Lamborghini Aventador / Huracan bull graphic — supercar streetwear for real ones.',
      img: 'Lamborghini Shirt Mockup.png'
    }
  ],
  graphics: [
    {
      id: 'g1', name: 'Cat Graphic — Street Kitty', price: 2500,
      desc: 'Aesthetic cat illustration — chill, minimalist, perfect for any vibe.',
      img: 'Cat-Graphic Shirt Mockup.png'
    }
  ]
};

// Initialize localStorage DB if empty
let productsData = JSON.parse(localStorage.getItem('zz_all_products'));
if (!productsData || Object.keys(productsData).length === 0) {
  productsData = defaultProductsData;
  localStorage.setItem('zz_all_products', JSON.stringify(productsData));
}

// Ensure custom items from admin manager are merged into the main catalog if they exist
const customItems = JSON.parse(localStorage.getItem('zz_custom_items') || '[]');
if (customItems.length > 0) {
  customItems.forEach(item => {
    // If it doesn't already exist in the base category, push it
    const catArray = productsData[item.category] || [];
    if (!catArray.find(i => i.id === item.id)) {
      catArray.push(item);
      productsData[item.category] = catArray;
    }
  });
  // Clear the bridge storage and permanently save to master catalog
  localStorage.removeItem('zz_custom_items');
  localStorage.setItem('zz_all_products', JSON.stringify(productsData));
}

// --- Discount Pricing Helper ---
let currentCategory = 'anime'; // tracks the active category for modal pricing

/**
 * Returns the effective price for an item, given the active discount config.
 * Category-specific discount takes priority over store-wide.
 * @returns {{ price: number, original: number|null, badge: string|null }}
 */
function getDiscountedPrice(basePrice, category) {
  const discounts = JSON.parse(localStorage.getItem('zz_discounts') || '{}');
  const catD = discounts.categories && discounts.categories[category];
  const storeD = discounts.store;
  // Category wins over store-wide
  const active = (catD && catD.active) ? catD : (storeD && storeD.active) ? storeD : null;
  if (!active) return { price: basePrice, original: null, badge: null };

  let discounted;
  let badge;
  if (active.type === 'flat') {
    discounted = Math.max(0, basePrice - active.value);
    badge = `Rs. ${active.value.toLocaleString()} OFF`;
  } else {
    discounted = Math.round(basePrice * (1 - active.value / 100));
    badge = `${active.value}% OFF`;
  }
  return { price: discounted, original: basePrice, badge };
}

function initProducts() {
  const grid = document.getElementById('products-grid');
  const tabs = document.querySelectorAll('.tab-btn');

  function renderCategory(category) {
    currentCategory = category; // track so modal knows current category
    grid.innerHTML = '';
    const items = productsData[category] || [];

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">No items in this category yet.</div>`;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';

      // Apply discount pricing
      const { price, original, badge } = getDiscountedPrice(item.price, category);
      const priceHtml = original
        ? `<div class="price-wrapper">
             <span class="price-original">Rs. ${original.toLocaleString()}</span>
             <span class="price-discounted">Rs. ${price.toLocaleString()}</span>
           </div>`
        : `<span class="product-price">Rs. ${price.toLocaleString()}</span>`;
      const badgeHtml = badge
        ? `<span class="discount-badge">${badge}</span>`
        : '';

      card.innerHTML = `
        <div class="product-img-wrapper">
          ${badgeHtml}
          ${item.img ? `<img src="/images/${encodeURIComponent(item.img)}" alt="${item.name}" class="product-img" loading="lazy">` : ''}
        </div>
        <div class="product-info">
          <h4 class="product-title">${item.name}</h4>
          <p class="product-desc">${item.desc}</p>
          <div class="product-footer">
            ${priceHtml}
            <button class="add-btn" aria-label="Add ${item.name} to cart">+</button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(item, category));
      card.style.animationDelay = `${index * 0.05}s`;
      grid.appendChild(card);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCategory(tab.dataset.category);
    });
  });

  renderCategory('anime');
}

// --- Modal Logic ---
let currentItem = null;
let currentQty = 1;

function openModal(item, category) {
  currentQty = 1;
  document.getElementById('qty-value').textContent = currentQty;
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-description').textContent = item.desc;

  // Compute discounted price for this item
  const { price, original, badge } = getDiscountedPrice(item.price, category || currentCategory);
  const modalPriceEl = document.getElementById('modal-price');
  if (original) {
    modalPriceEl.innerHTML = `
      <span class="modal-price-original">Rs. ${original.toLocaleString()}</span>
      Rs. ${price.toLocaleString()}`;
  } else {
    modalPriceEl.textContent = `Rs. ${price.toLocaleString()}`;
  }

  // Clone item with effective (discounted) price so cart stores the sale price
  currentItem = { ...item, price };

  const modalImg = document.getElementById('modal-image');
  if (item.img) {
    modalImg.style.backgroundImage = `url('/images/${encodeURIComponent(item.img)}')`;
    modalImg.style.backgroundSize = 'contain';
    modalImg.style.backgroundRepeat = 'no-repeat';
    modalImg.style.backgroundPosition = 'center';
    modalImg.style.backgroundColor = 'rgba(0,0,0,0.6)';
  }

  // Size and Color options
  document.getElementById('modal-options').innerHTML = `
    <div class="option-group">
      <label>Size</label>
      <select id="opt-size">
        <option value="S">Small (S)</option>
        <option value="M" selected>Medium (M)</option>
        <option value="L">Large (L)</option>
        <option value="XL">Extra Large (XL)</option>
        <option value="XXL">Double XL (XXL)</option>
      </select>
    </div>
    <div class="option-group">
      <label>Color</label>
      <select id="opt-color">
        <option value="Black" selected>Black</option>
        <option value="White">White</option>
      </select>
    </div>
  `;

  document.getElementById('product-modal-overlay').classList.add('open');
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
    const options = {};
    const size = document.getElementById('opt-size');
    if (size) options.Size = size.value;
    const color = document.getElementById('opt-color');
    if (color) options.Color = color.value;

    addToCart(currentItem, currentQty, options);
    overlay.classList.remove('open');

    // Show mini toast
    showToast(`${currentItem.name} added to cart!`);
  });
}

// --- Cart Logic ---
function initCart() {
  updateCartBadge();
}

function addToCart(item, qty, options) {
  let cart = JSON.parse(localStorage.getItem('zz_cart')) || [];
  const optionsStr = JSON.stringify(options);
  const existingIndex = cart.findIndex(c => c.id === item.id && JSON.stringify(c.options) === optionsStr);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, quantity: qty, options });
  }

  localStorage.setItem('zz_cart', JSON.stringify(cart));
  updateCartBadge();
  animateCartIcon();
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('zz_cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = totalItems;
}

function animateCartIcon() {
  const cartBtn = document.getElementById('cart-btn');
  if (!cartBtn) return;
  cartBtn.classList.remove('cart-bounce');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-bounce');
}

// --- Toast ---
function showToast(msg) {
  let toast = document.getElementById('zz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'zz-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
