import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Expert {
  id: string;
  name: string;
  field: string;
  bio: string;
  calendly_url: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    bio: '',
    calendly_url: '',
    avatar_url: '',
  });

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('専門家データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (expert?: Expert) => {
    if (expert) {
      setEditingExpert(expert);
      setFormData({
        name: expert.name,
        field: expert.field,
        bio: expert.bio,
        calendly_url: expert.calendly_url,
        avatar_url: expert.avatar_url || '',
      });
    } else {
      setEditingExpert(null);
      setFormData({
        name: '',
        field: '',
        bio: '',
        calendly_url: '',
        avatar_url: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpert(null);
    setFormData({
      name: '',
      field: '',
      bio: '',
      calendly_url: '',
      avatar_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.calendly_url.includes('calendly.com')) {
      alert('有効なCalendlyリンクを入力してください');
      return;
    }

    try {
      if (editingExpert) {
        // 更新
        const { error } = await supabase
          .from('experts')
          .update({
            name: formData.name,
            field: formData.field,
            bio: formData.bio,
            calendly_url: formData.calendly_url,
            avatar_url: formData.avatar_url || null,
          })
          .eq('id', editingExpert.id);

        if (error) throw error;
        alert('専門家情報を更新しました');
      } else {
        // 新規追加
        const { error } = await supabase
          .from('experts')
          .insert({
            name: formData.name,
            field: formData.field,
            bio: formData.bio,
            calendly_url: formData.calendly_url,
            avatar_url: formData.avatar_url || null,
          });

        if (error) throw error;
        alert('専門家を追加しました');
      }

      await fetchExperts();
      handleCloseModal();
    } catch (error) {
      console.error('専門家情報の保存に失敗しました:', error);
      alert('専門家情報の保存に失敗しました');
    }
  };

  const handleDelete = async (expertId: string) => {
    if (!confirm('この専門家を削除してもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from('experts')
        .delete()
        .eq('id', expertId);

      if (error) throw error;

      setExperts(experts.filter(expert => expert.id !== expertId));
      alert('専門家を削除しました');
    } catch (error) {
      console.error('専門家の削除に失敗しました:', error);
      alert('専門家の削除に失敗しました');
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
              <Link to="/admin/consultations" className="text-gray-600 hover:text-gray-900">
                相談予約管理
              </Link>
              <Link to="/admin/experts" className="text-teal-600 font-medium hover:text-teal-700">
                専門家管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">専門家管理</h1>
            <p className="text-gray-600">相談対応する専門家の管理</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            <span>専門家を追加</span>
          </button>
        </div>

        {/* 専門家グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <i className="ri-user-star-line text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">まだ専門家が登録されていません</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap"
              >
                最初の専門家を追加
              </button>
            </div>
          ) : (
            experts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {expert.name.charAt(0)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(expert)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h3>
                  <p className="text-sm text-teal-600 mb-3">{expert.field}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{expert.bio}</p>

                  <a
                    href={expert.calendly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-teal-600 hover:text-teal-700"
                  >
                    <i className="ri-calendar-line"></i>
                    <span>Calendlyリンク</span>
                    <i className="ri-external-link-line"></i>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingExpert ? '専門家情報を編集' : '新しい専門家を追加'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  専門分野 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="プロジェクト管理"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="経歴や専門分野について説明してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CalendlyリンクURL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.calendly_url}
                  onChange={(e) => setFormData({ ...formData, calendly_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://calendly.com/your-link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アバター画像URL（オプション）
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap"
                >
                  {editingExpert ? '更新する' : '追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
