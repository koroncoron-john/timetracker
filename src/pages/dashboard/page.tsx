import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProjectModal from './components/ProjectModal';
import type { Project } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('プロジェクトの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.status === '進行中';
    if (filter === 'completed') return project.status === '完了';
    return true;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === '進行中').length,
    completed: projects.filter((p) => p.status === '完了').length,
    totalRevenue: projects.reduce((sum, p) => sum + p.reward_amount, 0),
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="mt-4 text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white">プロジェクト管理</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-gradient px-4 md:px-6 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-500/20 text-sm md:text-base"
        >
          <i className="ri-add-line"></i>
          <span>新規プロジェクト</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
        <div className="glass-card p-4 md:p-6 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-400">総プロジェクト</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-folder-line text-xl md:text-2xl text-cyan-400"></i>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 md:p-6 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-400">進行中</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.active}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-play-circle-line text-xl md:text-2xl text-blue-400"></i>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 md:p-6 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-400">完了</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-check-line text-xl md:text-2xl text-emerald-400"></i>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 md:p-6 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-400">総報酬額</p>
              <p className="text-lg md:text-2xl font-bold text-white mt-1">
                ¥{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-xl md:text-2xl text-amber-400"></i>
            </div>
          </div>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="glass-card border-white/10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white">プロジェクト一覧</h2>
          </div>

          {/* フィルタータブ */}
          <div className="flex space-x-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${filter === f
                    ? 'bg-white/10 text-cyan-400 border border-cyan-400/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {f === 'all' ? 'すべて' : f === 'active' ? '進行中' : '完了'}
              </button>
            ))}
          </div>
        </div>

        {/* リスト */}
        <div className="divide-y divide-white/5">
          {filteredProjects.length === 0 ? (
            <div className="p-12 md:p-16 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-folder-open-line text-3xl md:text-4xl text-gray-600"></i>
              </div>
              <p className="text-gray-400 text-sm md:text-base">プロジェクトがありません</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer text-sm"
              >
                最初のプロジェクトを作成
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="block p-4 md:p-6 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {project.title}
                      </h3>
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium flex-shrink-0 ${project.status === '進行中' || project.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : project.status === '完了' || project.status === 'completed' || project.status === 'done'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}
                      >
                        {project.status === '進行中' || project.status === 'in_progress' ? '進行中' :
                          project.status === '完了' || project.status === 'completed' || project.status === 'done' ? '完了' : project.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <i className="ri-money-dollar-circle-line text-gray-500"></i>
                        <span>¥{project.reward_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-time-line text-gray-500"></i>
                        <span>
                          {formatTime(project.total_tracked_seconds)} / {project.estimated_hours}h
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-1 text-gray-500">
                        <i className="ri-calendar-line"></i>
                        <span>{project.created_at ? new Date(project.created_at).toLocaleDateString('ja-JP') : ''}</span>
                      </div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-line text-lg md:text-xl text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all ml-2"></i>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* プロジェクト作成モーダル */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
