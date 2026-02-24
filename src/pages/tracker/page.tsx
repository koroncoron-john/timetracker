import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { ProjectStatus, MaintenanceCost, MaintenanceLog } from '../../types';
import MaintenanceCostSection from './components/MaintenanceCostSection';
import MaintenanceCostModal from './components/MaintenanceCostModal';
import MaintenanceLogSection from './components/MaintenanceLogSection';
import MaintenanceLogModal from './components/MaintenanceLogModal';

const statusConfig: Record<ProjectStatus, { label: string; icon: string; dotColor: string; bgColor: string; borderColor: string; textColor: string }> = {
  backlog: { label: '作業前', icon: 'ri-inbox-line', dotColor: 'bg-gray-400', bgColor: 'from-gray-400/20 to-gray-500/20', borderColor: 'border-gray-400/30', textColor: 'text-gray-300' },
  in_progress: { label: '進行中', icon: 'ri-play-circle-line', dotColor: 'bg-cyan-400', bgColor: 'from-cyan-400/20 to-blue-500/20', borderColor: 'border-cyan-400/30', textColor: 'text-cyan-300' },
  completed: { label: '完了', icon: 'ri-check-double-line', dotColor: 'bg-emerald-400', bgColor: 'from-emerald-400/20 to-green-500/20', borderColor: 'border-emerald-400/30', textColor: 'text-emerald-300' },
  maintenance: { label: '保守対応', icon: 'ri-tools-line', dotColor: 'bg-amber-400', bgColor: 'from-amber-400/20 to-orange-500/20', borderColor: 'border-amber-400/30', textColor: 'text-amber-300' },
};

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'backlog', label: '作業前' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'maintenance', label: '保守対応' },
];

interface Project {
  id: string;
  title: string;
  reward_amount: number;
  estimated_hours: number;
  total_tracked_seconds: number;
  status: string;
  frozen_hourly_rate: number | null;
  current_hourly_rate: number;
}

interface TimeEntry {
  id: string;
  project_id: string;
  start_time: string;
  duration_seconds: number;
}

export default function TimeTracker() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>('backlog');
  const [showCostModal, setShowCostModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [maintenanceCosts, setMaintenanceCosts] = useState<MaintenanceCost[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData();
    }
  }, [projectId, user]);

  const fetchProjectData = async () => {
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

      setProject(projectData);
      setCurrentStatus(projectData.status as ProjectStatus);

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

      setTimeEntries(entriesData || []);
      setMaintenanceCosts(costsData || []);
      setMaintenanceLogs(logsData || []);

    } catch (err: any) {
      console.error('Error fetching project data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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
          <i className="ri-error-warning-line text-6xl text-red-400 mb-4"></i>
          <p className="text-white text-lg mb-2">{error || 'プロジェクトが見つかりません'}</p>
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

  const isMaintenance = currentStatus === 'maintenance';
  const frozenRate = project.frozen_hourly_rate ?? project.current_hourly_rate;

  const totalSeconds = project.total_tracked_seconds + currentSeconds;
  const currentHourlyRate = isMaintenance
    ? frozenRate
    : totalSeconds > 0
      ? Math.round(project.reward_amount / (totalSeconds / 3600))
      : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleToggle = async () => {
    if (isRunning) {
      try {
        // Save time entry to Supabase
        const startTime = new Date(Date.now() - currentSeconds * 1000).toISOString();
        const { data: newEntry, error: insertError } = await supabase
          .from('time_entries')
          .insert({
            project_id: projectId!,
            user_id: user?.id,
            start_time: startTime,
            duration_seconds: currentSeconds,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update project total_tracked_seconds
        const newTotalSeconds = project.total_tracked_seconds + currentSeconds;
        const { error: updateError } = await supabase
          .from('projects')
          .update({ total_tracked_seconds: newTotalSeconds })
          .eq('id', projectId!);

        if (updateError) throw updateError;

        setProject({ ...project, total_tracked_seconds: newTotalSeconds });
        setTimeEntries(prev => [newEntry, ...prev]);
        setCurrentSeconds(0);
        setIsRunning(false);
      } catch (err) {
        console.error('タイムエントリーの保存に失敗しました:', err);
        alert('タイムエントリーの保存に失敗しました');
      }
    } else {
      setIsRunning(true);
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    try {
      const updateData: { status: string; frozen_hourly_rate?: number } = { status };

      // If switching to maintenance, freeze the current hourly rate
      if (status === 'maintenance' && currentStatus !== 'maintenance') {
        const currentRate = totalSeconds > 0
          ? Math.round(project.reward_amount / (totalSeconds / 3600))
          : 0;
        updateData.frozen_hourly_rate = currentRate;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId!);

      if (error) throw error;

      setCurrentStatus(status);
      setShowStatusMenu(false);
      if (isRunning) {
        setIsRunning(false);
      }

      // Update local project state
      if (updateData.frozen_hourly_rate !== undefined) {
        setProject({ ...project, status, frozen_hourly_rate: updateData.frozen_hourly_rate });
      } else {
        setProject({ ...project, status });
      }

    } catch (err) {
      console.error('Error updating status:', err);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleAddCost = async (data: { name: string; monthlyFee: number; estimatedHours: number }) => {
    try {
      const { data: newCost, error } = await supabase
        .from('maintenance_costs')
        .insert({
          project_id: projectId!,
          name: data.name,
          monthly_fee: data.monthlyFee,
          estimated_hours: data.estimatedHours,
          actual_hours: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setMaintenanceCosts(prev => [newCost, ...prev]);
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

      setMaintenanceCosts(prev =>
        prev.map(c => (c.id === id ? { ...c, actual_hours: hours } : c))
      );
    } catch (err) {
      console.error('実績時間の更新に失敗しました:', err);
    }
  };

  const handleAddLog = async (data: { costId: string; yearMonth: string; description: string; actualHours: number }) => {
    try {
      const { data: newLog, error } = await supabase
        .from('maintenance_logs')
        .insert({
          project_id: projectId!,
          cost_id: data.costId,
          year_month: data.yearMonth,
          description: data.description,
          actual_hours: data.actualHours,
        })
        .select()
        .single();

      if (error) throw error;

      setMaintenanceLogs(prev => [newLog, ...prev]);
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

      setMaintenanceLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('保守ログの削除に失敗しました:', err);
    }
  };

  const handleCopyFromPreviousMonth = async (targetMonth: string, logsToCopy: MaintenanceLog[]) => {
    try {
      const newLogs = logsToCopy.map(log => ({
        project_id: projectId!,
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

      setMaintenanceLogs(prev => [...(data || []), ...prev]);
    } catch (err) {
      console.error('前月データのコピーに失敗しました:', err);
    }
  };

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      const entry = timeEntries.find(e => e.id === id);
      if (!entry) return;

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update project total_tracked_seconds
      const newTotal = Math.max(0, project.total_tracked_seconds - entry.duration_seconds);
      const { error: updateError } = await supabase
        .from('projects')
        .update({ total_tracked_seconds: newTotal })
        .eq('id', projectId!);

      if (updateError) throw updateError;

      setProject({ ...project, total_tracked_seconds: newTotal });
      setTimeEntries(prev => prev.filter(e => e.id !== id));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('作業履歴の削除に失敗しました:', err);
      alert('作業履歴の削除に失敗しました');
    }
  };

  const activeStatus = statusConfig[currentStatus] ?? statusConfig.backlog;

  // Maintenance summary
  const totalMaintenanceFee = maintenanceCosts.reduce((s, c) => s + c.monthly_fee, 0);
  const totalActualHours = maintenanceCosts.reduce((s, c) => s + c.actual_hours, 0);
  const maintenanceActualRate = totalActualHours > 0 ? Math.round(totalMaintenanceFee / totalActualHours) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-20">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
            </button>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-base">{project.title}</h2>
              <p className="text-gray-400 text-xs">¥{project.reward_amount.toLocaleString()} / {project.estimated_hours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Status Selector */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl backdrop-blur-xl bg-gradient-to-r ${activeStatus.bgColor} border ${activeStatus.borderColor} transition-all duration-200 cursor-pointer whitespace-nowrap`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${activeStatus.dotColor} shadow-lg`}></div>
              <i className={`${activeStatus.icon} ${activeStatus.textColor}`}></i>
              <span className={`font-medium text-sm ${activeStatus.textColor}`}>{activeStatus.label}</span>
            </div>
            <i className={`ri-arrow-down-s-line ${activeStatus.textColor} transition-transform duration-200 ${showStatusMenu ? 'rotate-180' : ''}`}></i>
          </button>

          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 z-20 backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                {statusOptions.map((option) => {
                  const config = statusConfig[option.value];
                  const isActive = currentStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isActive ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></div>
                      <i className={`${config.icon} ${config.textColor} text-sm`}></i>
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{option.label}</span>
                      {isActive && <i className="ri-check-line text-cyan-400 ml-auto"></i>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Frozen Rate Notice for Maintenance */}
        {isMaintenance && (
          <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-lock-line text-amber-400 text-sm"></i>
            </div>
            <div>
              <p className="text-amber-300 text-sm font-medium">案件時給は固定されています</p>
              <p className="text-amber-300/60 text-xs mt-1">
                保守対応モードでは開発時の実質時給 ¥{frozenRate.toLocaleString()}/h が固定されます。下部で保守費用ごとの時給を管理できます。
              </p>
            </div>
          </div>
        )}

        {/* Current Hourly Rate Display */}
        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 text-center ${
          isMaintenance
            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-400/20'
            : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
        }`}>
          <p className="text-gray-300 text-sm mb-3">
            {isMaintenance ? '案件 実質時給（固定）' : '現在の実質時給'}
          </p>
          <div className="relative">
            {isRunning && !isMaintenance && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse"></div>
            )}
            <div className={`relative text-6xl font-bold bg-clip-text text-transparent mb-2 ${
              isMaintenance
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300'
                : 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient'
            }`}>
              ¥{currentHourlyRate.toLocaleString()}
            </div>
          </div>
          <p className="text-gray-400 text-sm">/時間</p>
          {isMaintenance && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <i className="ri-lock-line text-amber-400/50 text-xs"></i>
              <span className="text-amber-400/50 text-xs">固定</span>
            </div>
          )}

          {/* Timer Display - only for non-maintenance */}
          {!isMaintenance && (
            <div className="mt-6 backdrop-blur-sm bg-white/5 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-2">現在のセッション</p>
              <p className="text-3xl font-mono font-bold text-white">{formatTime(currentSeconds)}</p>
            </div>
          )}

          {/* Maintenance summary in rate card */}
          {isMaintenance && maintenanceCosts.length > 0 && (
            <div className="mt-6 backdrop-blur-sm bg-white/5 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-2">保守 実稼働時給</p>
              <p className={`text-3xl font-bold ${maintenanceActualRate > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                {maintenanceActualRate > 0 ? `¥${maintenanceActualRate.toLocaleString()}` : '—'}
              </p>
              {maintenanceActualRate > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  月額 ¥{totalMaintenanceFee.toLocaleString()} / 実稼働 {totalActualHours}h
                </p>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons - only for non-maintenance */}
        {!isMaintenance && (
          <div className="mb-8">
            {!isRunning ? (
              <button
                onClick={handleToggle}
                disabled={currentStatus !== 'in_progress'}
                className={`w-full font-bold py-6 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 whitespace-nowrap ${
                  currentStatus !== 'in_progress'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white transform hover:scale-105 shadow-2xl shadow-purple-500/50 cursor-pointer'
                }`}
              >
                <i className="ri-play-fill text-3xl"></i>
                <span className="text-xl">開始</span>
                {currentStatus !== 'in_progress' && (
                  <span className="text-sm font-normal ml-1">（進行中で有効）</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleToggle}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-red-500/50 flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap animate-pulse"
              >
                <i className="ri-stop-fill text-3xl"></i>
                <span className="text-xl">停止</span>
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-2">総稼働時間</p>
            <p className="text-white font-bold text-lg">{formatDuration(isMaintenance ? project.total_tracked_seconds : totalSeconds)}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-2">{isMaintenance ? '保守費用数' : '進捗率'}</p>
            <p className="text-white font-bold text-lg">
              {isMaintenance
                ? `${maintenanceCosts.length}件`
                : `${Math.round((totalSeconds / 3600 / project.estimated_hours) * 100)}%`
              }
            </p>
          </div>
        </div>

        {/* Maintenance Cost Section */}
        {isMaintenance && (
          <MaintenanceCostSection
            costs={maintenanceCosts}
            onAddClick={() => setShowCostModal(true)}
            onUpdateActualHours={handleUpdateActualHours}
          />
        )}

        {/* Monthly Maintenance Log Section */}
        {isMaintenance && (
          <MaintenanceLogSection
            logs={maintenanceLogs}
            costs={maintenanceCosts}
            onAddClick={() => setShowLogModal(true)}
            onDeleteLog={handleDeleteLog}
            onCopyFromPreviousMonth={handleCopyFromPreviousMonth}
          />
        )}

        {/* Time Entries */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <i className="ri-history-line text-cyan-400"></i>
            作業履歴
          </h3>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="backdrop-blur-sm bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors group"
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
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-cyan-300 font-semibold text-sm">
                      ¥{Math.round(project.reward_amount / (project.total_tracked_seconds / 3600)).toLocaleString()}/h
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTargetId(entry.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            ))}

            {timeEntries.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">作業履歴がありません</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTargetId(null)}
          ></div>
          <div className="relative w-full max-w-sm mx-4 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-400/20 flex items-center justify-center mb-4">
                <i className="ri-error-warning-line text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">作業履歴を削除</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                この操作は元に戻せません。<br />本当にこの作業履歴を削除しますか？
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteTimeEntry(deleteTargetId)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-delete-bin-line"></i>
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Cost Modal */}
      {showCostModal && (
        <MaintenanceCostModal
          onClose={() => setShowCostModal(false)}
          onAdd={handleAddCost}
        />
      )}

      {/* Maintenance Log Modal */}
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
