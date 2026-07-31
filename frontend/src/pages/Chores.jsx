import { useState, useEffect } from 'react';
import { chores } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Chores() {
  const { household } = useAuth();
  const [allChores, setAllChores] = useState([]);
  const [todo, setTodo] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedChore, setSelectedChore] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    if (!household) return;
    try {
      const [c, lb] = await Promise.all([
        chores.list(household.household_id),
        chores.leaderboard(household.household_id),
      ]);
      setAllChores(c);
      setLeaderboard(lb);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [household]);

  const handleAddToTodo = () => {
    if (!selectedChore) return;
    const chore = allChores.find(c => c.id === parseInt(selectedChore, 10));
    if (!chore) return;
    if (todo.find(t => t.id === chore.id)) return;
    setTodo([...todo, chore]);
    setSelectedChore('');
  };

  const handleRemoveFromTodo = (choreId) => {
    setTodo(todo.filter(c => c.id !== choreId));
    setMessage('');
  };

  const handleComplete = async (choreId) => {
    setMessage('');
    try {
      const result = await chores.complete(household.household_id, choreId);
      setTodo(todo.filter(c => c.id !== choreId));
      setMessage(`${result.chore_name} completed! +${result.points} pts for you, -${result.points} for others`);
      fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const availableChores = allChores.filter(c => !todo.find(t => t.id === c.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Chores</h2>

        {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Add a chore</label>
            <select value={selectedChore} onChange={e => setSelectedChore(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Pick a chore...</option>
              {availableChores.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.points}pts)</option>
              ))}
            </select>
          </div>
          <button onClick={handleAddToTodo} disabled={!selectedChore}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-40">
            Add
          </button>
        </div>

        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2">Chore</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2">Points</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {todo.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-500 text-sm py-8">No chores added yet. Pick from the dropdown above.</td></tr>
            ) : (
              todo.map(chore => (
                <tr key={chore.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{chore.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{chore.points}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleComplete(chore.id)}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                      Done
                    </button>
                    <button onClick={() => handleRemoveFromTodo(chore.id)}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm">No completions yet.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.member_id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-sm">{entry.name}</span>
                </div>
                <span className={`text-sm font-bold ${entry.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.net >= 0 ? '+' : ''}{entry.net}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
