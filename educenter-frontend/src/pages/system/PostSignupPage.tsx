import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowRight, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import PrimaryButton from '../../components/common/PrimaryButton';

interface Etablissement {
  id: string;
  center_name: string;
  city: string;
}

const PostSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEtablissements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!userError && userRecord) {
        const { data: userEtabs } = await supabase
          .from('user_etablissements')
          .select('etablissements(id, center_name, city)')
          .eq('user_id', userRecord.id);

        if (userEtabs) {
          setEtablissements(
            userEtabs.map((ue: any) => ue.etablissements)
          );
        }
      }

      setLoading(false);
    };

    fetchEtablissements();
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-background) 0%, #e8f5e9 100%)',
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

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
        maxWidth: '520px',
        width: '100%',
      }}>
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
          <Building2 size={40} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Bienvenue sur EduCenter
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
            Votre compte a été créé avec succès.
          </p>
        </div>

        {etablissements.length === 0 ? (
          <div style={{
            width: '100%',
            padding: '40px 24px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '2px dashed var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}>
            <GraduationCap size={48} color="var(--color-gray)" />
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                Aucun établissement
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
                Vous n&apos;avez pas encore d&apos;établissement.<br />
                Créez votre premier centre pour commencer à gérer vos classes et étudiants.
              </p>
            </div>
            <button
              onClick={() => navigate('/nouvel-etablissement')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
            >
              <Plus size={18} />
              Créer un établissement
            </button>
          </div>
        ) : (
          <div style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: '#f9fafb',
            }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                {etablissements.length} établissement{etablissements.length > 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ padding: '8px' }}>
              {etablissements.map((etab) => (
                <div
                  key={etab.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                      {etab.center_name}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      {etab.city}
                    </p>
                  </div>
                  <ArrowRight size={18} color="var(--color-gray)" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ width: '100%' }}>
          <PrimaryButton
            label="Accéder au tableau de bord"
            onClick={handleGoToDashboard}
          />
        </div>
      </div>
    </div>
  );
};

export default PostSignupPage;
