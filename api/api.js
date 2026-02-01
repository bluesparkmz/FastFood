import axios from "axios";

export const base_url = 'https://api.skyvenda.com'; // Enforce HTTPS for production

const api = axios.create({
    baseURL: base_url,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false // Disable credentials for CORS
});

// Add a request interceptor to handle tokens if needed
api.interceptors.request.use(function (config) {
    // You can add authorization headers here if needed
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Always attach a Request ID for traceability
    try {
        const reqId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        config.headers['X-Request-ID'] = config.headers['X-Request-ID'] || reqId;
    } catch (_) {
        // noop
    }

    // Auto-generate Idempotency-Key for payment endpoint if missing
    try {
        const isPost = (config.method || '').toLowerCase() === 'post';
        const url = (config.url || '').toString();
        const isPagamento = /\/usuario\/.+\/pagamento\/?/.test(url);
        if (isPost && isPagamento && !config.headers['Idempotency-Key']) {
            const idem = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
            config.headers['Idempotency-Key'] = idem;
        }
    } catch (_) {
        // noop
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Helper to extract a user-friendly error message from FastAPI/Pydantic responses
function extractErrorMessage(err) {
    try {
        const res = err?.response;
        if (!res) return err?.message || 'Erro de rede';
        const data = res.data;
        // Common FastAPI shapes: {detail: '...'} or {detail: [{loc, msg, type, input?}, ...]}
        if (data?.detail) {
            if (typeof data.detail === 'string') return data.detail;
            if (Array.isArray(data.detail)) {
                const msgs = data.detail.map(d => d?.msg || JSON.stringify(d)).filter(Boolean);
                if (msgs.length) return msgs.join('; ');
            }
        }
        // Fallbacks
        if (data?.message) return data.message;
        if (typeof data === 'string') return data;
        return `Erro ${res.status}: ${res.statusText || 'Requisição falhou'}`;
    } catch (_) {
        return 'Ocorreu um erro inesperado';
    }
}

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    response => {
        try { stopLoading(); } catch (_) { }
        return response;
    },
    error => {
        try { stopLoading(); } catch (_) { }
        // Treat canceled requests as benign (navigation changes, strict mode double calls, etc.)
        try {
            const canceled = error?.code === 'ERR_CANCELED' || error?.message === 'canceled' || error?.name === 'CanceledError';
            if (canceled) {
                error.__canceled = true;
                return Promise.reject(error);
            }
        } catch (_) { }
        // Handle CORS errors more gracefully
        if (error.message === 'Network Error') {
            console.error('CORS or Network Error. Please check if the server allows cross-origin requests.');
        }

        // Log API errors with more details for debugging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', {
                status: error.response.status,
                url: error.config?.url,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Error Request:', {
                request: error.request,
                url: error.config?.url || 'unknown URL'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Error Setup:', error.message);
        }

        // Attach normalized message to be safe for UI/toast usage
        error.userMessage = extractErrorMessage(error);
        return Promise.reject(error);
    }
);

// Create a function to make API calls with CORS handling
export const apiCall = async (method, endpoint, data = null, params = null) => {
    try {
        let url = `${base_url}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors' // Enable CORS mode
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        if (params) {
            const queryParams = new URLSearchParams(params).toString();
            url += `?${queryParams}`;
        }

        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Helper function to toggle post like
export const togglePostLike = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Error toggling post like:', error);
        throw error;
    }
};

export default api;
