import { useState, useEffect } from 'react';
import { chores } from '../api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_CHORES = [
  { name: 'Clean the kitchen', points: 100 },
  { name: 'Mop the floor', points: 200 },
  { name: 'Do the laundry', points: 100 },
  { name: 'Take out the trash', points: 50 },
  { name: 'Clean the bathroom', points: 150 },
  { name: 'Vacuum the living room', points: 100 },
  { name: 'Wash the dishes', points: 100 },
  { name: 'Water the plants', points: 50 },
  { name: 'Clean the windows', points: 150 },
  { name: 'Organize the pantry', points: 200 },
];

export default function Chores() {
  const { household } = useAuth();
  const [list, setList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    if (!household) return;
    try {
      const [c, lb] = await Promise.all([
        chores.list(household.household_id),
        chores.leaderboard(household.household_id),
      ]);
      setList(c);
      setLeaderboard(lb);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [household]);

  const handleAdd = async (choreName, chorePoints) => {
    setMessage('');
    try {
      await chores.create(household.household_id, { name: choreName, points: chorePoints });
      fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleComplete = async (choreId) => {
    setMessage('');
    try {
      await chores.complete(household.household_id, choreId);
      fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleCustomAdd = async (e) => {
    e.preventDefault();
    if (!name || !points) return;
    await handleAdd(name, parseInt(points, 10));
    setName('');
    setPoints('');
  };

  const remaining = SUGGESTED_CHORES.filter(
    s => !list.some(c => c.name === s.name),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Chores</h2>

        {message && <p className="text-red-600 text-sm">{message}</p>}

        <form onSubmit={handleCustomAdd} className="flex gap-2">
          <input type="text" placeholder="Chore name" value={name} onChange={e => setName(e.target.value)} required
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Points" value={points} onChange={e => setPoints(e.target.value)} required
            className="w-20 border border-gray-300 rounded px-3 py-2 text-sm" />
          <button type="submit" className="bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700">
            Add
          </button>
        </form>

        {remaining.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Suggested chores</p>
            <div className="flex flex-wrap gap-2">
              {remaining.map(s => (
                <button key={s.name} onClick={() => handleAdd(s.name, s.points)}
                  className="text-xs border border-blue-200 bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100">
                  + {s.name} ({s.points}pts)
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {list.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No chores yet. Add one above or pick a suggestion.</p>
          ) : (
            list.map(chore => (
              <div key={chore.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{chore.name}</p>
                    <p className="text-xs text-gray-500">{chore.points} points</p>
                  </div>
                  <button onClick={() => handleComplete(chore.id)}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                    Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No completions yet.</p>
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
