const loginCard = document.getElementById('loginCard');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('adminLoginForm');
const loginStatus = document.getElementById('loginStatus');
const logoutButton = document.getElementById('logoutButton');
const registrationsList = document.getElementById('registrationsList');
const showChangePasswordButton = document.getElementById('showChangePasswordButton');
const passwordChangePanel = document.getElementById('passwordChangePanel');
const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordStatus = document.getElementById('changePasswordStatus');

let cachedRegistrations = [];

function setLoginStatus(message, isError = false) {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#b91c1c' : '#111827';
}

async function renderRegistrations() {
  registrationsList.innerHTML = '<div class="empty-state">Loading registrations...</div>';

  try {
    cachedRegistrations = await window.RegistrationDB.getAllRegistrations();
  } catch (error) {
    console.error(error);
    registrationsList.innerHTML = '<div class="empty-state">Unable to load registrations. Please refresh.</div>';
    return;
  }

  registrationsList.innerHTML = '';

  if (!cachedRegistrations.length) {
    registrationsList.innerHTML = '<div class="empty-state">No registrations yet.</div>';
    return;
  }

  cachedRegistrations.forEach((student) => {
    const card = document.createElement('article');
    card.className = 'registration-card';
    const dateStr = new Date(student.createdAt).toLocaleString();

    card.innerHTML = `
      <h3>${student.name || 'Unknown'}</h3>
      <div class="registration-meta">
        <div><strong>ID:</strong> ${student.id}</div>
        <div><strong>Mobile:</strong> ${student.mobile || '—'}</div>
        <div><strong>Course:</strong> ${student.course || '—'}</div>
        <div><strong>Submitted:</strong> ${dateStr}</div>
      </div>
      <div class="registration-actions">
        <button type="button" class="download-pdf-button" data-id="${student.id}" data-name="${student.name || ''}">Download PDF</button>
        <button type="button" class="view-pdf-button" data-id="${student.id}">View PDF</button>
        <button type="button" class="danger-button" data-id="${student.id}">Delete</button>
      </div>
    `;

    registrationsList.appendChild(card);
  });

  document.querySelectorAll('.download-pdf-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await generateAndDownloadPDF(btn.dataset.id, btn.dataset.name);
    });
  });

  document.querySelectorAll('.view-pdf-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPdfPreview(btn.dataset.id);
    });
  });

  document.querySelectorAll('.danger-button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this registration?')) return;

      try {
        await window.RegistrationDB.deleteRegistration(btn.dataset.id);
        await renderRegistrations();
      } catch (error) {
        console.error(error);
        alert('Unable to delete this registration.');
      }
    });
  });
}

function showDashboard() {
  loginCard.classList.add('hidden');
  dashboard.classList.remove('hidden');
  renderRegistrations();
}

function showLogin() {
  loginCard.classList.remove('hidden');
  dashboard.classList.add('hidden');
  setLoginStatus('');
  if (changePasswordStatus) changePasswordStatus.textContent = '';
  if (passwordChangePanel) passwordChangePanel.classList.add('hidden');
  if (showChangePasswordButton) showChangePasswordButton.textContent = 'Change Password';
}

async function getStudent(registrationId) {
  let student = cachedRegistrations.find((item) => item.id === registrationId);
  if (!student) {
    student = await window.RegistrationDB.getRegistration(registrationId);
  }
  return student;
}

async function generateAndDownloadPDF(registrationId, studentName) {
  const student = await getStudent(registrationId);

  if (!student) {
    alert('Student record not found');
    return;
  }

  if (!window.PdfGenerator) {
    alert('PDF generator is not loaded. Please refresh the page.');
    return;
  }

  const formData = window.PdfGenerator.studentToFormData(student);
  const fileName = `${student.id}-${(studentName || 'student').replace(/\s+/g, '_')}-Assessment-Form.pdf`;

  try {
    await window.PdfGenerator.generateAssessmentPdf(formData, fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
}

async function openPdfPreview(registrationId) {
  const student = await getStudent(registrationId);

  if (!student) {
    alert('Student record not found');
    return;
  }

  if (!window.PdfGenerator) {
    alert('PDF generator is not loaded. Please refresh the page.');
    return;
  }

  sessionStorage.setItem('adminPdfPreviewData', JSON.stringify(window.PdfGenerator.studentToFormData(student)));
  window.location.href = 'pdf-preview.html';
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!window.RegistrationDB?.isReady()) {
      setLoginStatus('Cloud database is not configured. See README.md for setup.', true);
      return;
    }

    const password = document.getElementById('sirPassword').value;
    setLoginStatus('Signing in...');

    try {
      await window.RegistrationDB.signInAdmin(password);
      showDashboard();
    } catch (error) {
      console.error(error);
      setLoginStatus('Incorrect admin password.', true);
    }
  });
}

if (showChangePasswordButton) {
  showChangePasswordButton.addEventListener('click', () => {
    const isHidden = passwordChangePanel.classList.contains('hidden');
    if (isHidden) {
      passwordChangePanel.classList.remove('hidden');
      showChangePasswordButton.textContent = 'Hide Change Password';
    } else {
      passwordChangePanel.classList.add('hidden');
      showChangePasswordButton.textContent = 'Change Password';
    }
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    changePasswordStatus.textContent = '';
    changePasswordStatus.style.color = '#111827';

    if (!newPassword.trim()) {
      changePasswordStatus.textContent = 'Please enter a new password.';
      changePasswordStatus.style.color = '#b91c1c';
      return;
    }

    if (newPassword !== confirmPassword) {
      changePasswordStatus.textContent = 'The new passwords do not match.';
      changePasswordStatus.style.color = '#b91c1c';
      return;
    }

    try {
      await window.RegistrationDB.changeAdminPassword(currentPassword, newPassword);
      changePasswordForm.reset();
      passwordChangePanel.classList.add('hidden');
      showChangePasswordButton.textContent = 'Change Password';
      changePasswordStatus.textContent = 'Password updated successfully.';
      changePasswordStatus.style.color = '#15803d';
    } catch (error) {
      console.error(error);
      changePasswordStatus.textContent = 'Unable to update password. Check your current password.';
      changePasswordStatus.style.color = '#b91c1c';
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await window.RegistrationDB.signOutAdmin();
    document.getElementById('sirPassword').value = '';
    changePasswordForm.reset();
    showLogin();
  });
}

if (window.RegistrationDB?.isReady()) {
  window.RegistrationDB.onAuthStateChanged((user) => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });
} else {
  setLoginStatus('Local storage is ready. You can sign in with the admin password.', true);
  showLogin();
}
