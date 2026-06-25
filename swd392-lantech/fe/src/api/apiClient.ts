import axios from 'axios';
import { useAppStore } from '../store/appStore';

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
    const originalRequest = error.config;
    
    // Nếu gặp lỗi 401 (Unauthorized) và request chưa được retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Gọi API refresh token bằng axios nguyên bản để tránh interceptor loop
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken
          });
          
          const { code, result } = response.data;
          
          if (code === 200 && result?.accessToken) {
            // Lưu token mới
            localStorage.setItem('access_token', result.accessToken);
            localStorage.setItem('refresh_token', result.refreshToken);
            
            // Cập nhật Header Authorization cho request cũ và gửi lại
            originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('Refresh token code is not 200');
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
      
      // Nếu không có refresh token hoặc gọi API refresh thất bại, xóa token và đăng xuất
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      useAppStore.getState().logout();
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
