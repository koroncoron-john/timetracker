
import type { TimeEntry, Project } from '../../../types';

interface TimeEntryListProps {
  entries: TimeEntry[];
  project: Project;
}

/**
 * Renders a list of time entries with formatted dates, durations and calculated rate.
 * Includes basic error handling for malformed dates and zero‑duration entries.
 */
export default function TimeEntryList({ entries, project }: TimeEntryListProps) {
  /**
   * Formats an ISO date string to "M/D HH:MM".
   * Returns a fallback string if the date is invalid.
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  /**
   * Converts a duration in seconds to "Xh Ym".
   * Handles edge cases where the input is not a positive number.
   */
  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '—';
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  /**
   * Calculates the hourly rate based on the project's total tracked time.
   * Protects against division by zero and non‑numeric values.
   */
  const rateAtTime = (() => {
    const totalSeconds = Number(project.total_tracked_seconds);
    const reward = Number(project.reward_amount);
    if (totalSeconds > 0 && reward > 0) {
      return Math.round(reward / (totalSeconds / 3600));
    }
    return 0;
  })();

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <i className="ri-history-line text-cyan-400"></i>
        作業履歴
      </h3>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="backdrop-blur-sm bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <i className="ri-time-line text-cyan-400"></i>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{formatDate(entry.start_time)}</p>
                <p className="text-gray-400 text-xs">{formatDuration(entry.duration_seconds)}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-cyan-300 font-semibold text-sm">
                {rateAtTime > 0 ? `¥${rateAtTime.toLocaleString()}/h` : '—'}
              </p>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">作業履歴がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
