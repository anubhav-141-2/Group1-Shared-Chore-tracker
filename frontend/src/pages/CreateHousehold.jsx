import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { households } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CreateHousehold() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { refreshHousehold } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await households.create({ name });
      await refreshHousehold();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Create a Household</h2>
      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Household name" value={name} onChange={e => setName(e.target.value)} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">
          Create
        </button>
      </form>
    </div>
  );
}
