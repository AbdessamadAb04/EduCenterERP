import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, GraduationCap, Search,
  MapPin, MoreVertical, Users, UserPlus, Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useCenter } from '../../context/CenterContext';
import TopBar from '../../components/common/TopBar';

interface Etablissement {
  id: string;
  center_name: string;
  center_type: string;
  city: string;
  address: string;
  phone: string;
  secondary_phone: string;
  email: string;
  website: string;
}

const centerTypeLabels: Record<string, string> = {
  langues: 'Centre de langues',
  soutien: 'Soutien scolaire',
  formation: 'Centre de formation',
  ecole: 'École privée',
  universite: 'Université',
  cours: 'Cours particuliers',
  autre: 'Autre',
};

const MesEtablissements: React.FC = () => {
  const navigate = useNavigate();
  const { setEtablissement } = useCenter();
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [collaboratorCounts, setCollaboratorCounts] = useState<Record<string, number>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const fromMeta = session.user.user_metadata?.full_name as string | undefined;
      if (fromMeta) setUserName(fromMeta);

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!userError && userRecord?.full_name) {
        setUserName(userRecord.full_name);
      }

      if (userError || !userRecord) { setLoading(false); return; }

      const { data: userEtabs } = await supabase
        .from('user_etablissements')
        .select('etablissements(id, center_name, center_type, city, address, phone, secondary_phone, email, website)')
        .eq('user_id', userRecord.id);

      if (userEtabs) {
        const etabs = userEtabs.map((ue: any) => ue.etablissements);
        setEtablissements(etabs);

        const ids = etabs.map((e: any) => e.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: countsData } = await supabase
            .from('user_etablissements')
            .select('etablissement_id')
            .in('etablissement_id', ids);

          if (countsData) {
            const counts: Record<string, number> = {};
            countsData.forEach((item: any) => {
              counts[item.etablissement_id] = (counts[item.etablissement_id] || 0) + 1;
            });
            setCollaboratorCounts(counts);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSelectEtablissement = (etab: Etablissement) => {
    setEtablissement({
      id: etab.id,
      centerName: etab.center_name,
      centerType: etab.center_type,
      city: etab.city,
      address: etab.address,
      phone: etab.phone,
      secondaryPhone: etab.secondary_phone,
      email: etab.email,
      website: etab.website,
    });
    navigate(`/mes-etablissements/etablissement/${etab.id}/dashboard`);
  };

  const filtered = etablissements.filter((e) =>
    e.center_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.city && e.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      <TopBar userName={userName} />

      <div style={{ display: 'flex', flex: 1 }}>
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 48px',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Mes établissements
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
              Gérez vos centres éducatifs et accédez à leurs fonctionnalités.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '28px',
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
                <Search size={18} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-gray)',
                }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un établissement..."
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                />
              </div>

              <button
                onClick={() => navigate('/nouvel-etablissement')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '10px', border: 'none',
                  backgroundColor: 'var(--color-primary)', color: 'white',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'background-color 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
              >
                <Plus size={18} />
                Ajouter un établissement
              </button>
            </div>

            {loading && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flex: 1, color: 'var(--color-text-secondary)',
              }}>
                Chargement...
              </div>
            )}

            {!loading && (
              <>
                {etablissements.length === 0 ? (
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '60px 40px', borderRadius: '12px',
                    border: '2px dashed var(--color-border)', gap: '20px', textAlign: 'center',
                  }}>
                    <GraduationCap size={64} color="var(--color-gray)" />
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Aucun établissement
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '8px 0 0', lineHeight: 1.6 }}>
                        Vous n&apos;avez pas encore créé d&apos;établissement.<br />
                        Créez votre premier centre pour commencer à gérer vos classes, étudiants et paiements.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/nouvel-etablissement')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 28px', borderRadius: '12px', border: 'none',
                        backgroundColor: 'var(--color-primary)', color: 'white',
                        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                    >
                      <Plus size={20} />
                      Créer mon premier établissement
                    </button>
                  </div>
                ) : searchQuery && filtered.length === 0 ? (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      <Search size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Aucun résultat pour "{searchQuery}"</p>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '20px',
                  }}>
                    {filtered.map((etab) => (
                      <div
                        key={etab.id}
                        onClick={() => handleSelectEtablissement(etab)}
                        style={{
                          backgroundColor: 'white', borderRadius: '14px',
                          border: '1px solid var(--color-border)', padding: '24px',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                          display: 'flex', flexDirection: 'column', gap: '16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            backgroundColor: 'var(--color-primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-primary)', flexShrink: 0,
                          }}>
                            <Building2 size={26} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {etab.center_name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                                {centerTypeLabels[etab.center_type] || etab.center_type}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} color="var(--color-gray)" />
                                {etab.city || 'Ville'}
                              </span>
                            </div>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === etab.id ? null : etab.id);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '4px', borderRadius: '8px', color: 'var(--color-gray)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdownId === etab.id && (
                              <>
                                <div
                                  style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    zIndex: 99,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                  }}
                                />
                                <div style={{
                                  position: 'absolute', top: '100%', right: 0, zIndex: 100,
                                  backgroundColor: 'white', borderRadius: '10px',
                                  border: '1px solid var(--color-border)',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                  minWidth: '220px', overflow: 'hidden',
                                }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(null);
                                    }}
                                    style={{
                                      width: '100%', padding: '10px 16px', border: 'none',
                                      background: 'none', cursor: 'pointer', textAlign: 'left',
                                      fontSize: '0.85rem', color: 'var(--color-text)',
                                      display: 'flex', alignItems: 'center', gap: '8px',
                                      transition: 'background-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                  >
                                    <UserPlus size={16} />
                                    Inviter un collaborateur
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(null);
                                      setEtablissement({
                                        id: etab.id,
                                        centerName: etab.center_name,
                                        centerType: etab.center_type,
                                        city: etab.city,
                                        address: etab.address,
                                        phone: etab.phone,
                                        secondaryPhone: etab.secondary_phone,
                                        email: etab.email,
                                        website: etab.website,
                                      });
                                      navigate(`/mes-etablissements/etablissement/${etab.id}/parametres`);
                                    }}
                                    style={{
                                      width: '100%', padding: '10px 16px', border: 'none',
                                      background: 'none', cursor: 'pointer', textAlign: 'left',
                                      fontSize: '0.85rem', color: 'var(--color-text)',
                                      display: 'flex', alignItems: 'center', gap: '8px',
                                      transition: 'background-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                  >
                                    <Settings size={16} />
                                    Paramètres
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                          <Users size={16} color="var(--color-gray)" />
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            <strong style={{ color: 'var(--color-text)' }}>{collaboratorCounts[etab.id] || 0}</strong> collaborateur{collaboratorCounts[etab.id] !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MesEtablissements;
