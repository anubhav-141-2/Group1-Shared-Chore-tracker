import { useState, useEffect } from 'react';
import { chores, households } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Chores() {
  const { household, user } = useAuth();
  const [list, setList] = useState([]);
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [weight, setWeight] = useState('1');
  const [error, setError] = useState('');

  const fetchChores = async () => {
    try {
      const data = await chores.list(household.household_id);
      setList(data);
    } catch {}
  };

  const fetchMembers = async () => {
    try {
      const data = await households.members(household.household_id);
      setMembers(data);
      setIsAdmin(data.some(m => m.user_id === user?.id && m.role === 'admin'));
    } catch {}
  };

  useEffect(() => {
    if (household) {
      fetchChores();
      fetchMembers();
    }
  }, [household]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await chores.create(household.household_id, { name, frequency, weight: parseFloat(weight) });
      setName('');
      setFrequency('weekly');
      setWeight('1');
      setShowForm(false);
      fetchChores();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = async (choreId) => {
    try {
      await chores.complete(household.household_id, choreId);
      fetchChores();
    } catch {}
  };

  const handleDelete = async (choreId) => {
    if (!confirm('Archive this chore?')) return;
    setError('');
    try {
      await chores.remove(household.household_id, choreId);
      fetchChores();
    } catch (err) {
      setError(err.message);
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Chores</h2>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <input type="text" placeholder="Chore name" value={name} onChange={e => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <select value={frequency} onChange={e => setFrequency(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input type="number" step="0.1" placeholder="Weight (points)" value={weight} onChange={e => setWeight(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">
            Add Chore
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No chores yet.</p>
      ) : (
        <div className="space-y-2">
          {list.map(chore => {
            const overdue = isOverdue(chore.next_due_date);
            return (
              <div key={chore.id} className={`bg-white border rounded-lg p-4 ${overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{chore.name}</p>
                    <p className="text-xs text-gray-500">
                      Assigned to: {chore.assignee_name || 'Unassigned'}
                      {chore.next_due_date && ` · Due: ${new Date(chore.next_due_date).toLocaleDateString()}`}
                      {overdue && <span className="text-red-600 font-medium"> · OVERDUE</span>}
                    </p>
                    <p className="text-xs text-gray-400">Weight: {parseFloat(chore.weight).toFixed(1)} · {chore.frequency}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleComplete(chore.id)}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                      Done
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(chore.id)} className="text-xs text-red-500 hover:underline">Archive</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
