import { request, API_BASE } from './api';

const LMSService = {
    // === MODULES ===
    getModules: async () => {
        return request('/v1/admin/lms/modules');
    },

    createModule: async (data) => {
        return request('/v1/admin/lms/modules', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateModule: async (data) => {
        return request('/v1/admin/lms/modules', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteModule: async (id) => {
        return request(`/v1/admin/lms/modules/${id}`, {
            method: 'DELETE'
        });
    },

    reorderModules: async (orderIds) => {
        return request('/v1/admin/lms/modules/reorder', {
            method: 'PATCH',
            body: JSON.stringify({ order: orderIds })
        });
    },

    // === LESSONS ===
    createLesson: async (data) => {
        return request('/v1/admin/lms/lessons', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateLesson: async (data) => {
        return request('/v1/admin/lms/lessons', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteLesson: async (id) => {
        return request(`/v1/admin/lms/lessons/${id}`, {
            method: 'DELETE'
        });
    },

    retranscribeLesson: async (id) => {
        return request(`/v1/admin/lms/lessons/${id}/retranscribe`, {
            method: 'POST'
        });
    },

    reorderLessons: async (orderIds) => {
        return request('/v1/admin/lms/lessons/reorder', {
            method: 'PATCH',
            body: JSON.stringify({ order: orderIds })
        });
    },

    // === ATTACHMENTS ===
    uploadAttachment: async (lessonId, title, file) => {
        const formData = new FormData();
        formData.append('lesson_id', lessonId);
        formData.append('title', title);
        formData.append('file', file);

        return request('/v1/admin/lms/attachments', {
            method: 'POST',
            body: formData
        });
    },

    deleteAttachment: async (id) => {
        return request(`/v1/admin/lms/attachments/${id}`, {
            method: 'DELETE'
        });
    },

    // === UPLOAD (Chunked with Progress) ===
    uploadVideoChunk: (chunk, index, totalChunks, fileName, fileId, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = `${API_BASE}/v1/admin/lms/upload-chunk`;

            xhr.open('POST', url, true);

            const savedAuth = localStorage.getItem('bh_auth');
            if (savedAuth) {
                try {
                    const parsed = JSON.parse(savedAuth);
                    if (parsed.token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${parsed.token}`);
                    }
                } catch (e) { }
            }

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(e);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('chunk_index', index);
            formData.append('total_chunks', totalChunks);
            formData.append('file_name', fileName);
            formData.append('file_id', fileId);

            xhr.send(formData);
        });
    },

    // === THUMBNAILS ===
    uploadThumbnail: async (file, slug = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (slug) formData.append('slug', slug);

        return request('/v1/admin/lms/upload-thumbnail', {
            method: 'POST',
            body: formData
        });
    },

    // === PREVIEW & CONVERT (ADMIN) ===
    signAdminUrl: async (lessonId) => {
        return request('/v1/admin/lms/sign-url', {
            method: 'POST',
            body: JSON.stringify({ lesson_id: lessonId })
        });
    },

    convertToHls: async (lessonId) => {
        return request(`/v1/admin/lms/lessons/${lessonId}/convert-hls`, {
            method: 'POST'
        });
    },

    // === SIGN URL (STUDENT) ===
    signUrl: async (lessonId) => {
        return request('/v1/lms/sign-url', {
            method: 'POST',
            body: JSON.stringify({ lesson_id: lessonId })
        });
    },

    // === FILE MANAGEMENT (V24) ===
    getFileInfo: async (id) => {
        return request(`/v1/admin/lms/lessons/${id}/file-info`);
    },

    renameFile: async (id, newName) => {
        return request(`/v1/admin/lms/lessons/${id}/rename-file`, {
            method: 'POST',
            body: JSON.stringify({ new_name: newName })
        });
    },

    getDownloadUrl: async (id) => {
        return request(`/v1/admin/lms/lessons/${id}/download-url`);
    },

    // === QUIZZES ===
    getQuiz: async (moduleId) => {
        return request(`/v1/admin/lms/quiz?module_id=${moduleId}`);
    },

    saveQuiz: async (quizData) => {
        return request('/v1/admin/lms/quiz', {
            method: 'POST',
            body: JSON.stringify(quizData)
        });
    },

    getStudentQuiz: async (moduleId) => {
        return request(`/v1/lms/quiz?module_id=${moduleId}`);
    },

    submitQuiz: async (payload) => {
        return request('/v1/lms/quiz/submit', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // === ANALYTICS ===
    getDashboardStats: async () => {
        return request('/v1/admin/lms/dashboard');
    },

    // === CERTIFICATES ===
    generateCertificate: async (moduleId) => {
        const token = localStorage.getItem('bh_auth') ? JSON.parse(localStorage.getItem('bh_auth')).token : null;

        try {
            const response = await fetch(`${API_BASE}/v1/lms/certificate/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ module_id: moduleId })
            });

            if (!response.ok) throw new Error('Falha ao gerar certificado');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificado_Modulo_${moduleId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    // === LIBRARY (GLOBAL RESOURCES) ===
    getLibraryResources: async () => {
        return request('/v1/admin/library');
    },

    uploadLibraryResource: async (title, file, category = 'other') => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        formData.append('category', category);

        return request('/v1/admin/library', {
            method: 'POST',
            body: formData
        });
    },

    deleteLibraryResource: async (id) => {
        return request(`/v1/admin/library/${id}`, {
            method: 'DELETE'
        });
    },

    approveResource: async (id) => {
        return request(`/v1/admin/library/${id}/approve`, {
            method: 'PATCH'
        });
    },

    rejectResource: async (id) => {
        return request(`/v1/admin/library/${id}/reject`, {
            method: 'PATCH'
        });
    },

    grantResourceAccess: async (id, studentIds) => {
        return request(`/v1/admin/library/${id}/grant`, {
            method: 'POST',
            body: JSON.stringify({ licenciada_ids: studentIds })
        });
    },

    getStudentResources: async () => {
        return request('/v1/lms/resources');
    },

    getStudents: async () => {
        return request('/v1/gestor/lms/students');
    },

    // === STUDENT ===
    getContent: async (moduleId = null) => {
        const url = moduleId ? `/v1/lms/modules/${moduleId}/lessons` : '/v1/lms/modules';
        const deviceToken = localStorage.getItem('bh_device_token');
        const headers = {};
        if (deviceToken) headers['X-Device-Token'] = deviceToken;
        return request(url, { headers });
    },

    // === EXCLUSIVE ACCESS ===
    getExclusiveAccessList: async () => {
        return request('/v1/admin/lms/exclusive-access/list');
    },

    getExclusiveAccessTargets: async () => {
        return request('/v1/admin/lms/exclusive-access/targets');
    },

    grantExclusiveAccess: async (data) => {
        return request('/v1/admin/lms/exclusive-access/grant', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    revokeExclusiveAccess: async (data) => {
        return request('/v1/admin/lms/exclusive-access/revoke', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    convertHlsBatch: async (force = false) => {
        return request('/v1/admin/lms/lessons/convert-hls-batch', {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    },

    getHlsBatchStatus: async () => {
        return request('/v1/admin/lms/lessons/convert-hls-batch-status');
    },

    generateThumbnailsBatch: async (force = false) => {
        return request('/v1/admin/lms/lessons/generate-thumbnails-batch', {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    },

    getThumbnailsBatchStatus: async () => {
        return request('/v1/admin/lms/lessons/generate-thumbnails-batch-status');
    }
};

export default LMSService;
