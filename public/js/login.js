// Single Login & Forgot Password Handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const toggleBtn = document.getElementById('toggleLoginPassword');
  const toggleIcon = document.getElementById('toggleLoginPasswordIcon');
  const loginBtn = document.getElementById('loginBtn');

  // Forgot password elements
  const forgotForm = document.getElementById('forgotForm');
  const forgotAlert = document.getElementById('forgotAlert');
  const forgotEmail = document.getElementById('forgotEmail');
  const forgotNewPass = document.getElementById('forgotNewPassword');
  const forgotConfirmPass = document.getElementById('forgotConfirmPassword');
  const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');

  // Demo credentials fill buttons
  document.getElementById('fillAdmin')?.addEventListener('click', (e) => {
    e.preventDefault();
    emailInput.value = 'admin@gmail.com';
    passwordInput.value = 'admin123';
  });

  document.getElementById('fillStudent')?.addEventListener('click', (e) => {
    e.preventDefault();
    emailInput.value = 'aarav.sharma@example.com';
    passwordInput.value = 'password123';
  });

  // Toggle Password
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    toggleIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  // Single Login Form Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.className = 'mb-3 d-none';
    loginAlert.innerHTML = '';

    if (!loginForm.checkValidity()) {
      loginForm.classList.add('was-validated');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';

    try {
      const res = await API.login(email, password);

      loginAlert.className = 'alert-custom-success mb-3';
      loginAlert.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> Login successful! Redirecting to ${res.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}...`;

      setTimeout(() => {
        if (res.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'student-dashboard.html';
        }
      }, 700);
    } catch (err) {
      loginAlert.className = 'alert-custom-error mb-3';
      loginAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> ${err.message || 'Login failed.'}`;
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Sign In';
    }
  });

  // Forgot Password Submit
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    forgotAlert.className = 'mb-3 d-none';
    forgotAlert.innerHTML = '';

    const email = forgotEmail.value.trim();
    const newPass = forgotNewPass.value;
    const confirmPass = forgotConfirmPass.value;

    if (!email || !newPass) {
      forgotAlert.className = 'alert-custom-error mb-3';
      forgotAlert.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Please provide all required fields.';
      return;
    }

    if (newPass !== confirmPass) {
      forgotAlert.className = 'alert-custom-error mb-3';
      forgotAlert.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Passwords do not match.';
      return;
    }

    forgotSubmitBtn.disabled = true;
    forgotSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

    try {
      const res = await API.forgotPassword(email, newPass);
      forgotAlert.className = 'alert-custom-success mb-3';
      forgotAlert.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${res.message || 'Password updated successfully!'}`;
      
      // Prefill login input
      emailInput.value = email;
      passwordInput.value = newPass;

      setTimeout(() => {
        const modalElement = document.getElementById('forgotPasswordModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        forgotForm.reset();
        forgotAlert.className = 'mb-3 d-none';
      }, 1500);
    } catch (err) {
      forgotAlert.className = 'alert-custom-error mb-3';
      forgotAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> ${err.message || 'Failed to update password.'}`;
    } finally {
      forgotSubmitBtn.disabled = false;
      forgotSubmitBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Update Password';
    }
  });
});
