const RegistrationDB = (() => {
  const STORAGE_KEYS = {
    registrations: 'bbs_registrations',
    adminPassword: 'bbs_admin_password',
    adminAuth: 'bbs_admin_auth',
  };
  const DEFAULT_ADMIN_PASSWORD = 'admin123';
  let initialized = false;

  function getCourseCode(course) {
    const normalized = String(course || '').trim().toUpperCase();
    if (normalized === 'BCA') return 'BCA';
    if (normalized === 'BBA') return 'BBA';
    return 'GEN';
  }

  function generatePassword() {
    return Math.random().toString(36).slice(-8).toUpperCase();
  }

  function formatRegistration(data) {
    if (!data) return null;

    return {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  function readRegistrations() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.registrations);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Unable to read registrations from local storage.', error);
      return [];
    }
  }

  function saveRegistrations(registrations) {
    window.localStorage.setItem(STORAGE_KEYS.registrations, JSON.stringify(registrations));
  }

  function getAdminPassword() {
    const storedPassword = window.localStorage.getItem(STORAGE_KEYS.adminPassword);
    if (storedPassword) return storedPassword;

    window.localStorage.setItem(STORAGE_KEYS.adminPassword, DEFAULT_ADMIN_PASSWORD);
    return DEFAULT_ADMIN_PASSWORD;
  }

  function init() {
    if (initialized) return true;

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      getAdminPassword();
      initialized = true;
      return true;
    } catch (error) {
      console.warn('Local storage is not available.', error);
      return false;
    }
  }

  function isReady() {
    return init();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read photo file.'));
      reader.readAsDataURL(file);
    });
  }

  function allocateRegistrationId(course) {
    const courseCode = getCourseCode(course);
    const registrations = readRegistrations();
    const numbers = registrations
      .map((registration) => registration.id)
      .filter((id) => typeof id === 'string' && id.startsWith(courseCode))
      .map((id) => Number.parseInt(id.replace(courseCode, ''), 10))
      .filter((value) => Number.isFinite(value));

    const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `${courseCode}${String(nextNumber).padStart(3, '0')}`;
  }

  async function createRegistration(values, photoFile) {
    if (!isReady()) {
      throw new Error('Offline registration is not available in this browser.');
    }

    const registrationId = allocateRegistrationId(values.course);
    const password = generatePassword();
    const photoDataUrl = await readFileAsDataUrl(photoFile);

    const registration = {
      id: registrationId,
      password,
      name: values.name || '',
      mobile: values.mobile || '',
      fatherName: values.fatherName || '',
      fatherMobile: values.fatherMobile || '',
      state: values.state || '',
      pincode: values.pincode || '',
      district: values.district || '',
      landmark: values.landmark || '',
      address: values.address || '',
      course: values.course || '',
      board10: values.board10 || '',
      percentage10: values.percentage10 || '',
      board: values.board || '',
      percentage: values.percentage || '',
      hostel: values.hostel || '',
      bus: values.bus || '',
      photoDataUrl,
      photoUrl: photoDataUrl,
      createdAt: new Date().toISOString(),
    };

    const registrations = readRegistrations();
    registrations.unshift(registration);
    saveRegistrations(registrations);

    return registration;
  }

  async function getAllRegistrations() {
    if (!isReady()) return [];

    return readRegistrations()
      .map(formatRegistration)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function getRegistration(registrationId) {
    if (!isReady()) return null;

    const registration = readRegistrations().find((item) => item.id === registrationId);
    return registration ? formatRegistration(registration) : null;
  }

  async function deleteRegistration(registrationId) {
    if (!isReady()) return;

    const registrations = readRegistrations().filter((item) => item.id !== registrationId);
    saveRegistrations(registrations);
  }

  async function signInAdmin(password) {
    if (!isReady()) {
      throw new Error('Local storage is not available.');
    }

    if (String(password) !== getAdminPassword()) {
      throw new Error('Incorrect admin password.');
    }

    window.localStorage.setItem(STORAGE_KEYS.adminAuth, 'true');
  }

  async function signOutAdmin() {
    window.localStorage.removeItem(STORAGE_KEYS.adminAuth);
  }

  async function changeAdminPassword(currentPassword, newPassword) {
    if (!newPassword || !String(newPassword).trim()) {
      throw new Error('Please enter a new password.');
    }

    if (String(currentPassword) !== getAdminPassword()) {
      throw new Error('Current password is incorrect.');
    }

    window.localStorage.setItem(STORAGE_KEYS.adminPassword, String(newPassword).trim());
  }

  function onAuthStateChanged(callback) {
    if (!init()) {
      callback(null);
      return () => {};
    }

    const isSignedIn = window.localStorage.getItem(STORAGE_KEYS.adminAuth) === 'true';
    callback(isSignedIn ? { uid: 'local-admin' } : null);
    return () => {};
  }

  return {
    isReady,
    createRegistration,
    getAllRegistrations,
    getRegistration,
    deleteRegistration,
    signInAdmin,
    signOutAdmin,
    changeAdminPassword,
    onAuthStateChanged,
  };
})();

window.RegistrationDB = RegistrationDB;
