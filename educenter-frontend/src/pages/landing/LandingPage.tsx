import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus, Mail } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-background) 0%, #e8f5e9 100%)',
      padding: '32px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
        maxWidth: '480px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 32px rgba(5, 150, 105, 0.25)',
          }}>
            <GraduationCap size={40} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            margin: 0,
            textAlign: 'center',
          }}>
            EduCenter
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Gérez vos étudiants, classes et paiements
            <br />en un seul endroit.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '16px 24px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#047857';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(5, 150, 105, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.25)';
            }}
          >
            <LogIn size={20} />
            Se connecter
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '16px 24px',
              borderRadius: '14px',
              border: '2px solid var(--color-primary)',
              backgroundColor: 'white',
              color: 'var(--color-primary)',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <UserPlus size={20} />
            Créer un compte
          </button>
        </div>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--color-gray)',
          margin: 0,
          textAlign: 'center',
        }}>
          EduCenter ERP v0.1
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 24px',
          backgroundColor: 'white',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <Mail size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Support technique :{' '}
          </span>
          <a
            href="mailto:orbytsupport@gmail.com"
            style={{
              color: 'var(--color-text)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
          >
            orbytsupport@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
