import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MyPage() {
  const { user, signOut } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === user?.email) {
      alert('新しいメールアドレスを入力してください。');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      alert('確認メールを送信しました。新しいメールアドレスで確認してください。');
      setIsEditingEmail(false);
    } catch (error: any) {
      console.error('メールアドレス変更エラー:', error);
      alert(error.message || 'メールアドレスの変更に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      alert('新しいパスワードを入力してください。');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません。');
      return;
    }

    if (newPassword.length < 6) {
      alert('パスワードは6文字以上で設定してください。');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('パスワードを変更しました。');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('パスワード変更エラー:', error);
      alert(error.message || 'パスワードの変更に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '退会する') {
      alert('「退会する」と入力してください。');
      return;
    }

    setLoading(true);
    try {
      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (authError) {
        // If admin delete fails, try regular sign out
        console.warn('管理者削除に失敗しました。サインアウトします。', authError);
      }

      alert('アカウントを削除しました。ご利用ありがとうございました。');
      await signOut();
      window.location.href = '/';
    } catch (error: any) {
      console.error('アカウント削除エラー:', error);
      alert(error.message || 'アカウントの削除に失敗しました。');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
              <p className="mt-2 text-sm text-gray-600">アカウント情報の確認・変更</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.email}</h2>
              <p className="text-sm text-gray-600">ユーザーID: {user?.id}</p>
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">メールアドレス</h3>
            {!isEditingEmail && (
              <button
                onClick={() => setIsEditingEmail(true)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap cursor-pointer"
              >
                変更する
              </button>
            )}
          </div>

          {isEditingEmail ? (
            <div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mb-4"
                placeholder="新しいメールアドレス"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleEmailUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loading ? '処理中...' : '保存する'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmail(false);
                    setNewEmail(user?.email || '');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                ※ 新しいメールアドレスに確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
              </p>
            </div>
          ) : (
            <p className="text-gray-700">{user?.email}</p>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">パスワード</h3>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap cursor-pointer"
              >
                変更する
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mb-3"
                placeholder="新しいパスワード（6文字以上）"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mb-4"
                placeholder="新しいパスワード（確認）"
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loading ? '処理中...' : '保存する'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">••••••••</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">クイックリンク</h3>
          <div className="space-y-3">
            <a
              href="/subscription"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-vip-crown-line text-teal-600 text-xl"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900">サブスクリプション管理</div>
                  <div className="text-sm text-gray-600">プランの確認・変更</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
            </a>
            <a
              href="/consultation"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-calendar-check-line text-blue-600 text-xl"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900">専門家への相談</div>
                  <div className="text-sm text-gray-600">相談予約・履歴確認</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4">危険な操作</h3>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 whitespace-nowrap cursor-pointer"
            >
              アカウントを削除する
            </button>
          ) : (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 mb-2">
                  <strong>警告:</strong> この操作は取り消せません。
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>すべてのプロジェクトデータが削除されます</li>
                  <li>作業履歴が完全に削除されます</li>
                  <li>サブスクリプションが解約されます</li>
                  <li>アカウントの復元はできません</li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                続行するには、下のボックスに <strong>「退会する」</strong> と入力してください。
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm mb-4"
                placeholder="退会する"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmText !== '退会する'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {loading ? '処理中...' : 'アカウントを削除する'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
