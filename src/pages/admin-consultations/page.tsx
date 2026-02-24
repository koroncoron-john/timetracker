import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Consultation {
  id: string;
  user_id: string;
  expert_id: string;
  scheduled_at: string;
  consultation_type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  cancel_reason: string | null;
  user_profiles?: {
    name: string;
    email: string;
  };
  experts?: {
    name: string;
    field: string;
  };
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, statusFilter, searchTerm]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          user_profiles!consultations_user_id_fkey(name, email),
          experts(name, field)
        `)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('相談予約データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = [...consultations];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((consultation) => consultation.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (consultation) =>
          consultation.user_profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultation.user_profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultation.experts?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleStatusChange = async (consultationId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', consultationId);

      if (error) throw error;

      setConsultations(consultations.map(cons => 
        cons.id === consultationId ? { ...cons, ...updateData } : cons
      ));

      alert('ステータスを更新しました');
    } catch (error) {
      console.error('ステータスの更新に失敗しました:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const downloadCSV = () => {
    const headers = ['予約日時', 'ユーザー名', 'メールアドレス', '専門家', '相談タイプ', 'ステータス'];
    const csvContent = [
      headers.join(','),
      ...filteredConsultations.map((consultation) =>
        [
          new Date(consultation.scheduled_at).toLocaleString('ja-JP'),
          consultation.user_profiles?.name || '',
          consultation.user_profiles?.email || '',
          consultation.experts?.name || '',
          consultation.consultation_type,
          getStatusText(consultation.status),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consultations_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '予約済み';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-teal-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <i className="ri-dashboard-line text-xl text-white"></i>
                </div>
                <span className="text-xl font-bold text-gray-900">管理者ダッシュボード</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                ダッシュボード
              </Link>
              <Link to="/admin/users" className="text-gray-600 hover:text-gray-900">
                ユーザー管理
              </Link>
              <Link to="/admin/inquiries" className="text-gray-600 hover:text-gray-900">
                問い合わせ管理
              </Link>
              <Link to="/admin/consultations" className="text-teal-600 font-medium hover:text-teal-700">
                相談予約管理
              </Link>
              <Link to="/admin/experts" className="text-gray-600 hover:text-gray-900">
                専門家管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">相談予約管理</h1>
          <p className="text-gray-600">専門家への相談予約の管理</p>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="ユーザー名、メールアドレス、専門家名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">すべて</option>
                <option value="scheduled">予約済み</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredConsultations.length}件の予約を表示中
            </p>
            <button
              onClick={downloadCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <i className="ri-download-line"></i>
              <span>CSVダウンロード</span>
            </button>
          </div>
        </div>

        {/* 予約テーブル */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    予約日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    専門家
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    相談タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      予約が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(consultation.scheduled_at).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.user_profiles?.name || '不明'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.user_profiles?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.experts?.name || '不明'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.experts?.field || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{consultation.consultation_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                          {getStatusText(consultation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={consultation.status}
                          onChange={(e) => handleStatusChange(consultation.id, e.target.value as any)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        >
                          <option value="scheduled">予約済み</option>
                          <option value="completed">完了</option>
                          <option value="cancelled">キャンセル</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
