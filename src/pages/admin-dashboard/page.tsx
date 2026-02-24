import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RevenueChart from './components/RevenueChart';
import UserTrendChart from './components/UserTrendChart';
import PaymentTable from './components/PaymentTable';
import { supabase } from '../../lib/supabase';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  new_users: number;
  cancelled_users: number;
  active_subscriptions: number;
  premium_users: number;
}

interface PaymentRecord {
  id: string;
  user_email: string;
  user_name: string;
  amount: number;
  billing_date: string;
  card_status: 'active' | 'expired' | 'declined';
}

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  monthlyRevenue: number;
  activeProjects: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    monthlyRevenue: 0,
    activeProjects: 0,
  });
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ユーザー統計を取得
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('subscription_plan');

      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;
      const premiumUsers = users?.filter(u => u.subscription_plan === 'premium').length || 0;

      // プロジェクト数を取得
      const { count: projectCount, error: projectError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (projectError) throw projectError;

      // 月次売上データを取得
      const { data: revenue, error: revenueError } = await supabase
        .from('monthly_revenue')
        .select('*')
        .order('month', { ascending: false })
        .limit(6);

      if (revenueError) throw revenueError;

      // 決済履歴を取得
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_records')
        .select('*')
        .order('billing_date', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;

      // 今月の売上を計算
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthRevenue = revenue?.find(r => r.month === currentMonth)?.revenue || 0;

      setStats({
        totalUsers,
        premiumUsers,
        monthlyRevenue: currentMonthRevenue,
        activeProjects: projectCount || 0,
      });

      setRevenueData(revenue || []);
      setPaymentRecords(payments || []);
    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
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
              <Link to="/admin/dashboard" className="text-teal-600 font-medium hover:text-teal-700">
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
              <Link to="/admin/experts" className="text-gray-600 hover:text-gray-900">
                専門家管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総ユーザー数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">プレミアムユーザー</p>
                <p className="text-3xl font-bold text-gray-900">{stats.premiumUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-vip-crown-line text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">今月の売上</p>
                <p className="text-3xl font-bold text-gray-900">¥{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">アクティブプロジェクト</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <i className="ri-folder-line text-2xl text-teal-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* チャート */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={revenueData} />
          <UserTrendChart data={revenueData} />
        </div>

        {/* 決済履歴テーブル */}
        <PaymentTable records={paymentRecords} />
      </main>
    </div>
  );
}
