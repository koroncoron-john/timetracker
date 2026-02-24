
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MaintenanceLog, MaintenanceCost } from '../../../types';

interface MaintenanceLogSectionProps {
  logs: MaintenanceLog[];
  costs: MaintenanceCost[];
  onAddClick: () => void;
  onDeleteLog: (id: string) => void;
  onCopyFromPreviousMonth: (targetMonth: string, logsToCopy: MaintenanceLog[]) => void;
}

export default function MaintenanceLogSection({
  logs,
  costs,
  onAddClick,
  onDeleteLog,
  onCopyFromPreviousMonth,
}: MaintenanceLogSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetMonth, setCopyTargetMonth] = useState('');
  const [copySourceMonth, setCopySourceMonth] = useState('');
  const [selectedCopyLogIds, setSelectedCopyLogIds] = useState<Set<string>>(new Set());

  const months = Array.from(new Set(logs.map((l) => l.year_month))).sort((a, b) =>
    b.localeCompare(a)
  );

  const filteredLogs =
    selectedMonth === 'all'
      ? [...logs].sort((a, b) => b.created_at.localeCompare(a.created_at))
      : logs
          .filter((l) => l.year_month === selectedMonth)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const formatYearMonth = (ym: string) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const getNextMonth = (ym: string) => {
    const [year, month] = ym.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  };

  const getCostName = (costId: string) => {
    const cost = costs.find((c) => c.id === costId);
    return cost ? cost.name : '不明';
  };

  const getCost = (costId: string) => {
    return costs.find((c) => c.id === costId);
  };

  const getMonthSummary = (month: string) => {
    const monthLogs = logs.filter((l) => l.year_month === month);
    const totalHours = monthLogs.reduce((s, l) => s + l.actual_hours, 0);
    const uniqueCostIds = Array.from(new Set(monthLogs.map((l) => l.cost_id)));
    const uniqueTotalFee = uniqueCostIds.reduce((s, cid) => {
      const cost = getCost(cid);
      return s + (cost ? cost.monthly_fee : 0);
    }, 0);
    const avgRate = totalHours > 0 ? Math.round(uniqueTotalFee / totalHours) : 0;
    return { totalHours, uniqueTotalFee, avgRate, count: monthLogs.length };
  };

  const currentSummary = selectedMonth === 'all' ? null : getMonthSummary(selectedMonth);

  const copySourceLogs = logs.filter((l) => l.year_month === copySourceMonth);

  const handleOpenCopyModal = () => {
    if (months.length === 0) return;
    const initialSourceMonth = months[0];
    const initialTargetMonth = getNextMonth(initialSourceMonth);
    setCopySourceMonth(initialSourceMonth);
    setCopyTargetMonth(initialTargetMonth);
    const sourceLogs = logs.filter((l) => l.year_month === initialSourceMonth);
    setSelectedCopyLogIds(new Set(sourceLogs.map((l) => l.id)));
    setShowCopyModal(true);
  };

  const handleSourceMonthChange = (newSourceMonth: string) => {
    setCopySourceMonth(newSourceMonth);
    const sourceLogs = logs.filter((l) => l.year_month === newSourceMonth);
    setSelectedCopyLogIds(new Set(sourceLogs.map((l) => l.id)));
  };

  const handleToggleCopyLog = (logId: string) => {
    setSelectedCopyLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const handleConfirmCopy = () => {
    const selectedLogs = copySourceLogs.filter((l) => selectedCopyLogIds.has(l.id));
    if (selectedLogs.length === 0) return;
    onCopyFromPreviousMonth(copyTargetMonth, selectedLogs);
    setShowCopyModal(false);
    setSelectedCopyLogIds(new Set());
    setSelectedMonth(copyTargetMonth);
  };

  const canCopy = logs.length > 0;

  const copyModal = showCopyModal ? createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 9999 }}>
      <div onClick={() => setShowCopyModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        className="relative w-full max-w-md mx-4 mb-0 sm:mb-4 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ zIndex: 10000 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            履歴からコピー
          </h3>
          <button
            onClick={() => setShowCopyModal(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-2">コピー元の月</label>
          <select
            value={copySourceMonth}
            onChange={(e) => handleSourceMonthChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm appearance-none cursor-pointer [color-scheme:dark]"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-slate-800 text-white">
                {formatYearMonth(m)}（{logs.filter((l) => l.year_month === m).length}件）
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-center flex-1">
            <p className="text-gray-500 text-xs mb-1">コピー元</p>
            <p className="text-white text-sm font-semibold">{formatYearMonth(copySourceMonth)}</p>
          </div>
          <div className="flex items-center justify-center">
            <i className="ri-arrow-right-line text-teal-400 text-lg"></i>
          </div>
          <div className="text-center flex-1">
            <p className="text-gray-500 text-xs mb-1">コピー先</p>
            <p className="text-teal-300 text-sm font-semibold">{formatYearMonth(copyTargetMonth)}</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-gray-300 text-sm font-medium mb-2">コピー先の年月</label>
          <input
            type="month"
            value={copyTargetMonth}
            onChange={(e) => setCopyTargetMonth(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all text-sm [color-scheme:dark]"
          />
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-300 text-sm font-medium">コピーする項目を選択</label>
            <button
              onClick={() => {
                if (selectedCopyLogIds.size === copySourceLogs.length) {
                  setSelectedCopyLogIds(new Set());
                } else {
                  setSelectedCopyLogIds(new Set(copySourceLogs.map((l) => l.id)));
                }
              }}
              className="text-teal-400 text-xs hover:text-teal-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              {selectedCopyLogIds.size === copySourceLogs.length ? 'すべて解除' : 'すべて選択'}
            </button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {copySourceLogs.length > 0 ? (
              copySourceLogs.map((log) => {
                const isSelected = selectedCopyLogIds.has(log.id);
                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => handleToggleCopyLog(log.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? 'bg-teal-500/15 border-teal-400/30' : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'bg-teal-500 text-white' : 'bg-white/10 text-transparent'
                        }`}
                      >
                        <i className="ri-check-line text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400 text-xs">{getCostName(log.cost_id)}</span>
                          <span className="text-gray-600 text-xs">・{log.actual_hours}h</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed line-clamp-2">{log.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">この月のログはありません</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 mb-5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-400/20">
          <i className="ri-information-line text-amber-400 text-sm mt-0.5 flex-shrink-0"></i>
          <p className="text-amber-300/80 text-xs leading-relaxed">
            作業内容と稼働時間がコピーされます。コピー後に各項目を編集できます。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowCopyModal(false)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirmCopy}
            disabled={selectedCopyLogIds.size === 0}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <i className="ri-file-copy-line"></i>
            {selectedCopyLogIds.size}件コピー
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border border-teal-400/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-calendar-check-line text-teal-400"></i>
          月次保守履歴
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-teal-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-lg"></i>
          </button>
          {canCopy && (
            <button
              onClick={handleOpenCopyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-file-copy-line text-sm"></i>
              履歴コピー
            </button>
          )}
        </div>
      </div>

      {months.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              selectedMonth === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                : 'bg-white/10 text-gray-400 hover:bg-white/15 border border-white/10'
            }`}
          >
            すべて
          </button>
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedMonth === month
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/10 text-gray-400 hover:bg-white/15 border border-white/10'
              }`}
            >
              {formatYearMonth(month)}
            </button>
          ))}
        </div>
      )}

      {currentSummary && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">作業件数</p>
            <p className="text-white font-bold text-sm">{currentSummary.count}件</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">合計稼働</p>
            <p className="text-white font-bold text-sm">{currentSummary.totalHours}h</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">実質時給</p>
            <p
              className={`font-bold text-sm ${
                currentSummary.avgRate > 0 ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              {currentSummary.avgRate > 0
                ? `¥${currentSummary.avgRate.toLocaleString()}`
                : '\u2014'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {filteredLogs.map((log) => {
          const cost = getCost(log.cost_id);
          const logRate =
            cost && log.actual_hours > 0
              ? Math.round(cost.monthly_fee / log.actual_hours)
              : 0;
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition-colors"
            >
              <button
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="w-full text-left p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-400/20 text-teal-300 text-xs font-medium whitespace-nowrap">
                        {formatYearMonth(log.year_month)}
                      </span>
                      <span className="text-gray-500 text-xs truncate">{getCostName(log.cost_id)}</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed line-clamp-2">{log.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-teal-300 font-bold text-sm">{log.actual_hours}h</p>
                    </div>
                    <i
                      className={`ri-arrow-down-s-line text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    ></i>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">保守費用項目</p>
                      <p className="text-gray-300 text-sm">{getCostName(log.cost_id)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">この作業の時給</p>
                      <p className={`text-sm font-bold ${logRate > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {logRate > 0 ? `¥${logRate.toLocaleString()}/h` : '\u2014'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">見積もり工数</p>
                      <p className="text-gray-300 text-sm">{cost ? `${cost.estimated_hours}h/月` : '\u2014'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">記録日</p>
                      <p className="text-gray-300 text-sm">
                        {new Date(log.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {cost && log.actual_hours < cost.estimated_hours && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                      <i className="ri-flashlight-line text-emerald-400 text-sm"></i>
                      <span className="text-emerald-400 text-xs font-medium">
                        見積もりより{cost.estimated_hours - log.actual_hours}h短縮 —
                        効率{Math.round((cost.estimated_hours / log.actual_hours) * 100)}%
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLog(log.id);
                      setExpandedLogId(null);
                    }}
                    className="mt-3 flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                    削除
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/10 flex items-center justify-center">
              <i className="ri-calendar-todo-line text-xl text-teal-400/50"></i>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {selectedMonth === 'all'
                ? '月次保守ログがまだありません'
                : `${formatYearMonth(selectedMonth)}のログがありません`}
            </p>
            <button
              onClick={onAddClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 text-teal-300 text-sm font-medium hover:from-teal-500/30 hover:to-cyan-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i>
              ログを追加
            </button>
          </div>
        )}
      </div>

      {copyModal}
    </div>
  );
}
