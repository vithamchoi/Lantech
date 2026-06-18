import axios from 'axios';

const API_BASE_URL = 'http://localhost:5131/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để đính kèm JWT token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi và chuẩn hóa dữ liệu trả về
apiClient.interceptors.response.use(
  (response) => {
    // Quy tắc: Backend trả về 200 nhưng code nghiệp vụ có thể khác
    const { code, message, result, errors } = response.data;
    
    if (code !== 200) {
      const errorMessage = message || (errors && errors.length > 0 ? errors[0] : 'Đã có lỗi xảy ra');
      return Promise.reject({ response: { data: { message: errorMessage }, status: code } });
    }
    
    return result; // Trả về trực tiếp trường 'result'
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
