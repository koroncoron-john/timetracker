import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
    icon: string;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: 'ri-dashboard-line', label: 'ダッシュボード', path: '/dashboard' },
    { icon: 'ri-customer-service-2-line', label: '相談予約', path: '/consultation' },
    { icon: 'ri-user-line', label: 'マイページ', path: '/mypage' },
];

interface UserLayoutProps {
    children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const isActive = (item: NavItem) => {
        return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-main-gradient relative overflow-hidden">
            {/* 背景アニメーション */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* ===== PC: サイドバー (769px+) ===== */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col glass-panel border-r border-white/10">
                {/* ロゴ */}
                <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10 flex-shrink-0">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                            <i className="ri-time-line text-lg text-white"></i>
                        </div>
                        <span className="text-lg font-bold text-gradient">
                            FreelanceTracker
                        </span>
                    </div>
                </div>

                {/* ナビメニュー */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive(item)
                                ? 'bg-white/10 text-cyan-400 shadow-lg shadow-cyan-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <i className={`${item.icon} text-xl`}></i>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* サイドバー下部: サブスク・ログアウト */}
                <div className="px-4 py-4 border-t border-white/10 space-y-1 flex-shrink-0">
                    <Link
                        to="/subscription"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === '/subscription'
                            ? 'bg-white/10 text-cyan-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <i className="ri-vip-crown-line text-xl"></i>
                        サブスクリプション
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                    >
                        <i className="ri-logout-box-r-line text-xl"></i>
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* ===== メインコンテンツエリア ===== */}
            <div className="md:ml-64 relative z-10 min-h-screen pb-20 md:pb-0">
                {/* モバイルヘッダー (≤768px) */}
                <header className="md:hidden glass-panel border-b border-white/10 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 h-14">
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                <i className="ri-time-line text-sm text-white"></i>
                            </div>
                            <span className="text-base font-bold text-gradient">
                                FreelanceTracker
                            </span>
                        </div>
                    </div>
                </header>

                {/* ページコンテンツ */}
                <main className="relative z-10">
                    {children || <Outlet />}
                </main>
            </div>

            {/* ===== モバイル: フッターナビバー (≤768px) ===== */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-panel border-t border-white/10 backdrop-blur-2xl bg-slate-950/80">
                <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer min-w-0 ${isActive(item)
                                ? 'text-cyan-400'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <i className={`${item.icon} text-xl`}></i>
                            <span className="text-[10px] font-medium truncate">{item.label}</span>
                            {isActive(item) && (
                                <div className="absolute -top-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
