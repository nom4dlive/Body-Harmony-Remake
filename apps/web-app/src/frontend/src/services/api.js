// API Configuration - Monolith (Hostinger)
export const API_BASE = '/api';

// Memory Cache for heavy read-only endpoints (Nexus V48)
const NEXUS_CACHE = new Map();
const CACHE_TTL = 60000; // 60 seconds (Increased from 30s for 503 mitigation)

// Helper for fetch with retry (Stability Shield V100)
async function fetchWithRetry(url, config, maxRetries = 2) {
  const method = config.method || 'GET';
  const canRetry = method === 'GET';
  
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, config);
      
      if ((response.status === 500 || response.status === 503) && canRetry && attempt < maxRetries) {
        attempt++;
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
        console.warn(`[STABILITY] Request failed with ${response.status}. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (canRetry && attempt < maxRetries) {
        attempt++;
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.warn(`[STABILITY] Network error: ${error.message}. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

// Helper for standard fetch
export async function request(endpoint, options = {}) {
  // 0. Cache Check
  const cacheKey = `${endpoint}_${options.method || 'GET'}`;
  if (options.method === 'GET' || !options.method) {
    const cached = NEXUS_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const url = `${API_BASE}${endpoint}`;

  const isAdminRoute = endpoint.includes('/admin/') || endpoint.includes('/gestor/');
  const isAlunaRoute = endpoint.includes('/auth/aluna/') || endpoint.includes('/aluna/');
  const isStudentRoute = !isAdminRoute && !isAlunaRoute && (
    endpoint.includes('/lms/') || 
    endpoint.includes('/auth/licenciada/') || 
    endpoint.includes('/licenciada/')
  );
  let token = null;

  if (isStudentRoute) {
    // Rotas de licenciada/aluna devem SEMPRE usar o device token
    token = localStorage.getItem('bh_device_token');
    if (!token) {
      const studentAuth = localStorage.getItem('bh_student');
      if (studentAuth) {
        try {
          const parsed = JSON.parse(studentAuth);
          token = parsed.token || parsed.device_token;
        } catch (e) { }
      }
    }
  } else {
    // Rotas administrativas/gerais usam bh_auth (Admin) primeiro
    const adminAuth = localStorage.getItem('bh_auth');
    if (adminAuth) {
      try {
        const parsed = JSON.parse(adminAuth);
        token = parsed.token;
      } catch (e) {
        console.error('Failed to parse admin auth', e);
      }
    }
    // Fallback para device token se não houver admin logado
    if (!token) {
      token = localStorage.getItem('bh_device_token');
    }
    // Fallback para aluna token se ainda não houver token
    if (!token) {
      token = localStorage.getItem('bh_aluna_token');
    }
  }


  // 3. Persistent Device Fingerprinting (Nexus V47)
  let deviceUuid = localStorage.getItem('bh_device_uuid');
  if (!deviceUuid) {
    deviceUuid = 'dev-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bh_device_uuid', deviceUuid);
  }

  const headers = {
    ...options.headers,
    'X-DEVICE-ID': deviceUuid,
    'X-SCREEN-RESOLUTION': `${window.screen.width}x${window.screen.height}`,
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token && !endpoint.includes('/auth.php')) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // BOT API KEY Injection (Nexus V95)
  if (endpoint.startsWith('/bot/')) {
    headers['X-BOT-API-KEY'] = import.meta.env.VITE_BOT_API_KEY;
  }

  const config = {
    ...options,
    headers,
  }

  // Nexus V48: Invalida cache de memória local se for uma mutação
  if (config.method && config.method !== 'GET') {
    NEXUS_CACHE.clear();
  }

  const response = await fetchWithRetry(url, config);

  if (response.status === 401) {
    // If we are already on the login endpoint, DO NOT redirect/reload globally.
    // However, we MUST try to extract the error body to show a precise message.
    if (url.includes('/auth/login') || url.includes('/auth/licenciada/login')) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = errorBody.error?.message || errorBody.error || 'Unauthorized';
      const error = new Error(errorMsg);
      error.response = errorBody;
      error.status = 401;
      throw error;
    }

    const isAdminRoute   = endpoint.includes('/admin/') || endpoint.includes('/gestor/');
    const isAlunaRoute   = endpoint.includes('/auth/aluna/') || endpoint.includes('/aluna/');
    const isStudentRoute = !isAdminRoute && !isAlunaRoute && (
      endpoint.includes('/lms/') || 
      endpoint.includes('/auth/licenciada/') || 
      endpoint.includes('/licenciada/')
    );
    const isAiRoute      = endpoint.includes('/doctor-harmony/');

    console.warn(`Unauthorized [${endpoint}]. Handling logout.`);

    if (isAlunaRoute) {
      // Lança com status=401 para o AlunaAuthContext capturar corretamente
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    if (isAiRoute) {
      console.warn('AI Route 401 - Suppressing Global Logout');
      throw new Error('Unauthorized');
    }

    if (isStudentRoute) {
      localStorage.removeItem('bh_student');
      localStorage.removeItem('bh_licenciada');
      localStorage.removeItem('bh_licenciada_auth');
      localStorage.removeItem('bh_device_token');
      
      const err = new Error('Unauthorized');
      err.status = 401;
      
      window.dispatchEvent(new Event('licenciada_auth:unauthorized'));
      
      throw err;
    } else if (isAdminRoute) {
      localStorage.removeItem('bh_auth');
      window.dispatchEvent(new Event('auth:unauthorized'));
    } else {
      // Default fallback for shared routes (like /site_config)
      // Only clear if we actually sent a token
      if (token) {
        localStorage.removeItem('bh_auth');
        localStorage.removeItem('bh_licenciada_auth');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMsg = `Request failed with status ${response.status}`;

    if (contentType && contentType.includes('application/json')) {
      const errorBody = await response.json().catch(() => ({}));
      errorMsg = errorBody.error?.message || errorBody.error || errorMsg;
      const error = new Error(errorMsg);
      error.response = errorBody; // Attach full response for ErrorModal
      throw error;
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses (like from DELETE)
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  // Fallback for non-JSON responses (or empty 200 OK)
  let result = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      result = await response.json();
    } catch (e) {
      console.error('Failed to parse API response as JSON', e);
      // Fallback for non-JSON errors when content-type was wrongly set or parsing failed
      result = {
        error: 'System Uplink Malfunction',
        message: 'The server returned an invalid response format.',
        details: e.message
      };
    }
  }

  // 4. Update Cache (Only for successful GETs)
  if ((options.method === 'GET' || !options.method) && response.ok && result !== null) {
    NEXUS_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
  }

  return result;
}

export const api = {
  // Generic Methods
  request,
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options) => request(endpoint, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
    ...options
  }).then(data => {
    // Invalidate cache on mutations
    NEXUS_CACHE.clear();
    return data;
  }),
  put: (endpoint, data, options) => request(endpoint, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
    ...options
  }).then(data => {
    // Invalidate cache on mutations
    NEXUS_CACHE.clear();
    return data;
  }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }).then(data => {
    // Invalidate cache on mutations
    NEXUS_CACHE.clear();
    return data;
  }),

  // Auth
  login: (credentials) => request('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // RBAC & Equipe (PLAN-079)
  rbac: {
    getUsers: () => request('/v1/admin/rbac/users.php'),
    getDepartments: () => request('/v1/admin/rbac/departments.php'),
    getRoles: (departmentId = null) => request(`/v1/admin/rbac/roles.php${departmentId ? `?department_id=${departmentId}` : ''}`),
    createUser: (data) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ ...data, action: 'create' })
    }),
    updateUser: (id, data) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ ...data, action: 'update', user_id: id })
    }),
    toggleStatus: (id) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'toggle_status', user_id: id })
    }),
    resetPassword: (id, password) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_password', user_id: id, password })
    }),
    assignRole: (adminId, roleId, departmentId, supervisorId) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'assign_role', admin_id: adminId, role_id: roleId, department_id: departmentId, supervisor_id: supervisorId })
    }),
    updateRolePermissions: (roleId, permissions) => request('/v1/admin/rbac/roles.php', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId, permissions })
    }),
    updateUserPermissions: (userId, permissions, hasCustom = 1) => request('/v1/admin/rbac/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'save_custom_permissions', user_id: userId, permissions, has_custom_permissions: hasCustom })
    })
  },

  // ── Portal Aluna Individual (V68) ───────────────────────────────────────
  // Token exclusivo: bh_aluna_token (prefixo al_*)
  aluna: {
    _headers() {
      const token = localStorage.getItem('bh_aluna_token');
      return token ? { 'X-ALUNA-TOKEN': token } : {};
    },

    login: (data) => request('/v1/auth/aluna/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    validate: () => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/auth/aluna/validate', {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    changePassword: (current_password, new_password) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/auth/aluna/change_password', {
        method: 'POST',
        body: JSON.stringify({ current_password, new_password }),
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    firstAccess: (new_password) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/auth/aluna/first-access', {
        method: 'POST',
        body: JSON.stringify({ new_password }),
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    getModules: () => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/aluna/modules', {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    getCatalog: () => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/aluna/catalog', {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    getLessons: (moduleId) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request(`/v1/aluna/modules/${moduleId}/lessons`, {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    updateProgress: (data) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/aluna/progress', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    signUrl: (lesson_id, fallback = false) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/aluna/sign-url', {
        method: 'POST',
        body: JSON.stringify({ lesson_id, fallback }),
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    getCertificate: (moduleId) => {
      const token = localStorage.getItem('bh_aluna_token');
      return request(`/v1/lms/modules/${moduleId}/certificate`, {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },

    getPendingTerms: () => {
      const token = localStorage.getItem('bh_aluna_token');
      return request('/v1/aluna/pending-terms', {
        headers: token ? { 'X-ALUNA-TOKEN': token } : {}
      });
    },
  },
  // ── /Portal Aluna ────────────────────────────────────────────────────────

  // ── Admin — Gestão de Alunas (V68.1) ─────────────────────────────────────
  admin: {
    alunas: {
      list:          ()            => request('/v1/admin/alunas'),
      show:          (id)          => request(`/v1/admin/alunas/${id}`),
      create:        (body)        => request('/v1/admin/alunas', { method: 'POST', body: JSON.stringify(body) }),
      update:        (id, body)    => request(`/v1/admin/alunas/${id}`, { method: 'POST', body: JSON.stringify(body) }),
      destroy:       (id)          => request(`/v1/admin/alunas/${id}`, { method: 'DELETE' }),
      grantAccess:   (id, body)    => request(`/v1/admin/alunas/${id}/grant-access`, { method: 'POST', body: JSON.stringify(body) }),
      revokeAccess:  (id, mid)     => request(`/v1/admin/alunas/${id}/revoke-access/${mid}`, { method: 'DELETE' }),
      resetPassword: (id, body)    => request(`/v1/admin/alunas/${id}/reset-password`, { method: 'POST', body: JSON.stringify(body) }),
      accesses:      (id)          => request(`/v1/admin/alunas/${id}/accesses`),
      devices:       (id)          => request(`/v1/admin/alunas/${id}/devices`),
      revokeDevices: (id)          => request(`/v1/admin/alunas/${id}/revoke-devices`, { method: 'POST' }),
      hardDelete:    (id)          => request(`/v1/admin/alunas/${id}/permanent`, { method: 'DELETE' }),
      unlock:        (id)          => request(`/v1/admin/alunas/${id}/unlock`, { method: 'POST' }),
    },
    getModules: () => request('/v1/admin/lms/modules'),
  },
  getAdminModules: () => request('/v1/admin/lms/modules'),
  // ── /Admin Alunas ─────────────────────────────────────────────────────────

  // Licenciada Auth
  licenciadaLogin: (data) => request('/v1/auth/licenciada/login', {
    method: 'POST',
    body: JSON.stringify({ action: 'login', ...data })
  }),

  licenciadaChangePasswordFirstAccess: (licenciada_id, new_password) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;

    return request('/v1/auth/licenciada/first-access', {
      method: 'POST',
      body: JSON.stringify({ licenciada_id, new_password }),
      headers
    });
  },

  licenciadaChangePassword: (current_password, new_password) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;

    return request('/v1/auth/licenciada/change_password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
      headers
    });
  },

  licenciadaValidateSession: () => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    return request('/v1/auth/licenciada/validate', { headers });
  },

  // Backward compatibility aliases
  studentLogin: (data) => api.licenciadaLogin(data),
  studentValidateSession: () => api.licenciadaValidateSession(),
  studentChangePassword: (c, n) => api.licenciadaChangePassword(c, n),
  studentChangePasswordFirstAccess: (id, p) => api.licenciadaChangePasswordFirstAccess(id, p),

  signLmsUrl: (lessonId) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    return request('/v1/lms/sign-url', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId }),
      headers
    });
  },

  updateStudentProfile: (data) => request('/v1/auth/licenciada/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  changePassword: (data) => request('/v1/auth/admin/change_password', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),

  // Landing Data Consolidada
  getLandingData: () => request('/v1/public/landing-data'),

  // Config
  getConfig: () => request(`/v1/site_config?t=${Date.now()}`),
  updateConfig: (key, value) => request('/v1/admin/site_config', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
    headers: { 'Content-Type': 'application/json' }
  }),

  // New Bulk Update Method
  updateConfigBulk: (settingsObject) => request('/v1/admin/site_config', {
    method: 'POST',
    body: JSON.stringify(settingsObject),
    headers: { 'Content-Type': 'application/json' }
  }),

  // Licenciadas (Antigo licenciadas)
  getLicenciadas: (force = false) => request(`/v1/licenciadas${force ? '?t=' + Date.now() : ''}`),
  createLicenciadaJSON: (data) => request('/v1/licenciadas', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateLicenciadaJSON: (id, data) => request(`/v1/licenciadas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteLicenciada: (id) => request(`/v1/licenciadas/${id}`, { method: 'DELETE' }),

  // Licenciadas (Multipart/FormData) - Admin Area
  saveLicenciada: async (id, formData) => {
    const savedAuth = localStorage.getItem('bh_auth');
    let token = null;
    if (savedAuth) {
      try { token = JSON.parse(savedAuth).token; } catch (e) { }
    }
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = id
      ? `${API_BASE}/v1/admin/licenciadas/${id}`
      : `${API_BASE}/v1/admin/licenciadas`;

    const response = await fetch(url, {
      method: 'POST', // We use POST for both create and update (multipart PHP compatibility)
      headers,
      body: formData
    });

    if (!response.ok) throw new Error(`Falha ao ${id ? 'atualizar' : 'criar'} licenciada`);

    return response.json();
  },


  // Results
  getResults: () => request('/v1/results'),
  createResult: (data) => request('/v1/results', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateResult: (id, data) => request(`/v1/results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteResult: (id) => request(`/v1/results/${id}`, { method: 'DELETE' }),

  // Testimonials
  getTestimonials: () => request('/v1/testimonials'),
  createTestimonial: (data) => request('/v1/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateTestimonial: (id, data) => request(`/v1/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteTestimonial: (id) => request(`/v1/admin/testimonials/${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: () => request('/v1/admin/leads'),
  createLead: (data) => request('/v1/leads', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateLead: (id, data) => request(`/v1/admin/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteLead: (id) => request(`/v1/admin/leads/${id}`, { method: 'DELETE' }),

  // FAQ
  getFaq: () => request('/v1/faq'),
  createFaq: (data) => request('/v1/faq', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateFaq: (id, data) => request(`/v1/faq/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteFaq: (id) => request(`/v1/faq/${id}`, { method: 'DELETE' }),

  // Gallery
  getGallery: () => request('/v1/gallery'),
  updateGalleryImage: (id, data) => request(`/v1/admin/gallery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteGalleryImage: (id) => request(`/v1/admin/gallery/${id}`, { method: 'DELETE' }),

  // Mentors
  getMentors: () => request('/v1/mentors'),
  createMentor: (data) => request('/v1/admin/mentors', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  updateMentor: (id, data) => request(`/v1/admin/mentors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteMentor: (id) => request(`/v1/admin/mentors/${id}`, { method: 'DELETE' }),

  // LMS
  getLmsContent: (moduleId = null) => {
    // Unified API Gateway (v1)
    let url = moduleId
      ? `/v1/lms/modules/${moduleId}/lessons`
      : '/v1/lms/modules';

    // Auth header is handled by request helper if device token is mapped (need to verify this)
    // Actually, request helper uses 'bh_auth' (Admin) token.
    // StudentAuthContext manages 'bh_device_token'.
    // We need to pass the device token header manually here OR update request() to look for it.
    // Let's pass it manually for now to be safe, searching localStorage.

    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;

    return request(url, { headers });
  },

  getGestorLicenciadas: () => request('/v1/gestor/lms/licenciadas'),

  getLmsResources: () => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    return request('/v1/lms/resources', { headers });
  },

  getStudentRecentLogs: (id, showAll = false) => request(`/v1/gestor/lms/students/${id}/logs?all=${showAll}`),

  getDashboardSummary: () => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    return request('/v1/licenciada/dashboard-summary', { headers });
  },

  updateLmsProgress: (data) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;

    return request('/v1/lms/progress', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  },

  getCertificateStatus: (moduleId) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;

    return request(`/v1/lms/modules/${moduleId}/certificate`, { headers });
  },

  getLicenciadaCertificatesStatus: () => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;

    return request('/v1/lms/certificates/status', { headers });
  },

  downloadMasterCertificate: async () => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;

    const response = await fetch(`${API_BASE}/v1/lms/certificates/master/download`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Falha ao baixar certificado' }));
      throw new Error(err.error || 'Falha ao baixar certificado');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'Certificado_Formacao_Body_Harmony.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getAdminCertificateTemplate: () => request('/v1/admin/lms/certificate-template'),

  updateAdminCertificateTemplate: (data) => request('/v1/admin/lms/certificate-template', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  verifyCertificate: (hash) => request(`/v1/certificates/verify/${hash}`),

  getStudentQuiz: (moduleId) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;
    return request(`/v1/lms/quiz?module_id=${moduleId}`, { headers });
  },

  submitStudentQuiz: (quizId, answers) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;
    return request('/v1/lms/quiz/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify({ quiz_id: quizId, answers })
    });
  },

  generateCertificate: async (moduleId) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (alunaToken) headers['X-ALUNA-TOKEN'] = alunaToken;

    const response = await fetch(`${API_BASE}/v1/lms/modules/${moduleId}/certificate/download`, { headers });
    if (!response.ok) throw new Error('Falha ao baixar certificado');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Certificado_Modulo_${moduleId}.pdf`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1000);
    return true;
  },

  saveAutoThumbnail: (data) => {
    const deviceToken = localStorage.getItem('bh_device_token');
    const alunaToken = localStorage.getItem('bh_aluna_token');
    const headers = {};
    if (deviceToken) {
      headers['X-Device-Token'] = deviceToken;
    } else if (alunaToken) {
      headers['X-ALUNA-TOKEN'] = alunaToken;
    }

    return request('/v1/lms/auto-thumbnail', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  },

  downloadFile: async (fileId) => {
    // 1. Get Token (Student or Admin)
    const deviceToken = localStorage.getItem('bh_device_token');
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const headers = {};
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    if (authData.token) headers['Authorization'] = `Bearer ${authData.token}`;

    // 2. Fetch Blob
    const response = await fetch(`${API_BASE}/download.php?file_id=${fileId}`, { headers });

    if (!response.ok) throw new Error('Download failed');

    // 3. Extract Filename from Content-Disposition
    const disposition = response.headers.get('Content-Disposition');
    let filename = `file_${fileId}`;

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // 4. Trigger Save via Blob URL
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup: Increased timeout to ensure browser context has handed off the blob
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1000); // 1s is safer than 100ms
  },

  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    // Get token from localStorage
    const savedAuth = localStorage.getItem('bh_auth');
    let token = null;
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        token = parsed.token;
      } catch (e) { console.error(e); }
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/upload.php`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (response.status === 401) {
        console.warn('Upload: Unauthorized. Logging out.');
        localStorage.removeItem('bh_auth');
        // Dispatch event instead of hard redirect
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    } catch (error) {
      // In production, re-throw so UI shows error
      throw error;
    }
  },

  // Mentors CRUD (V41 Expansion)
  addMentor: (data) => request('/v1/admin/mentors', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateMentor: (id, data) => request(`/v1/admin/mentors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteMentor: (id) => request(`/v1/admin/mentors/${id}`, {
    method: 'DELETE'
  }),

  // Nexus (Superadmin)
  nexus: {
    getUsers: () => request('/v1/admin/users'),
    getWatchtowerStats: () => request('/v1/admin/analytics/watchtower'),

    banUser: (userId) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'ban', user_id: userId })
    }),

    unbanUser: (userId) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'unban', user_id: userId })
    }),

    clearDevices: (userId) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'clear_devices', user_id: userId })
    }),

    resetLifecycle: (userId, options) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_lifecycle', user_id: userId, ...options })
    }),

    checkAccess: (data) => request('/v1/admin/users/check-access', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    createStudent: (data) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', ...data })
    }),
    deleteStudent: (userId) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', user_id: userId })
    }),
    resetStudentPassword: (userId, password) => request('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_password', user_id: userId, password })
    }),

    // Admin Management
    getAdmins: () => request('/v1/admin/admins'),
    createAdmin: (data) => request('/v1/admin/admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', ...data })
    }),
    deleteAdmin: (userId) => request('/v1/admin/admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id: userId })
    }),
    resetAdminPassword: (userId, password) => request('/v1/admin/admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_password', id: userId, password })
    }),

    impersonate: (userId) => request('/v1/admin/impersonate', {
      method: 'POST',
      body: JSON.stringify({ student_id: userId })
    }),

    getLogs: () => request('/v1/admin/logs?lines=100'),
    getServerHealth: () => request('/v1/admin/health'),

    flushCache: () => request('/v1/admin/flush-cache', { method: 'POST' }),

    getMaintenanceMode: () => request('/v1/site_config'),
    toggleMaintenance: (status) => request('/v1/admin/maintenance', {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

    // War Room (v2 - Refactored)
    getSystemStatus: () => request('/v1/admin/nexus/system-status'),
    getSecurityMetrics: () => request('/v1/admin/nexus/security-metrics'),

    // War Room (v1 - Legacy)
    getAnalytics: () => request('/v1/admin/analytics/war-room'),

    // V95 — Bot Staging Stats
    getBotStats: () => request('/v1/admin/analytics/bot-stats'),

    // Signal Tower (v1)
    getBroadcasts: () => request('/v1/admin/broadcasts'),
    getActiveBroadcasts: () => request('/v1/broadcasts/active'),
    getBroadcastHistory: () => request('/v1/broadcasts/history'),
    acknowledgeBroadcast: (id) => request('/v1/broadcasts/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ id })
    }),
    manageBroadcast: (data) => request('/v1/admin/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    deleteBroadcast: (id) => request(`/v1/admin/broadcasts/${id}`, { method: 'DELETE' }),

    // The Vault (Consolidated v1)
    getFaqs: () => request('/v1/faq'),
    manageFaq: (data) => {
      const { id, action, ...rest } = data;
      if (action === 'create') return request('/v1/faq', { method: 'POST', body: JSON.stringify(rest) });
      if (action === 'update') return request(`/v1/faq/${id}`, { method: 'PUT', body: JSON.stringify(rest) });
      if (action === 'delete') return request(`/v1/faq/${id}`, { method: 'DELETE' });
    },

    // Nudge System
    logNudge: (data) => request('/v1/admin/nudge', {
      method: 'POST',
      body: JSON.stringify({ action: 'log', ...data })
    }),
    getNudgeHistory: (studentId) => request('/v1/admin/nudge', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_history', student_id: studentId })
    }),

    // Database Governance (v1) & Testing Hub
    getNexusDbStatus: () => request('/v1/admin/nexus/db/status'), // Renamed to match Dashboard.jsx
    rebuildNexusDb: () => request('/v1/admin/nexus/db/rebuild', { method: 'POST' }), // Renamed to match Dashboard.jsx

    getMigrations: () => request('/v1/admin/nexus/db/migrations'),
    runMigration: (file) => request('/v1/admin/nexus/db/migrations/run', {
      method: 'POST',
      body: JSON.stringify({ file })
    }),
    nexusHeal: () => request('/v1/admin/nexus/db/heal', { method: 'POST' }),
    nexusSync: () => request('/v1/admin/nexus/db/sync', { method: 'POST' }),
    uploadMigration: (formData) => request('/v1/admin/nexus/db/upload', {
      method: 'POST',
      body: formData
    }),
    getSeeds: () => request('/v1/admin/nexus/db/seeds'),
    runSeed: (file) => request('/v1/admin/nexus/db/seeds/run', {
      method: 'POST',
      body: JSON.stringify({ file })
    }),
    getScripts: () => request('/v1/admin/nexus/db/scripts'),
    exportSnapshot: () => request('/v1/admin/nexus/db/export', { method: 'POST' }),
    getDbExports: () => request('/v1/admin/nexus/db/exports'),
    switchDb: (target) => request('/v1/admin/nexus/db/switch', {
      method: 'POST',
      body: JSON.stringify({ target })
    }),
    downloadSnapshot: (file) => {
      const auth = localStorage.getItem('bh_auth');
      let token = null;
      if (auth) {
        try {
          token = JSON.parse(auth).token;
        } catch (e) { }
      }
      window.location.href = `${API_BASE}/v1/admin/nexus/db/download?file=${file}&token=${token}&t=${Date.now()}`;
    },
    exportLicenciadasCSV: () => {
      const auth = localStorage.getItem('bh_auth');
      let token = null;
      if (auth) {
        try {
          token = JSON.parse(auth).token;
        } catch (e) { }
      }
      window.location.href = `${API_BASE}/v1/admin/nexus/db/licenciadas/export?token=${token}&t=${Date.now()}`;
    },
    importLicenciadasCSV: (formData) => request('/v1/admin/nexus/db/licenciadas/import', {
      method: 'POST',
      body: formData
    }),

    // Test Suites (New)
    getTestSuites: () => request('/v1/admin/nexus/tests/suites'),
    runTest: (suite) => request('/v1/admin/nexus/tests/run', {
      method: 'POST',
      body: JSON.stringify({ suite: suite?.id })
    }),
    getTestStatus: () => request('/v1/admin/nexus/tests/status'),

    // Neural Oversight (New)
    getConfig: () => request('/v1/nexus/ai/config'),
    updateConfig: (data) => request('/v1/nexus/ai/config', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getAuditLogs: () => request('/v1/nexus/ai/audit'),
    runSandbox: (formData) => request('/v1/nexus/ai/sandbox', {
      method: 'POST',
      body: formData
    }),
    healthCheck: () => request('/v1/nexus/ai/health'),

    // Forensics (V23)
    analyzeForensics: (formData) => request('/admin/nexus/forensics/analyze', {
      method: 'POST',
      body: formData
    }),

    getForensicslicenciadas: () => request('/admin/nexus/forensics/licenciadas'),
    generateForensicsBatch: (data) => request('/admin/nexus/forensics/generate-batch', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getForensicsLogs: () => request('/admin/nexus/forensics/logs'),
    lookupForensicsHash: (hash) => request(`/admin/nexus/forensics/lookup/${hash}`),
    getForensicsConfig: () => request('/admin/nexus/forensics/config'),
    updateForensicsConfig: (data) => request('/admin/nexus/forensics/config', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Doctor Harmony Clinical Core / Neural Oversight (Shared)
  doctorHarmony: {
    getCredits: () => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request('/v1/doctor-harmony/credits', { headers });
    },
    evaluate: (formData) => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request('/v1/doctor-harmony/evaluate', {
        method: 'POST',
        headers,
        body: formData
      });
    },
    getHistory: () => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request('/v1/doctor-harmony/history', { headers });
    },
    getContext: (lessonId) => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request(`/v1/doctor-harmony/context?lesson_id=${lessonId}`, { headers });
    },
    logEvent: (event) => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      const formData = new FormData();
      formData.append('event', event);
      return request('/v1/doctor-harmony/log-event', {
        method: 'POST',
        headers,
        body: formData
      });
    },
    getPendingCases: () => request('/v1/admin/doctor-harmony/cases/pending'),
    reviewCase: (id, notes) => request(`/v1/admin/doctor-harmony/cases/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    }),
    getConfig: () => request('/v1/admin/doctor-harmony/config'),
    updateConfig: (data) => request('/v1/admin/doctor-harmony/config', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getAuditLogs: () => request('/v1/admin/doctor-harmony/audit'),
    healthCheck: () => request('/v1/admin/doctor-harmony/health'),
    runSandbox: (formData) => request('/v1/admin/doctor-harmony/sandbox', {
      method: 'POST',
      body: formData
    }),
    getSession: () => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = {};
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request('/v1/doctor-harmony/session', { headers });
    },
    saveSession: (data) => {
      const deviceToken = localStorage.getItem('bh_device_token');
      const headers = { 'Content-Type': 'application/json' };
      if (deviceToken) headers['X-Device-Token'] = deviceToken;
      return request('/v1/doctor-harmony/session', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
    }
  },

  // Media Browser
  media: {
    listFiles: async ({
      category,
      page = 1,
      limit = 50,
      search = '',
      // Advanced filters
      date_from,
      date_to,
      min_size,
      max_size,
      min_width,
      max_width,
      min_height,
      max_height,
      min_usage,
      max_usage,
      type = '',
      sort = 'created_at',
      order = 'desc'
    }) => {
      const params = new URLSearchParams({ category, page, limit, search, sort, order });

      if (type) params.append('type', type);

      // Add optional filters
      if (date_from) params.append('date_from', date_from);
      if (date_to) params.append('date_to', date_to);
      if (min_size !== undefined) params.append('min_size', min_size);
      if (max_size !== undefined) params.append('max_size', max_size);
      if (min_width !== undefined) params.append('min_width', min_width);
      if (max_width !== undefined) params.append('max_width', max_width);
      if (min_height !== undefined) params.append('min_height', min_height);
      if (max_height !== undefined) params.append('max_height', max_height);
      if (min_usage !== undefined) params.append('min_usage', min_usage);
      if (max_usage !== undefined) params.append('max_usage', max_usage);

      return request(`/v1/admin/media/list?${params}`);
    },

    trackUsage: async (filePath) => {
      return request(`/v1/admin/media/track-usage`, {
        method: 'POST',
        body: JSON.stringify({ file_path: filePath }),
      });
    },

    batchDelete: async (fileIds) => {
      return request(`/v1/admin/media/batch-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ file_ids: fileIds }),
      });
    },

    updateFile: async (id, fileName) => {
      return request(`/v1/admin/media/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ file_name: fileName }),
      });
    },

    // Scripts Manager (Nexus)
    listScripts: () => request(`/v1/nexus/scripts/list?t=${Date.now()}`),
    executeScript: (scriptId, params) => request('/v1/nexus/scripts/execute', {
      method: 'POST',
      body: JSON.stringify({ script_id: scriptId, params })
    }),
    getScriptHistory: (scriptId = null, limit = 50) => {
      const params = new URLSearchParams({ limit });
      if (scriptId) params.append('script_id', scriptId);
      return request(`/v1/nexus/scripts/history?${params}`);
    }
  },
};

// === BOT / TWA ENDPOINTS (Nexus V95) ===
export async function submitBotSupport(data) {
  return request('/bot/support-request', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// === CONTRACTS & DIGITAL SIGNATURES API (PLAN-036) ===
export const contractsApi = {
  getContracts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/v1/admin/contracts/index.php?${qs}`);
  },
  getContractDetail: (uuid) => request(`/v1/admin/contracts/index.php?uuid=${encodeURIComponent(uuid)}`),
  getTemplates: (category = null) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/v1/admin/contracts/templates.php${qs}`);
  },
  getTemplateDetail: (id) => request(`/v1/admin/contracts/templates.php?id=${id}`),
  createTemplate: (data) => request('/v1/admin/contracts/templates.php', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTemplate: (id, data) => request(`/v1/admin/contracts/templates.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTemplate: (id) => request(`/v1/admin/contracts/templates.php?id=${id}`, {
    method: 'DELETE'
  }),
  getContractByUuid: (uuid) => request(`/v1/admin/contracts/index.php?uuid=${encodeURIComponent(uuid)}`),
  createContract: (data) => request('/v1/admin/contracts/index.php', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateContract: (uuid, data) => request(`/v1/admin/contracts/index.php?uuid=${encodeURIComponent(uuid)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteContract: (uuid) => request(`/v1/admin/contracts/index.php?uuid=${encodeURIComponent(uuid)}`, {
    method: 'DELETE'
  }),
  uploadSignedContract: (uuidOrLicenciadaId, file, notes = '') => {
    const formData = new FormData();
    if (typeof uuidOrLicenciadaId === 'number' || /^\d+$/.test(String(uuidOrLicenciadaId))) {
      formData.append('licenciada_id', uuidOrLicenciadaId);
    } else {
      formData.append('contract_uuid', uuidOrLicenciadaId);
    }
    formData.append('file', file);
    if (notes) formData.append('notes', notes);
    
    return request('/v1/admin/contracts/upload-signed', {
      method: 'POST',
      body: formData
    });
  },
  uploadSigned: (uuidOrLicenciadaId, file, notes = '') => contractsApi.uploadSignedContract(uuidOrLicenciadaId, file, notes),
  getPublicContract: (token) => request(`/v1/contracts/sign.php?token=${encodeURIComponent(token)}`),
  getDownloadDraftUrl: (uuid, token) => `${API_BASE}/v1/contracts/download.php?uuid=${encodeURIComponent(uuid)}&token=${encodeURIComponent(token)}`,
  signContract: (payload) => request('/v1/contracts/sign.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  healContracts: () => request('/v1/admin/contracts/heal.php', {
    method: 'POST'
  })
};

export const whatsappApi = {
  // Instance Management (CRM Hub)
  getInstancesStatus: () => request('/v1/crm/status.php').catch(() => request('/crm/status')),
  connectInstance: (instance) => request(`/v1/crm/instances/${encodeURIComponent(instance)}/connect`, { method: 'POST' }),
  disconnectInstance: (instance) => request(`/v1/crm/instances/${encodeURIComponent(instance)}/disconnect`, { method: 'POST' }),

  // Template Management (Legacy & Gestor)
  getTemplates: (category = 'ALL', search = '') =>
    request(`/v1/admin/whatsapp-templates/index.php?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`),
  createTemplate: (data) =>
    request('/v1/admin/whatsapp-templates/index.php', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTemplate: (data) =>
    request('/v1/admin/whatsapp-templates/index.php', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTemplate: (id) =>
    request(`/v1/admin/whatsapp-templates/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
};

// === GESTOR AGENDA API (PLAN-062 & PLAN-063) ===
export const gestorAgendaApi = {
  getEvents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/v1/admin/agenda/events${qs ? '?' + qs : ''}`);
  },
  getEventDetail: (id) => request(`/v1/admin/agenda/events/${id}`),
  createEvent: (data) => request('/v1/admin/agenda/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEvent: (id, data) => request(`/v1/admin/agenda/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateStatus: (id, status) => request(`/v1/admin/agenda/events/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  deleteEvent: (id) => request(`/v1/admin/agenda/events/${id}`, {
    method: 'DELETE'
  }),
  getSummary: () => request('/v1/admin/agenda/summary'),
  
  // Advanced Features (PLAN-063)
  getComments: (id) => request(`/v1/admin/agenda/events/${id}/comments`),
  addComment: (id, comment, mentions = []) => request(`/v1/admin/agenda/events/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment, mentions })
  }),
  addChecklist: (id, title) => request(`/v1/admin/agenda/events/${id}/checklists`, {
    method: 'POST',
    body: JSON.stringify({ title })
  }),
  toggleChecklist: (checklistId) => request(`/v1/admin/agenda/checklists/${checklistId}/toggle`, {
    method: 'PATCH'
  }),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/v1/admin/agenda/events/${id}/attachments`, {
      method: 'POST',
      body: formData
    });
  },
  getAgendaShares: () => request('/v1/admin/agenda/shares'),
  shareAgenda: (data) => request('/v1/admin/agenda/shares', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  revokeAgendaShare: (targetAdminId) => request(`/v1/admin/agenda/shares?shared_with_admin_id=${targetAdminId}`, {
    method: 'DELETE'
  }),
  getFeedUrl: () => `${window.location.origin}/api/v1/admin/agenda/feed.ics`
};

// === ONBOARDING FUNNEL API (PLAN-064) ===
export const onboardingApi = {
  // Gestor Endpoints
  getFunnel: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/v1/admin/onboarding/funnel${qs ? '?' + qs : ''}`);
  },
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/v1/admin/onboarding/funnel${qs ? '?' + qs : ''}`);
  },
  getMetrics: (periodoDias = 30) => request(`/v1/admin/onboarding/metrics?periodo_dias=${periodoDias}`),
  getLeadDetail: (id) => request(`/v1/admin/onboarding/${id}`),
  getDetail: (id) => request(`/v1/admin/onboarding/${id}`),
  createLink: (data) => request('/v1/admin/onboarding/links', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  generateLink: (data) => request('/v1/admin/onboarding/links', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateLeadStatus: (id, status) => request(`/v1/admin/onboarding/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  updateStatus: (id, status) => request(`/v1/admin/onboarding/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  generateContract: (id, payload = {}) => request(`/v1/admin/onboarding/${id}/generate-contract`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  confirmPayment: (id, payload = {}) => request(`/v1/admin/onboarding/${id}/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  sendReminder: (id, type = 'assinatura') => request(`/v1/admin/onboarding/${id}/send-reminder`, {
    method: 'POST',
    body: JSON.stringify({ type })
  }),
  sendWhatsAppReminder: (id, type = 'assinatura') => request(`/v1/admin/onboarding/${id}/send-reminder`, {
    method: 'POST',
    body: JSON.stringify({ type })
  }),
  getWhatsAppMessage: (id, stage = 'convite') => request(`/v1/admin/onboarding/${id}/whatsapp-message?stage=${encodeURIComponent(stage)}`),
  
  // Public Endpoints (Sem exigência de auth admin)
  validateToken: (token) => request(`/v1/public/onboarding/${encodeURIComponent(token)}`),
  validatePublicToken: (token) => request(`/v1/public/onboarding/${encodeURIComponent(token)}`),
  getPublicOnboarding: (token) => request(`/v1/public/onboarding/${encodeURIComponent(token)}`),
  processOcr: (formData) => request('/v1/public/onboarding/ocr', {
    method: 'POST',
    body: formData
  }),
  ocr: (formData) => request('/v1/public/onboarding/ocr', {
    method: 'POST',
    body: formData
  }),
  submitPublic: (token, formData) => {
    const endpoint = token ? `/v1/public/onboarding/${encodeURIComponent(token)}` : '/v1/public/onboarding/submit';
    return request(endpoint, {
      method: 'POST',
      body: formData
    });
  },
  submitPublicOnboarding: (tokenOrFormData, maybeFormData) => {
    let endpoint = '/v1/public/onboarding/submit';
    let body = tokenOrFormData;
    if (typeof tokenOrFormData === 'string' && maybeFormData) {
      endpoint = `/v1/public/onboarding/${encodeURIComponent(tokenOrFormData)}`;
      body = maybeFormData;
    }
    return request(endpoint, {
      method: 'POST',
      body
    });
  },

  // PLAN-066: Métricas agregadas do funil para o Dashboard do Gestor
  getMetrics: (periodoDias = 30) =>
    request(`/v1/admin/onboarding/metrics?periodo_dias=${encodeURIComponent(periodoDias)}`),

  // PLAN-067: Aprovação com integração de licenciada e download de documentos em ZIP
  approveAndIntegrate: (id, payload = {}) => request(`/v1/admin/onboarding/${id}/approve-and-integrate`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  downloadAllFilesZip: (id) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData?.token || '';
    const url = `/api/v1/admin/onboarding/${id}/download-zip${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
    return Promise.resolve({ success: true });
  },
  getDownloadZipUrl: (id) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData?.token || '';
    return `/api/v1/admin/onboarding/${id}/download-zip${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getDocumentUrl: (id, docType = 'doc_frente') => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData?.token || '';
    return `/api/v1/admin/onboarding/${id}/document/${docType}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // PLAN-083: Sandbox, Testes & Delegação
  deleteRequest: (id) => request(`/v1/admin/onboarding/requests/${id}`, {
    method: 'DELETE'
  }),
  deleteLead: (id) => request(`/v1/admin/onboarding/requests/${id}`, {
    method: 'DELETE'
  }),
  generateQuickMock: (payload = {}) => request('/v1/admin/onboarding/sandbox/generate-quick', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  purgeTestRequests: () => request('/v1/admin/onboarding/sandbox/purge-tests', {
    method: 'POST'
  }),
  assignRequest: (id, payload = {}) => request(`/v1/admin/onboarding/requests/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),
};

// === RBAC & USERS MANAGEMENT API (PLAN-079) ===
export const rbacApi = {
  getUsers: () => request('/v1/admin/rbac/users.php'),
  getDepartments: () => request('/v1/admin/rbac/departments.php'),
  getRoles: (departmentId = null) => request(`/v1/admin/rbac/roles.php${departmentId ? `?department_id=${departmentId}` : ''}`),
  createUser: (data) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ ...data, action: 'create' })
  }),
  updateUser: (id, data) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ ...data, action: 'update', user_id: id })
  }),
  toggleStatus: (id) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'toggle_status', user_id: id })
  }),
  resetPassword: (id, password) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'reset_password', user_id: id, password })
  }),
  assignRole: (adminId, roleId, departmentId, supervisorId) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'assign_role', admin_id: adminId, role_id: roleId, department_id: departmentId, supervisor_id: supervisorId })
  }),
  updateRolePermissions: (roleId, permissions) => request('/v1/admin/rbac/roles.php', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, permissions })
  }),
  updateUserPermissions: (userId, permissions, hasCustom = 1) => request('/v1/admin/rbac/users.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_custom_permissions', user_id: userId, permissions, has_custom_permissions: hasCustom })
  })
};

// === SHOP & PAYMENTS API (PLAN-086 / PLAN-162) ===
export const shopApi = {
  getProducts: (category = null) => request(`/v1/shop/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (slug) => request(`/v1/shop/products/${slug}`),
  generateAsaasPaymentLink: (productId) => request(`/v1/admin/shop/products/${productId}/generate-payment-link`, { method: 'POST' }),
  checkout: (data) => request('/v1/shop/checkout', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAdminOrders: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return request(`/v1/admin/shop/orders${qs ? `?${qs}` : ''}`);
  },
  getAdminLeads: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return request(`/v1/admin/shop/leads${qs ? `?${qs}` : ''}`);
  },
  validateOrder: (id, notes = '') => request(`/v1/admin/shop/orders/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify({ notes })
  }),
  checkinTicket: (ticketIdentifier) => request('/v1/admin/shop/checkin', {
    method: 'POST',
    body: JSON.stringify({ ticket_identifier: ticketIdentifier })
  }),
  getPublicTicket: (token) => request(`/v1/shop/tickets/${token}`),
  updateOrder: (id, data) => request(`/v1/admin/shop/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOrder: (id) => request(`/v1/admin/shop/orders/${id}`, {
    method: 'DELETE'
  }),
  updateLead: (id, data) => request(`/v1/admin/shop/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteLead: (id) => request(`/v1/admin/shop/leads/${id}`, {
    method: 'DELETE'
  }),
  getAdminProducts: (category = null) => {
    const qs = category && category !== 'Todos' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/v1/admin/shop/products${qs}`);
  },
  createProduct: (data) => request('/v1/admin/shop/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data) => request(`/v1/admin/shop/products/${id}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => request(`/v1/admin/shop/products/${id}`, {
    method: 'DELETE'
  }),
  toggleProductStatus: (id) => request(`/v1/admin/shop/products/${id}/toggle-status`, {
    method: 'POST'
  }),
  uploadProductImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/v1/admin/shop/products/${id}/image`, {
      method: 'POST',
      body: formData
    });
  },
  getSettings: () => request('/v1/shop/settings'),
  getPublicSettings: () => request('/v1/shop/settings'),
  getAdminSettings: () => request('/v1/admin/shop/settings'),
  updateAdminSettings: (data) => request('/v1/admin/shop/settings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  // PLAN-110 / PLAN-194: Upload de fotos para o Congresso (Hero, Sobre, VIP, Galeria e Espaço)
  uploadCongressoPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/v1/admin/congresso/gallery/upload', {
      method: 'POST',
      body: formData
    });
  },
  uploadCongressGallery: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/v1/admin/congresso/gallery/upload', {
      method: 'POST',
      body: formData
    });
  },
  uploadCongressGalleryImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/v1/admin/congresso/gallery/upload', {
      method: 'POST',
      body: formData
    });
  },
};

// === IA NOTEBOOK LMS API (PLAN-101 / PLAN-102 / PLAN-103 / PLAN-104) ===
export const lmsNotebookApi = {
  getModulesWithNotebooks: (category = 'all') => request(`/v1/admin/lms/notebooks/modules?category=${category}`),
  getModuleSources: (moduleId) => request(`/v1/admin/lms/notebooks/modules/${moduleId}/sources`),
  uploadModulePdf: (moduleId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/v1/admin/lms/notebooks/modules/${moduleId}/sources/pdf`, {
      method: 'POST',
      body: formData
    });
  },
  syncSingleModule: (moduleId) => request(`/v1/admin/lms/notebooks/modules/${moduleId}/sync`, {
    method: 'POST'
  }),
  syncModules: () => request('/v1/admin/lms/notebooks/sync', {
    method: 'POST',
    body: JSON.stringify({})
  }),
  getAuthTicket: (moduleId, licenciadaId = null) => request('/v1/aluna/notebook/ticket', {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId, licenciada_id: licenciadaId })
  }),
  getImpersonateTicket: (licenciadaId = 1, moduleId = 1) => request('/v1/admin/lms/notebooks/impersonate-ticket', {
    method: 'POST',
    body: JSON.stringify({ licenciada_id: licenciadaId, module_id: moduleId })
  }),
  getBetaTesters: () => request('/v1/admin/lms/notebooks/beta-testers'),
  updateBetaTester: (licenciadaId, isBetaActive, creditOverride = 100) => request('/v1/admin/lms/notebooks/beta-testers', {
    method: 'POST',
    body: JSON.stringify({ licenciada_id: licenciadaId, is_beta_active: isBetaActive, daily_credit_override: creditOverride })
  }),
  getGovernanceSettings: () => request('/v1/admin/lms/notebooks/governance/settings'),
  updateGovernanceSettings: (settings) => request('/v1/admin/lms/notebooks/governance/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  }),
  getClinicalInsights: () => request('/v1/admin/lms/notebooks/governance/insights'),
  getPodcastsGallery: () => request('/v1/admin/lms/notebooks/governance/podcasts'),
  togglePodcastFeature: (podcastId) => request(`/v1/admin/lms/notebooks/governance/podcasts/${podcastId}/feature`, {
    method: 'POST'
  }),
  sendChatMessage: (moduleId, message, history = [], licenciadaId = null) => request('/v1/aluna/notebook/chat', {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId, message, history, licenciada_id: licenciadaId })
  }),
  generatePodcast: (moduleId, topic, licenciadaId = null) => request('/v1/aluna/notebook/podcast/generate', {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId, topic, licenciada_id: licenciadaId })
  }),
  getModuleArtifacts: (moduleId) => request(`/v1/aluna/smartbook/transformations?module_id=${moduleId}`),
  executeTransformation: (moduleId, transformationKey, forceRefresh = false, licenciadaId = null) => request('/v1/aluna/smartbook/transformations/execute', {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId, transformation_key: transformationKey, force_refresh: forceRefresh, licenciada_id: licenciadaId })
  }),
  getGoogleAuthStatus: () => request('/v1/admin/lms/notebook/auth/status'),
  getGoogleAuthUrl: () => request('/v1/admin/lms/notebook/auth/google/url'),
  disconnectGoogle: () => request('/v1/admin/lms/notebook/auth/disconnect', { method: 'POST' }),
  getAuthConfig: () => request('/v1/admin/lms/notebook/auth/config'),
  saveAuthConfig: (data) => request('/v1/admin/lms/notebook/auth/config', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  saveSessionToken: (data) => request('/v1/admin/lms/notebook/auth/session-token', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// === FINANCIAL MODULE (PLAN-122) ===
export const financialApi = {
  getDashboard: (period = '30d') => request(`/v1/admin/financial/dashboard?period=${period}`),
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.source_type) params.append('source_type', filters.source_type);
    if (filters.tax_tag) params.append('tax_tag', filters.tax_tag);
    if (filters.category) params.append('category', filters.category);
    if (filters.event_tag) params.append('event_tag', filters.event_tag);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    const qs = params.toString();
    return request(`/v1/admin/financial/transactions${qs ? `?${qs}` : ''}`);
  },
  createTransaction: (data) => request('/v1/admin/financial/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getCashClose: (date) => request(`/v1/admin/financial/cash-close?date=${date}`),
  performCashClose: (date) => request(`/v1/admin/financial/cash-close/${date}`, {
    method: 'POST'
  }),
  getCostCenters: () => request('/v1/admin/financial/cost-centers'),
  createCostCenter: (data) => request('/v1/admin/financial/cost-centers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCostCenter: (id, data) => request(`/v1/admin/financial/cost-centers/${id}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteCostCenter: (id) => request(`/v1/admin/financial/cost-centers/${id}`, {
    method: 'DELETE'
  }),
  getExpenseCategories: () => request('/v1/admin/financial/expenses/categories'),
  createExpense: (data) => request('/v1/admin/financial/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getDre: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.event_tag) params.append('event_tag', filters.event_tag);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const qs = params.toString();
    return request(`/v1/admin/financial/reports/dre${qs ? `?${qs}` : ''}`);
  },
  getDreExpanded: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const qs = params.toString();
    return request(`/v1/admin/financial/reports/dre-expanded${qs ? `?${qs}` : ''}`);
  }
};

export const licenseTaxesApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.status) params.append('status', filters.status);
    if (filters.method) params.append('method', filters.method);
    if (filters.search) params.append('search', filters.search);
    if (filters.source) params.append('source', filters.source);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    const qs = params.toString();
    return request(`/v1/admin/financial/license-taxes${qs ? `?${qs}` : ''}`);
  },
  getSummary: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    const qs = params.toString();
    return request(`/v1/admin/financial/license-taxes/summary${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/v1/admin/financial/license-taxes/${id}`),
  create: (data) => request('/v1/admin/financial/license-taxes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/v1/admin/financial/license-taxes/${id}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/v1/admin/financial/license-taxes/${id}`, {
    method: 'DELETE'
  }),
  seedHistorical: (payload = { confirm: 'CONFIRMAR_SEED_PRODUCAO' }) => request('/v1/admin/financial/license-taxes/seed', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  syncAll: (payload = { confirm: 'CONFIRMAR_SYNC_PRODUCAO' }) => request('/v1/admin/financial/license-taxes/sync-all', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  uploadReceipt: (licenciadaId, file, notes = '') => {
    const formData = new FormData();
    formData.append('licenciada_id', licenciadaId);
    formData.append('file', file);
    if (notes) formData.append('notes', notes);
    return request('/v1/admin/financial/receipt', {
      method: 'POST',
      body: formData
    });
  },
  uploadAttachment: (formData) => request('/v1/admin/financial/license-taxes/upload', {
    method: 'POST',
    body: formData
  }),
  getAttachments: (id, parentType = 'license_tax') => request(`/v1/admin/financial/license-taxes/${id}/attachments?parent_type=${parentType}`),
  deleteAttachment: (attachId) => request(`/v1/admin/financial/license-taxes/attachments/${attachId}`, {
    method: 'DELETE'
  }),
  getWhatsAppReceipt: (id) => request(`/v1/admin/financial/license-taxes/${id}/receipt-whatsapp`),
  getReceiptWhatsApp: (id) => request(`/v1/admin/financial/license-taxes/${id}/receipt-whatsapp`),
  exportReport: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.method) params.append('method', filters.method);
    if (filters.search) params.append('search', filters.search);
    if (filters.source) params.append('source', filters.source);
    const qs = params.toString();
    return request(`/v1/admin/financial/license-taxes/export${qs ? `?${qs}` : ''}`);
  },
  exportCsv: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.method) params.append('method', filters.method);
    if (filters.search) params.append('search', filters.search);
    if (filters.source) params.append('source', filters.source);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    const qs = params.toString();
    return request(`/v1/admin/financial/license-taxes/export${qs ? `?${qs}` : ''}`);
  },
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.action) params.append('action', filters.action);
    if (filters.target_id) params.append('target_id', filters.target_id);
    if (filters.admin_id) params.append('admin_id', filters.admin_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const qs = params.toString();
    return request(`/v1/admin/financial/audit-logs${qs ? `?${qs}` : ''}`);
  }
};

export const licenciadasApi = {
  list: (force = false) => api.getLicenciadas(force),
  getById: (id) => request(`/v1/licenciadas/${id}`),
  create: (data) => api.createLicenciadaJSON(data),
  update: (id, data) => api.updateLicenciadaJSON(id, data),
  delete: (id) => api.deleteLicenciada(id),
  getView360: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);
    if (params.method) qs.append('method', params.method);
    if (params.start_date) qs.append('start_date', params.start_date);
    if (params.end_date) qs.append('end_date', params.end_date);
    const qStr = qs.toString();
    return request(`/v1/admin/licenciadas/view-360${qStr ? `?${qStr}` : ''}`);
  },
  getDossier360: (id) => request(`/v1/admin/licenciadas/${id}/dossier`),
  updateDossier360: (id, data) => request(`/v1/admin/licenciadas/${id}/dossier`, { method: 'PUT', body: JSON.stringify(data) }),
  sync360: () => request('/v1/admin/licenciadas/sync-360', { method: 'POST' }),
  getDevices: (licenciadaId) => request(`/v1/admin/licenciadas/${licenciadaId}/devices`),
  deleteDevice: (deviceId) => request(`/v1/admin/licenciadas/devices/${deviceId}`, { method: 'DELETE' })
};

const NOTEBOOK_API_BASE = 'https://notebook.bodyharmony.com.br/api/v1/smartbook';

export const smartbookMultiTenancyApi = {
  getOrCreateInstance: async (notebookId, userId, title = null) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      },
      body: JSON.stringify({
        notebook_id: String(notebookId),
        user_id: String(userId),
        title: title || undefined
      })
    });
    if (!res.ok) throw new Error(`Falha ao obter instância: ${res.statusText}`);
    return res.json();
  },

  getUserInstances: async (userId) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      }
    });
    if (!res.ok) throw new Error(`Falha ao listar instâncias: ${res.statusText}`);
    return res.json();
  },

  getInstanceDetails: async (instanceId, userId) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances/${instanceId}?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      }
    });
    if (!res.ok) throw new Error(`Falha ao carregar detalhes da instância: ${res.statusText}`);
    return res.json();
  },

  getChatHistory: async (instanceId, userId) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances/${instanceId}/chat?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      }
    });
    if (!res.ok) throw new Error(`Falha ao carregar histórico de chat: ${res.statusText}`);
    return res.json();
  },

  sendChatMessage: async (instanceId, userId, content, generateAi = true) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances/${instanceId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      },
      body: JSON.stringify({
        user_id: String(userId),
        content,
        generate_ai_reply: generateAi
      })
    });
    if (!res.ok) throw new Error(`Falha ao enviar mensagem: ${res.statusText}`);
    return res.json();
  },

  listStudioContent: async (instanceId, userId, type = null) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const qs = type ? `&type=${encodeURIComponent(type)}` : '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances/${instanceId}/studio?user_id=${encodeURIComponent(userId)}${qs}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      }
    });
    if (!res.ok) throw new Error(`Falha ao listar estúdio: ${res.statusText}`);
    return res.json();
  },

  generateStudioContent: async (instanceId, userId, type, customInstructions = '', title = null) => {
    const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
    const token = authData.token || '';
    const res = await fetch(`${NOTEBOOK_API_BASE}/instances/${instanceId}/studio/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-Role': 'LICENCIADA'
      },
      body: JSON.stringify({
        user_id: String(userId),
        type,
        title: title || undefined,
        custom_instructions: customInstructions || undefined
      })
    });
    if (!res.ok) throw new Error(`Falha ao gerar material: ${res.statusText}`);
    return res.json();
  }
};

// ==========================================
// LICENCIADA 360º DOSSIER API (PLAN-142)
// ==========================================
export const licenciadas360Api = {
  getDossier: (id) => request(`/v1/admin/licenciadas/${id}/dossier`),
  updateDossier: (id, data) => request(`/v1/admin/licenciadas/${id}/dossier`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  sync360: () => request('/v1/admin/licenciadas/sync-360', {
    method: 'POST'
  }),
  uploadSignedContract: (licenciadaId, file, notes = '') => contractsApi.uploadSignedContract(licenciadaId, file, notes),
  uploadReceipt: (licenciadaId, file, notes = '') => licenseTaxesApi.uploadReceipt(licenciadaId, file, notes)
};

// ==========================================
// CRM BRIDGE & EMBED DOSSIER API (PLAN-154)
// ==========================================
export const crmApi = {
  getDossier: (phone) => request(`/v1/crm/dossier.php?phone=${encodeURIComponent(phone)}`),
  getStatus: () => request('/v1/crm/status.php'),
  connectInstance: (instance) => request('/v1/crm/instance_connect.php', {
    method: 'POST',
    body: JSON.stringify({ instance })
  }),
  disconnectInstance: (instance) => request('/v1/crm/instance_disconnect.php', {
    method: 'POST',
    body: JSON.stringify({ instance })
  }),
  triggerContract: (payload) => request('/v1/crm/triggers.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'contract_issuance', ...payload })
  }),
  triggerMentorship: (payload) => request('/v1/crm/triggers.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'mentorship_reminder', ...payload })
  }),
  updateInboxName: (inboxId, name) => request(`/v1/crm/inbox_update.php`, {
    method: 'POST',
    body: JSON.stringify({ inboxId, name })
  }),
  importHistory: (inboxId, messages) => request('/v1/crm/history_import.php', {
    method: 'POST',
    body: JSON.stringify({ inbox_id: inboxId, messages })
  }),
  exportHistory: (inboxId, format = 'json') => request(`/v1/crm/history_export.php?inbox_id=${encodeURIComponent(inboxId)}&format=${encodeURIComponent(format)}`),
  getCockpitContext: (phone, conversationId, name) => request(`/v1/crm/cockpit/context.php?phone=${encodeURIComponent(phone)}&conversation_id=${encodeURIComponent(conversationId || '')}&name=${encodeURIComponent(name || '')}`),
  createAppointment: (payload) => request('/v1/crm/cockpit/appointment.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createMeetRoom: (title) => request(`/v1/crm/cockpit/meet.php?title=${encodeURIComponent(title || '')}`),
  processAntiNoShow: () => request('/v1/crm/anti_noshow_process.php', { method: 'POST' }),
  submitAnamnese: (payload) => request('/v1/crm/anamnese_webhook.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  syncMedia: (payload) => request('/v1/crm/media_sync.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getKanbanCards: (pipeline = 'CLINICA') => request(`/v1/crm/kanban_cards.php?pipeline=${encodeURIComponent(pipeline)}`),
  moveKanbanCard: (cardId, newStage) => request('/v1/crm/kanban_move.php', {
    method: 'POST',
    body: JSON.stringify({ card_id: cardId, new_stage: newStage })
  }),
  getNoShowStats: () => request('/v1/crm/anti_noshow_process.php?action=stats'),
  triggerNoShowReminders: () => request('/v1/crm/noshow_trigger.php', { method: 'POST' }),
  getInboxConversations: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/v1/crm/inbox_conversations.php${qs}`);
  },
  getInboxMessages: (conversationId, phone) => {
    const qs = `?conversation_id=${encodeURIComponent(conversationId || '')}&phone=${encodeURIComponent(phone || '')}`;
    return request(`/v1/crm/inbox_messages.php${qs}`);
  },
  pollInboxDelta: (conversationId, afterId, phone) => {
    const qs = `?conversation_id=${encodeURIComponent(conversationId || '')}&after_id=${encodeURIComponent(afterId || 0)}&phone=${encodeURIComponent(phone || '')}`;
    return request(`/v1/crm/inbox_poll_delta.php${qs}`);
  },
  sendInboxMessage: (payload) => request('/v1/crm/inbox_messages.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAttendants: () => request('/v1/crm/attendants.php'),
  updateAttendantRouting: (payload) => request('/v1/crm/attendants.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  transferConversation: (payload) => request('/v1/crm/transfer.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getChannels: () => request('/v1/crm/channels.php'),
  getQrCode: (instanceKey) => request(`/v1/crm/channels.php?action=qr&instanceKey=${encodeURIComponent(instanceKey)}`),
  getTeam: () => request('/v1/crm/team.php'),
  saveChannel: (payload) => request('/v1/crm/channels.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteChannel: (id) => request(`/v1/crm/channels.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  }),
  getSettings: () => request('/v1/crm/settings.php'),
  saveSettings: (payload) => request('/v1/crm/settings.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  syncCannedResponses: () => request('/v1/crm/canned_responses.php', { method: 'POST' }),
  getCannedResponses: () => request('/v1/crm/canned_responses.php'),
  executeInboxAction: (payload) => request('/v1/crm/inbox_actions.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  sendInboxMedia: (formData) => request('/v1/crm/inbox_messages.php', {
    method: 'POST',
    body: formData
  }),
  importChatHistory: (formData) => request('/v1/crm/history_import.php', {
    method: 'POST',
    body: formData
  }),
  getMyProfile: () => request('/v1/crm/attendants.php?action=me').catch(() => ({
    success: true,
    me: {
      id: '1',
      username: 'guilherme',
      name: 'Guilherme (Gestor)',
      role: 'ADMIN',
      primaryLine: 'JURIDICO',
      allowedLines: ['CLINICA', 'JURIDICO', 'VENDAS', 'SUPORTE']
    }
  })),
  getHealth: () => request('/v1/crm/health.php'),
  // Nexus V4.8 (PLAN-195) Human-AI Integration Methods
  sendRlhfFeedback: (payload) => request('/v1/crm/hermes_rlhf.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getClinicalBridge: (phone) => request(`/v1/crm/clinical_bridge.php?phone=${encodeURIComponent(phone)}`),
  saveClinicalBridge: (payload) => request('/v1/crm/clinical_bridge.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  nlpExtractClinicalProfile: (payload) => request('/v1/crm/clinical_bridge.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'nlp_extract', ...payload })
  }),
  getAutomationQueue: (status = 'PENDING_APPROVAL') => request(`/v1/crm/automation_queue.php?status=${encodeURIComponent(status)}`),
  processAutomationAction: (payload) => request('/v1/crm/automation_queue.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  // Nexus V4.9 (PLAN-197) Soul Memory Methods
  getSoulMemory: (phone) => request(`/v1/crm/soul_memory.php?phone=${encodeURIComponent(phone)}`),
  consolidateSoulMemory: (payload) => request('/v1/crm/soul_memory.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

// ==========================================
// INSTAGRAM ZERNIO HUB API (PLAN-201)
// ==========================================
export const instagramApi = {
  getConversations: (limit = 50) => request(`/v1/crm/instagram_inbox.php?action=conversations&limit=${limit}`),
  getMessages: (conversationId) => request(`/v1/crm/instagram_inbox.php?action=messages&conversation_id=${encodeURIComponent(conversationId)}`),
  sendDirectMessage: (conversationId, message, attachments = []) => request('/v1/crm/instagram_inbox.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'send_dm', conversation_id: conversationId, message, attachments })
  }),
  markAsRead: (conversationId) => request('/v1/crm/instagram_inbox.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'mark_read', conversation_id: conversationId })
  }),
  getTelemetry: () => request('/v1/crm/instagram_inbox.php?action=telemetry')
};

export const googleContactsApi = {
  getStats: () => request('/v1/crm/google_contacts.php?action=stats'),
  listContacts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/v1/crm/google_contacts.php?action=list&${q}`);
  },
  saveContact: (payload) => request('/v1/crm/google_contacts.php?action=save', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  syncAll: () => request('/v1/crm/google_contacts.php?action=sync_all', { method: 'POST' })
};

export const googleDriveApi = {
  listItems: (parentId = null) => request(`/v1/crm/google_drive.php?action=list${parentId ? `&parent_id=${encodeURIComponent(parentId)}` : ''}`),
  uploadFile: (formData) => request('/v1/crm/google_drive.php?action=upload', {
    method: 'POST',
    body: formData
  }),
  renameItem: (fileId, newName) => request('/v1/crm/google_drive.php?action=rename', {
    method: 'POST',
    body: JSON.stringify({ action: 'rename', file_id: fileId, new_name: newName })
  }),
  ensurePatientFolder: (patientName, cpf = null, folderType = 'PRONTUARIO') => request('/v1/crm/google_drive.php', {
    method: 'POST',
    body: JSON.stringify({ patient_name: patientName, cpf, folder_type: folderType })
  })
};

export const googleWorkspaceApi = {
  getStatus: () => request('/v1/crm/google_status.php').catch(() => ({
    success: false,
    is_connected: false,
    is_live_api: false,
    mode: 'LOCAL_FALLBACK',
    account: 'bodyharmony36@gmail.com',
    auth_type: 'none',
    services: { contacts: 'standby', calendar: 'standby', drive: 'standby', meet: 'standby' },
    synced_contacts_count: 0
  })),
  runLiveProbe: () => request('/v1/crm/google_status.php?action=probe', {
    method: 'POST',
    body: JSON.stringify({ action: 'probe' })
  }),
  saveToken: (tokenJson) => request('/v1/crm/google_status.php?action=save_token', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_token', token_json: tokenJson })
  }),
  getOAuthConfig: () => request('/v1/crm/google_oauth.php?action=config').catch(() => ({
    success: true,
    account: 'bodyharmony36@gmail.com',
    has_client_id: false,
    client_id: '',
    has_client_secret: false,
    redirect_uri: 'https://bodyharmony.com.br/api/v1/crm/google_oauth.php?action=callback',
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/contacts'],
    service_account_email: 'bodyharmony-crm-sa@nom4d-crm.iam.gserviceaccount.com'
  })),
  getOAuthUrl: (clientId = null) => request(`/v1/crm/google_oauth.php?action=auth_url${clientId ? `&client_id=${encodeURIComponent(clientId)}` : ''}`),
  saveOAuthCredentials: (clientId, clientSecret) => request('/v1/crm/google_oauth.php?action=save_credentials', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_credentials', client_id: clientId, client_secret: clientSecret })
  }),
  exchangeOAuthCode: (code) => request('/v1/crm/google_oauth.php?action=exchange_code', {
    method: 'POST',
    body: JSON.stringify({ action: 'exchange_code', code })
  }),
  disconnect: () => request('/v1/crm/google_status.php?action=disconnect', {
    method: 'POST',
    body: JSON.stringify({ action: 'disconnect' })
  }),
  getAppointments: (calendarId = 'primary') => request(`/v1/crm/google_calendar.php?calendar_id=${encodeURIComponent(calendarId)}`).catch(() => ({ success: true, count: 0, events: [] })),
  syncCalendar: () => request('/v1/crm/google_calendar.php?action=sync', { method: 'POST' }),
  listContacts: (params = {}) => googleContactsApi.listContacts(params),
  saveContact: (payload) => googleContactsApi.saveContact(payload),
  syncAll: () => googleContactsApi.syncAll(),
  syncContacts: () => googleContactsApi.syncAll(),
  getStats: () => googleContactsApi.getStats(),
  listDriveItems: (parentId = null) => googleDriveApi.listItems(parentId),
  uploadDriveFile: (formData) => googleDriveApi.uploadFile(formData),
  renameDriveItem: (fileId, newName) => googleDriveApi.renameItem(fileId, newName)
};

export const socialChannelsApi = {
  getStatus: () => request('/v1/crm/social-channels/status').catch(() => ({ status: 'active', instagram: true, telegram: true })),
  getConfig: () => request('/v1/crm/social-channels/status').catch(() => request('/crm/social/config')).catch(() => ({ status: 'active', instagram: true, telegram: true })),
  updateConfig: (data) => request('/v1/crm/social-channels/connect', {
    method: 'POST',
    body: JSON.stringify(data)
  }).catch(() => request('/crm/social/config', { method: 'POST', body: JSON.stringify(data) })),
  connect: (payload) => request('/v1/crm/social-channels/connect', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

export const afterHoursApi = {
  getSettings: () => request('/v1/crm/afterhours/settings'),
  updateSettings: (payload) => request('/v1/crm/afterhours/settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  simulate: (payload) => request('/v1/crm/afterhours/simulate', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

export const crmAnalyticsApi = {
  getExport: (period = '30d') => request(`/v1/crm/analytics_export.php?period=${encodeURIComponent(period)}`),
  getMetrics: (period = '30d') => request(`/v1/crm/analytics_export.php?period=${encodeURIComponent(period)}`)
    .catch(() => ({ success: false, total_sessions: 0, revenue: 0 }))
};

export const crmHealthApi = {
  checkHealth: () => request('/v1/crm/health.php').catch(() => request('/crm/health')),
  getHealth: () => request('/v1/crm/health.php').catch(() => request('/crm/health'))
};

// ==========================================
// CONGRESSO BODY HARMONY & GATEWAY API (PLAN-159)
// ==========================================
export const congressApi = {
  getTiers: () => request('/v1/congress/tiers'),
  validateCoupon: (code, tierId, customerCpf = '', customerEmail = '') => request('/v1/congress/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, tier_id: tierId, customer_cpf: customerCpf, customer_email: customerEmail })
  }),
  checkout: (payload) => request('/v1/congress/checkout', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getTicket: (token) => request(`/v1/congress/ticket/${encodeURIComponent(token)}`),
  lookupTickets: (identifier) => request('/v1/congress/ticket/lookup', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  }),
  updateTier: (tierId, payload) => request(`/v1/admin/congress/tiers/${tierId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAdminCoupons: () => request('/v1/admin/congress/coupons'),
  saveAdminCoupon: (payload) => request('/v1/admin/congress/coupons', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteAdminCoupon: (couponId) => request(`/v1/admin/congress/coupons/${couponId}`, {
    method: 'DELETE'
  }),
  getCouponUsages: (couponId) => request(`/v1/admin/congress/coupons/${couponId}/usages`),
  processCheckIn: (token) => request('/v1/admin/congress/checkin', {
    method: 'POST',
    body: JSON.stringify({ ticket_token: token })
  })
};

// ==========================================
// HERMES AGENT BOT & COPILOT API (PLAN-hermes-crm-intelligence)
// ==========================================
export const hermesAgentApi = {
  getConfig: () => request('/v1/crm/hermes_agent_webhook.php'),
  updateConfig: (config) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_config', config })
  }),
  updatePrompts: (prompts) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_prompts', prompts })
  }),
  testPrompt: (channel, message, operator = {}) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'test_prompt', channel, message, operator })
  }),
  getCopilotDraft: (message, line, patient = {}, operator = {}, history = []) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'copilot_draft', message, line, patient, operator, history })
  }),
  summarizeDossier: (conversationId, messages = [], contact = {}) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'summarize_dossier', conversation_id: conversationId, messages, contact })
  }),
  internalAssistantChat: (query, operator = {}, history = [], contact = {}) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'internal_assistant_chat', query, operator, history, contact })
  }),
  executeTool: (tool, args = {}) => request('/v1/crm/hermes_agent_webhook.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'execute_tool', tool, args })
  })
};

// ==========================================
// BACKGROUND WORKERS & ANTI NO-SHOW API (PLAN-crm-background-workers)
// ==========================================
export const crmWorkerApi = {
  getStatus: () => request('/v1/crm/worker_runner.php'),
  runFullCycle: () => request('/v1/crm/worker_runner.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'run_full' })
  }),
  runReminders: () => request('/v1/crm/worker_runner.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'run_reminders' })
  }),
  runCalendarSync: () => request('/v1/crm/worker_runner.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'run_calendar_sync' })
  })
};

// ==========================================
// HERMES AI AUDIT TRAIL & ADVANCED INTELLIGENCE API (PLAN-hermes-advanced-audit)
// ==========================================
export const hermesAuditApi = {
  getFeedAndMetrics: () => request('/v1/crm/hermes_audit.php'),
  searchKnowledge: (query) => request(`/v1/crm/hermes_audit.php?action=knowledge_search&q=${encodeURIComponent(query)}`),
  getPatientMemory: (phone) => request(`/v1/crm/hermes_audit.php?action=patient_memory&phone=${encodeURIComponent(phone)}`),
  transcribeAudio: (audioUrl) => request('/v1/crm/hermes_audit.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'transcribe_audio', audio_url: audioUrl })
  }),
  analyzeSentiment: (text) => request('/v1/crm/hermes_audit.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'analyze_sentiment', text })
  })
};





