import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Compass, BookOpen, Trash2, Edit2, Check } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

interface CurriculumUnit {
  id: string;
  unitNum: number;
  title: string;
  level: string;
  lessonsCount: number;
  quizzesCount: number;
}

export default function AdminCurriculum() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<CurriculumUnit[]>([
    { id: '1', unitNum: 1, title: 'Forest Introduction & Basic Nouns', level: 'A1', lessonsCount: 3, quizzesCount: 2 },
    { id: '2', unitNum: 2, title: 'Nature Verb Conjugations', level: 'B1', lessonsCount: 4, quizzesCount: 2 },
    { id: '3', unitNum: 3, title: 'Descriptive Canopy Adjectives', level: 'B2', lessonsCount: 5, quizzesCount: 3 },
  ]);

  const [editingUnit, setEditingUnit] = useState<CurriculumUnit | null>(null);

  const handleEdit = (unit: CurriculumUnit) => {
    setEditingUnit({ ...unit });
  };

  const handleSave = () => {
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? editingUnit : u));
      setEditingUnit(null);
    }
  };

  const handleDelete = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
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
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Quản Lý Giáo Trình</span>
            <h1 className="text-2xl font-bold text-slate font-outfit mt-0.5">Cấu trúc Chương & Bài học</h1>
          </div>
        </div>

        <button
          onClick={() => {
            const newUnit: CurriculumUnit = {
              id: Date.now().toString(),
              unitNum: units.length + 1,
              title: 'Chương Lâm Nghiệp Mới',
              level: 'B1',
              lessonsCount: 2,
              quizzesCount: 1
            };
            setUnits([...units, newUnit]);
            setEditingUnit(newUnit);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-meadow hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo Chương Mới
        </button>
      </div>

      {/* Chapters list */}
      <div className="bg-white rounded-card border border-sage shadow-diffuse overflow-hidden">
        <div className="divide-y divide-sage">
          {units.map((unit) => (
            <div key={unit.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4 hover:bg-cream-50 transition-all">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-meadow-50 text-meadow flex items-center justify-center rounded-control shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Bài {unit.unitNum}</span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded">
                      {unit.level}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate">{unit.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {unit.lessonsCount} bài học</span>
                    <span>•</span>
                    <span>{unit.quizzesCount} bài kiểm tra</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(unit)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-slate text-xs font-bold rounded-control transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa Bài học
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
                  className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-control transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editing Dialog Portal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-slate/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-card border border-sage shadow-diffuse-md space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="font-outfit font-bold text-lg text-slate">Chỉnh Sửa Chi Tiết Bài học</h3>
              <button 
                onClick={() => setEditingUnit(null)}
                className="p-1 hover:bg-cream-200 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiêu đề Chương</label>
                <input
                  type="text"
                  value={editingUnit.title}
                  onChange={(e) => setEditingUnit({ ...editingUnit, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-sage rounded-control text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số Thứ Tự Bài</label>
                  <input
                    type="number"
                    value={editingUnit.unitNum}
                    onChange={(e) => setEditingUnit({ ...editingUnit, unitNum: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ Mục tiêu</label>
                  <CustomSelect
                    value={editingUnit.level}
                    onChange={(val) => setEditingUnit({ ...editingUnit, level: val })}
                    options={[
                      { value: "A1", label: "A1" },
                      { value: "A2", label: "A2" },
                      { value: "B1", label: "B1" },
                      { value: "B2", label: "B2" },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số Bài học</label>
                  <input
                    type="number"
                    value={editingUnit.lessonsCount}
                    onChange={(e) => setEditingUnit({ ...editingUnit, lessonsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-cream-50 border border-sage rounded-control text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingUnit(null)}
                className="flex-1 py-2.5 border border-sage text-slate rounded-control text-xs font-bold hover:bg-cream-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-meadow text-white rounded-control text-xs font-bold hover:bg-meadow-600 shadow-diffuse flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Lưu Giáo trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
