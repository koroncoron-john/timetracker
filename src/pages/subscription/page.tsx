import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { supabase } from '../../lib/supabase';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { plan, refreshSubscription } = useSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cancelAtDate, setCancelAtDate] = useState<Date | null>(null);
  const status = userProfile?.subscription_status ?? 'active';
  const updateSubscription = async (_plan: string, _status: string) => {
    await refreshSubscription();
  };

  useEffect(() => {
    if (status === 'canceled' && user) {
      const stored = localStorage.getItem(`cancelAt_${user.id}`);
      if (stored) setCancelAtDate(new Date(parseInt(stored) * 1000));
    }
  }, [status, user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      window.history.replaceState({}, '', '/subscription');
      let retries = 0;
      const poll = setInterval(async () => {
        retries++;
        await refreshSubscription();
        await fetchUserProfile();
        if (retries >= 5) clearInterval(poll);
      }, 2000);
    }
    if (params.get('canceled') === 'true') {
      window.history.replaceState({}, '', '/subscription');
    }
  }, []);

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
            userEmail: user.email,
            userId: user.id,
            priceId: 'price_1T5BOfABoy8HO0Oz1Ywm97em',
            successUrl: `${window.location.origin}/subscription?success=true`,
            cancelUrl: `${window.location.origin}/subscription?canceled=true`,
          }),
        }
      );

      const data = await response.json();
      console.log('Edge Function response:', JSON.stringify(data));

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'チェックアウトURLの取得に失敗しました');
      }
    } catch (error) {
      console.error('アップグレードエラー詳細:', error);
      alert(`アップグレード処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
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
            userEmail: user.email,
            userId: user.id,
          }),
        }
      );

      const data = await response.json();
      console.log('キャンセルAPIレスポンス:', JSON.stringify(data));

      if (data.success) {
        if (data.cancelAt) {
          const date = new Date(data.cancelAt * 1000);
          setCancelAtDate(date);
          localStorage.setItem(`cancelAt_${user.id}`, data.cancelAt.toString());
        }
        setShowCancelModal(false);
        alert('サブスクリプションのキャンセルを受け付けました。現在の請求期間終了後に無料プランへ切り替わります。');
        window.location.reload();
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

  const handleReactivate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/reactivate-subscription`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ userEmail: user.email, userId: user.id }),
        }
      );
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem(`cancelAt_${user.id}`);
        alert('サブスクリプションのキャンセルを取り消しました。引き続きプレミアムプランをご利用いただけます。');
        window.location.reload();
      } else {
        throw new Error(data.error || '再有効化に失敗しました');
      }
    } catch (error: any) {
      alert(error.message || '再有効化処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = () => {
    window.open('https://billing.stripe.com/p/login/9AQcQv2uXgew9wsaEE', '_blank');
  };

  const isPremium = plan === 'premium' && (status === 'active' || status === 'canceled');
  const isCanceling = plan === 'premium' && status === 'canceled';
  const formatCancelDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">サブスクリプション</h1>
        <p className="text-gray-400">プランの確認と管理</p>
      </div>

      {/* 現在のプラン */}
      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">現在のプラン</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-gradient">
                {isPremium ? 'プレミアムプラン' : '無料プラン'}
              </span>
              {isPremium && !isCanceling && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30">
                  アクティブ
                </span>
              )}
              {isCanceling && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm font-semibold rounded-full border border-orange-500/30">
                  キャンセル処理中{cancelAtDate ? `（${formatCancelDate(cancelAtDate)}まで有効）` : ''}
                </span>
              )}
            </div>
          </div>
          {isPremium && (
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-vip-crown-line text-white text-3xl"></i>
            </div>
          )}
        </div>

        {isPremium ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">月額料金</div>
                <div className="text-2xl font-bold text-white">¥2,980</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">ステータス</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {status === 'active' ? 'アクティブ' : status}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">プロジェクト数</div>
                <div className="text-2xl font-bold text-white">無制限</div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={openBillingPortal}
                className="px-6 py-3 btn-primary-gradient text-white rounded-xl font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-file-list-3-line mr-2"></i>
                決済履歴を確認
              </button>
              {!isCanceling && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-3 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/10 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-close-circle-line mr-2"></i>
                  プランをキャンセル
                </button>
              )}
              {isCanceling && (
                <button
                  onClick={handleReactivate}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-xl font-medium hover:bg-orange-500/30 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  {loading ? '処理中...' : '引き続き使用する場合は、こちらをクリック'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-6">
              現在、無料プランをご利用中です。プレミアムプランにアップグレードして、すべての機能をご利用ください。
            </p>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-6 py-3 btn-primary-gradient text-white rounded-xl font-medium disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {loading ? '処理中...' : 'プレミアムプランにアップグレード'}
            </button>
          </div>
        )}
      </div>

      {/* プラン比較 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* 無料プラン */}
        <div className="glass-card p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">無料プラン</h3>
            <div className="text-4xl font-bold text-white mb-2">¥0</div>
            <p className="text-sm text-gray-400">永久無料</p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <i className="ri-check-line text-cyan-400 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-300">プロジェクト数: 最大3件</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-cyan-400 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-300">基本的なタイムトラッキング</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-cyan-400 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-300">保守費用管理</span>
            </li>
            <li className="flex items-start">
              <i className="ri-close-line text-gray-600 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-600">無制限プロジェクト</span>
            </li>
            <li className="flex items-start">
              <i className="ri-close-line text-gray-600 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-600">高度なレポート機能</span>
            </li>
            <li className="flex items-start">
              <i className="ri-close-line text-gray-600 text-xl mr-3 mt-0.5"></i>
              <span className="text-gray-600">優先サポート</span>
            </li>
          </ul>

          {!isPremium && (
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-white/5 text-gray-400 rounded-xl font-medium border border-white/10">
                現在のプラン
              </span>
            </div>
          )}
        </div>

        {/* プレミアムプラン */}
        <div className="relative rounded-2xl p-6 md:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <i className="ri-vip-crown-line text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-white">プレミアムプラン</h3>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-white mb-2">¥2,980</div>
              <p className="text-white/70">月額（税込）</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">プロジェクト数: 無制限</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">高度なタイムトラッキング</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">詳細な保守費用管理</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">カスタムレポート作成</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">データエクスポート機能</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-xl mr-3 mt-0.5 text-white"></i>
                <span className="text-white">優先メールサポート</span>
              </li>
            </ul>

            {isPremium ? (
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-white/20 rounded-xl font-medium text-white">
                  現在のプラン
                </span>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full px-6 py-3 bg-white text-cyan-600 rounded-xl font-bold hover:bg-white/90 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {loading ? '処理中...' : 'プレミアムプランを始める'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 決済管理 */}
      {isPremium && (
        <div className="mt-8 glass-card p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-4">決済・請求管理</h3>
          <p className="text-gray-400 mb-6">
            Stripeカスタマーポータルで、決済履歴の確認、請求書のダウンロード、支払い方法の変更が行えます。
          </p>
          <button
            onClick={openBillingPortal}
            className="px-6 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-external-link-line mr-2"></i>
            決済履歴・請求管理
          </button>
        </div>
      )}

      {/* キャンセル確認モーダル */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-error-warning-line text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white">プランをキャンセルしますか？</h3>
            </div>

            <p className="text-gray-400 mb-6">
              キャンセルすると、現在の請求期間終了後に以下の特典が失われます：
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-gray-300">
                <i className="ri-close-circle-line text-red-400 mr-2 mt-0.5"></i>
                無制限のプロジェクト作成
              </li>
              <li className="flex items-start text-sm text-gray-300">
                <i className="ri-close-circle-line text-red-400 mr-2 mt-0.5"></i>
                高度なレポート機能
              </li>
              <li className="flex items-start text-sm text-gray-300">
                <i className="ri-close-circle-line text-red-400 mr-2 mt-0.5"></i>
                優先サポート
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {loading ? '処理中...' : 'キャンセルする'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/5 disabled:opacity-50 whitespace-nowrap cursor-pointer"
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
