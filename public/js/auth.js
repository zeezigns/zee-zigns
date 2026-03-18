document.addEventListener('DOMContentLoaded', () => {
  initToggle();
  initForms();
});

function initToggle() {
  const toggleSignup = document.getElementById('toggle-signup');
  const toggleLogin = document.getElementById('toggle-login');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const card = document.getElementById('auth-card');
  const wrapper = document.querySelector('.forms-wrapper');

  function switchToSignup() {
    toggleLogin.classList.remove('active');
    toggleSignup.classList.add('active');
    loginForm.classList.remove('active-form');
    loginForm.classList.add('disabled-form');
    signupForm.classList.remove('disabled-form');
    signupForm.classList.add('active-form');
  }

  function switchToLogin() {
    toggleSignup.classList.remove('active');
    toggleLogin.classList.add('active');
    signupForm.classList.remove('active-form');
    signupForm.classList.add('disabled-form');
    loginForm.classList.remove('disabled-form');
    loginForm.classList.add('active-form');
  }

  toggleSignup.addEventListener('click', switchToSignup);
  toggleLogin.addEventListener('click', switchToLogin);
}

function initForms() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = signupForm.querySelector('button');
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');
    const errorMsg = document.getElementById('signup-error');
    
    // Reset/loading state
    errorMsg.textContent = '';
    text.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;

    const data = {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      address: document.getElementById('reg-address').value
    };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        window.location.href = '/account'; // Redirect to account dashboard
      } else {
        errorMsg.textContent = result.error || 'Signup failed.';
        text.classList.remove('hidden');
        loader.classList.add('hidden');
        btn.disabled = false;
      }
    } catch (err) {
      errorMsg.textContent = 'Server connection error.';
      text.classList.remove('hidden');
      loader.classList.add('hidden');
      btn.disabled = false;
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button');
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');
    const errorMsg = document.getElementById('login-error');
    
    errorMsg.textContent = '';
    text.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;

    const data = {
      email: document.getElementById('login-email').value,
      phone: document.getElementById('login-phone').value
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        // If there's a custom redirect intent, ideally we'd use it, otherwise go home
        window.location.href = '/'; 
      } else {
        errorMsg.textContent = result.error || 'Login failed.';
        text.classList.remove('hidden');
        loader.classList.add('hidden');
        btn.disabled = false;
      }
    } catch (err) {
      errorMsg.textContent = 'Server connection error.';
      text.classList.remove('hidden');
      loader.classList.add('hidden');
      btn.disabled = false;
    }
  });
}
