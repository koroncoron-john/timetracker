
import { useState } from 'react';

interface MaintenanceCostModalProps {
  onClose: () => void;
  onAdd: (data: { name: string; monthlyFee: number; estimatedHours: number }) => void;
}

export default function MaintenanceCostModal({ onClose, onAdd }: MaintenanceCostModalProps) {
  const [name, setName] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !monthlyFee || !estimatedHours) return;
    onAdd({
      name,
      monthlyFee: Number(monthlyFee),
      estimatedHours: Number(estimatedHours),
    });
    onClose();
  };

  const previewRate = monthlyFee && estimatedHours && Number(estimatedHours) > 0
    ? Math.round(Number(monthlyFee) / Number(estimatedHours))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md mx-4 mb-0 sm:mb-4 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            保守費用を追加
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">保守費用名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 月次セキュリティアップデート"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">月額保守費用（円）</label>
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="例: 30000"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all text-sm"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">見積もり工数（時間/月）</label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="例: 2"
              step="0.5"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all text-sm"
              required
              min="0.5"
            />
          </div>

          {/* Preview */}
          {previewRate > 0 && (
            <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-400/20 rounded-xl p-4">
              <p className="text-amber-300/70 text-xs mb-1">予想時給（見積もり工数ベース）</p>
              <p className="text-amber-300 font-bold text-xl">¥{previewRate.toLocaleString()}/h</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
