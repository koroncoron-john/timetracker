
import type { MaintenanceCost } from '../../../types';

interface MaintenanceCostSectionProps {
  costs: MaintenanceCost[];
  onAddClick: () => void;
  onUpdateActualHours: (id: string, hours: number) => void;
}

export default function MaintenanceCostSection({
  costs,
  onAddClick,
  onUpdateActualHours,
}: MaintenanceCostSectionProps) {
  const totalMonthlyFee = costs.reduce((s, c) => s + c.monthly_fee, 0);
  const totalEstimatedHours = costs.reduce((s, c) => s + c.estimated_hours, 0);
  const totalActualHours = costs.reduce((s, c) => s + c.actual_hours, 0);
  const overallEstimatedRate =
    totalEstimatedHours > 0 ? Math.round(totalMonthlyFee / totalEstimatedHours) : 0;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-400/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-shield-check-line text-amber-400"></i>
          追加構築費用
        </h3>
        <button
          onClick={onAddClick}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-lg"></i>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-1">月額合計</p>
          <p className="text-white font-bold text-lg">
            ¥{totalMonthlyFee.toLocaleString()}
          </p>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-1">見積もり時給</p>
          <p
            className={`font-bold text-lg ${
              overallEstimatedRate > 0 ? 'text-amber-400' : 'text-gray-500'
            }`}
          >
            {overallEstimatedRate > 0
              ? `¥${overallEstimatedRate.toLocaleString()}`
              : '\u2014'}
          </p>
        </div>
      </div>

      {/* Cost Items */}
      <div className="space-y-2.5">
        {costs.map((cost) => {
          const estimatedRate =
            cost.estimated_hours > 0
              ? Math.round(cost.monthly_fee / cost.estimated_hours)
              : 0;
          const actualRate =
            cost.actual_hours > 0
              ? Math.round(cost.monthly_fee / cost.actual_hours)
              : 0;

          return (
            <div
              key={cost.id}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm mb-1">{cost.name}</h4>
                  <p className="text-gray-400 text-xs">
                    ¥{cost.monthly_fee.toLocaleString()}/月
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-300 font-bold text-sm">
                    ¥{estimatedRate.toLocaleString()}/h
                  </p>
                  <p className="text-gray-500 text-xs">見積もり</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">見積もり工数</p>
                  <p className="text-gray-300 text-sm">
                    {cost.estimated_hours}h/月
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">実稼働時間</p>
                  <input
                    type="number"
                    value={cost.actual_hours ?? ''}
                    onChange={(e) =>
                      onUpdateActualHours(cost.id, Number(e.target.value))
                    }
                    placeholder="0"
                    step="0.5"
                    min="0"
                    className="w-full bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all text-sm"
                  />
                </div>
              </div>

              {actualRate > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-gray-500 text-xs">実稼働時給</span>
                  <span
                    className={`font-bold text-sm ${
                      actualRate > estimatedRate
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                    }`}
                  >
                    ¥{actualRate.toLocaleString()}/h
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {costs.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
              <i className="ri-shield-line text-xl text-amber-400/50"></i>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              保守費用がまだ登録されていません
            </p>
            <button
              onClick={onAddClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i>
              保守費用を追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
