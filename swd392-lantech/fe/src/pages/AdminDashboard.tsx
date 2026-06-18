import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Plus, Pencil, Trash2, Search, ShieldCheck, Users, BookOpen, HelpCircle, Award, BarChart2, TrendingUp, X, Loader2, Sparkles } from "lucide-react";
import { adminService, AdminStatsDto, AdminUserDto, AdminLessonDto, AdminQuestionDto, AdminVocabularyDto, AdminBadgeDto, AdminPronunciationPhraseDto } from "../services/adminService";
import { toast } from "sonner";
import apiClient from "../api/apiClient";

type AdminSection = "overview" | "questions" | "lessons" | "vocabulary" | "users" | "badges" | "pronunciation";

const SECTIONS: { id: AdminSection; label: string; icon: any }[] = [
  { id: "overview", label: "Tổng quan", icon: BarChart2 },
  { id: "questions", label: "Ngân hàng câu hỏi", icon: HelpCircle },
  { id: "lessons", label: "Bài học", icon: BookOpen },
  { id: "vocabulary", label: "Từ vựng", icon: BookOpen },
  { id: "pronunciation", label: "Luyện phát âm", icon: BookOpen },
  { id: "users", label: "Tài khoản người dùng", icon: Users },
  { id: "badges", label: "Huy hiệu & Thành tích", icon: Award },
];

type UserStatus = "active" | "suspended";
type UserRole = "student" | "ranger";

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  Grammar: { bg: "#e0f2fe", text: "#0369a1" },
  Listening: { bg: "#fef9c3", text: "#854d0e" },
  Reading: { bg: "#f3e8ff", text: "#7e22ce" },
  Writing: { bg: "#dcfce7", text: "#166534" },
  Speaking: { bg: "#ffe4e6", text: "#9f1239" },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: "#e0f2fe", text: "#0369a1" },
  A2: { bg: "#dcfce7", text: "#166534" },
  B1: { bg: "#fef9c3", text: "#854d0e" },
  B2: { bg: "#fed7aa", text: "#9a3412" },
  C1: { bg: "#f3e8ff", text: "#7e22ce" },
  C2: { bg: "#ffe4e6", text: "#9f1239" },
};

const translateSkill = (skill: string) => {
  const mapping: Record<string, string> = {
    Grammar: "Ngữ pháp",
    Listening: "Nghe",
    Reading: "Đọc",
    Writing: "Viết",
    Speaking: "Nói"
  };
  return mapping[skill] || skill;
};

const translateDifficulty = (difficulty: string | number) => {
  if (difficulty === "Hard" || difficulty === 3) return "Khó";
  if (difficulty === "Medium" || difficulty === 2) return "Trung bình";
  return "Dễ";
};

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const darkMode = useAppStore(state => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/ranger/curriculum") {
      if (activeSection !== "lessons" && activeSection !== "questions") {
        setActiveSection("lessons");
      }
    } else if (path === "/ranger/vocabulary-badges") {
      if (activeSection !== "vocabulary" && activeSection !== "badges") {
        setActiveSection("vocabulary");
      }
    } else if (path === "/ranger/users") {
      setActiveSection("users");
    } else if (path === "/ranger/translations") {
      setActiveSection("pronunciation");
    } else {
      setActiveSection("overview");
    }
  }, [location.pathname]);

  const handleTabClick = (sectionId: AdminSection) => {
    setActiveSection(sectionId);
    setSearch("");
    if (sectionId === "overview") {
      navigate("/ranger");
    } else if (sectionId === "lessons" || sectionId === "questions") {
      navigate("/ranger/curriculum");
    } else if (sectionId === "vocabulary" || sectionId === "badges") {
      navigate("/ranger/vocabulary-badges");
    } else if (sectionId === "users") {
      navigate("/ranger/users");
    } else if (sectionId === "pronunciation") {
      navigate("/ranger/translations");
    }
  };

  // State for data from API
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [questions, setQuestions] = useState<AdminQuestionDto[]>([]);
  const [vocabularies, setVocabularies] = useState<AdminVocabularyDto[]>([]);
  const [badges, setBadges] = useState<AdminBadgeDto[]>([]);
  const [phrases, setPhrases] = useState<AdminPronunciationPhraseDto[]>([]);
  const [selectedPhrase, setSelectedPhrase] = useState<AdminPronunciationPhraseDto | null>(null);
  const [phraseForm, setPhraseForm] = useState({
    text: "",
    phonetic: "",
    category: "",
    tags: ""
  });

  const [isGeneratingPhonetics, setIsGeneratingPhonetics] = useState(false);

  const handleAutoFillPhonetics = async (type: 'pronunciation' | 'vocabulary') => {
    const text = type === 'pronunciation' ? phraseForm.text : vocabForm.word;
    if (!text || !text.trim()) {
      toast.error(type === 'pronunciation' ? "Vui lòng nhập nội dung cụm từ trước" : "Vui lòng nhập từ vựng trước");
      return;
    }

    setIsGeneratingPhonetics(true);
    const toastId = toast.loading("Đang tự động tạo phiên âm bằng AI...");
    try {
      const result = await apiClient.post<any, string>('/AI/generate-phonetics', { text: text.trim() });
      if (type === 'pronunciation') {
        setPhraseForm(prev => ({ ...prev, phonetic: result }));
      } else {
        setVocabForm(prev => ({ ...prev, ipa: result }));
      }
      toast.success("Tạo phiên âm thành công!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Tạo phiên âm thất bại", { id: toastId });
    } finally {
      setIsGeneratingPhonetics(false);
    }
  };

  // Lesson form state
  const [selectedLesson, setSelectedLesson] = useState<AdminLessonDto | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    cefrLevel: "A1",
    description: "",
    skill: "Reading",
    topic: "",
    orderIndex: 1,
    estimatedMinutes: 15,
    xpReward: 20,
    isPublished: true
  });

  // Vocabulary form state
  const [selectedVocabulary, setSelectedVocabulary] = useState<AdminVocabularyDto | null>(null);
  const [vocabForm, setVocabForm] = useState({
    word: "",
    ipa: "",
    cefrLevel: "A1",
    partOfSpeech: "Noun",
    exampleSentence: "",
    meaning: ""
  });

  // Question form state
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestionDto | null>(null);
  const [questionForm, setQuestionForm] = useState({
    lessonId: "",
    type: "MultipleChoice",
    prompt: "",
    instruction: "Choose the correct answer",
    correctAnswer: "",
    options: "",
    explanation: "",
    difficulty: 1,
    xpReward: 5,
    orderIndex: 1
  });

  // Fetch data when section changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeSection === "overview") {
          const data = await adminService.getOverviewStats();
          setStats(data || {
            totalUsers: 0,
            activeUsers: 0,
            totalLessons: 0,
            totalQuestions: 0,
            totalBadges: 0
          });
          const usersData = await adminService.getUsers();
          setUsers(usersData || []);
        } else if (activeSection === "users") {
          const data = await adminService.getUsers();
          setUsers(data || []);
        } else if (activeSection === "lessons") {
          const data = await adminService.getLessons();
          setLessons(data || []);
        } else if (activeSection === "questions") {
          const data = await adminService.getQuestions();
          setQuestions(data || []);
        } else if (activeSection === "vocabulary") {
          const data = await adminService.getVocabularies();
          setVocabularies(data || []);
        } else if (activeSection === "badges") {
          const data = await adminService.getBadges();
          setBadges(data || []);
        } else if (activeSection === "pronunciation") {
          const data = await adminService.getPronunciationPhrases();
          setPhrases(data || []);
        }
      } catch (error) {
        console.error("Admin API Error:", error);
        // Fallback to empty arrays so UI doesn't crash
        setUsers([]);
        setLessons([]);
        setQuestions([]);
        setVocabularies([]);
        setBadges([]);
        setPhrases([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeSection]);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await adminService.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success("Đã cập nhật vai trò người dùng");
    } catch (error) {
      toast.error("Cập nhật vai trò thất bại");
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("Đã cập nhật trạng thái người dùng");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const fetchPhrases = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPronunciationPhrases();
      setPhrases(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách cụm từ phát âm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddPhrase = () => {
    setSelectedPhrase(null);
    setPhraseForm({
      text: "",
      phonetic: "",
      category: "",
      tags: ""
    });
    setShowAddModal(true);
  };

  const handleOpenEditPhrase = (phrase: AdminPronunciationPhraseDto) => {
    setSelectedPhrase(phrase);
    setPhraseForm({
      text: phrase.text,
      phonetic: phrase.phonetic,
      category: phrase.category,
      tags: phrase.tags ? phrase.tags.join(", ") : ""
    });
    setShowAddModal(true);
  };

  const handleSavePhrase = async () => {
    if (!phraseForm.text.trim() || !phraseForm.category.trim()) {
      toast.error("Vui lòng nhập nội dung cụm từ và chủ đề");
      return;
    }

    const payload: AdminPronunciationPhraseDto = {
      text: phraseForm.text.trim(),
      phonetic: phraseForm.phonetic.trim(),
      category: phraseForm.category.trim(),
      tags: phraseForm.tags
        ? phraseForm.tags.split(",").map(t => t.trim()).filter(Boolean)
        : []
    };

    try {
      if (selectedPhrase?.id) {
        await adminService.updatePronunciationPhrase(selectedPhrase.id, payload);
        toast.success("Đã cập nhật cụm từ thành công");
      } else {
        await adminService.createPronunciationPhrase(payload);
        toast.success("Đã tạo cụm từ mới thành công");
      }
      setShowAddModal(false);
      fetchPhrases();
    } catch (err) {
      console.error(err);
      toast.error("Lưu cụm từ thất bại");
    }
  };

  const handleDeletePhrase = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa cụm từ phát âm",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn cụm từ phát âm này không?",
      onConfirm: async () => {
        try {
          await adminService.deletePronunciationPhrase(id);
          toast.success("Xóa cụm từ thành công");
          fetchPhrases();
        } catch (err) {
          console.error(err);
          toast.error("Xóa cụm từ thất bại");
        }
      }
    });
  };

  // Helper fetch functions
  const fetchLessons = async () => {
    try {
      const data = await adminService.getLessons();
      setLessons(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVocabularies = async () => {
    try {
      const data = await adminService.getVocabularies();
      setVocabularies(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await adminService.getQuestions();
      setQuestions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Lesson handlers
  const handleOpenAddLesson = () => {
    setSelectedLesson(null);
    setLessonForm({
      title: "",
      cefrLevel: "A1",
      description: "",
      skill: "Reading",
      topic: "",
      orderIndex: lessons.length + 1,
      estimatedMinutes: 15,
      xpReward: 20,
      isPublished: true
    });
    setShowAddModal(true);
  };

  const handleOpenEditLesson = (lesson: AdminLessonDto) => {
    setSelectedLesson(lesson);
    setLessonForm({
      title: lesson.title,
      cefrLevel: lesson.level,
      description: `Description for ${lesson.title}`,
      skill: "Reading",
      topic: "",
      orderIndex: lesson.order,
      estimatedMinutes: 15,
      xpReward: 20,
      isPublished: true
    });
    setShowAddModal(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }
    const payload = {
      title: lessonForm.title.trim(),
      cefrLevel: lessonForm.cefrLevel,
      description: lessonForm.description.trim() || `Lesson on ${lessonForm.title}`,
      skill: lessonForm.skill,
      topic: lessonForm.topic.trim() || undefined,
      orderIndex: Number(lessonForm.orderIndex),
      estimatedMinutes: Number(lessonForm.estimatedMinutes),
      xpReward: Number(lessonForm.xpReward),
      isPublished: lessonForm.isPublished
    };
    try {
      if (selectedLesson?.id) {
        await adminService.updateLesson(selectedLesson.id, payload);
        toast.success("Cập nhật bài học thành công");
      } else {
        await adminService.createLesson(payload);
        toast.success("Tạo bài học thành công");
      }
      setShowAddModal(false);
      fetchLessons();
    } catch (err) {
      console.error(err);
      toast.error("Lưu bài học thất bại");
    }
  };

  const handleDeleteLesson = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa bài học",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn bài học này và toàn bộ dữ liệu liên quan?",
      onConfirm: async () => {
        try {
          await adminService.deleteLesson(id);
          toast.success("Xóa bài học thành công");
          fetchLessons();
        } catch (err) {
          console.error(err);
          toast.error("Xóa bài học thất bại");
        }
      }
    });
  };

  // Vocabulary handlers
  const handleOpenAddVocabulary = () => {
    setSelectedVocabulary(null);
    setVocabForm({
      word: "",
      ipa: "",
      cefrLevel: "A1",
      partOfSpeech: "Noun",
      exampleSentence: "",
      meaning: ""
    });
    setShowAddModal(true);
  };

  const handleOpenEditVocabulary = (v: AdminVocabularyDto) => {
    setSelectedVocabulary(v);
    setVocabForm({
      word: v.word,
      ipa: v.phoneme,
      cefrLevel: v.level,
      partOfSpeech: "Noun",
      exampleSentence: "",
      meaning: v.definition
    });
    setShowAddModal(true);
  };

  const handleSaveVocabulary = async () => {
    if (!vocabForm.word.trim() || !vocabForm.meaning.trim()) {
      toast.error("Vui lòng nhập từ vựng và dịch nghĩa");
      return;
    }
    const payload = {
      word: vocabForm.word.trim(),
      ipa: vocabForm.ipa.trim() || undefined,
      cefrLevel: vocabForm.cefrLevel,
      partOfSpeech: vocabForm.partOfSpeech,
      exampleSentence: vocabForm.exampleSentence.trim() || undefined,
      translations: [
        {
          languageCode: "vi",
          meaning: vocabForm.meaning.trim(),
          explanation: vocabForm.meaning.trim(),
          exampleTranslation: vocabForm.exampleSentence ? `Dịch câu ví dụ` : undefined
        }
      ]
    };
    try {
      if (selectedVocabulary?.id) {
        await adminService.updateVocabulary(selectedVocabulary.id, payload);
        toast.success("Cập nhật từ vựng thành công");
      } else {
        await adminService.createVocabulary(payload);
        toast.success("Tạo từ vựng thành công");
      }
      setShowAddModal(false);
      fetchVocabularies();
    } catch (err) {
      console.error(err);
      toast.error("Lưu từ vựng thất bại");
    }
  };

  const handleDeleteVocabulary = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa từ vựng",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn từ vựng này không?",
      onConfirm: async () => {
        try {
          await adminService.deleteVocabulary(id);
          toast.success("Xóa từ vựng thành công");
          fetchVocabularies();
        } catch (err) {
          console.error(err);
          toast.error("Xóa từ vựng thất bại");
        }
      }
    });
  };

  // Questions handlers
  const handleOpenAddQuestion = () => {
    setSelectedQuestion(null);
    setQuestionForm({
      lessonId: lessons[0]?.id || "",
      type: "MultipleChoice",
      prompt: "",
      instruction: "Choose the correct answer",
      correctAnswer: "",
      options: "",
      explanation: "",
      difficulty: 1,
      xpReward: 5,
      orderIndex: questions.length + 1
    });
    setShowAddModal(true);
  };

  const handleOpenEditQuestion = (q: AdminQuestionDto) => {
    setSelectedQuestion(q);
    setQuestionForm({
      lessonId: lessons[0]?.id || "",
      type: "MultipleChoice",
      prompt: q.text,
      instruction: "Choose the correct answer",
      correctAnswer: "",
      options: "",
      explanation: "",
      difficulty: q.difficulty === "Hard" ? 3 : q.difficulty === "Medium" ? 2 : 1,
      xpReward: 5,
      orderIndex: 1
    });
    setShowAddModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.lessonId) {
      toast.error("Vui lòng chọn một bài học");
      return;
    }
    if (!questionForm.prompt.trim() || !questionForm.correctAnswer.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi và đáp án đúng");
      return;
    }
    const payload = {
      lessonId: questionForm.lessonId,
      type: questionForm.type,
      prompt: questionForm.prompt.trim(),
      instruction: questionForm.instruction.trim() || undefined,
      correctAnswer: questionForm.correctAnswer.trim(),
      options: questionForm.options ? questionForm.options.split(",").map(o => o.trim()).filter(Boolean) : undefined,
      explanation: questionForm.explanation.trim() || undefined,
      difficulty: Number(questionForm.difficulty),
      xpReward: Number(questionForm.xpReward),
      orderIndex: Number(questionForm.orderIndex)
    };
    try {
      if (selectedQuestion?.id) {
        await adminService.updateQuestion(selectedQuestion.id, payload);
        toast.success("Cập nhật câu hỏi thành công");
      } else {
        await adminService.createQuestion(payload);
        toast.success("Tạo câu hỏi thành công");
      }
      setShowAddModal(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Lưu câu hỏi thất bại");
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa câu hỏi",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn câu hỏi này không?",
      onConfirm: async () => {
        try {
          await adminService.deleteQuestion(id);
          toast.success("Xóa câu hỏi thành công");
          fetchQuestions();
        } catch (err) {
          console.error(err);
          toast.error("Xóa câu hỏi thất bại");
        }
      }
    });
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={40} color="var(--brand)" />
        </div>
      );
    }

    if (activeSection === "overview" && stats) {
      return (
        <div className="p-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-7">
            {[
              { label: "Tổng học viên", value: stats.totalUsers, sub: `${stats.activeUsers} đang hoạt động`, Icon: Users, color: "#6366f1", bg: darkMode ? "rgba(99, 102, 241, 0.15)" : "#eef2ff" },
              { label: "Bài học giáo trình", value: stats.totalLessons, sub: "Đã xuất bản", Icon: BookOpen, color: "#ec4899", bg: darkMode ? "rgba(236, 72, 153, 0.15)" : "#fce7f3" },
              { label: "Ngân hàng câu hỏi", value: stats.totalQuestions, sub: "Đang được sử dụng", Icon: HelpCircle, color: "#f59e0b", bg: darkMode ? "rgba(245, 158, 11, 0.15)" : "#fef9c3" },
              { label: "Huy hiệu & Danh hiệu", value: stats.totalBadges, sub: "Loại thành tích", Icon: Award, color: "#22c55e", bg: darkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <s.Icon size={18} style={{ color: s.color }} />
                  </div>
                  <TrendingUp size={13} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--foreground)" }}>{s.value}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-foreground)", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 1, opacity: 0.8 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent users */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--foreground)" }}>Học viên mới tham gia</div>
                <button onClick={() => setActiveSection("users")} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>Xem tất cả →</button>
              </div>
              {users.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: u.role === "ranger" ? "rgba(236, 72, 153, 0.15)" : "rgba(28, 176, 246, 0.15)", fontSize: 11, fontWeight: 800, color: u.role === "ranger" ? "#ec4899" : "#1cb0f6" }}>
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{u.username}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>{u.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "active" ? "#22c55e" : "#ef4444" }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: u.status === "active" ? "#22c55e" : "#ef4444" }}>
                      {u.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lesson popularity */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--foreground)" }}>Mức độ phổ biến của bài học</div>
                <button onClick={() => setActiveSection("lessons")} style={{ fontSize: 12, fontWeight: 700, color: "#ec4899", background: "none", border: "none", cursor: "pointer" }}>Xem tất cả →</button>
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {lessons.map(l => (
                  <div key={l.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{l.title}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>{l.students} học viên</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 5, background: "var(--muted)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round((l.students / (stats.totalUsers || 1)) * 100)}%`, background: "#ec4899" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "questions") {
      const filtered = questions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["ID", "Nội dung câu hỏi", "Kỹ năng", "Trình độ", "Độ khó", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((q, i) => (
                <tr key={q.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{q.id}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "var(--foreground)", maxWidth: 280 }}>{q.text}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(SKILL_COLORS[q.skill] || SKILL_COLORS["Grammar"]), fontSize: 11.5, fontWeight: 700 }}>
                      {translateSkill(q.skill)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[q.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{q.level}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: q.difficulty === "Hard" ? "#dc2626" : q.difficulty === "Medium" ? "#d97706" : "#16a34a" }}>
                      {translateDifficulty(q.difficulty)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(59, 130, 246, 0.15)" : "#eff6ff" }}
                      >
                        <Pencil size={12} style={{ color: "#3b82f6" }} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fee2e2" }}
                      >
                        <Trash2 size={12} style={{ color: "#dc2626" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Không tìm thấy câu hỏi nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "lessons") {
      const filtered = lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["STT", "Tiêu đề bài học", "Trình độ", "Bài tập", "Học viên", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontWeight: 800, fontSize: 14, color: "var(--foreground)" }}>#{l.order}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "var(--foreground)", fontWeight: 600 }}>{l.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[l.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{l.level}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>{l.exercises} bài tập</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full overflow-hidden" style={{ width: 60, height: 5, background: "var(--muted)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round((l.students / (stats?.totalUsers || 1)) * 100)}%`, background: "#ec4899" }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)" }}>{l.students} học viên</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditLesson(l)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(59, 130, 246, 0.15)" : "#eff6ff" }}
                      >
                        <Pencil size={12} style={{ color: "#3b82f6" }} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(l.id)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fee2e2" }}
                      >
                        <Trash2 size={12} style={{ color: "#dc2626" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Không tìm thấy bài học nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "users") {
      const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Tên đăng nhập", "Email", "XP", "Ngày tham gia", "Vai trò", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--foreground)" }}>{u.username}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{u.email}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{u.xp.toLocaleString()}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{u.joined}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg outline-none cursor-pointer"
                      style={{ border: "1.5px solid var(--border)", fontSize: 12.5, fontFamily: "var(--font-family)", background: "var(--background)", color: "var(--foreground)" }}
                    >
                      <option value="student" style={{ background: "var(--background)", color: "var(--foreground)" }}>Học viên</option>
                      <option value="ranger" style={{ background: "var(--background)", color: "var(--foreground)" }}>Quản trị viên (Ranger)</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleUpdateStatus(u.id, u.status)}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none"
                      style={{
                        background: u.status === "active" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: u.status === "active" ? "#22c55e" : "#ef4444",
                        fontWeight: 700, fontSize: 12,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "active" ? "#22c55e" : "#ef4444" }} />
                      {u.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Không tìm thấy người dùng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "vocabulary") {
      const filtered = vocabularies.filter(v => v.word.toLowerCase().includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["ID", "Từ vựng", "Phiên âm", "Trình độ", "Định nghĩa nghĩa", "Ngày thêm", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{v.id}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 800, fontSize: 14, color: "var(--foreground)" }}>{v.word}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12.5, color: "#1CB0F6", fontWeight: 600 }}>{v.phoneme}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[v.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{v.level}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 200 }}>{v.definition}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{v.added}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditVocabulary(v)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(59, 130, 246, 0.15)" : "#eff6ff" }}
                      >
                        <Pencil size={12} style={{ color: "#3b82f6" }} />
                      </button>
                      <button
                        onClick={() => handleDeleteVocabulary(v.id)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fee2e2" }}
                      >
                        <Trash2 size={12} style={{ color: "#dc2626" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Không tìm thấy từ vựng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "badges") {
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["ID", "Tên huy hiệu", "Mô tả", "XP yêu cầu", "Số người đạt", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {badges.length > 0 ? badges.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{b.id}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>{b.title}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{b.description}</td>
                  <td className="px-5 py-3.5"><span style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b" }}>{b.requiredXP} XP</span></td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{b.holders} học viên</td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Không tìm thấy huy hiệu nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "pronunciation") {
      const filtered = phrases.filter(p => p.text.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Cụm từ", "Phiên âm", "Chủ đề", "Thẻ (Tags)", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--background)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "var(--foreground)", fontWeight: 600 }}>{p.text}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12.5, color: "#1CB0F6", fontWeight: 600 }}>{p.phonetic}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ background: darkMode ? "rgba(28, 176, 246, 0.15)" : "#e0f2fe", color: "#1cb0f6", fontSize: 11.5, fontWeight: 700 }}>{p.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] font-semibold rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPhrase(p)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(59, 130, 246, 0.15)" : "#eff6ff" }}
                      >
                        <Pencil size={12} style={{ color: "#3b82f6" }} />
                      </button>
                      <button
                        onClick={() => handleDeletePhrase(p.id!)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fee2e2" }}
                      >
                        <Trash2 size={12} style={{ color: "#dc2626" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy cụm từ nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Ranger Hub Header */}
      <div className="px-8 pt-7 pb-4 border-b shrink-0" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} style={{ color: "#ec4899" }} />
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--foreground)" }}> Trang Quản Trị Lantech</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Bảng điều khiển dành cho việc quản lý giáo trình, câu hỏi, người học và thành tích</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => handleTabClick(s.id)}
                type="button"
                className="px-4 py-1.5 rounded-full cursor-pointer shrink-0 transition-all outline-none border flex items-center gap-2 text-xs font-bold"
                style={{
                  background: isActive ? (darkMode ? "rgba(236, 72, 153, 0.2)" : "#fce7f3") : "var(--card)",
                  color: isActive ? "#ec4899" : "var(--muted-foreground)",
                  borderColor: isActive ? "#ec4899" : "var(--border)",
                }}
              >
                <Icon size={14} style={{ color: isActive ? "#ec4899" : "var(--muted-foreground)" }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      {activeSection !== "overview" && (
        <div className="flex items-center justify-between px-8 py-4 shrink-0 flex-wrap gap-2 text-left bg-transparent">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>Danh sách {currentSection?.label}</h2>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>Quản lý dữ liệu {currentSection?.label.toLowerCase()} trong cơ sở dữ liệu</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="outline-none border-none bg-transparent"
                style={{ fontSize: 13, color: "var(--foreground)", width: 150, fontFamily: "var(--font-family)" }}
              />
            </div>
            {activeSection !== "users" && activeSection !== "badges" && (
              <button
                onClick={() => {
                  if (activeSection === "pronunciation") handleOpenAddPhrase();
                  else if (activeSection === "lessons") handleOpenAddLesson();
                  else if (activeSection === "vocabulary") handleOpenAddVocabulary();
                  else if (activeSection === "questions") handleOpenAddQuestion();
                  else setShowAddModal(true);
                }}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs text-white shadow-md transition-all hover:brightness-95"
                style={{ background: "#ec4899" }}
              >
                <Plus size={14} /> Thêm mới
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto px-8 py-5">
        {activeSection === "overview" ? (
          renderContent()
        ) : (
          <div className="rounded-3xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
            {renderContent()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {activeSection !== "overview" && (
        <div className="flex items-center justify-between px-8 py-4 shrink-0 bg-transparent">
          <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>Đang hiển thị tất cả các dòng</span>
          <div className="flex gap-1">
            <button type="button" className="w-8 h-8 rounded-lg cursor-pointer border-none outline-none font-bold text-white shadow-sm flex items-center justify-center text-xs" style={{ background: "#ec4899" }}>1</button>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 p-4" onClick={() => setShowAddModal(false)}>
          <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl text-left max-h-[85vh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--foreground)" }}>
                {activeSection === "pronunciation" && (selectedPhrase ? "Chỉnh sửa cụm từ" : "Thêm cụm từ mới")}
                {activeSection === "lessons" && (selectedLesson ? "Chỉnh sửa bài học" : "Thêm bài học mới")}
                {activeSection === "vocabulary" && (selectedVocabulary ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới")}
                {activeSection === "questions" && (selectedQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới")}
              </h3>
              <button onClick={() => setShowAddModal(false)} type="button" className="background-none border-none cursor-pointer outline-none bg-transparent" style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            {activeSection === "pronunciation" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Nội dung cụm từ</label>
                  <input
                    value={phraseForm.text}
                    onChange={e => setPhraseForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Nhập nội dung cụm từ..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>Ký hiệu phiên âm</label>
                    <button
                      type="button"
                      onClick={() => handleAutoFillPhonetics('pronunciation')}
                      disabled={isGeneratingPhonetics}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#1CB0F6] hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles size={11} /> Tự động điền bằng AI
                    </button>
                  </div>
                  <input
                    value={phraseForm.phonetic}
                    onChange={e => setPhraseForm(prev => ({ ...prev, phonetic: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: /ðə ˈwɛðər/"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Chủ đề</label>
                  <input
                    value={phraseForm.category}
                    onChange={e => setPhraseForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Daily, Business"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Thẻ phân loại (ngăn cách bởi dấu phẩy)</label>
                  <input
                    value={phraseForm.tags}
                    onChange={e => setPhraseForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: basic, travel"
                  />
                </div>
              </div>
            )}

            {activeSection === "lessons" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Tiêu đề bài học</label>
                  <input
                    value={lessonForm.title}
                    onChange={e => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Present Simple Introduction"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Trình độ CEFR</label>
                    <select
                      value={lessonForm.cefrLevel}
                      onChange={e => setLessonForm(prev => ({ ...prev, cefrLevel: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    >
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Kỹ năng</label>
                    <select
                      value={lessonForm.skill}
                      onChange={e => setLessonForm(prev => ({ ...prev, skill: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    >
                      {[["Reading", "Đọc"], ["Listening", "Nghe"], ["Speaking", "Nói"], ["Writing", "Viết"], ["Grammar", "Ngữ pháp"]].map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Chủ đề bài học</label>
                  <input
                    value={lessonForm.topic}
                    onChange={e => setLessonForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Travel, Restaurant, Grammar"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Mô tả bài học</label>
                  <textarea
                    value={lessonForm.description}
                    onChange={e => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl outline-none resize-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Mô tả chi tiết bài học này..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Thứ tự</label>
                    <input
                      type="number"
                      value={lessonForm.orderIndex}
                      onChange={e => setLessonForm(prev => ({ ...prev, orderIndex: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, color: "var(--foreground)", background: "var(--background)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Số phút</label>
                    <input
                      type="number"
                      value={lessonForm.estimatedMinutes}
                      onChange={e => setLessonForm(prev => ({ ...prev, estimatedMinutes: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, color: "var(--foreground)", background: "var(--background)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Điểm XP</label>
                    <input
                      type="number"
                      value={lessonForm.xpReward}
                      onChange={e => setLessonForm(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, color: "var(--foreground)", background: "var(--background)" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={lessonForm.isPublished}
                    onChange={e => setLessonForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isPublished" className="cursor-pointer" style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Xuất bản bài học này ngay lập tức</label>
                </div>
              </div>
            )}

            {activeSection === "vocabulary" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Từ vựng</label>
                  <input
                    value={vocabForm.word}
                    onChange={e => setVocabForm(prev => ({ ...prev, word: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Melancholy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>Phiên âm IPA</label>
                      <button
                        type="button"
                        onClick={() => handleAutoFillPhonetics('vocabulary')}
                        disabled={isGeneratingPhonetics}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#1CB0F6] hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles size={11} /> Tự động điền
                      </button>
                    </div>
                    <input
                      value={vocabForm.ipa}
                      onChange={e => setVocabForm(prev => ({ ...prev, ipa: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                      placeholder="Ví dụ: /ˈmelənkəlē/"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Từ loại</label>
                    <select
                      value={vocabForm.partOfSpeech}
                      onChange={e => setVocabForm(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    >
                      {[["Noun", "Danh từ"], ["Verb", "Động từ"], ["Adjective", "Tính từ"], ["Adverb", "Trạng từ"], ["Pronoun", "Đại từ"], ["Preposition", "Giới từ"], ["Conjunction", "Liên từ"]].map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Trình độ CEFR</label>
                  <select
                    value={vocabForm.cefrLevel}
                    onChange={e => setVocabForm(prev => ({ ...prev, cefrLevel: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                  >
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Nghĩa (Bản dịch Tiếng Việt)</label>
                  <input
                    value={vocabForm.meaning}
                    onChange={e => setVocabForm(prev => ({ ...prev, meaning: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: U sầu, sầu muộn"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Câu ví dụ minh họa</label>
                  <textarea
                    value={vocabForm.exampleSentence}
                    onChange={e => setVocabForm(prev => ({ ...prev, exampleSentence: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl outline-none resize-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: She fell into a deep melancholy."
                  />
                </div>
              </div>
            )}

            {activeSection === "questions" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Chọn bài học</label>
                  <select
                    value={questionForm.lessonId}
                    onChange={e => setQuestionForm(prev => ({ ...prev, lessonId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                  >
                    <option value="">-- Chọn một bài học --</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title} ({l.level})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Loại câu hỏi</label>
                    <select
                      value={questionForm.type}
                      onChange={e => setQuestionForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    >
                      <option value="MultipleChoice">Trắc nghiệm (MCQ)</option>
                      <option value="FillInTheBlank">Điền vào chỗ trống</option>
                      <option value="TrueFalse">Đúng hoặc Sai</option>
                      <option value="TextResponse">Tự luận ngắn</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Độ khó</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    >
                      <option value={1}>Dễ</option>
                      <option value={2}>Trung bình</option>
                      <option value={3}>Khó</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Nội dung câu hỏi</label>
                  <textarea
                    value={questionForm.prompt}
                    onChange={e => setQuestionForm(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl outline-none resize-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Hướng dẫn làm bài</label>
                  <input
                    value={questionForm.instruction}
                    onChange={e => setQuestionForm(prev => ({ ...prev, instruction: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Chọn từ đồng nghĩa chính xác nhất"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Các lựa chọn (ngăn cách bởi dấu phẩy, nếu là trắc nghiệm)</label>
                  <input
                    value={questionForm.options}
                    onChange={e => setQuestionForm(prev => ({ ...prev, options: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Ví dụ: Apple, Banana, Orange, Peach"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Đáp án đúng</label>
                  <input
                    value={questionForm.correctAnswer}
                    onChange={e => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Nhập giá trị đáp án đúng..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Giải thích chi tiết</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={e => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl outline-none resize-none"
                    style={{ border: "2px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-family)", color: "var(--foreground)", background: "var(--background)" }}
                    placeholder="Giải thích lý do tại sao đáp án này là chính xác..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Điểm XP thưởng</label>
                    <input
                      type="number"
                      value={questionForm.xpReward}
                      onChange={e => setQuestionForm(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, color: "var(--foreground)", background: "var(--background)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Thứ tự sắp xếp</label>
                    <input
                      type="number"
                      value={questionForm.orderIndex}
                      onChange={e => setQuestionForm(prev => ({ ...prev, orderIndex: Number(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-xl outline-none"
                      style={{ border: "2px solid var(--border)", fontSize: 13.5, color: "var(--foreground)", background: "var(--background)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>Hủy bỏ</button>
              <button
                onClick={() => {
                  if (activeSection === "pronunciation") handleSavePhrase();
                  else if (activeSection === "lessons") handleSaveLesson();
                  else if (activeSection === "vocabulary") handleSaveVocabulary();
                  else if (activeSection === "questions") handleSaveQuestion();
                  else setShowAddModal(false);
                }}
                type="button"
                className="flex-1 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs text-white shadow-md"
                style={{ background: "#ec4899" }}
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border rounded-xl p-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-155" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>{deleteConfirm.title}</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>{deleteConfirm.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none transition-all"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none text-white transition-all hover:opacity-90"
                style={{ background: "var(--destructive)" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all hover:opacity-80" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
        <Pencil size={12} style={{ color: "#3b82f6" }} />
      </button>
      <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all hover:opacity-80" style={{ background: "rgba(220, 38, 38, 0.15)" }}>
        <Trash2 size={12} style={{ color: "#dc2626" }} />
      </button>
    </div>
  );
}
