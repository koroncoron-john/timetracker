import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2">
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <i className="ri-time-line text-lg sm:text-xl text-white"></i>
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                FreelanceTracker
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-3 py-1.5 sm:px-6 sm:py-2 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer whitespace-nowrap text-xs sm:text-base"
                >
                  ダッシュボード
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base"
                  >
                    ログイン
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-3 py-1.5 sm:px-6 sm:py-2 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer whitespace-nowrap text-xs sm:text-base"
                  >
                    新規登録
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                案件の「赤字」を防ぎ、プロに相談もできる。<br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  フリーランスのためのAI伴走型タイムトラッカー
                </span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                稼働時間と利益を可視化し、AIが炎上リスクを予測。孤独なフリーランスの悩みを解決する、メンタリング予約機能付きの次世代プロジェクト管理ツールです。
              </p>
              <button
                onClick={() => navigate('/login?mode=signup')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg cursor-pointer whitespace-nowrap"
              >
                新規登録はこちら（無料ではじめる）
              </button>
            </div>
            <div className="relative">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20dark%20themed%20freelance%20time%20tracking%20dashboard%20interface%20with%20purple%20and%20cyan%20accents%20showing%20project%20analytics%20charts%20time%20entries%20and%20revenue%20metrics%20in%20a%20sleek%20professional%20design%20with%20glassmorphism%20effects%20and%20gradient%20elements%20on%20dark%20background&width=600&height=450&seq=hero-dashboard-mockup&orientation=landscape"
                  alt="Dashboard Preview"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problems" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            こんなお悩みありませんか？
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <i className="ri-money-dollar-circle-line text-3xl text-red-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">利益が見えない</h3>
              <p className="text-gray-300 leading-relaxed">
                どんぶり勘定になっていて、この案件が本当に黒字なのか時給換算するといくらなのか分からない。
              </p>
            </div>

            {/* Card 2 */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6">
                <i className="ri-fire-line text-3xl text-orange-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">予算とスケジュールの炎上</h3>
              <p className="text-gray-300 leading-relaxed">
                最初の見積もりが甘くて、いつもプロジェクト終盤にスケジュールや予算が厳しくなる。
              </p>
            </div>

            {/* Card 3 */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-6">
                <i className="ri-user-search-line text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">相談相手がいない</h3>
              <p className="text-gray-300 leading-relaxed">
                単価交渉やキャリアの悩み、案件の進め方について、気軽に相談できるベテランやメンターがいない。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            あなたのビジネスを可視化し、守る<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">3つの特徴</span>
          </h2>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6">
                <i className="ri-timer-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                タイムトラッキング ＆ リアルタイム収益可視化
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                案件ごとの単価と現在の稼働工数を自動計算。今の自分が「時給いくらで働いている状態か」が一目でわかります。
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <img
                src="https://readdy.ai/api/search-image?query=Dark%20themed%20time%20tracking%20interface%20showing%20real-time%20hourly%20rate%20calculation%20with%20cyan%20and%20purple%20gradient%20charts%20displaying%20project%20costs%20and%20revenue%20metrics%20in%20modern%20glassmorphism%20style%20on%20dark%20background&width=600&height=400&seq=feature-time-tracking&orientation=landscape"
                alt="Time Tracking Feature"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <img
                src="https://readdy.ai/api/search-image?query=AI%20powered%20project%20prediction%20dashboard%20with%20futuristic%20dark%20interface%20showing%20cost%20forecasting%20risk%20analysis%20and%20schedule%20predictions%20with%20purple%20and%20cyan%20gradient%20elements%20and%20glassmorphism%20effects%20on%20dark%20background&width=600&height=400&seq=feature-ai-prediction&orientation=landscape"
                alt="AI Prediction Feature"
                className="w-full h-auto rounded-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <i className="ri-brain-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                AIがプロジェクトの未来を予測
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                現在の進捗データをAIに入力するだけで、今後の想定コストやスケジュール遅延のリスク、改善アドバイスを即座にレポートします。
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mb-6">
                <i className="ri-user-voice-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                孤独を解消するメンタリング予約システム
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                システム内で実績のあるプロに直接面談の予約が可能。壁打ち相手としてオンラインで直接アドバイスをもらえます。
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <img
                src="https://readdy.ai/api/search-image?query=Online%20mentoring%20video%20call%20interface%20with%20dark%20theme%20showing%20professional%20consultation%20booking%20system%20with%20calendar%20and%20mentor%20profiles%20featuring%20cyan%20and%20purple%20accents%20and%20glassmorphism%20design%20on%20dark%20background&width=600&height=400&seq=feature-mentoring&orientation=landscape"
                alt="Mentoring Feature"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            ユーザーの声
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-white"></i>
                </div>
                <div>
                  <p className="text-white font-semibold">Webデザイナー</p>
                  <p className="text-gray-400 text-sm">独立2年目</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                今まで感覚で受けていた案件の利益率がはっきり数字で出るようになり、受けるべき仕事の基準が明確になりました。無料プランでも月に1回プロに相談できるのが、精神的にすごく救われています。
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-white"></i>
                </div>
                <div>
                  <p className="text-white font-semibold">フリーランスエンジニア</p>
                  <p className="text-gray-400 text-sm">独立5年目</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                AIのコスト算出機能が優秀です。スケジュールの甘さをAIに指摘され、事前に対策を打つことができました。サブスク登録してフル活用しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            料金プラン
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">フリープラン</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">月額0円</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">案件登録：最大2件まで</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">AIコスト算出機能：お試し利用</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">プロへの相談予約：初回相談のみ（1回30分）</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                無料ではじめる
              </button>
            </div>

            {/* Pro Plan */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400/50 rounded-3xl p-8 relative hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                おすすめ
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">プロプラン</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">月額5,000円</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">案件登録：無制限</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">AIコスト算出機能：フル活用</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-cyan-400 text-xl flex-shrink-0 mt-0.5"></i>
                  <span className="text-gray-300">プロへの相談予約：月に4回まで！優先的に予約可能</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login?mode=signup')}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                プロプランに登録
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            感覚的な働き方から卒業して、<br />
            データとAIを味方につけませんか？
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            まずは無料プランで、あなたの本当の時給を計ってみてください。
          </p>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg cursor-pointer whitespace-nowrap"
          >
            新規登録はこちら
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <i className="ri-time-line text-xl text-white"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                FreelanceTracker
              </span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">利用規約</a>
              <a href="#" className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">運営会社</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2024 FreelanceTracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
