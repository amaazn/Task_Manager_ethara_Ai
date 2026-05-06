import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../api/client.js';

export default function Signup() {
  const { user, signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await signup(name, email, password, secretKey);
      nav('/dashboard');
    } catch (err) {
      setError(apiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-sm border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-gray-500">Enter the admin secret key to become an admin.</p>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
        <div>
          <label className="text-sm font-medium">Name</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" required value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Password (min 6 chars)</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Admin Secret Key (optional)</label>
          <input className="mt-1 w-full border rounded-md px-3 py-2" type="password" value={secretKey} onChange={(e)=>setSecretKey(e.target.value)} />
        </div>
        <button disabled={busy} className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">
          {busy ? 'Creating…' : 'Sign up'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
