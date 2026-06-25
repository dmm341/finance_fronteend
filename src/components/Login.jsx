import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let subscription;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = sub;
    };
    init();
    return () => subscription?.subscription?.unsubscribe?.();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    setUser(data.user);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    alert('Sign-up successful. Check your email to confirm.');
    setUser(data.user ?? null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {user ? (
        <div className="login-status">
          <p>Signed in as <strong>{user.email}</strong></p>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <form className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="login-actions">
            <button onClick={handleSignIn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            <button onClick={handleSignUp} disabled={loading}>{loading ? 'Working...' : 'Sign Up'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;
