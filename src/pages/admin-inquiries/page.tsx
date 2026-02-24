import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Inquiry {
  id: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: 'technical' | 'billing' | 'feature' | 'other';
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  received_at: string;
  updated_at: string;
}

interface InquiryResponse {
  id: string;
  inquiry_id: string;
  admin_name: string;
  message: string;
  timestamp: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responses, setResponses] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technical' | 'billing' | 'feature' | 'other'>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [inquiries, statusFilter, categoryFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('received_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('問い合わせデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (inquiryId: string) => {
    try {
      const { data, error } = await supabase
        .from('inquiry_responses')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('返信データの取得に失敗しました:', error);
    }
  };

  const filterInquiries = () => {
    let filtered = [...inquiries];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.category === categoryFilter);
    }

    setFilteredInquiries(filtered);
  };

  const handleSelectInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    await fetchResponses(inquiry.id);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', inquiryId);

      if (error) throw error;

      setInquiries(inquiries.map(inq => 
        inq.id === inquiryId ? { ...inq, status: newStatus, updated_at: new Date().toISOString() } : inq
      ));

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error('ステータスの更新に失敗しました:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('inquiry_responses')
        .insert({
          inquiry_id: selectedInquiry.id,
          admin_name: '管理者',
          message: replyMessage.trim(),
        });

      if (error) throw error;

      // ステータスを「対応中」に更新
      await handleStatusChange(selectedInquiry.id, 'in_progress');

      // 返信リストを再取得
      await fetchResponses(selectedInquiry.id);

      setReplyMessage('');
      alert('返信を送信しました');
    } catch (error) {
      console.error('返信の送信に失敗しました:', error);
      alert('返信の送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical':
        return '技術的な問題';
      case 'billing':
        return '請求・支払い';
      case 'feature':
        return '機能要望';
      case 'other':
        return 'その他';
      default:
        return category;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '未対応';
      case 'in_progress':
        return '対応中';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
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
              <Link to="/admin/inquiries" className="text-teal-600 font-medium hover:text-teal-700">
                問い合わせ管理
              </Link>
              <Link to="/admin/consultations" className="text-gray-600 hover:text-gray-900">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">問い合わせ管理</h1>
          <p className="text-gray-600">ユーザーからの問い合わせ対応</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 問い合わせリスト */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="all">すべてのステータス</option>
                    <option value="pending">未対応</option>
                    <option value="in_progress">対応中</option>
                    <option value="completed">完了</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="all">すべてのカテゴリ</option>
                    <option value="technical">技術的な問題</option>
                    <option value="billing">請求・支払い</option>
                    <option value="feature">機能要望</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    問い合わせがありません
                  </div>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      onClick={() => handleSelectInquiry(inquiry)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {inquiry.subject}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getStatusColor(inquiry.status)}`}>
                          {getStatusText(inquiry.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{inquiry.user_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getCategoryText(inquiry.category)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(inquiry.received_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 問い合わせ詳細 */}
          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedInquiry.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{selectedInquiry.user_name}</span>
                        <span>{selectedInquiry.user_email}</span>
                        <span>{getCategoryText(selectedInquiry.category)}</span>
                      </div>
                    </div>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      <option value="pending">未対応</option>
                      <option value="in_progress">対応中</option>
                      <option value="completed">完了</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.content}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    受信日時: {new Date(selectedInquiry.received_at).toLocaleString('ja-JP')}
                  </p>
                </div>

                {/* 返信履歴 */}
                <div className="p-6 border-b border-gray-200 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">返信履歴</h3>
                  {responses.length === 0 ? (
                    <p className="text-gray-500 text-sm">まだ返信がありません</p>
                  ) : (
                    <div className="space-y-4">
                      {responses.map((response) => (
                        <div key={response.id} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {response.admin_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.timestamp).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {response.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 返信フォーム */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">返信する</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="返信内容を入力してください"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sending}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap"
                    >
                      {sending ? '送信中...' : '返信を送信'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="ri-mail-line text-5xl mb-4"></i>
                  <p>問い合わせを選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
