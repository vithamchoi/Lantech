import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { AssessmentDetailDto } from "../services/assessmentService";
import { authService } from "../services/authService";
import { useTranslation } from "../hooks/useTranslation";
import apiClient from "../api/apiClient";
import { CheckCircle2, Award, BookOpen, ChevronRight, BarChart2 } from "lucide-react";

export default function AssessmentResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, login } = useAppStore();
  const { t } = useTranslation();
  
  const result = location.state?.result as any;

  if (!result) {
    navigate("/dashboard");
    return null;
  }

  // Extract breakdown scores supporting both camelCase and PascalCase
  const breakdown = result.skillBreakdown || result.SkillBreakdown || {};
  const listening = breakdown.Listening ?? breakdown.listening ?? result.listeningScore ?? 0;
  const reading = breakdown.Reading ?? breakdown.reading ?? result.readingScore ?? 0;
  const writing = breakdown.Writing ?? breakdown.writing ?? result.writingScore ?? 0;
  const speaking = breakdown.Speaking ?? breakdown.speaking ?? result.speakingScore ?? 0;
  
  const avgScore = Math.round(
    result.overallScore ?? result.OverallScore ?? (listening + reading + writing + speaking) / 4
  );

  const SKILL_SCORES = [
    { name: "Listening (Nghe)", score: Math.round(listening), color: "#1CB0F6" },
    { name: "Reading (Đọc)", score: Math.round(reading), color: "#8b5cf6" },
    { name: "Writing (Viết)", score: Math.round(writing), color: "#f97316" },
    { name: "Speaking (Nói)", score: Math.round(speaking), color: "#10b981" },
  ];

  // Map average score to standard levels
  const getRecommendedLevel = (score: number) => {
    if (score < 20) return "A1";
    if (score < 40) return "A2";
    if (score < 60) return "B1";
    if (score < 80) return "B2";
    return "C1";
  };

  const RECOMMENDED_LEVEL = result.cefrLevel ?? result.CefrLevel ?? result.resultLevel ?? getRecommendedLevel(avgScore);

  const LEVELS = [
    { key: "A1", range: "Dưới 20 điểm", title: "A1 - Beginner (Cơ bản)", desc: "Phù hợp cho người bắt đầu làm quen với Tiếng Anh." },
    { key: "A2", range: "20 - 39 điểm", title: "A2 - Elementary (Sơ cấp)", desc: "Có thể hiểu và giao tiếp những thông tin đơn giản." },
    { key: "B1", range: "40 - 59 điểm", title: "B1 - Intermediate (Trung cấp)", desc: "Đủ khả năng diễn đạt ý kiến và hiểu các nội dung phổ biến." },
    { key: "B2", range: "60 - 79 điểm", title: "B2 - Upper Intermediate (Khá)", desc: "Có thể tự tin giao tiếp và viết các văn bản phức tạp." },
    { key: "C1", range: "80 - 100 điểm", title: "C1 - Advanced (Lưu loát)", desc: "Sử dụng ngôn ngữ linh hoạt cho các mục đích học tập và công việc." },
  ];

  // Track the user's custom chosen level (Default to RECOMMENDED_LEVEL)
  const [selectedLevel, setSelectedLevel] = React.useState(() => RECOMMENDED_LEVEL);

  // Calculate allowed selection options (RECOMMENDED_LEVEL +/- 1 level)
  const ALL_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  const recommendedIdx = ALL_CEFR_LEVELS.indexOf(RECOMMENDED_LEVEL);
  const minIdx = Math.max(0, recommendedIdx - 1);
  const maxIdx = Math.min(ALL_CEFR_LEVELS.length - 1, recommendedIdx + 1);
  const allowedLevels = ALL_CEFR_LEVELS.slice(minIdx, maxIdx + 1);

  const handlePlantTrail = async () => {
    try {
      // Overwrite the learning path for the chosen level manually
      await apiClient.post("/learningpaths/generate-manual", { cefrLevel: selectedLevel });
      
      const updatedUser = await authService.getMe();
      login(updatedUser.role === 'Admin' ? 'Admin' : 'Student', updatedUser);
    } catch (e) {
      if (user) {
        setUser({
          ...user,
          cefr: selectedLevel,
        });
      }
    }
    navigate("/dashboard");
  };

  return (
    <div className="overflow-y-auto h-full px-8 py-10 text-left" style={{ fontFamily: "var(--font-family)", background: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#1e293b", marginBottom: 8 }}>
            Kết Quả Đánh Giá Năng Lực
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>
            Chúc mừng bạn đã hoàn thành bài thi chẩn đoán 4 kỹ năng! Dưới đây là phân tích kết quả chi tiết của bạn.
          </p>
        </div>

        {/* Scoring Summary & Recommended Level Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Score Card */}
          <div className="bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm border border-slate-100">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Điểm Trung Bình</span>
            <div className="relative flex items-center justify-center">
              <span className="text-6xl font-black text-slate-800">{avgScore}</span>
              <span className="text-lg font-bold text-slate-400 ml-1">/100</span>
            </div>
            <p className="text-xs text-slate-400 mt-3">Trung bình cộng của cả 4 bài thi kỹ năng</p>
          </div>

          {/* Recommended CEFR Card */}
          <div className="md:col-span-2 rounded-3xl p-7 flex flex-col justify-between text-white shadow-lg transition-all duration-300"
               style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                {selectedLevel === RECOMMENDED_LEVEL ? "Trình Độ Khuyên Dùng" : "Trình Độ Bạn Đã Chọn"}
              </span>
              <h2 className="text-5xl font-black mt-2 leading-none">{selectedLevel}</h2>
              <p className="text-sm font-semibold mt-2 opacity-95">
                {LEVELS.find(l => l.key === selectedLevel)?.title}
              </p>
            </div>
            <p className="text-xs opacity-90 mt-4 leading-relaxed">
              {selectedLevel === RECOMMENDED_LEVEL 
                ? "Dựa trên điểm trung bình của bạn, hệ thống khuyên nghị bạn nên bắt đầu lộ trình học tập ở trình độ này để đạt hiệu quả tốt nhất."
                : `Bạn đã tự chọn bắt đầu lộ trình học tập ở trình độ ${selectedLevel} (Trình độ gốc được chẩn đoán là ${RECOMMENDED_LEVEL}).`}
            </p>
          </div>
        </div>

        {/* Level List Visualizer */}
        <div className="bg-white rounded-3xl p-7 mb-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
            <Award size={20} className="text-emerald-500" />
            Khung Đánh Giá Năng Lực (5 Cấp Độ)
          </h3>
          <div className="flex flex-col gap-4">
            {LEVELS.map(lvl => {
              const isGradedLevel = lvl.key === RECOMMENDED_LEVEL;
              const isSelectedLevel = lvl.key === selectedLevel;
              return (
                <div 
                  key={lvl.key}
                  className={`rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between border-2 ${
                    isGradedLevel 
                      ? "border-emerald-500 bg-emerald-50/30 shadow-sm" 
                      : "border-slate-100 bg-slate-50/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                        isGradedLevel ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {lvl.key}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isGradedLevel ? "text-emerald-900" : "text-slate-700"}`}>
                        {lvl.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{lvl.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isGradedLevel ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"
                    }`}>
                      {lvl.range}
                    </span>
                    {isGradedLevel && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={14} /> Trình độ của bạn
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill breakdown */}
        <div className="bg-white rounded-3xl p-7 mb-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-emerald-500" />
            Chi Tiết Điểm Số Từng Kỹ Năng
          </h3>
          <div className="flex flex-col gap-6">
            {SKILL_SCORES.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">{s.name}</span>
                  <span className="text-base font-extrabold" style={{ color: s.color }}>{s.score} / 100</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 10, background: "#f1f5f9" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.score}%`, background: s.color, transition: "width 1s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customized Level Selector */}
        <div className="bg-white rounded-3xl p-7 mb-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-500" />
            Tự Chọn Trình Độ Học Tập Của Bạn
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Hệ thống đánh giá trình độ của bạn là <strong className="text-emerald-600">{RECOMMENDED_LEVEL}</strong>. 
            Bạn được phép tự chọn trình độ bắt đầu học (chênh lệch tối đa 1 bậc so với kết quả chấm):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {allowedLevels.map(lvlKey => {
              const lvlDetails = LEVELS.find(l => l.key === lvlKey);
              if (!lvlDetails) return null;
              const isSelected = selectedLevel === lvlKey;
              const isGraded = lvlKey === RECOMMENDED_LEVEL;
              
              return (
                <button
                  key={lvlKey}
                  type="button"
                  onClick={() => setSelectedLevel(lvlKey)}
                  className={`rounded-2xl p-5 text-left transition-all border-2 cursor-pointer outline-none bg-none flex flex-col justify-between ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm" 
                      : "border-slate-100 hover:border-slate-300 bg-slate-50/20"
                  }`}
                  style={{ minHeight: "130px" }}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-lg font-black ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                        Trình độ {lvlKey}
                      </span>
                      {isGraded && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Được chấm
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">{lvlDetails.range}</span>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{lvlDetails.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 size={13} /> Đang chọn học
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handlePlantTrail}
          className="w-full py-5 rounded-2xl cursor-pointer border-none outline-none font-black text-white text-lg shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
          style={{ background: "#10b981" }}
        >
          Nhận lộ trình học tập và Bắt đầu <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
