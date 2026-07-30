import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, household, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = user
    ? [
        { to: '/', label: 'Home' },
        ...(household
          ? [
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/expenses', label: 'Expenses' },
              { to: '/chores', label: 'Chores' },
              { to: '/settlements', label: 'Settle' },
              { to: '/settings', label: 'Settings' },
            ]
          : [
              { to: '/household/create', label: 'Create' },
              { to: '/household/join', label: 'Join' },
            ]),
        { to: '/', label: 'Logout', onClick: handleLogout, isButton: true },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/login', label: 'Login' },
      ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_45%,_#f9f7ff_100%)] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-5 lg:px-6">
        <header className="sticky top-3 z-40 rounded-[2rem] border border-white/70 bg-white/60 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Shared living made easy</p>
                <h1 className="text-xl font-black text-slate-900">Fair Split</h1>
              </div>
              {household && (
                <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {household.household_name}
                </div>
              )}
            </div>

            <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-slate-900/5 p-2">
              {navItems.map((item) =>
                item.isButton ? (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    {item.label}
                  </button>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive: active }) =>
                      `rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active || isActive(item.to)
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 py-6 sm:py-8">
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
