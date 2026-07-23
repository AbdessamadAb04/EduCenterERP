import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import { supabase } from '../../lib/supabaseClient';
import { setToken, setFullName } from '../../utils/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('Adresse email invalide.'); return false; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return false; }
    return true;
  };

  const submit = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setToken(data.session?.access_token || '');

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('fullname')
        .eq('auth_user_id', data.user?.id)
        .maybeSingle();

      if (!userError && userRecord?.fullname) {
        setFullName(userRecord.fullname);
      } else if (data.user?.user_metadata?.full_name) {
        setFullName(data.user.user_metadata.full_name);
      }

      navigate('/mes-etablissements');
    } catch (e) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-background) 0%, #e8f5e9 100%)',
      padding: '32px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 48,
        left: 48,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            backgroundColor: 'white',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <LogIn size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Se connecter
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Connectez-vous à votre compte.
          </p>
        </div>

        {error && (
          <div style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: karim@email.com"
            required
          />
          <div style={{ marginBottom: '4px', display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Mot de passe <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                required
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  backgroundColor: 'var(--color-white)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: 4,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <PrimaryButton
            label={loading ? 'Connexion en cours...' : 'Se connecter'}
            onClick={submit}
            disabled={loading}
          />
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
            Pas encore de compte ?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              S'inscrire
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
