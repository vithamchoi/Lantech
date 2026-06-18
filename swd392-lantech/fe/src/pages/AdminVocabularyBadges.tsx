import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Plus, Edit2, Trash2, Check, Sparkles, Loader2 } from 'lucide-react';
import { adminService, AdminVocabularyDto, AdminBadgeDto } from '../services/adminService';
import { toast } from 'sonner';

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
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const [editingVocab, setEditingVocab] = useState<AdminVocabularyDto | null>(null);

  const handleSaveVocab = async () => {
    // This is currently a mock update on the frontend since we don't have the update/create APIs implemented yet
    // To do: Implement adminService.createVocabulary and adminService.updateVocabulary
    if (editingVocab) {
      setVocab(vocab.map(v => v.id === editingVocab.id ? editingVocab : v));
      setEditingVocab(null);
      toast.success("Vocabulary updated locally");
    }
  };

  const handleDeleteVocab = async (id: string) => {
     // To do: Implement adminService.deleteVocabulary
     setVocab(vocab.filter(v => v.id !== id));
     toast.success("Vocabulary deleted locally");
  };

  const handleDeleteBadge = async (id: string) => {
     // To do: Implement adminService.deleteBadge
     setBadges(badges.filter(b => b.id !== id));
     toast.success("Badge deleted locally");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-inter text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/ranger')}
            className="p-2 hover:bg-cream-200 rounded-control transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Content Mod</span>
            <h1 className="text-2xl font-bold text-slate font-outfit mt-0.5">Vocabulary & Badges CMS</h1>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'vocab' ? (
            <button
              onClick={() => {
                const newItem: AdminVocabularyDto = {
                  id: Date.now().toString(),
                  word: 'New Word',
                  definition: 'Bản dịch',
                  phoneme: '/ipa/',
                  level: 'B1',
                  added: new Date().toISOString()
                };
                setVocab([newItem, ...vocab]);
                setEditingVocab(newItem);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all"
            >
              <Plus className="w-4 h-4" /> Add Word
            </button>
          ) : (
            <button
              onClick={() => {
                const newBadge: AdminBadgeDto = {
                  id: Date.now().toString(),
                  title: 'New Badge',
                  description: 'Unlock milestone trigger',
                  requiredXP: 100,
                  holders: 0
                };
                setBadges([...badges, newBadge]);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all"
            >
              <Plus className="w-4 h-4" /> Add Badge
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sage">
        <button
          onClick={() => setActiveTab('vocab')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'vocab' ? 'border-meadow text-meadow' : 'border-transparent text-slate-500 hover:text-slate'
          }`}
        >
          Vocabulary List ({vocab.length})
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'badges' ? 'border-meadow text-meadow' : 'border-transparent text-slate-500 hover:text-slate'
          }`}
        >
          Badges & Achievements ({badges.length})
        </button>
      </div>

      {/* Lists */}
      {activeTab === 'vocab' ? (
        <div className="bg-white rounded-card border border-sage shadow-diffuse overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-200 border-b border-sage text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Word</th>
                <th className="px-6 py-4">IPA Phonetic</th>
                <th className="px-6 py-4">Translation</th>
                <th className="px-6 py-4">CEFR</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                      className="p-1.5 text-slate-500 hover:text-slate bg-cream-200 hover:bg-cream-300 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVocab(item.id)}
                      className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded"
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
            <div key={badge.id} className="bg-white p-6 rounded-card border border-sage shadow-diffuse space-y-4 flex flex-col justify-between">
              <div className="flex gap-4">
                <div className="text-4xl shrink-0">🏅</div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate">{badge.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{badge.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-sage text-xs font-bold">
                <span className="text-meadow">+{badge.requiredXP} XP Required</span>
                <button
                  onClick={() => handleDeleteBadge(badge.id)}
                  className="text-rose-600 hover:underline"
                >
                  Delete
                </button>
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
              <h3 className="font-outfit font-bold text-lg text-slate">Edit Vocabulary Word</h3>
              <button 
                onClick={() => setEditingVocab(null)}
                className="p-1 hover:bg-cream-200 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Word</label>
                <input
                  type="text"
                  value={editingVocab.word}
                  onChange={(e) => setEditingVocab({ ...editingVocab, word: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">IPA Phonetic</label>
                <input
                  type="text"
                  value={editingVocab.phoneme}
                  onChange={(e) => setEditingVocab({ ...editingVocab, phoneme: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Translation</label>
                <input
                  type="text"
                  value={editingVocab.definition}
                  onChange={(e) => setEditingVocab({ ...editingVocab, definition: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CEFR Grade</label>
                <select
                  value={editingVocab.level}
                  onChange={(e) => setEditingVocab({ ...editingVocab, level: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingVocab(null)}
                className="flex-1 py-2.5 border border-sage text-slate rounded-control text-xs font-bold hover:bg-cream-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVocab}
                className="flex-1 py-2.5 bg-meadow text-white rounded-control text-xs font-bold hover:bg-meadow-600 shadow-diffuse flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Vocabulary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
