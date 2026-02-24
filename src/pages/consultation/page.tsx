import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CalendlyModal from './components/CalendlyModal';

interface Expert {
  id: string;
  name: string;
  field: string;
  bio: string;
  calendly_url: string;
  avatar_url: string;
}

interface Consultation {
  id: string;
  expert_id: string;
  scheduled_at: string;
  consultation_type: string;
  status: string;
  notes: string;
  expert?: Expert;
}

export default function ConsultationPage() {
  const { user } = useAuth();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
    if (user) {
      fetchConsultations();
    }
  }, [user]);

  const fetchExperts = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('専門家の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          expert:experts(*)
        `)
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('相談履歴の取得に失敗しました:', error);
    }
  };

  const handleBooking = (expert: Expert) => {
    setSelectedExpert(expert);
    setIsModalOpen(true);
  };

  const handleBookingComplete = async (scheduledAt: Date, notes: string) => {
    if (!user || !selectedExpert) return;

    try {
      const { error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          expert_id: selectedExpert.id,
          scheduled_at: scheduledAt.toISOString(),
          consultation_type: '専門家相談',
          status: '予約済み',
          notes: notes
        });

      if (error) throw error;

      await fetchConsultations();
      setIsModalOpen(false);
      setSelectedExpert(null);
    } catch (error) {
      console.error('予約の保存に失敗しました:', error);
      alert('予約の保存に失敗しました。もう一度お試しください。');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '予約済み':
        return 'bg-blue-100 text-blue-800';
      case '完了':
        return 'bg-green-100 text-green-800';
      case 'キャンセル':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">専門家への相談</h1>
              <p className="mt-2 text-sm text-gray-600">
                経験豊富な専門家に相談して、プロジェクトを成功に導きましょう
              </p>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              ダッシュボードに戻る
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Initial Consultation Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <i className="ri-calendar-check-line text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">初回30分無料相談</h2>
                  <p className="text-teal-100 text-sm">まずはお気軽にご相談ください</p>
                </div>
              </div>
              <p className="text-white/90 mb-4 leading-relaxed">
                プロジェクトの進め方、技術選定、チーム構成など、どんなことでもお気軽にご相談ください。
                経験豊富な専門家が、あなたのプロジェクトを成功に導くためのアドバイスを提供します。
              </p>
              <a
                href="https://calendly.com/koroncoron-1121/30"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-calendar-line mr-2"></i>
                初回相談を予約する
              </a>
            </div>
          </div>
        </div>

        {/* Experts Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">専門家一覧</h2>
            <span className="text-sm text-gray-600">{experts.length}名の専門家が在籍</span>
          </div>

          {experts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-search-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">専門家が登録されていません</h3>
              <p className="text-gray-600">現在、相談可能な専門家がいません。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start mb-4">
                    <img
                      src={expert.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=14b8a6&color=fff&size=128`}
                      alt={expert.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h3>
                      <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">
                        {expert.field}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{expert.bio}</p>
                  <button
                    onClick={() => handleBooking(expert)}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    相談を予約する
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultation History */}
        {user && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相談履歴</h2>
            {consultations.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-calendar-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">相談履歴がありません</h3>
                <p className="text-gray-600">専門家との相談を予約してみましょう。</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          予約日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          専門家
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          相談内容
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {consultations.map((consultation) => (
                        <tr key={consultation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(consultation.scheduled_at).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={consultation.expert?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultation.expert?.name || '')}&background=14b8a6&color=fff&size=128`}
                                alt={consultation.expert?.name}
                                className="w-8 h-8 rounded-full object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {consultation.expert?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {consultation.expert?.field}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="max-w-xs truncate">{consultation.notes || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                              {consultation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendly Modal */}
      {selectedExpert && (
        <CalendlyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExpert(null);
          }}
          calendlyUrl={selectedExpert.calendly_url}
          expertName={selectedExpert.name}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
