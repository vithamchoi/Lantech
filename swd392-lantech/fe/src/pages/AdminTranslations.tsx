import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Check, Globe } from 'lucide-react';

interface TranslationItem {
  id: string;
  key: string;
  english: string;
  translation: string;
  lang: string;
  status: 'Approved' | 'Draft';
}

export default function AdminTranslations() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<TranslationItem[]>([
    { id: '1', key: 'lesson.sapling.title', english: 'Oak Sapling', translation: 'Cây Sồi Con', lang: 'Vietnamese', status: 'Approved' },
    { id: '2', key: 'lesson.sapling.desc', english: 'A young tree, especially one with a slender trunk.', translation: 'Một cây non, đặc biệt là cây có thân thanh mảnh.', lang: 'Vietnamese', status: 'Approved' },
    { id: '3', key: 'word.canopy', english: 'Canopy', translation: 'Copete de árboles', lang: 'Spanish', status: 'Draft' },
  ]);
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);

  const handleEdit = (item: TranslationItem) => {
    setEditingItem({ ...item });
  };

  const handleSave = () => {
    if (editingItem) {
      setItems(items.map((i) => (i.id === editingItem.id ? editingItem : i)));
      setEditingItem(null);
    }
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const filteredItems = items.filter((i) => 
    i.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-inter text-left">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/ranger')}
            className="p-2 hover:bg-cream-200 rounded-control transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Database Editor</span>
            <h1 className="text-2xl font-bold text-slate font-outfit mt-0.5">Translations Database</h1>
          </div>
        </div>

        <button
          onClick={() => {
            const newItem: TranslationItem = {
              id: Date.now().toString(),
              key: 'new.translation.key',
              english: 'New Term',
              translation: 'Bản dịch mới',
              lang: 'Vietnamese',
              status: 'Draft'
            };
            setItems([newItem, ...items]);
            setEditingItem(newItem);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all"
        >
          <Plus className="w-4 h-4" /> Add Key
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-card border border-sage shadow-diffuse flex items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search translation key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-sage rounded-control text-xs focus:outline-none focus:border-meadow transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-card border border-sage shadow-diffuse overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-200 border-b border-sage text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Key</th>
                <th className="px-6 py-4">English</th>
                <th className="px-6 py-4">Translation</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage text-sm font-semibold">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.key}</td>
                  <td className="px-6 py-4 text-slate">{item.english}</td>
                  <td className="px-6 py-4 text-slate-600">{item.translation}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Globe className="w-3.5 h-3.5" /> {item.lang}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'Approved' ? 'bg-meadow-50 text-meadow' : 'bg-ochre-50 text-ochre'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate bg-cream-200 hover:bg-cream-300 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
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
      </div>

      {/* Edit Overlay Drawer */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-card border border-sage shadow-diffuse-md space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="font-outfit font-bold text-lg text-slate">Edit Translation Key</h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-cream-200 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Identifier</label>
                <input
                  type="text"
                  value={editingItem.key}
                  onChange={(e) => setEditingItem({ ...editingItem, key: e.target.value })}
                  className="w-full px-4 py-2 bg-cream-50 border border-sage rounded-control text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">English Term</label>
                <input
                  type="text"
                  value={editingItem.english}
                  onChange={(e) => setEditingItem({ ...editingItem, english: e.target.value })}
                  className="w-full px-4 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Translation Value</label>
                <textarea
                  rows={3}
                  value={editingItem.translation}
                  onChange={(e) => setEditingItem({ ...editingItem, translation: e.target.value })}
                  className="w-full px-4 py-2 bg-cream-50 border border-sage rounded-control text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language</label>
                  <select
                    value={editingItem.lang}
                    onChange={(e) => setEditingItem({ ...editingItem, lang: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                  >
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as 'Approved' | 'Draft' })}
                    className="w-full px-3 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 border border-sage text-slate rounded-control text-xs font-bold hover:bg-cream-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-meadow text-white rounded-control text-xs font-bold hover:bg-meadow-600 shadow-diffuse flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
