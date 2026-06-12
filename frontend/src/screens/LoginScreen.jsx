import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { KeyRound, LogIn, MailCheck, ShieldCheck, UserPlus } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/authStore';

const copy = {
  login: { title: 'Welcome back', eyebrow: 'User Login', button: 'Sign in', icon: LogIn },
  signup: { title: 'Create your account', eyebrow: 'User Signup', button: 'Create account', icon: UserPlus },
  forgot: { title: 'Recover access', eyebrow: 'Forgot Password', button: 'Create reset token', icon: KeyRound },
  reset: { title: 'Set new password', eyebrow: 'Reset Password', button: 'Reset password', icon: KeyRound },
  admin: { title: 'Super admin access', eyebrow: 'Hidden Admin Login', button: 'Enter control center', icon: ShieldCheck },
};

const LoginScreen = ({ mode = 'login' }) => {
  const active = copy[mode] || copy.login;
  const Icon = active.icon;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const { signIn, signUp, authLoading } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const data = await signUp({ name, email, password });
        setMessage(`Account created. Verification token: ${data.verificationToken}`);
        navigate('/');
        return;
      }

      if (mode === 'forgot') {
        const { data } = await api.post('/users/forgot-password', { email });
        setMessage(data.resetToken ? `Reset token: ${data.resetToken}` : data.message);
        return;
      }

      if (mode === 'reset') {
        const { data } = await api.post(`/users/reset-password/${token}`, { password });
        setMessage(data.message);
        return;
      }

      const data = await signIn({ email, password, rememberMe }, mode === 'admin');
      navigate(mode === 'admin' || data.isAdmin ? '/admin' : '/');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Request failed');
    }
  };

  const requestOtp = async () => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/users/otp/request', { email });
      setMessage(`OTP created: ${data.otpCode}`);
    } catch (otpError) {
      setError(otpError.response?.data?.message || 'Could not create OTP');
    }
  };

  const socialLogin = async (provider) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/users/social/${provider}`);
      setMessage(data.message);
    } catch (socialError) {
      setError(socialError.response?.data?.message || `${provider} login is unavailable`);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow"><Icon size={14} /> {active.eyebrow}</p>
        <h1>{active.title}</h1>
        <p className="muted"></p>

        {message && <div className="form-note"><MailCheck size={16} /> {message}</div>}
        {error && <div className="alert" role="alert">{error}</div>}

        <form onSubmit={submitHandler}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          {mode !== 'reset' && (
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}
          {mode !== 'forgot' && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          {(mode === 'login' || mode === 'admin') && (
            <label className="pill" style={{ width: 'fit-content' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me
            </label>
          )}
          <button className="primary-button full" type="submit" disabled={authLoading}>{active.button}</button>
        </form>

        {(mode === 'login' || mode === 'signup') && (
          <div className="pill-row" style={{ marginTop: 14 }}>
            <button className="secondary-button compact" type="button" onClick={() => socialLogin('google')}>Google</button>
            
          </div>
        )}

        <div className="auth-links">
          {mode !== 'login' && <Link to="/login">User login</Link>}
          {mode !== 'signup' && <Link to="/signup">Create account</Link>}
          {mode !== 'forgot' && <Link to="/forgot-password">Forgot password</Link>}
        </div>
      </section>
    </div>
  );
};

export default LoginScreen;
