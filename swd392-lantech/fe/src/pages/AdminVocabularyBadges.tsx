import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Plus, Edit2, Trash2, Check, Sparkles, Loader2 } from 'lucide-react';
import { adminService, AdminVocabularyDto, AdminBadgeDto } from '../services/adminService';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import CustomSelect from '../components/CustomSelect';

export default function AdminVocabularyBadges() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'vocab' | 'badges'>('vocab');
  
  const [vocab, setVocab] = useState<AdminVocabularyDto[]>([]);
  const [badges, setBadges] = useState<AdminBadgeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'vocab') {
          const data = await adminService.getVocabularies();
          setVocab(data || []);
        } else {
          const data = await adminService.getBadges();
          setBadges(data || []);
        }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const [editingVocab, setEditingVocab] = useState<AdminVocabularyDto | null>(null);
  const [editingBadge, setEditingBadge] = useState<AdminBadgeDto | null>(null);
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

  const handleSaveVocab = async () => {
    if (!editingVocab) return;
    if (!editingVocab.word.trim()) {
      toast.error("Word is required");
      return;
    }
    if (!editingVocab.definition.trim()) {
      toast.error("Translation is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        word: editingVocab.word,
        ipa: editingVocab.phoneme,
        cefrLevel: editingVocab.level,
        partOfSpeech: "noun",
        exampleSentence: "",
        contentSource: "Curated",
        translations: [
          {
            languageCode: "vi",
            meaning: editingVocab.definition,
            explanation: "",
            exampleTranslation: ""
          }
        ]
      };

      if (editingVocab.id) {
        // Edit mode
        const updated = await adminService.updateVocabulary(editingVocab.id, payload);
        setVocab(vocab.map(v => v.id === editingVocab.id ? {
          id: updated.id,
          word: updated.word,
          phoneme: updated.ipa || '',
          level: updated.cefrLevel,
          definition: editingVocab.definition,
          added: v.added
        } : v));
        toast.success("Vocabulary updated successfully");
      } else {
        // Create mode
        const created = await adminService.createVocabulary(payload);
        const newAdminVocab = {
          id: created.id,
          word: created.word,
          phoneme: created.ipa || '',
          level: created.cefrLevel,
          definition: editingVocab.definition,
          added: new Date().toISOString().split('T')[0]
        };
        setVocab([newAdminVocab, ...vocab]);
        toast.success("Vocabulary created successfully");
      }
      setEditingVocab(null);
    } catch (error) {
      console.error("Failed to save vocabulary", error);
      toast.error("Failed to save vocabulary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVocab = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa từ vựng",
      message: "Bạn có chắc chắn muốn xóa từ vựng này?",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await adminService.deleteVocabulary(id);
          setVocab(vocab.filter(v => v.id !== id));
          toast.success("Vocabulary deleted successfully");
        } catch (error) {
          console.error("Failed to delete vocabulary", error);
          toast.error("Failed to delete vocabulary");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleDeleteBadge = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Xóa huy hiệu",
      message: "Bạn có chắc chắn muốn xóa huy hiệu này?",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await adminService.deleteBadge(id);
          setBadges(badges.filter(b => b.id !== id));
          toast.success("Xóa huy hiệu thành công");
        } catch (error) {
          console.error("Failed to delete badge", error);
          toast.error("Không thể xóa huy hiệu");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleSaveBadge = async () => {
    if (!editingBadge) return;
    if (!editingBadge.code.trim()) {
      toast.error("Mã Code không được để trống");
      return;
    }
    if (!editingBadge.title.trim()) {
      toast.error("Tên Huy hiệu không được để trống");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        code: editingBadge.code.trim(),
        name: editingBadge.title.trim(),
        description: editingBadge.description.trim(),
        iconUrl: editingBadge.iconUrl || '🏅',
        conditionType: editingBadge.conditionType,
        conditionValue: editingBadge.conditionType === 'SELFLEVELSELECTED' ? 0 : editingBadge.conditionValue
      };

      if (editingBadge.id && !editingBadge.id.startsWith("new_")) {
        // Edit mode
        const updated = await adminService.updateBadge(editingBadge.id, payload);
        setBadges(badges.map(b => b.id === editingBadge.id ? {
          ...updated,
          holders: editingBadge.holders
        } : b));
        toast.success("Cập nhật huy hiệu thành công");
      } else {
        // Create mode
        const created = await adminService.createBadge(payload);
        setBadges([created, ...badges]);
        toast.success("Thêm mới huy hiệu thành công");
      }
      setEditingBadge(null);
    } catch (error) {
      console.error("Failed to save badge", error);
      toast.error("Không thể lưu huy hiệu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-inter text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/ranger')}
            className="p-2 hover:bg-cream-200 rounded-control transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Điều Phối Nội Dung</span>
            <h1 className="text-2xl font-bold text-slate font-outfit mt-0.5">Quản Lý Từ Vựng & Huy Hiệu</h1>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'vocab' ? (
            <button
              onClick={() => {
                setEditingVocab({
                  id: '',
                  word: '',
                  definition: '',
                  phoneme: '',
                  level: 'A1',
                  added: ''
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Từ
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingBadge({
                  id: 'new_' + Date.now().toString(),
                  code: '',
                  title: '',
                  description: '',
                  iconUrl: '🏅',
                  conditionType: 'XP',
                  conditionValue: 100,
                  requiredXP: 0,
                  holders: 0
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Huy Hiệu
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sage">
        <button
          onClick={() => setActiveTab('vocab')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'vocab' ? 'border-meadow text-meadow' : 'border-transparent text-slate-500 hover:text-slate'
          }`}
        >
          Danh sách Từ vựng ({vocab.length})
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'badges' ? 'border-meadow text-meadow' : 'border-transparent text-slate-500 hover:text-slate'
          }`}
        >
          Huy hiệu & Thành tích ({badges.length})
        </button>
      </div>

      {/* Lists */}
      {activeTab === 'vocab' ? (
        <div className="bg-white rounded-card border border-sage shadow-diffuse overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-200 border-b border-sage text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Từ</th>
                <th className="px-6 py-4">Phiên âm (IPA)</th>
                <th className="px-6 py-4">Dịch nghĩa</th>
                <th className="px-6 py-4">Cấp độ (CEFR)</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage text-sm font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-meadow" />
                  </td>
                </tr>
              ) : vocab.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4 text-slate">{item.word}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.phoneme}</td>
                  <td className="px-6 py-4 text-slate-600">{item.definition}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-bold rounded">
                      {item.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setEditingVocab(item)}
                      className="p-1.5 text-slate-500 hover:text-slate bg-cream-200 hover:bg-cream-300 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVocab(item.id)}
                      className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Badges grid view */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 py-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-meadow" />
            </div>
          ) : badges.map((badge) => (
            <div key={badge.id} className="bg-white p-6 rounded-card border border-sage shadow-diffuse space-y-4 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingBadge(badge)}
                  className="p-1 hover:bg-cream-200 rounded text-slate-500 hover:text-slate cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBadge(badge.id)}
                  className="p-1 hover:bg-rose-50 rounded text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="text-4xl shrink-0 select-none">{badge.iconUrl || '🏅'}</div>
                <div className="space-y-1 text-left">
                  <h4 className="font-bold text-sm text-slate flex items-center gap-1.5 flex-wrap">
                    {badge.title}
                    <span className="text-[10px] px-1.5 py-0.5 bg-cream-300 text-slate-600 rounded font-mono font-bold uppercase">
                      {badge.code}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{badge.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-sage flex flex-col gap-2 text-left">
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-meadow" />
                  <span>Yêu cầu: </span>
                  <span className="font-bold text-meadow">
                    {badge.conditionType?.toUpperCase() === 'XP' && `Tích lũy ${badge.conditionValue} XP`}
                    {badge.conditionType?.toUpperCase() === 'STREAK' && `Học liên tục ${badge.conditionValue} ngày`}
                    {badge.conditionType?.toUpperCase() === 'LESSONCOMPLETED' && `Hoàn thành ${badge.conditionValue} bài học`}
                    {badge.conditionType?.toUpperCase() === 'FLASHCARDREVIEWED' && `Ôn tập ${badge.conditionValue} flashcard`}
                    {badge.conditionType?.toUpperCase() === 'PERFECTLESSON' && `Đạt 100% ${badge.conditionValue} bài học`}
                    {badge.conditionType?.toUpperCase() === 'ASSESSMENTCOMPLETED' && `Làm ${badge.conditionValue} bài đánh giá`}
                    {badge.conditionType?.toUpperCase() === 'SELFLEVELSELECTED' && `Tự chọn trình độ đầu vào`}
                    {!['XP', 'STREAK', 'LESSONCOMPLETED', 'FLASHCARDREVIEWED', 'PERFECTLESSON', 'ASSESSMENTCOMPLETED', 'SELFLEVELSELECTED'].includes(badge.conditionType?.toUpperCase() || '') && `${badge.conditionType}: ${badge.conditionValue}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                  <span>{badge.holders} học viên sở hữu</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editing Dialog Portal */}
      {editingVocab && (
        <div className="fixed inset-0 bg-slate/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-card border border-sage shadow-diffuse-md space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="font-outfit font-bold text-lg text-slate">
                {editingVocab.id ? "Chỉnh Sửa Từ Vựng" : "Thêm Từ Vựng Mới"}
              </h3>
              <button 
                onClick={() => setEditingVocab(null)}
                className="p-1 hover:bg-cream-200 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Từ</label>
                <input
                  type="text"
                  value={editingVocab.word}
                  onChange={(e) => setEditingVocab({ ...editingVocab, word: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phiên âm (IPA)</label>
                <input
                  type="text"
                  value={editingVocab.phoneme}
                  onChange={(e) => setEditingVocab({ ...editingVocab, phoneme: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dịch nghĩa</label>
                <input
                  type="text"
                  value={editingVocab.definition}
                  onChange={(e) => setEditingVocab({ ...editingVocab, definition: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân loại CEFR</label>
                <CustomSelect
                  value={editingVocab.level}
                  onChange={(val) => setEditingVocab({ ...editingVocab, level: val })}
                  options={[
                    { value: "A1", label: "A1" },
                    { value: "A2", label: "A2" },
                    { value: "B1", label: "B1" },
                    { value: "B2", label: "B2" },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingVocab(null)}
                className="flex-1 py-2.5 border border-sage text-slate rounded-control text-xs font-bold hover:bg-cream-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveVocab}
                className="flex-1 py-2.5 bg-meadow text-white rounded-control text-xs font-bold hover:bg-meadow-600 shadow-diffuse flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Lưu Từ Vựng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Badge Dialog Portal */}
      {editingBadge && (
        <div className="fixed inset-0 bg-slate/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-card border border-sage shadow-diffuse-md space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="font-outfit font-bold text-lg text-slate">
                {editingBadge.id && !editingBadge.id.startsWith("new_") ? "Chỉnh Sửa Huy Chương" : "Thêm Huy Chương Mới"}
              </h3>
              <button 
                onClick={() => setEditingBadge(null)}
                className="p-1 hover:bg-cream-200 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã Code (Không dấu, không khoảng trắng)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: XP_1000"
                  value={editingBadge.code}
                  onChange={(e) => setEditingBadge({ ...editingBadge, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên Huy Chương</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chiến Binh XP"
                  value={editingBadge.title}
                  onChange={(e) => setEditingBadge({ ...editingBadge, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mô Tả Huy Chương</label>
                <textarea
                  placeholder="Mô tả cách đạt huy chương..."
                  value={editingBadge.description}
                  onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs min-h-[60px] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biểu Tượng (Emoji)</label>
                  <input
                    type="text"
                    placeholder="🏅"
                    value={editingBadge.iconUrl || ''}
                    onChange={(e) => setEditingBadge({ ...editingBadge, iconUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-cream-50 border border-sage rounded-control text-center text-lg h-[38px] font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại Điều Kiện</label>
                  <CustomSelect
                    value={editingBadge.conditionType}
                    onChange={(val) => setEditingBadge({ ...editingBadge, conditionType: val })}
                    options={[
                      { value: "XP", label: "Tích Lũy XP" },
                      { value: "STREAK", label: "Học Liên Tục (Streak)" },
                      { value: "LESSONCOMPLETED", label: "Hoàn Thành Bài Học" },
                      { value: "FLASHCARDREVIEWED", label: "Ôn Tập Flashcard" },
                      { value: "PERFECTLESSON", label: "Bài Học Đạt 100%" },
                      { value: "ASSESSMENTCOMPLETED", label: "Làm Bài Khảo Sát" },
                      { value: "SELFLEVELSELECTED", label: "Đã Chọn Trình Độ" },
                    ]}
                  />
                </div>
              </div>

              {editingBadge.conditionType !== 'SELFLEVELSELECTED' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá Trị Cần Đạt</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBadge.conditionValue}
                    onChange={(e) => setEditingBadge({ ...editingBadge, conditionValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingBadge(null)}
                className="flex-1 py-2.5 border border-sage text-slate rounded-control text-xs font-bold hover:bg-cream-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBadge}
                className="flex-1 py-2.5 bg-meadow text-white rounded-control text-xs font-bold hover:bg-meadow-600 shadow-diffuse flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Lưu Huy Chương
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                Hủy bỏ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none text-white transition-all hover:brightness-95"
                style={{ background: "var(--destructive)" }}
              >
                Xóa
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
