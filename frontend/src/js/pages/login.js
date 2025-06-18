import { login } from '../services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    const username = form.username.value;
    const password = form.password.value;
    try {
      const data = await login({ username, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.email);
      window.location.href = '/dashboard.html';
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });
});
