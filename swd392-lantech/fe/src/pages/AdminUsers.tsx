import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserCheck, ShieldAlert, Award, Flame, Loader2 } from 'lucide-react';
import { adminService, AdminUserDto } from '../services/adminService';
import { toast } from 'sonner';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await adminService.getUsers();
        setAccounts(data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole.toLowerCase() === 'admin' ? 'student' : 'admin';
    try {
      await adminService.updateUserRole(id, newRole);
      setAccounts(accounts.map(acc => {
        if (acc.id === id) {
          return {
            ...acc,
            role: newRole
          };
        }
        return acc;
      }));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Failed to update user role", error);
      toast.error("Failed to update role");
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Moderation</span>
            <h1 className="text-2xl font-bold text-slate font-outfit mt-0.5">User Accounts Manager</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-card border border-sage shadow-diffuse">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search account name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-sage rounded-control text-xs focus:outline-none focus:border-meadow transition-all"
          />
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-white rounded-card border border-sage shadow-diffuse overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-200 border-b border-sage text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">CEFR</th>
                <th className="px-6 py-4">Streak & XP</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage text-sm font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-meadow" />
                  </td>
                </tr>
              ) : filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4 text-slate">{acc.username}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{acc.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-bold rounded">
                      N/A
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-ochre">
                      <Flame className="w-3.5 h-3.5 fill-current" /> N/A Days
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {acc.xp} XP Accumulated
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      acc.role.toLowerCase() === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-meadow-50 text-meadow'
                    }`}>
                      {acc.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRoleToggle(acc.id, acc.role)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-slate text-xs font-bold rounded-control transition-all"
                    >
                      {acc.role.toLowerCase() === 'admin' ? <UserCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
