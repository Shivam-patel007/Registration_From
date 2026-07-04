const form = document.getElementById('registrationForm');
const submitButton = document.getElementById('submitButton');
const statusMessage = document.getElementById('status');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setStatus(message, isError = false) {
  statusMessage.classList.toggle('is-error', isError);
  statusMessage.classList.toggle('is-success', !isError && Boolean(message));
  statusMessage.textContent = message;
}

function showSuccessMessage(credentials) {
  statusMessage.classList.remove('is-error');
  statusMessage.classList.add('is-success');
  statusMessage.innerHTML = `
    <strong>Registration submitted successfully.</strong><br><br>
    Registration ID: <strong>${escapeHtml(credentials.id)}</strong><br>
    Password: <strong>${escapeHtml(credentials.password)}</strong><br><br>
    <span class="note">Please save these details for your records.</span>
  `;
}

function updatePhotoPreview(file) {
  photoPreview.innerHTML = '';

  if (!file) {
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-placeholder';
    placeholder.textContent = 'Preview will appear here';
    photoPreview.appendChild(placeholder);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = document.createElement('img');
    image.src = reader.result;
    image.alt = 'Uploaded photo preview';
    photoPreview.appendChild(image);
  };
  reader.readAsDataURL(file);
}

function getFormValues() {
  const fields = [
    'name', 'mobile', 'fatherName', 'fatherMobile', 'state', 'pincode',
    'district', 'landmark', 'address', 'course', 'board10', 'percentage10',
    'board', 'percentage', 'hostel', 'bus',
  ];

  return fields.reduce((values, id) => {
    values[id] = document.getElementById(id).value.trim();
    return values;
  }, {});
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!window.RegistrationDB?.isReady()) {
    setStatus('Online registration is not configured yet. Please contact the institute.', true);
    return;
  }

  submitButton.disabled = true;
  setStatus('Submitting your registration...');

  try {
    const photoFile = photoInput.files[0];
    if (!photoFile) {
      throw new Error('Please upload a photo before submitting.');
    }

    const values = getFormValues();
    const registration = await window.RegistrationDB.createRegistration(values, photoFile);

    showSuccessMessage(registration);
    form.reset();
    updatePhotoPreview(null);
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Something went wrong. Please try again.', true);
    submitButton.disabled = false;
  }
});

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];

  if (file && file.size > MAX_PHOTO_SIZE) {
    setStatus('Photo must be 2 MB or smaller.', true);
    photoInput.value = '';
    updatePhotoPreview(null);
    return;
  }

  updatePhotoPreview(file);
  if (statusMessage.classList.contains('is-error')) {
    setStatus('');
  }
});

updatePhotoPreview(null);
