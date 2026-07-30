import { useState, useEffect } from 'react';
import { households } from '../api';
import { useAuth } from '../context/AuthContext';

export default function HouseholdSettings() {
  const { household, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    if (!household) return;
    try {
      const m = await households.members(household.household_id);
      setMembers(m);
      setInviteCode(household.invite_code);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [household]);

  const handleRegenerate = async () => {
    try {
      const data = await households.regenerateInvite(household.household_id);
      setInviteCode(data.invite_code);
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAdmin = members.some(m => m.user_id === user?.id && m.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2">Invite Code</h3>
        <div className="flex gap-2 items-center">
          <code className="bg-gray-100 px-3 py-1 rounded text-lg font-bold">{inviteCode}</code>
          <button onClick={copyCode} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {isAdmin && (
            <button onClick={handleRegenerate} className="text-xs text-red-600 hover:underline ml-2">
              Regenerate
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2">Members</h3>
        {members.map(m => (
          <div key={m.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-gray-500">{m.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${m.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
