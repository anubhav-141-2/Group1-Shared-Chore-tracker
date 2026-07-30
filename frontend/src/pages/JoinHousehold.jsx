import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { households } from '../api';
import { useAuth } from '../context/AuthContext';

export default function JoinHousehold() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { refreshHousehold } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await households.join({ invite_code: code });
      await refreshHousehold();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Join a Household</h2>
      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Invite code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm uppercase" />
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">
          Join
        </button>
      </form>
    </div>
  );
}
