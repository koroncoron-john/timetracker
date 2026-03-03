import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectModal({ isOpen, onClose, onSuccess }: ProjectModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    reward_amount: '',
    estimated_hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('projects').insert({
        user_id: user?.id,
        title: formData.title,
        reward_amount: parseInt(formData.reward_amount),
        estimated_hours: parseInt(formData.estimated_hours),
        total_tracked_seconds: 0,
        status: '進行中',
        frozen_hourly_rate: Math.floor(parseInt(formData.reward_amount) / parseInt(formData.estimated_hours)),
      });

      if (insertError) throw insertError;

      setFormData({ title: '', reward_amount: '', estimated_hours: '' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'プロジェクトの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-8 shadow-2xl border-white/10 relative overflow-hidden">
        {/* Background blobs for modal */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">新規プロジェクト作成</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                プロジェクト名
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                placeholder="例: Webサイトリニューアル"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                報酬額（円）
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={formData.reward_amount}
                  onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                  placeholder="500,000"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                見積時間（時間）
              </label>
              <div className="relative">
                <i className="ri-time-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                  placeholder="100"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 hover:text-white transition-all whitespace-nowrap cursor-pointer text-sm font-medium"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary-gradient py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 text-sm font-bold transition-all transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? '作成中...' : 'プロジェクトを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
