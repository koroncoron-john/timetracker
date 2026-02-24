import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { supabase } from '../../lib/supabase';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { plan, status, updateSubscription } = useSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserProfile(data);
        // Update context with latest data
        updateSubscription(data.subscription_plan, data.subscription_status);
      }
    } catch (error) {
      console.error('ユーザープロフィールの取得に失敗しました:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-subscription-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            priceId: 'price_1QpqxnP3ônMfJQxBBqJxqxqx',
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('チェックアウトURLの取得に失敗しました');
      }
    } catch (error) {
      console.error('アップグレードエラー:', error);
      alert('アップグレード処理に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        await supabase
          .from('user_profiles')
          .update({
            subscription_plan: 'free',
            subscription_status: 'inactive'
          })
          .eq('id', user.id);

        updateSubscription('free', 'inactive');
        alert('サブスクリプションをキャンセルしました。現在の請求期間終了後に無料プランに切り替わります。');
        setShowCancelModal(false);
        await fetchUserProfile();
      } else {
        throw new Error(data.error || 'キャンセル処理に失敗しました');
      }
    } catch (error: any) {
      console.error('キャンセルエラー:', error);
      alert(error.message || 'キャンセル処理に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = () => {
    window.open('https://billing.stripe.com/p/login/9AQcQv2uXgew9wsaEE', '_blank');
  };

  const isPremium = plan === 'premium' && status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">サブスクリプション</h1>
              <p className="mt-2 text-sm text-gray-600">プランの確認と管理</p>
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
        {/* Current Plan Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">現在のプラン</h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-teal-600">
                  {isPremium ? 'プレミアムプラン' : '無料プラン'}
                </span>
                {isPremium && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-semibold rounded-full">
                    アクティブ
                  </span>
                )}
              </div>
            </div>
            {isPremium && (
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                <i className="ri-vip-crown-line text-white text-3xl"></i>
              </div>
            )}
          </div>

          {isPremium ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">月額料金</div>
                  <div className="text-2xl font-bold text-gray-900">¥2,980</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">ステータス</div>
                  <div className="text-2xl font-bold text-teal-600">
                    {status === 'active' ? 'アクティブ' : status}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">プロジェクト数</div>
                  <div className="text-2xl font-bold text-gray-900">無制限</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={openBillingPortal}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-file-list-3-line mr-2"></i>
                  決済履歴を確認
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-close-circle-line mr-2"></i>
                  プランをキャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                現在、無料プランをご利用中です。プレミアムプランにアップグレードして、すべての機能をご利用ください。
              </p>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {loading ? '処理中...' : 'プレミアムプランにアップグレード'}
              </button>
            </div>
          )}
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">無料プラン</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">¥0</div>
              <p className="text-sm text-gray-600">永久無料</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <i className="ri-check-line text-teal-600 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-700">プロジェクト数: 最大3件</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-teal-600 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-700">基本的なタイムトラッキング</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-teal-600 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-700">保守費用管理</span>
              </li>
              <li className="flex items-start">
                <i className="ri-close-line text-gray-400 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-400">無制限プロジェクト</span>
              </li>
              <li className="flex items-start">
                <i className="ri-close-line text-gray-400 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-400">高度なレポート機能</span>
              </li>
              <li className="flex items-start">
                <i className="ri-close-line text-gray-400 text-xl mr-3 mt-0.5"></i>
                <span className="text-gray-400">優先サポート</span>
              </li>
            </ul>

            {!isPremium && (
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                  現在のプラン
                </span>
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-vip-crown-line text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold">プレミアムプラン</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">¥2,980</div>
                <p className="text-teal-100">月額（税込）</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>プロジェクト数: 無制限</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>高度なタイムトラッキング</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>詳細な保守費用管理</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>カスタムレポート作成</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>データエクスポート機能</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-xl mr-3 mt-0.5"></i>
                  <span>優先メールサポート</span>
                </li>
              </ul>

              {isPremium ? (
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-white/20 rounded-lg font-medium">
                    現在のプラン
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-teal-50 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loading ? '処理中...' : 'プレミアムプランを始める'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Billing Management */}
        {isPremium && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">決済・請求管理</h3>
            <p className="text-gray-600 mb-6">
              Stripeカスタマーポータルで、決済履歴の確認、請求書のダウンロード、支払い方法の変更が行えます。
            </p>
            <button
              onClick={openBillingPortal}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-external-link-line mr-2"></i>
              決済履歴・請求管理
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-error-warning-line text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">プランをキャンセルしますか？</h3>
            </div>

            <p className="text-gray-600 mb-6">
              キャンセルすると、現在の請求期間終了後に以下の特典が失われます：
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-gray-700">
                <i className="ri-close-circle-line text-red-500 mr-2 mt-0.5"></i>
                無制限のプロジェクト作成
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <i className="ri-close-circle-line text-red-500 mr-2 mt-0.5"></i>
                高度なレポート機能
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <i className="ri-close-circle-line text-red-500 mr-2 mt-0.5"></i>
                優先サポート
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {loading ? '処理中...' : 'キャンセルする'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
