import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ExpertRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    bio: '',
    calendlyUrl: '',
    avatarUrl: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.field || !formData.bio || !formData.calendlyUrl) {
      setError('すべての必須項目を入力してください。');
      return;
    }

    if (!formData.calendlyUrl.includes('calendly.com')) {
      setError('有効なCalendlyリンクを入力してください。');
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('experts')
        .insert({
          name: formData.name,
          field: formData.field,
          bio: formData.bio,
          calendly_url: formData.calendlyUrl,
          avatar_url: formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=14b8a6&color=fff&size=128`
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('専門家登録エラー:', err);
      setError(err.message || '登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-teal-600 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">登録完了</h2>
          <p className="text-gray-600 mb-6">
            専門家として登録されました。相談予約ページに表示されます。
          </p>
          <div className="flex gap-3">
            <a
              href="/admin-experts"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer text-center"
            >
              専門家管理に戻る
            </a>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  field: '',
                  bio: '',
                  calendlyUrl: '',
                  avatarUrl: ''
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              続けて登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">専門家登録</h1>
              <p className="mt-2 text-sm text-gray-600">相談予約ページに表示される専門家情報を登録します</p>
            </div>
            <a
              href="/admin-experts"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              戻る
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="山田 太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    専門分野 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="プロジェクト管理">プロジェクト管理</option>
                    <option value="技術コンサルティング">技術コンサルティング</option>
                    <option value="UI/UXデザイン">UI/UXデザイン</option>
                    <option value="フロントエンド開発">フロントエンド開発</option>
                    <option value="バックエンド開発">バックエンド開発</option>
                    <option value="インフラ・DevOps">インフラ・DevOps</option>
                    <option value="セキュリティ">セキュリティ</option>
                    <option value="データ分析">データ分析</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己紹介 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                    placeholder="経歴、得意分野、提供できるサポート内容などを記入してください"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">相談者に表示される紹介文です</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CalendlyリンクURL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="calendlyUrl"
                    value={formData.calendlyUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="https://calendly.com/your-username/30min"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    相談予約に使用するCalendlyのイベントリンクを入力してください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プロフィール画像URL（任意）
                  </label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    未入力の場合は自動生成されたアバターが使用されます
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loading ? '登録中...' : '専門家として登録する'}
                </button>
              </form>
            </div>
          </div>

          {/* Guide Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <i className="ri-information-line text-teal-600 mr-2"></i>
                Calendlyリンクの取得方法
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-900">アカウント作成</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline cursor-pointer">
                      Calendly公式サイト
                    </a>
                    にアクセスし、無料アカウントを作成します。
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-900">イベント作成</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    「New Event Type」から相談用のイベントを作成します。相談時間（30分、60分など）を設定してください。
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-900">リンクをコピー</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    作成したイベントの「Copy Link」ボタンをクリックして、リンクをコピーします。
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm mr-3">
                      4
                    </div>
                    <h4 className="font-semibold text-gray-900">リンクを貼り付け</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    コピーしたリンクを左の「CalendlyリンクURL」欄に貼り付けます。
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <i className="ri-lightbulb-line mr-1"></i>
                  <strong>ヒント:</strong> Calendlyの無料プランでも十分に使用できます。相談時間や質問項目をカスタマイズして、効率的な相談を実現しましょう。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
