
import { useState } from 'react';
import type { MaintenanceCost } from '../../../types';

interface MaintenanceLogModalProps {
  onClose: () => void;
  onAdd: (data: { costId: string; yearMonth: string; description: string; actualHours: number }) => void;
  onAddCost: (data: { name: string; monthlyFee: number; estimatedHours: number }) => string | Promise<string>;
  costs: MaintenanceCost[];
}

export default function MaintenanceLogModal({ onClose, onAdd, onAddCost, costs }: MaintenanceLogModalProps) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [costId, setCostId] = useState(costs.length > 0 ? costs[0].id : '');
  const [yearMonth, setYearMonth] = useState(defaultMonth);
  const [description, setDescription] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [showCostDropdown, setShowCostDropdown] = useState(false);

  const [isCreatingNewCost, setIsCreatingNewCost] = useState(costs.length === 0);
  const [newCostName, setNewCostName] = useState('');
  const [newCostMonthlyFee, setNewCostMonthlyFee] = useState('');
  const [newCostEstimatedHours, setNewCostEstimatedHours] = useState('');

  const selectedCost = costs.find(c => c.id === costId);

  const newCostPreviewRate =
    newCostMonthlyFee && newCostEstimatedHours && Number(newCostEstimatedHours) > 0
      ? Math.round(Number(newCostMonthlyFee) / Number(newCostEstimatedHours))
      : 0;

  const handleSelectNewCost = () => {
    setIsCreatingNewCost(true);
    setCostId('');
    setShowCostDropdown(false);
  };

  const handleSelectExistingCost = (id: string) => {
    setCostId(id);
    setIsCreatingNewCost(false);
    setNewCostName('');
    setNewCostMonthlyFee('');
    setNewCostEstimatedHours('');
    setShowCostDropdown(false);
  };

  const handleCancelNewCost = () => {
    setIsCreatingNewCost(false);
    setNewCostName('');
    setNewCostMonthlyFee('');
    setNewCostEstimatedHours('');
    if (costs.length > 0) {
      setCostId(costs[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCostId = costId;

    if (isCreatingNewCost) {
      if (!newCostName || !newCostMonthlyFee || !newCostEstimatedHours) return;
      try {
        finalCostId = await onAddCost({
          name: newCostName,
          monthlyFee: Number(newCostMonthlyFee),
          estimatedHours: Number(newCostEstimatedHours),
        });
      } catch (err) {
        console.error('Failed to create new cost:', err);
        return;
      }
    }

    if (!finalCostId || !yearMonth || !description || !actualHours) return;

    onAdd({
      costId: finalCostId,
      yearMonth,
      description,
      actualHours: Number(actualHours),
    });
    onClose();
  };

  const effectiveCost = isCreatingNewCost
    ? newCostMonthlyFee
      ? Number(newCostMonthlyFee)
      : 0
    : selectedCost?.monthly_fee ?? 0;

  const previewRate =
    effectiveCost > 0 && actualHours && Number(actualHours) > 0
      ? Math.round(effectiveCost / Number(actualHours))
      : 0;

  const effectiveEstimatedHours = isCreatingNewCost
    ? newCostEstimatedHours
      ? Number(newCostEstimatedHours)
      : 0
    : selectedCost?.estimated_hours ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md mx-4 mb-0 sm:mb-4 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            月次保守ログを追加
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
            <label className="block text-gray-300 text-sm font-medium mb-2">保守費用項目</label>
            {!isCreatingNewCost ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCostDropdown(!showCostDropdown)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedCost ? 'text-white truncate' : 'text-gray-500'}>
                    {selectedCost
                      ? `${selectedCost.name}（¥${selectedCost.monthly_fee.toLocaleString()}/月）`
                      : '選択してください'}
                  </span>
                  <i
                    className={`ri-arrow-down-s-line text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      showCostDropdown ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>
                {showCostDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCostDropdown(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                      {costs.map(cost => (
                        <button
                          key={cost.id}
                          type="button"
                          onClick={() => handleSelectExistingCost(cost.id)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer ${
                            costId === cost.id
                              ? 'bg-white/10 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          <p className="font-medium">{cost.name}</p>
                          <p className="text-xs opacity-60 mt-0.5">
                            ¥{cost.monthly_fee.toLocaleString()}/月 ・ 見積{cost.estimated_hours}h
                          </p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleSelectNewCost}
                        className="w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-t border-white/10 text-teal-400 hover:bg-teal-500/10"
                      >
                        <div className="flex items-center gap-2">
                          <i className="ri-add-circle-line"></i>
                          <span className="font-medium">新しい保守費用を作成</span>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="backdrop-blur-sm bg-teal-500/5 border border-teal-400/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-teal-300 text-xs font-semibold flex items-center gap-1.5">
                    <i className="ri-add-circle-line text-sm"></i>
                    新しい保守費用を作成
                  </p>
                  {costs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCancelNewCost}
                      className="text-gray-500 hover:text-gray-300 text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      既存から選択
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">保守費用名</label>
                  <input
                    type="text"
                    value={newCostName}
                    onChange={e => setNewCostName(e.target.value)}
                    placeholder="例: コンテンツ更新対応"
                    className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm"
                    required={isCreatingNewCost}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">月額費用（円）</label>
                    <input
                      type="number"
                      value={newCostMonthlyFee}
                      onChange={e => setNewCostMonthlyFee(e.target.value)}
                      placeholder="例: 20000"
                      className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm"
                      required={isCreatingNewCost}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">見積もり工数（h/月）</label>
                    <input
                      type="number"
                      value={newCostEstimatedHours}
                      onChange={e => setNewCostEstimatedHours(e.target.value)}
                      placeholder="例: 2"
                      step="0.5"
                      className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm"
                      required={isCreatingNewCost}
                      min="0.5"
                    />
                  </div>
                </div>
                {newCostPreviewRate > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-gray-500 text-xs">予想時給:</span>
                    <span className="text-teal-300 text-sm font-bold">
                      ¥{newCostPreviewRate.toLocaleString()}/h
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">対象年月</label>
            <input
              type="month"
              value={yearMonth}
              onChange={e => setYearMonth(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm [color-scheme:dark]"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">作業内容</label>
            <textarea
              value={description}
              onChange={e => {
                if (e.target.value.length <= 500) setDescription(e.target.value);
              }}
              placeholder="例: トップページのバナー画像差し替え、お知らせ記事の追加"
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm resize-none"
              required
              maxLength={500}
            />
            <p className="text-gray-500 text-xs mt-1 text-right">{description.length}/500</p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">実稼働時間（時間）</label>
            <input
              type="number"
              value={actualHours}
              onChange={e => setActualHours(e.target.value)}
              placeholder="例: 1.5"
              step="0.25"
              min="0.25"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm"
              required
            />
          </div>

          {previewRate > 0 && (
            <div className="backdrop-blur-sm bg-teal-500/10 border border-teal-400/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-300/70 text-xs mb-1">この作業の実質時給</p>
                  <p className="text-teal-300 font-bold text-xl">¥{previewRate.toLocaleString()}/h</p>
                </div>
                {effectiveEstimatedHours > 0 && Number(actualHours) < effectiveEstimatedHours && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    <i className="ri-arrow-up-line text-emerald-400 text-xs"></i>
                    <span className="text-emerald-400 text-xs font-medium">効率的</span>
                  </div>
                )}
              </div>
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
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
