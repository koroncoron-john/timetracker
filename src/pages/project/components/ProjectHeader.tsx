
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../../types';

interface ProjectHeaderProps {
  project: Project;
}

const statusBadges: Record<string, { label: string; color: string }> = {
  backlog: { label: '作業前', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  in_progress: { label: '進行中', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  active: { label: '進行中', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  completed: { label: '完了', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  maintenance: { label: '保守対応', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const navigate = useNavigate();

  // Safely retrieve badge information; fall back to 'backlog' if status is unknown
  const badge = statusBadges[project.status] ?? statusBadges.backlog;

  // Guard against missing project data to avoid runtime crashes
  if (!project) {
    console.error('ProjectHeader: project prop is undefined');
    return null;
  }

  return (
    <div className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-white font-semibold text-lg truncate">{project.title}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-medium border ${badge.color} whitespace-nowrap`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              ¥{project.reward_amount.toLocaleString()} / 見積 {project.estimated_hours}h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
