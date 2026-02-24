
import { useState } from 'react';
import type { ProjectStatus } from '../../../types';

const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    icon: string;
    dotColor: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  backlog: {
    label: '作業前',
    icon: 'ri-inbox-line',
    dotColor: 'bg-gray-400',
    bgColor: 'from-gray-400/20 to-gray-500/20',
    borderColor: 'border-gray-400/30',
    textColor: 'text-gray-300',
  },
  in_progress: {
    label: '進行中',
    icon: 'ri-play-circle-line',
    dotColor: 'bg-cyan-400',
    bgColor: 'from-cyan-400/20 to-blue-500/20',
    borderColor: 'border-cyan-400/30',
    textColor: 'text-cyan-300',
  },
  completed: {
    label: '完了',
    icon: 'ri-check-double-line',
    dotColor: 'bg-emerald-400',
    bgColor: 'from-emerald-400/20 to-green-500/20',
    borderColor: 'border-emerald-400/30',
    textColor: 'text-emerald-300',
  },
  maintenance: {
    label: '保守対応',
    icon: 'ri-tools-line',
    dotColor: 'bg-amber-400',
    bgColor: 'from-amber-400/20 to-orange-500/20',
    borderColor: 'border-amber-400/30',
    textColor: 'text-amber-300',
  },
};

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'backlog', label: '作業前' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'maintenance', label: '保守対応' },
];

interface StatusChangerProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => Promise<void>;
}

export default function StatusChanger({
  currentStatus,
  onStatusChange,
}: StatusChangerProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [changing, setChanging] = useState(false);

  const activeStatus = statusConfig[currentStatus] ?? statusConfig.backlog;

  const handleChange = async (status: ProjectStatus) => {
    if (status === currentStatus) {
      setShowMenu(false);
      return;
    }

    setChanging(true);
    try {
      await onStatusChange(status);
    } catch (error) {
      // Optional: surface the error to the user or log it
      console.error('Failed to change status:', error);
    } finally {
      setChanging(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={changing}
        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl backdrop-blur-xl bg-gradient-to-r ${activeStatus.bgColor} border ${activeStatus.borderColor} transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-60`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${activeStatus.dotColor} shadow-lg`}
          ></div>
          <i className={`${activeStatus.icon} ${activeStatus.textColor}`}></i>
          <span className={`font-medium text-sm ${activeStatus.textColor}`}>
            {changing ? '変更中...' : activeStatus.label}
          </span>
        </div>
        <i
          className={`ri-arrow-down-s-line ${activeStatus.textColor} transition-transform duration-200 ${
            showMenu ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute top-full left-0 right-0 mt-2 z-20 backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {statusOptions.map((option) => {
              const config = statusConfig[option.value];
              const isActive = currentStatus === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleChange(option.value)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}
                  ></div>
                  <i
                    className={`${config.icon} ${config.textColor} text-sm`}
                  ></i>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {option.label}
                  </span>
                  {isActive && (
                    <i className="ri-check-line text-cyan-400 ml-auto"></i>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
