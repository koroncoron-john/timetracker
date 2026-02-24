
import type { Project, MaintenanceCost } from '../../../types';

interface ProjectStatsProps {
  project: Project;
  isMaintenance: boolean;
  maintenanceCosts: MaintenanceCost[];
}

export default function ProjectStats({
  project,
  isMaintenance,
  maintenanceCosts,
}: ProjectStatsProps) {
  const totalSeconds = project.total_tracked_seconds ?? 0;
  const trackedHours = totalSeconds / 3600;
  const currentHourlyRate =
    trackedHours > 0 ? Math.round(project.reward_amount / trackedHours) : 0;
  const estimatedRate =
    project.estimated_hours > 0
      ? Math.round(project.reward_amount / project.estimated_hours)
      : 0;
  const frozenRate = project.frozen_hourly_rate ?? currentHourlyRate;
  const progressPercent =
    project.estimated_hours > 0
      ? Math.min(
          Math.round((trackedHours / project.estimated_hours) * 100),
          100,
        )
      : 0;

  const totalMaintenanceFee = maintenanceCosts.reduce(
    (s, c) => s + (c.monthly_fee ?? 0),
    0,
  );
  const totalActualHours = maintenanceCosts.reduce(
    (s, c) => s + (c.actual_hours ?? 0),
    0,
  );
  const maintenanceActualRate =
    totalActualHours > 0
      ? Math.round(totalMaintenanceFee / totalActualHours)
      : 0;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Main Rate Card */}
      <div
        className={`backdrop-blur-xl border rounded-2xl p-6 text-center ${
          isMaintenance
            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-400/20'
            : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
        }`}
      >
        <p className="text-gray-300 text-sm mb-2">
          {isMaintenance ? '案件 実質時給（固定）' : '現在の実質時給'}
        </p>
        <div
          className={`text-5xl font-bold bg-clip-text text-transparent mb-1 ${
            isMaintenance
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300'
              : 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400'
          }`}
        >
          ¥{(isMaintenance ? frozenRate : currentHourlyRate).toLocaleString()}
        </div>
        <p className="text-gray-400 text-sm">/時間</p>
        {isMaintenance && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <i className="ri-lock-line text-amber-400/50 text-xs"></i>
            <span className="text-amber-400/50 text-xs">固定</span>
          </div>
        )}

        {isMaintenance && maintenanceCosts.length > 0 && (
          <div className="mt-4 backdrop-blur-sm bg-white/5 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">保守 実稼働時給</p>
            <p
              className={`text-2xl font-bold ${
                maintenanceActualRate > 0 ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              {maintenanceActualRate > 0
                ? `¥${maintenanceActualRate.toLocaleString()}`
                : '\u2014'}
            </p>
            {maintenanceActualRate > 0 && (
              <p className="text-gray-500 text-xs mt-1">
                月額 ¥{totalMaintenanceFee.toLocaleString()} / 実稼働{' '}
                {totalActualHours}h
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">報酬額</p>
          <p className="text-white font-bold text-base">
            ¥{project.reward_amount.toLocaleString()}
          </p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">見積時給</p>
          <p className="text-white font-bold text-base">
            ¥{estimatedRate.toLocaleString()}/h
          </p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">総稼働時間</p>
          <p className="text-white font-bold text-base">
            {formatDuration(totalSeconds)}
          </p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">進捗率</p>
          <p className="text-white font-bold text-base">{progressPercent}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaintenance && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
            <span>稼働時間</span>
            <span>
              {trackedHours.toFixed(1)}h / {project.estimated_hours}h
            </span>
          </div>
          <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Frozen Rate Notice */}
      {isMaintenance && (
        <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-lock-line text-amber-400 text-sm"></i>
          </div>
          <div>
            <p className="text-amber-300 text-sm font-medium">
              案件時給は固定されています
            </p>
            <p className="text-amber-300/60 text-xs mt-1">
              保守対応モードでは開発時の実質時給 ¥{frozenRate.toLocaleString()}/h が固定されます。下部で保守費用ごとの時給を管理できます。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
