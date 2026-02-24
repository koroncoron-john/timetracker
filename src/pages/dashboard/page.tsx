import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ProjectModal from './components/ProjectModal';
import type { Project } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-teal-600">
                FreelanceHub
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="text-teal-600 font-medium">
                  ダッシュボード
                </Link>
                <Link to="/tracker" className="text-gray-600 hover:text-gray-900">
                  タイムトラッカー
                </Link>
                <Link to="/consultation" className="text-gray-600 hover:text-gray-900">
                  相談予約
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/mypage"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <i className="ri-user-line text-lg"></i>
                <span className="hidden sm:inline">マイページ</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総プロジェクト数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <i className="ri-folder-line text-2xl text-teal-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">進行中</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-play-circle-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">完了</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総報酬額</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ¥{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-2xl text-amber-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">プロジェクト一覧</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line"></i>
                <span>新規プロジェクト</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer ${
                  filter === 'all'
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer ${
                  filter === 'active'
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                進行中
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                完了
              </button>
            </div>
          </div>

          {/* Projects List */}
          <div className="divide-y divide-gray-200">
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center">
                <i className="ri-folder-open-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">プロジェクトがありません</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-teal-600 hover:text-teal-700 font-medium cursor-pointer whitespace-nowrap"
                >
                  最初のプロジェクトを作成
                </button>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            project.status === '進行中'
                              ? 'bg-blue-100 text-blue-700'
                              : project.status === '完了'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <i className="ri-money-dollar-circle-line"></i>
                          <span>¥{project.reward_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="ri-time-line"></i>
                          <span>
                            {formatTime(project.total_tracked_seconds)} / {project.estimated_hours}h
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="ri-calendar-line"></i>
                          <span>{new Date(project.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                    <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
