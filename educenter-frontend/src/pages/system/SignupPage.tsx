import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Eye, EyeOff, Info } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import { supabase } from '../../lib/supabaseClient';
import { setToken, setFullName } from '../../utils/auth';

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;

type CriteriaKey = 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';

const criteriaLabels: Record<CriteriaKey, string> = {
  length: `${MIN_LENGTH}–${MAX_LENGTH} caractères`,
  uppercase: 'Une lettre majuscule (A–Z)',
  lowercase: 'Une lettre minuscule (a–z)',
  number: 'Un chiffre (0–9)',
  special: 'Un caractère spécial (!@#$%^&*)',
};

function checkCriteria(p: string): Record<CriteriaKey, boolean> {
  return {
    length: p.length >= MIN_LENGTH && p.length <= MAX_LENGTH,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[!@#$%^&*]/.test(p),
  };
}

const strengthLevels = [
  { label: 'Très faible', color: '#ef4444' },
  { label: 'Faible', color: '#f97316' },
  { label: 'Moyen', color: '#eab308' },
  { label: 'Fort', color: '#22c55e' },
  { label: 'Très fort', color: 'var(--color-primary)' },
];

function evaluatePasswordStrength(password: string): {
  score: number;
  strength: string;
} {
  if (!password) return { score: 0, strength: 'Nul' };

  const criteria = {
    length: password.length >= 8 && password.length <= 64,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  let score = 0;

  if (criteria.length) score += 20;
  if (criteria.uppercase) score += 20;
  if (criteria.lowercase) score += 20;
  if (criteria.number) score += 20;
  if (criteria.special) score += 20;

  if (password.length >= 12) score += 5;
  if (password.length >= 16) score += 5;

  score = Math.min(score, 100);

  let strength: string;

  if (score < 20) {
    strength = 'Très faible';
  } else if (score < 40) {
    strength = 'Faible';
  } else if (score < 60) {
    strength = 'Moyen';
  } else if (score < 80) {
    strength = 'Fort';
  } else {
    strength = 'Très fort';
  }

  return { score, strength };
}

function strengthIndex(s: string): number {
  const map: Record<string, number> = {
    'Très faible': 0,
    'Faible': 1,
    'Moyen': 2,
    'Fort': 3,
    'Très fort': 4,
  };
  return map[s] ?? -1;
}

function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Le nom complet est requis.';
  if (trimmed.length < 2 || trimmed.length > 100)
    return 'Le nom complet doit contenir entre 2 et 100 caractères.';
  if (!/^[\p{L}\s'-]+$/u.test(trimmed))
    return 'Le nom complet ne doit contenir que des lettres, espaces, apostrophes et tirets.';
  return null;
}

function validateEmailFormat(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'L\'email est requis.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return 'L\'email n\'est pas valide.';
  return null;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const criteria = checkCriteria(password);
  const { score: strengthScore, strength: strengthName } = evaluatePasswordStrength(password);
  const idx = strengthIndex(strengthName);
  const strengthLabel = idx >= 0 ? strengthName : '';
  const strengthColor = idx >= 0 ? strengthLevels[idx].color : 'transparent';
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;
  const fullNameValid = fullName.trim().length >= 2 && fullName.trim().length <= 100 && /^[\p{L}\s'-]+$/u.test(fullName.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = fullNameValid && emailValid && strengthScore >= 60 && confirmPassword !== '';

  const handleSignup = async () => {
    setSubmitted(true);
    setError(null);

    const fnError = validateFullName(fullName);
    const emError = validateEmailFormat(email);
    setFullNameError(fnError);
    setEmailError(emError);

    if (fnError || emError) return;
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (!canSubmit) return;

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte.');

      if (!authData.session) {
        setError('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.');
        setLoading(false);
        return;
      }

      setToken(authData.session.access_token);
      setFullName(fullName.trim());
      navigate('/post-signup');
    } catch (e) {
      if (e instanceof Error && e.message.includes('User already registered')) {
        setEmailError('Cet email est déjà utilisé.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur lors de l\'inscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (submitted) setFullNameError(validateFullName(value));
  };

  const handleFullNameBlur = () => {
    setFullNameError(validateFullName(fullName));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (submitted) setEmailError(validateEmailFormat(value));
  };

  const handleEmailBlur = () => {
    const normalized = email.trim().toLowerCase();
    if (normalized !== email) setEmail(normalized);
    setEmailError(validateEmailFormat(normalized));
  };
  const togglePass = () => setShowPassword((s) => !s);
  const toggleConfirm = () => setShowConfirm((s) => !s);

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
        gap: '24px',
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
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Créer un compte
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Créez votre compte pour commencer.
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
            label="Nom complet"
            value={fullName}
            onChange={handleFullNameChange}
            onBlur={handleFullNameBlur}
            placeholder="ex: Karim Idrissi"
            required
            error={fullNameError ?? undefined}
          />
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="ex: karim@email.com"
            required
            error={emailError ?? undefined}
          />

          {/* Password */}
          <div style={{ marginBottom: '4px', display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Mot de passe <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez un mot de passe sécurisé"
                required
                maxLength={MAX_LENGTH}
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
                onClick={togglePass}
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

          {/* Strength bar (segmented) + criteria toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
                {strengthLevels.map((level, i) => (
                  <div
                    key={level.label}
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i <= idx && idx >= 0 ? strengthLevels[idx].color : '#e5e7eb',
                      transition: 'background-color 0.3s',
                    }}
                  />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '18px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: idx >= 0 ? strengthColor : '#9ca3af', fontWeight: 500 }}>
                {idx >= 0 ? strengthLabel : 'Nul'}
              </span>
              <button
                type="button"
                onClick={() => setShowCriteria((s) => !s)}
                tabIndex={-1}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: showCriteria ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: 0,
                  display: 'flex',
                  transition: 'color 0.2s',
                }}
                title="Afficher les critères du mot de passe"
              >
                <Info size={14} />
              </button>
            </div>
            {showCriteria && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                {(Object.keys(criteriaLabels) as CriteriaKey[]).map((key) => {
                  const met = criteria[key];
                  return (
                    <span key={key} style={{ fontSize: '0.8rem', color: met ? 'var(--color-primary)' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {met ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" style={{ flexShrink: 0 }}>
                          <polyline points="4,12 10,18 20,6" />
                        </svg>
                      ) : (
                        <span style={{ fontSize: '0.7rem' }}>○</span>
                      )}
                      {criteriaLabels[key]}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Confirmer le mot de passe <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                maxLength={MAX_LENGTH}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${submitted && confirmPassword && !passwordsMatch ? '#ef4444' : 'var(--color-border)'}`,
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  backgroundColor: 'var(--color-white)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { if (passwordsMatch || !confirmPassword) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                onBlur={(e) => { if (passwordsMatch || !confirmPassword) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              />
              <button
                type="button"
                onClick={toggleConfirm}
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
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && passwordsMatch && (
              <span style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ Les mots de passe correspondent.
              </span>
            )}
            {submitted && confirmPassword && !passwordsMatch && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                ✗ Les mots de passe ne correspondent pas.
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <PrimaryButton
            label={loading ? 'Création en cours...' : 'Créer mon compte'}
            onClick={handleSignup}
            disabled={loading || !canSubmit}
          />
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
            Déjà un compte ?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              Se connecter
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
