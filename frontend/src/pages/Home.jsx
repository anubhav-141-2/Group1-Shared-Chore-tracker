import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Shared living made simple
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Keep your household finances and chores in one calm place.
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              Fair Split helps roommates, families, and shared households track expenses, share chores, and settle up clearly without the usual confusion.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Log in
            </Link>
            <Link
              to="/household/create"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
            >
              Create household
            </Link>
            <Link
              to="/household/join"
              className="rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-center text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
            >
              Join with code
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 p-6 text-white shadow-[0_25px_80px_-25px_rgba(15,23,42,0.65)]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">What you can do</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-100">
                <li>• Split shared expenses fairly</li>
                <li>• Assign and rotate chores easily</li>
                <li>• Keep balances and settlements transparent</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100 backdrop-blur">
              <p className="font-semibold">Perfect for roommates, families, and shared spaces.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[
          ['Smart splits', 'Create shared expenses and split them evenly or by custom shares.'],
          ['Chore flow', 'Turn recurring chores into an easy rotation for everyone.'],
          ['Clear balances', 'See who owes what at a glance and settle up quickly.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Fair Split. Built for smoother shared living.</p>
        <a href="mailto:hello@fairsplit.app" className="font-semibold text-blue-700 hover:text-blue-800">
          Contact us: hello@fairsplit.app
        </a>
      </footer>
    </div>
  );
}
