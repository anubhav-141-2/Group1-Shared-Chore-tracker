import { useState, useEffect } from 'react';
import { settlements, households, balance as balanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Settlements() {
  const { household, user } = useAuth();
  const [list, setList] = useState([]);
  const [members, setMembers] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [settleTo, setSettleTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [s, m, b] = await Promise.all([
        settlements.list(household.household_id),
        households.members(household.household_id),
        balanceApi.get(household.household_id),
      ]);
      setList(s);
      setMembers(m);
      setBalanceData(b);
    } catch {}
  };

  useEffect(() => { if (household) fetchData(); }, [household]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!settleTo) { setError('Select who you are paying'); return; }
    try {
      const myMember = members.find(m => m.user_id === user?.id);
      await settlements.create(household.household_id, {
        from_member_id: myMember.id,
        to_member_id: parseInt(settleTo),
        amount: parseFloat(amount),
        settlement_date: date,
      });
      setSettleTo('');
      setAmount('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const myMember = members.find(m => m.user_id === user?.id);
  const credits = (balanceData?.breakdown || []).filter(b => b.net_balance > 0);
  const debts = (balanceData?.breakdown || []).filter(b => b.net_balance < 0);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Settle Up</h2>

      {balanceData && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2">Who Owes Whom</h3>
          {credits.length === 0 && debts.length === 0 && (
            <p className="text-sm text-gray-500">Everyone is settled up.</p>
          )}
          {credits.map(b => (
            <div key={b.member_id} className="flex justify-between text-sm py-1">
              <span>{b.name}</span>
              <span className="text-green-600">owes you ${b.net_balance.toFixed(2)}</span>
            </div>
          ))}
          {debts.map(b => (
            <div key={b.member_id} className="flex justify-between text-sm py-1">
              <span>{b.name}</span>
              <span className="text-red-600">you owe ${Math.abs(b.net_balance).toFixed(2)}</span>
            </div>
          ))}

          {debts.length > 0 && (
            <button onClick={() => setShowForm(!showForm)}
              className="mt-2 bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700">
              {showForm ? 'Cancel' : 'Record Payment'}
            </button>
          )}
        </div>
      )}

      {balanceData && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2">Your Chore Credit</h3>
          <p className="text-sm text-gray-600">
            Completed {balanceData.total_chore_weight_completed.toFixed(1)} points · fair share {balanceData.fair_share_chore_weight.toFixed(1)} points
          </p>
          <p className={`text-sm font-medium mt-1 ${balanceData.chore_credit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balanceData.chore_credit >= 0
              ? `You're ${balanceData.chore_credit.toFixed(1)} chore points ahead`
              : `You owe ${Math.abs(balanceData.chore_credit).toFixed(1)} chore points`}
          </p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-green-200 rounded-lg p-4 mb-4 space-y-3">
          <p className="text-sm text-gray-600">You are the payer</p>
          <select value={settleTo} onChange={e => setSettleTo(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="">Who are you paying?</option>
            {debts.map(b => (
              <option key={b.member_id} value={b.member_id}>{b.name}</option>
            ))}
          </select>
          <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <button type="submit" className="w-full bg-green-600 text-white rounded py-2 text-sm font-medium hover:bg-green-700">
            Record Payment
          </button>
        </form>
      )}

      <h3 className="font-semibold text-sm mb-2 mt-6">Payment History</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No payments recorded.</p>
      ) : (
        <div className="space-y-2">
          {list.map(s => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-sm">
                  <span className="font-medium">{s.from_name}</span> paid <span className="font-medium">{s.to_name}</span>
                </p>
                <p className="text-xs text-gray-500">{new Date(s.settlement_date).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-sm">${parseFloat(s.amount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
