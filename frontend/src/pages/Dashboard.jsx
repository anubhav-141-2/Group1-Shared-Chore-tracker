import { useState, useEffect } from 'react';
import { balance } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { household, user } = useAuth();
  const [data, setData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (household) {
      balance.get(household.household_id).then(setData).catch(() => {});
    }
  }, [household]);

  if (!data) return <p className="text-gray-500 text-sm">Loading balance...</p>;

  const combined = data.combined_balance;
  const owes = combined < 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Welcome back, {user?.name}</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center mb-6">
        <p className="text-sm text-gray-500 mb-1">Your Fairness Balance</p>
        <p className={`text-3xl font-bold ${combined === 0 ? 'text-green-600' : owes ? 'text-red-600' : 'text-green-600'}`}>
          {combined === 0 ? 'You\'re square!' : owes ? `You owe $${Math.abs(combined).toFixed(2)}` : `You're ahead $${combined.toFixed(2)}`}
        </p>
        <button onClick={() => setShowBreakdown(!showBreakdown)} className="text-xs text-blue-600 hover:underline mt-2">
          {showBreakdown ? 'Hide' : 'Show'} breakdown
        </button>
      </div>

      {showBreakdown && (
        <div className="space-y-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-2">Money Balance</h3>
            <p className="text-sm text-gray-700">
              {data.money_balance >= 0
                ? `Others owe you $${data.money_balance.toFixed(2)}`
                : `You owe others $${Math.abs(data.money_balance).toFixed(2)}`}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-2">Chore Credit</h3>
            <p className="text-sm text-gray-700">
              Completed {data.total_chore_weight_completed.toFixed(1)} weight points (fair share: {data.fair_share_chore_weight.toFixed(1)})
            </p>
            <p className="text-sm text-gray-700">
              {data.chore_credit >= 0
                ? `You've done ${data.chore_credit.toFixed(1)} more than your share`
                : `You owe ${Math.abs(data.chore_credit).toFixed(1)} in chore credit`}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-2">Settlements</h3>
            <p className="text-sm text-gray-700">
              {data.net_settlements >= 0
                ? `You've received $${data.net_settlements.toFixed(2)} more than you paid out`
                : `You've paid out $${Math.abs(data.net_settlements).toFixed(2)} more than you received`}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-2">Per-Person Breakdown</h3>
            {data.breakdown.map(m => (
              <div key={m.member_id} className="flex justify-between text-sm py-1">
                <span>{m.name}</span>
                <span className={m.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {m.net_balance >= 0 ? `owes you $${m.net_balance.toFixed(2)}` : `you owe $${Math.abs(m.net_balance).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
