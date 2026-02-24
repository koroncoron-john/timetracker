import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type {
  Project,
  ProjectStatus,
  MaintenanceCost,
  MaintenanceLog,
  TimeEntry,
} from '../../types';
import ProjectHeader from './components/ProjectHeader';
import ProjectStats from './components/ProjectStats';
import StatusChanger from './components/StatusChanger';
import TimeEntryList from './components/TimeEntryList';
import MaintenanceCostSection from '../tracker/components/MaintenanceCostSection';
import MaintenanceCostModal from '../tracker/components/MaintenanceCostModal';
import MaintenanceLogSection from '../tracker/components/MaintenanceLogSection';
import MaintenanceLogModal from '../tracker/components/MaintenanceLogModal';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState<MaintenanceCost[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (projectId && user) {
      fetchAll();
    }
  }, [projectId, user]);

  const fetchAll = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        setError('プロジェクトが見つかりません');
        return;
      }

      // Fetch time entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('start_time', { ascending: false });

      if (entriesError) throw entriesError;

      // Fetch maintenance costs
      const { data: costsData, error: costsError } = await supabase
        .from('maintenance_costs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (costsError) throw costsError;

      // Fetch maintenance logs
      const { data: logsData, error: logsError } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      setProject(projectData);
      setTimeEntries(entriesData || []);
      setMaintenanceCosts(costsData || []);
      setMaintenanceLogs(logsData || []);
    } catch (err: any) {
      console.error(err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!project || !projectId) return;

    try {
      const updateData: { status: string; frozen_hourly_rate?: number } = { status };

      // When entering maintenance, freeze the current hourly rate
      if (status === 'maintenance' && project.status !== 'maintenance') {
        const totalSec = project.total_tracked_seconds ?? 0;
        const rate =
          totalSec > 0
            ? Math.round(project.reward_amount / (totalSec / 3600))
            : 0;
        updateData.frozen_hourly_rate = rate;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setProject((prev) =>
        prev
          ? {
              ...prev,
              status,
              frozen_hourly_rate:
                updateData.frozen_hourly_rate ??
                prev.frozen_hourly_rate,
            }
          : null,
      );
    } catch (err) {
      console.error('ステータスの更新に失敗しました:', err);
    }
  };

  const handleAddCost = async (data: {
    name: string;
    monthlyFee: number;
    estimatedHours: number;
  }) => {
    if (!projectId) return '';

    try {
      const { data: newCost, error } = await supabase
        .from('maintenance_costs')
        .insert({
          project_id: projectId,
          name: data.name,
          monthly_fee: data.monthlyFee,
          estimated_hours: data.estimatedHours,
          actual_hours: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setMaintenanceCosts((prev) => [newCost, ...prev]);
      return newCost.id;
    } catch (err) {
      console.error('保守費用の追加に失敗しました:', err);
      return '';
    }
  };

  const handleUpdateActualHours = async (id: string, hours: number) => {
    try {
      const { error } = await supabase
        .from('maintenance_costs')
        .update({ actual_hours: hours })
        .eq('id', id);

      if (error) throw error;

      setMaintenanceCosts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, actual_hours: hours } : c,
        ),
      );
    } catch (err) {
      console.error('実績時間の更新に失敗しました:', err);
    }
  };

  const handleAddLog = async (data: {
    costId: string;
    yearMonth: string;
    description: string;
    actualHours: number;
  }) => {
    if (!projectId) return;

    try {
      const { data: newLog, error } = await supabase
        .from('maintenance_logs')
        .insert({
          project_id: projectId,
          cost_id: data.costId,
          year_month: data.yearMonth,
          description: data.description,
          actual_hours: data.actualHours,
        })
        .select()
        .single();

      if (error) throw error;

      setMaintenanceLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('保守ログの追加に失敗しました:', err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaintenanceLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('保守ログの削除に失敗しました:', err);
    }
  };

  const handleCopyFromPreviousMonth = async (
    targetMonth: string,
    logsToCopy: MaintenanceLog[],
  ) => {
    if (!projectId) return;

    try {
      const newLogs = logsToCopy.map((log) => ({
        project_id: projectId,
        cost_id: log.cost_id,
        year_month: targetMonth,
        description: log.description,
        actual_hours: log.actual_hours,
      }));

      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert(newLogs)
        .select();

      if (error) throw error;

      setMaintenanceLogs((prev) => [...(data || []), ...prev]);
    } catch (err) {
      console.error('前月データのコピーに失敗しました:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-red-400 mb-4 block"></i>
          <p className="text-white text-lg mb-2">
            {error || 'プロジェクトが見つかりません'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const isMaintenance = project.status === 'maintenance';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-20">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse"
          style={{ animationDelay: '1.5s' }}
        ></div>
      </div>

      <ProjectHeader project={project} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-col gap-2 mb-6">
          <a
            href={`/tracker/${project.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (project.status === 'in_progress') {
                navigate(`/tracker/${project.id}`);
              }
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              project.status === 'in_progress'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 cursor-pointer'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed pointer-events-none'
            }`}
            aria-disabled={project.status !== 'in_progress'}
          >
            <i className="ri-timer-line text-lg"></i>
            タイムトラッカーを開く
          </a>
          <p className="text-xs text-gray-500 text-center">
            <i className="ri-information-line mr-1"></i>
            ステータスが「進行中」の場合のみ使用できます
          </p>
        </div>

        {/* Status Changer */}
        <StatusChanger
          currentStatus={project.status as ProjectStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Stats */}
        <ProjectStats
          project={project}
          isMaintenance={isMaintenance}
          maintenanceCosts={maintenanceCosts}
        />

        {/* Maintenance Sections */}
        {isMaintenance && (
          <>
            <MaintenanceCostSection
              costs={maintenanceCosts}
              onAddClick={() => setShowCostModal(true)}
              onUpdateActualHours={handleUpdateActualHours}
            />
            <MaintenanceLogSection
              logs={maintenanceLogs}
              costs={maintenanceCosts}
              onAddClick={() => setShowLogModal(true)}
              onDeleteLog={handleDeleteLog}
              onCopyFromPreviousMonth={handleCopyFromPreviousMonth}
            />
          </>
        )}

        {/* Time Entries */}
        <TimeEntryList entries={timeEntries} project={project} />
      </div>

      {/* Modals */}
      {showCostModal && (
        <MaintenanceCostModal
          onClose={() => setShowCostModal(false)}
          onAdd={handleAddCost}
        />
      )}
      {showLogModal && (
        <MaintenanceLogModal
          onClose={() => setShowLogModal(false)}
          onAdd={handleAddLog}
          onAddCost={handleAddCost}
          costs={maintenanceCosts}
        />
      )}
    </div>
  );
}
