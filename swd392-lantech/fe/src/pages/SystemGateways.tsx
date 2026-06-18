import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, UserRole } from '../store/appStore';
import { ShieldAlert, Server, Activity, ArrowLeft, Key } from 'lucide-react';

export default function SystemGateways() {
  const navigate = useNavigate();
  const { role, setRole, login, logout } = useAppStore();

  const handleQuickRoleChange = (targetRole: UserRole) => {
    if (targetRole === 'Visitor') {
      logout();
    } else {
      login(targetRole, `${targetRole.toLowerCase()}@lantech-dev.org`);
    }
  };

  const healthServices = [
    { name: "Core API Host", status: "Hoạt động tốt", latency: "14ms", details: "SWD392.LantechEnglish.Api đang chạy" },
    { name: "Database Store", status: "Hoạt động tốt", latency: "2ms", details: "Kết nối PostgreSQL đang mở" },
    { name: "Speech AI Engine", status: "Hoạt động tốt", latency: "142ms", details: "Dịch vụ Azure Cognitive trực tuyến" },
    { name: "Cache Storage", status: "Hoạt động tốt", latency: "1ms", details: "Lớp bộ đệm Redis đang hoạt động" }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-inter text-left transition-colors duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-control transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Bàn Chẩn Đoán Hệ Thống</span>
            <h1 className="text-2xl font-bold text-slate dark:text-cream-50 font-outfit mt-0.5">Cổng Kết Nối Hệ Thống</h1>
          </div>
        </div>
      </div>

      {/* Grid: Health Check and Sim panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Health Check Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse space-y-4 transition-colors duration-300">
            <h3 className="font-outfit font-bold text-lg text-slate dark:text-cream-50 border-b border-sage dark:border-[#2C3531] pb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-meadow dark:text-meadow-400" /> Trạng thái Dịch vụ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {healthServices.map((srv) => (
                <div key={srv.name} className="p-4 bg-cream-50 dark:bg-slate-900/60 rounded-control border border-sage dark:border-[#2C3531] space-y-2 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate dark:text-cream-100">{srv.name}</h4>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-meadow-50 dark:bg-meadow-950/20 text-meadow dark:text-meadow-400 text-[9px] font-bold rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-meadow dark:bg-meadow-400"></span> {srv.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-cream-300/50 leading-snug">{srv.details}</p>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold pt-1">Độ trễ Phản hồi: {srv.latency}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Core System stats */}
          <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse space-y-4 transition-colors duration-300">
            <h3 className="font-outfit font-bold text-sm text-slate dark:text-cream-50 border-b border-sage dark:border-[#2C3531] pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Chỉ số API Endpoint
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-cream-50/50 dark:bg-slate-900/30 rounded border border-sage/50 dark:border-[#2C3531]/50">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Tổng số Endpoint được kiểm soát</span>
                <span className="font-mono font-bold text-slate dark:text-cream-50">119 tuyến đường đang chạy</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50/50 dark:bg-slate-900/30 rounded border border-sage/50 dark:border-[#2C3531]/50">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Bộ lọc quyền bảo mật</span>
                <span className="font-mono font-bold text-slate dark:text-cream-50">Xác thực Token JWT Gating</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50/50 dark:bg-slate-900/30 rounded border border-sage/50 dark:border-[#2C3531]/50">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Trạng thái dữ liệu giả (Mock Mode)</span>
                <span className="font-mono font-bold text-meadow dark:text-meadow-400">Có (Môi trường phát triển cục bộ)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Development Sim Toggles */}
        <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse space-y-6 transition-colors duration-300">
          <div>
            <h3 className="font-outfit font-bold text-sm text-slate dark:text-cream-50 border-b border-sage dark:border-[#2C3531] pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-ochre dark:text-ochre-400" /> Giả lập Vai trò (Role)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Thay đổi nhanh vai trò phiên làm việc của người dùng để xác minh các quyền truy cập trang và phân hệ giao diện.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { roleName: 'Visitor' as UserRole, desc: 'Khách vãng lai & Đăng nhập' },
              { roleName: 'Student' as UserRole, desc: 'Bảng học tập & Bộ thẻ từ vựng' },
              { roleName: 'Admin' as UserRole, desc: 'Trang Quản trị Ranger & Hệ thống Quản lý' }
            ].map((sim) => (
              <button
                key={sim.roleName}
                onClick={() => handleQuickRoleChange(sim.roleName)}
                className={`w-full flex items-center justify-between p-3.5 rounded-control border text-left transition-all ${
                  role === sim.roleName
                    ? 'border-meadow bg-meadow-50/50 dark:bg-meadow-950/20 text-slate dark:text-cream-50 font-bold dark:border-meadow-500'
                    : 'border-sage dark:border-[#2C3531] hover:bg-cream-200 dark:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold'
                }`}
              >
                <div>
                  <span className="text-xs block capitalize text-slate dark:text-cream-100 font-bold">Vai trò: {sim.roleName}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">{sim.desc}</span>
                </div>
                {role === sim.roleName && (
                  <span className="w-2.5 h-2.5 bg-meadow dark:bg-meadow-400 rounded-full animate-pulse shrink-0"></span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-ochre-50 dark:bg-ochre-950/10 p-4 rounded-control border border-ochre-100 dark:border-ochre-900/30 flex items-start gap-2.5 transition-colors duration-300">
            <ShieldAlert className="w-5 h-5 text-ochre shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="font-bold text-xs text-ochre-600 dark:text-ochre-400">An toàn giả lập</h4>
              <p className="text-[10px] text-slate-500 dark:text-cream-200/80 leading-relaxed mt-0.5">
                Các nút này sẽ trực tiếp thay đổi trạng thái trong Zustand cục bộ để thuận tiện cho việc kiểm thử luồng hoạt động (E2E).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
