import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
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
        gap: '32px',
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        padding: '48px 40px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)',
        }}>
          <FileQuestion size={36} />
        </div>

        <div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            margin: 0,
            lineHeight: 1,
          }}>
            404
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--color-text-secondary)',
            margin: '12px 0 0',
            lineHeight: 1.6,
          }}>
            Page introuvable
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--color-gray)',
            margin: '8px 0 0',
          }}>
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
          >
            <Home size={18} />
            Accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 24px',
              borderRadius: '12px',
              border: '2px solid var(--color-primary)',
              backgroundColor: 'white',
              color: 'var(--color-primary)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
