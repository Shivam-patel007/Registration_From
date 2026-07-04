const RegistrationDB = (() => {
  const STORAGE_KEYS = {
    adminToken: "bbs_admin_token",
  };

  let initialized = false;

  function getAdminToken() {
    return window.sessionStorage.getItem(STORAGE_KEYS.adminToken);
  }

  function setAdminToken(token) {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEYS.adminToken, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.adminToken);
    }
  }

  async function apiRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const token = getAdminToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload.error || "Request failed.");
    }

    return payload;
  }

  function init() {
    if (initialized) return true;

    if (typeof window === "undefined" || !window.fetch) {
      return false;
    }

    initialized = true;
    return true;
  }

  function isReady() {
    return init();
  }

  async function createRegistration(values, photoFile) {
    if (!isReady()) {
      throw new Error("Online registration is not available in this browser.");
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("photo", photoFile);

    return apiRequest("/api/registrations", {
      method: "POST",
      body: formData,
    });
  }

  async function getAllRegistrations() {
    if (!isReady()) return [];
    return apiRequest("/api/registrations");
  }

  async function getRegistration(registrationId) {
    if (!isReady()) return null;

    try {
      return await apiRequest(`/api/registrations/${encodeURIComponent(registrationId)}`);
    } catch (error) {
      if (error.message === "Registration not found.") {
        return null;
      }
      throw error;
    }
  }

  async function deleteRegistration(registrationId) {
    if (!isReady()) return;

    await apiRequest(`/api/registrations/${encodeURIComponent(registrationId)}`, {
      method: "DELETE",
    });
  }

  async function signInAdmin(password) {
    if (!isReady()) {
      throw new Error("Server connection is not available.");
    }

    const session = await apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    setAdminToken(session.token);
  }

  async function signOutAdmin() {
    try {
      if (getAdminToken()) {
        await apiRequest("/api/admin/logout", { method: "POST" });
      }
    } catch (error) {
      console.warn("Unable to sign out on server.", error);
    } finally {
      setAdminToken(null);
    }
  }

  async function changeAdminPassword(currentPassword, newPassword) {
    await apiRequest("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setAdminToken(null);
  }

  function onAuthStateChanged(callback) {
    if (!init()) {
      callback(null);
      return () => {};
    }

    let cancelled = false;

    (async () => {
      const token = getAdminToken();
      if (!token) {
        if (!cancelled) callback(null);
        return;
      }

      try {
        const session = await apiRequest("/api/admin/session");
        if (!cancelled) {
          callback(session);
        }
      } catch {
        setAdminToken(null);
        if (!cancelled) {
          callback(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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
