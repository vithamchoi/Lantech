import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { Plus, Pencil, Trash2, Search, ShieldCheck, Users, BookOpen, HelpCircle, Award, BarChart2, TrendingUp, X, Loader2 } from "lucide-react";
import { adminService, AdminStatsDto, AdminUserDto, AdminLessonDto, AdminQuestionDto, AdminVocabularyDto, AdminBadgeDto } from "../services/adminService";
import { toast } from "sonner";

type AdminSection = "overview" | "questions" | "lessons" | "vocabulary" | "users" | "badges";

const SECTIONS: { id: AdminSection; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "questions", label: "Question Bank", icon: HelpCircle },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
  { id: "users", label: "User Accounts", icon: Users },
  { id: "badges", label: "Achievements", icon: Award },
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

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for data from API
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [questions, setQuestions] = useState<AdminQuestionDto[]>([]);
  const [vocabularies, setVocabularies] = useState<AdminVocabularyDto[]>([]);
  const [badges, setBadges] = useState<AdminBadgeDto[]>([]);

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
        }
      } catch (error) {
        console.error("Admin API Error:", error);
        // Fallback to empty arrays so UI doesn't crash
        setUsers([]);
        setLessons([]);
        setQuestions([]);
        setVocabularies([]);
        setBadges([]);
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
      toast.success("User role updated");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
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
              { label: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active`, Icon: Users, color: "#6366f1", bg: "#eef2ff" },
              { label: "Lessons", value: stats.totalLessons, sub: "Published", Icon: BookOpen, color: "#ec4899", bg: "#fce7f3" },
              { label: "Questions", value: stats.totalQuestions, sub: "In question bank", Icon: HelpCircle, color: "#f59e0b", bg: "#fef9c3" },
              { label: "Badges", value: stats.totalBadges, sub: "Achievement types", Icon: Award, color: "#22c55e", bg: "#dcfce7" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <s.Icon size={18} style={{ color: s.color }} />
                  </div>
                  <TrendingUp size={13} style={{ color: "#ccc" }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#1e1e2e" }}>{s.value}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#888", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11.5, color: "#bbb", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent users */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(0,0,0,0.07)", background: "#fff" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "#1e1e2e" }}>Recent Users</div>
                <button onClick={() => setActiveSection("users")} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
              </div>
              {users.slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: u.role === "ranger" ? "#fce7f3" : "#f0fdf4", fontSize: 11, fontWeight: 800, color: u.role === "ranger" ? "#ec4899" : "var(--brand-dark)" }}>
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1e2e" }}>{u.username}</div>
                    <div style={{ fontSize: 11.5, color: "#aaa" }}>{u.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "active" ? "#22c55e" : "#ef4444" }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: u.status === "active" ? "#16a34a" : "#dc2626" }}>{u.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lesson popularity */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(0,0,0,0.07)", background: "#fff" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "#1e1e2e" }}>Lesson Popularity</div>
                <button onClick={() => setActiveSection("lessons")} style={{ fontSize: 12, fontWeight: 700, color: "#ec4899", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {lessons.map(l => (
                  <div key={l.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e1e2e" }}>{l.title}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{l.students}</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 5, background: "#f3f4f6" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(l.students / 142 * 100)}%`, background: "#ec4899" }} />
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
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Question Preview", "Skill", "Level", "Difficulty", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((q, i) => (
                <tr key={q.id} style={{ background: i % 2 === 0 ? "#fff" : "#fcfcfc", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>{q.id}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "#3c3c3c", maxWidth: 280 }}>{q.text}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(SKILL_COLORS[q.skill] || SKILL_COLORS["Grammar"]), fontSize: 11.5, fontWeight: 700 }}>{q.skill}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[q.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{q.level}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: q.difficulty === "Hard" ? "#dc2626" : q.difficulty === "Medium" ? "#d97706" : "#16a34a" }}>{q.difficulty}</span>
                  </td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No questions found</td>
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
              <tr style={{ background: "#fafafa" }}>
                {["#", "Title", "Level", "Exercises", "Students", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? "#fff" : "#fcfcfc", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <td className="px-5 py-3.5" style={{ fontWeight: 800, fontSize: 14, color: "#3c3c3c" }}>#{l.order}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "#3c3c3c", fontWeight: 600 }}>{l.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[l.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{l.level}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13.5, color: "#888" }}>{l.exercises}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full overflow-hidden" style={{ width: 60, height: 5, background: "#f3f4f6" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(l.students / 142 * 100)}%`, background: "#ec4899" }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#555" }}>{l.students}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No lessons found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === "users") {
      const filtered = users.filter(u => u.username.includes(search.toLowerCase()) || u.email.includes(search.toLowerCase()));
      return (
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Username", "Email", "XP", "Joined", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#fcfcfc", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <td className="px-5 py-3.5" style={{ fontWeight: 700, fontSize: 13.5, color: "#1e1e2e" }}>{u.username}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "#888" }}>{u.email}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{u.xp.toLocaleString()}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12.5, color: "#aaa" }}>{u.joined}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg outline-none cursor-pointer"
                      style={{ border: "1.5px solid #e5e7eb", fontSize: 12.5, fontFamily: "var(--font-family)", background: "#fafafa", color: "#3c3c3c" }}
                    >
                      <option value="student">Student</option>
                      <option value="ranger">Ranger</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleUpdateStatus(u.id, u.status)}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none"
                      style={{
                        background: u.status === "active" ? "#dcfce7" : "#fee2e2",
                        color: u.status === "active" ? "#16a34a" : "#dc2626",
                        fontWeight: 700, fontSize: 12,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "active" ? "#22c55e" : "#ef4444" }} />
                      {u.status === "active" ? "Active" : "Suspended"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No users found</td>
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
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Word", "Phoneme", "Level", "Definition", "Added", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? "#fff" : "#fcfcfc", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>{v.id}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 800, fontSize: 14, color: "#1e1e2e" }}>{v.word}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12.5, color: "#1CB0F6", fontWeight: 600 }}>{v.phoneme}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full" style={{ ...(LEVEL_COLORS[v.level] || LEVEL_COLORS["A1"]), fontSize: 11.5, fontWeight: 700 }}>{v.level}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "#888", maxWidth: 200 }}>{v.definition}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "#bbb" }}>{v.added}</td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No vocabulary found</td>
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
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Badge Name", "Description", "Required XP", "Holders", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {badges.length > 0 ? badges.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#fcfcfc", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>{b.id}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 700, fontSize: 14, color: "#1e1e2e" }}>{b.title}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, color: "#888" }}>{b.description}</td>
                  <td className="px-5 py-3.5"><span style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b" }}>{b.requiredXP} XP</span></td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{b.holders} users</td>
                  <td className="px-5 py-3.5"><ActionButtons /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No badges found</td>
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
      <div className="px-8 pt-7 pb-4 bg-white border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} style={{ color: "#ec4899" }} />
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#3c3c3c" }}>Ranger Console</h1>
            </div>
            <p style={{ fontSize: 13, color: "#888" }}>Control panel for curriculum content, questions, users, and achievements</p>
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
                onClick={() => { setActiveSection(s.id); setSearch(""); }}
                type="button"
                className="px-4 py-1.5 rounded-full cursor-pointer shrink-0 transition-all outline-none border flex items-center gap-2 text-xs font-bold"
                style={{
                  background: isActive ? "#fce7f3" : "#fff",
                  color: isActive ? "#db2777" : "#888",
                  borderColor: isActive ? "#f472b6" : "#e5e7eb",
                }}
              >
                <Icon size={14} style={{ color: isActive ? "#db2777" : "#aaa" }} />
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
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#3c3c3c" }}>{currentSection?.label} List</h2>
            <p style={{ fontSize: 12, color: "#888", marginTop: 1 }}>Manage {currentSection?.label.toLowerCase()} records in the database</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <Search size={14} style={{ color: "#aaa" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="outline-none border-none bg-transparent"
                style={{ fontSize: 13, color: "#3c3c3c", width: 150, fontFamily: "var(--font-family)" }}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs text-white shadow-md transition-all hover:brightness-95"
              style={{ background: "#ec4899" }}
            >
              <Plus size={14} /> Add New
            </button>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto px-8 py-5">
        {activeSection === "overview" ? (
          renderContent()
        ) : (
          <div className="rounded-3xl overflow-hidden border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {renderContent()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {activeSection !== "overview" && (
        <div className="flex items-center justify-between px-8 py-4 shrink-0 bg-transparent">
          <span style={{ fontSize: 12.5, color: "#aaa" }}>Showing all records</span>
          <div className="flex gap-1">
            <button type="button" className="w-8 h-8 rounded-lg cursor-pointer border-none outline-none font-bold text-white shadow-sm flex items-center justify-center text-xs" style={{ background: "#ec4899" }}>1</button>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 p-4" onClick={() => setShowAddModal(false)}>
          <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl bg-white text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontSize: 19, fontWeight: 900, color: "#1e1e2e" }}>Add New {currentSection?.label}</h3>
              <button onClick={() => setShowAddModal(false)} type="button" className="background-none border-none cursor-pointer outline-none bg-transparent" style={{ color: "#aaa" }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {["Title / Name", "Level", "Details"].map(field => (
                <div key={field}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>{field}</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{ border: "2px solid #e5e7eb", fontSize: 14, fontFamily: "var(--font-family)", color: "#3c3c3c" }}
                    placeholder={`Enter ${field.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 py-3 rounded-xl cursor-pointer border-none outline-none font-bold" style={{ background: "#f3f4f6", color: "#888" }}>Cancel</button>
              <button onClick={() => setShowAddModal(false)} type="button" className="flex-1 py-3 rounded-xl cursor-pointer border-none outline-none font-bold text-white shadow-md" style={{ background: "#ec4899" }}>Save Record</button>
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
      <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none" style={{ background: "#eff6ff" }}>
        <Pencil size={12} style={{ color: "#3b82f6" }} />
      </button>
      <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none" style={{ background: "#fee2e2" }}>
        <Trash2 size={12} style={{ color: "#dc2626" }} />
      </button>
    </div>
  );
}
