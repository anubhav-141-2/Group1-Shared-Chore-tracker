import { useState, useEffect } from 'react';
import { expenses, households, balance as balanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const { household, user } = useAuth();
  const [list, setList] = useState([]);
  const [members, setMembers] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [e, m, b] = await Promise.all([
        expenses.list(household.household_id),
        households.members(household.household_id),
        balanceApi.get(household.household_id),
      ]);
      setList(e);
      setMembers(m);
      setBalanceData(b);
    } catch {}
  };

  useEffect(() => { if (household) fetchAll(); }, [household]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await expenses.create(household.household_id, { amount: parseFloat(amount), description, expense_date: date });
      setAmount('');
      setDescription('');
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this expense?')) return;
    try {
      await expenses.remove(household.household_id, id);
      fetchAll();
    } catch {}
  };

  const myMember = members.find(m => m.user_id === user?.id);
  const credits = (balanceData?.breakdown || []).filter(b => b.net_balance > 0);
  const debts = (balanceData?.breakdown || []).filter(b => b.net_balance < 0);

  return (
    <div>
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
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Expenses</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">
            Add Expense
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No expenses yet.</p>
      ) : (
        <div className="space-y-2">
          {list.map(exp => (
            <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{exp.description}</p>
                  <p className="text-xs text-gray-500">{exp.payer_name} &middot; {new Date(exp.expense_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${parseFloat(exp.amount).toFixed(2)}</p>
                  <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-500 hover:underline">Archive</button>
                </div>
              </div>
              {exp.shares && (
                <div className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  {exp.shares.map(s => (
                    <span key={s.member_id} className="mr-3">{s.member_name}: ${parseFloat(s.share_amount).toFixed(2)}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
