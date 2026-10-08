// Student Signup Handling
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const alertContainer = document.getElementById('alertContainer');
  const fileInput = document.getElementById('aadhaar');
  const fileFeedback = document.getElementById('fileValidationFeedback');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('togglePasswordIcon');
  const submitBtn = document.getElementById('submitBtn');

  // Toggle Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    toggleIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  // Client-side File Validation on change
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        fileInput.classList.add('is-invalid');
        fileFeedback.classList.remove('d-none');
        fileFeedback.textContent = 'File validation error: Uploaded document must be a PDF.';
      } else {
        fileInput.classList.remove('is-invalid');
        fileFeedback.classList.add('d-none');
      }
    }
  });

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.className = 'mb-4 d-none';
    alertContainer.innerHTML = '';

    // HTML5 validation
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    // Verify PDF file selection
    const file = fileInput.files[0];
    if (!file) {
      fileInput.classList.add('is-invalid');
      fileFeedback.classList.remove('d-none');
      fileFeedback.textContent = 'Please select your Aadhaar PDF document.';
      return;
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      fileInput.classList.add('is-invalid');
      fileFeedback.classList.remove('d-none');
      fileFeedback.textContent = 'File validation error: Uploaded document must be a PDF.';
      return;
    }

    // Collect Selected Interests
    const selectedInterests = [];
    document.querySelectorAll('.interest-checkbox:checked').forEach(cb => {
      selectedInterests.push(cb.value);
    });

    // Gather Form Data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: passwordInput.value,
      dob: document.getElementById('dob').value,
      gender: document.querySelector('input[name="gender"]:checked')?.value || 'Other',
      qualification: document.getElementById('qualification').value,
      interests: selectedInterests,
      class: document.getElementById('class').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      marks: document.getElementById('marks').value
    };

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registering...';

    try {
      const res = await API.register(formData, file);

      // Show success
      alertContainer.className = 'alert-custom-success mb-4';
      alertContainer.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${res.message || 'Registration successful! Redirecting to login...'}`;

      form.reset();
      form.classList.remove('was-validated');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1800);
    } catch (err) {
      // Display error - ensures EXACT error message "This email is already registered."
      alertContainer.className = 'alert-custom-error mb-4';
      alertContainer.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> ${err.message || 'Registration failed.'}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Register Student Account';
    }
  });
});
