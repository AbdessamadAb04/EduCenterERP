import React from 'react';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Building2, Pencil, X, Upload, LogOut, Trash2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { clearToken, setFullName } from '../../utils/auth';
import FormInput from '../../components/common/FormInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import TopBar from '../../components/common/TopBar';
import { supabase } from '../../lib/supabaseClient';

const MonProfil: React.FC = () => {
  const navigate = useNavigate();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [personalEditMode, setPersonalEditMode] = React.useState(false);
  const [securityEditMode, setSecurityEditMode] = React.useState(false);
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<'logout' | 'delete' | null>(null);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [confirmStep, setConfirmStep] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string>('Administrateur');
  const [memberSince, setMemberSince] = React.useState('');

  const initials = form.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const passwordStrength = React.useMemo(() => {
    const value = form.newPassword;
    if (value.length >= 10 && /\d/.test(value) && /[A-Z]/.test(value)) return { label: 'Fort', width: '100%', color: 'var(--color-success)' };
    if (value.length >= 8 && /\d/.test(value)) return { label: 'Moyen', width: '66%', color: 'var(--color-warning)' };
    return { label: 'Faible', width: '33%', color: 'var(--color-danger)' };
  }, [form.newPassword]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, created_at')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!userError && userRecord) {
        setForm((current) => ({
          ...current,
          fullName: userRecord.full_name || '',
          email: userRecord.email || session.user.email || '',
        }));
        setFullName(userRecord.full_name || '');
        setMemberSince(
          userRecord.created_at
            ? new Date(userRecord.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
            : ''
        );

        const { data: roleData } = await supabase
          .from('user_etablissements')
          .select('role')
          .eq('user_id', userRecord.id)
          .limit(1)
          .maybeSingle();

        if (roleData) {
          const roleMap: Record<string, string> = {
            OWNER: 'Propriétaire',
            ADMIN: 'Administrateur',
            SECRETARY: 'Secrétaire',
          };
          setUserRole(roleMap[roleData.role] || roleData.role);
        }
      } else {
        setForm((current) => ({
          ...current,
          email: session.user.email || '',
        }));
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const onChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    if (field === 'fullName') setFullName(nextValue);
  };

  const inputType = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => (showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'next' : 'confirm'] ? 'text' : 'password');

  const toggle = (key: keyof typeof showPasswords) => {
    setShowPasswords((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextImageUrl = URL.createObjectURL(file);
    setProfileImage(nextImageUrl);
  };

  const handleSavePersonal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('users')
      .update({ full_name: form.fullName })
      .eq('auth_user_id', session.user.id);

    if (!error) {
      setFullName(form.fullName);
    }

    setPersonalEditMode(false);
  };

  const handleSaveSecurity = () => {
    setSecurityEditMode(false);
    setForm((current) => ({
      ...current,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setShowPasswords({ current: false, next: false, confirm: false });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      {!etablissementId && <TopBar showEtablissementLink />}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 0.9fr)', gap: '24px', alignContent: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={cardStyle}>
              <div style={{ ...headerStyle, position: 'relative' }}>
                <div>
                  <h3 style={titleStyle}>Informations personnelles</h3>
                  <p style={subtitleStyle}>Mettez à jour vos informations de profil</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPersonalEditMode((current) => !current)}
                  title={personalEditMode ? 'Annuler' : 'Modifier les informations'}
                  style={{ ...editButtonStyle, ...(personalEditMode ? cancelButtonStyle : {}) }}
                >
                  {personalEditMode ? <X size={16} /> : <Pencil size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
                  <div style={avatarFrameStyle}>
                    {profileImage ? (
                      <img src={profileImage} alt="Photo de profil" style={avatarImageStyle} />
                    ) : (
                      <div style={avatarStyle}>{initials || 'A'}</div>
                    )}
                    <button type="button" onClick={handleAvatarClick} style={avatarEditButtonStyle} title="Modifier la photo de profil">
                      <Upload size={14} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Photo de profil (bientôt disponible)</span>
                </div>

                <FormInput label="Nom complet" value={form.fullName} onChange={onChange('fullName')} required placeholder="Votre nom complet" disabled={!personalEditMode} editMode={personalEditMode} />
                <FormInput label="Adresse email" type="email" value={form.email} onChange={onChange('email')} required placeholder="votre@email.com" disabled={!personalEditMode} editMode={personalEditMode} />

                <div>
                  <label style={labelStyle}>Rôle</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={roleBadgeStyle}>{userRole}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      <Lock size={14} /> Accès complet
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <PrimaryButton label="Enregistrer les modifications" onClick={handleSavePersonal} disabled={!personalEditMode} />
                </div>
              </div>
            </section>

            <section style={cardStyle}>
              <div style={{ ...headerStyle, position: 'relative' }}>
                <div>
                  <h3 style={titleStyle}>Sécurité</h3>
                  <p style={subtitleStyle}>Modifiez votre mot de passe de connexion</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityEditMode((current) => !current)}
                  title={securityEditMode ? 'Annuler' : 'Modifier la sécurité'}
                  style={{ ...editButtonStyle, ...(securityEditMode ? cancelButtonStyle : {}) }}
                >
                  {securityEditMode ? <X size={16} /> : <Pencil size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <FormInput label="Mot de passe actuel" type={inputType('currentPassword')} value={form.currentPassword} onChange={onChange('currentPassword')} required placeholder="••••••••" disabled={!securityEditMode} editMode={securityEditMode} />
                  <button type="button" onClick={() => toggle('current')} style={eyeButtonStyle}>{showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>

                <div style={{ position: 'relative' }}>
                  <FormInput label="Nouveau mot de passe" type={inputType('newPassword')} value={form.newPassword} onChange={onChange('newPassword')} required placeholder="••••••••" disabled={!securityEditMode} editMode={securityEditMode} />
                  <button type="button" onClick={() => toggle('next')} style={eyeButtonStyle}>{showPasswords.next ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <div style={{ marginTop: '-8px', marginBottom: '12px' }}>
                    <div style={{ height: '6px', borderRadius: '999px', background: 'var(--color-gray-bg)', overflow: 'hidden' }}>
                      <div style={{ width: passwordStrength.width, height: '100%', background: passwordStrength.color }} />
                    </div>
                    <div style={{ marginTop: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Niveau de sécurité: {passwordStrength.label}</div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <FormInput label="Confirmer le nouveau mot de passe" type={inputType('confirmPassword')} value={form.confirmPassword} onChange={onChange('confirmPassword')} required placeholder="••••••••" disabled={!securityEditMode} editMode={securityEditMode} />
                  <button type="button" onClick={() => toggle('confirm')} style={eyeButtonStyle}>{showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <PrimaryButton label="Mettre à jour le mot de passe" onClick={handleSaveSecurity} disabled={!securityEditMode || !form.currentPassword || !form.newPassword || form.newPassword !== form.confirmPassword} />
                </div>
              </div>
            </section>

            <div style={cardStyle}>
              <div style={{ ...headerStyle, borderBottomColor: 'var(--color-danger)' }}>
                <div>
                  <h3 style={{ ...titleStyle, color: 'var(--color-danger)' }}>Zone de danger</h3>
                  <p style={subtitleStyle}>Actions irréversibles disponibles pour votre compte</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <button
                  onClick={() => { setConfirmAction('logout'); setConfirmStep(1); setConfirmModalOpen(true); }}
                  style={dangerButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-danger)';
                  }}
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
                <button
                  onClick={() => { setConfirmAction('delete'); setConfirmStep(1); setDeletePassword(''); setConfirmModalOpen(true); }}
                  style={{ ...dangerButtonStyle, backgroundColor: 'var(--color-danger)', color: 'white' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-danger)';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  <Trash2 size={16} />
                  Supprimer le compte
                </button>
              </div>
            </div>

            <Modal
              isOpen={confirmModalOpen}
              onClose={() => { setConfirmModalOpen(false); setDeletePassword(''); setConfirmStep(1); }}
              title={confirmAction === 'delete' && confirmStep === 2 ? 'Confirmer votre mot de passe' : 'Confirmation'}
              footer={
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
                  <button
                    onClick={() => { setConfirmModalOpen(false); setDeletePassword(''); setConfirmStep(1); }}
                    style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Annuler
                  </button>
                  {confirmAction === 'delete' && confirmStep === 2 ? (
                    <button
                      onClick={() => { clearToken(); navigate('/login'); }}
                      style={{ padding: '10px 20px', backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Confirmer & supprimer
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirmAction === 'logout') {
                          clearToken();
                          navigate('/login');
                        } else if (confirmAction === 'delete') {
                          setConfirmStep(2);
                        }
                      }}
                      style={{ padding: '10px 20px', backgroundColor: confirmAction === 'delete' ? 'var(--color-danger)' : 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {confirmAction === 'delete' ? 'Supprimer' : 'Confirmer'}
                    </button>
                  )}
                </div>
              }
            >
              {confirmAction === 'delete' && confirmStep === 2 ? (
                <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                  <p style={{ fontSize: '1.05rem', color: 'var(--color-text)', margin: '0 0 16px', lineHeight: 1.6 }}>
                    Veuillez saisir votre mot de passe pour confirmer la suppression de votre compte.
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '1rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', margin: 0, lineHeight: 1.6 }}>
                    {confirmAction === 'logout'
                      ? 'Êtes-vous sûr de vouloir vous déconnecter ?'
                      : 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'}
                  </p>
                </div>
              )}
            </Modal>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <aside style={cardStyle}>
              <div style={headerStyle}>
                <div>
                  <h3 style={titleStyle}>Aperçu du compte</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <div style={avatarFrameStyle}>
                  {profileImage ? (
                    <img src={profileImage} alt="Photo de profil" style={avatarImageStyle} />
                  ) : (
                    <div style={avatarStyle}>{initials || 'A'}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)' }}>{form.fullName}</div>
                  <div style={{ marginTop: '6px' }}><span style={roleBadgeStyle}>{userRole}</span></div>
                </div>

                <div style={dividerStyle} />

                <div style={{ width: '100%', display: 'grid', gap: '12px', textAlign: 'left' }}>
                  <InfoRow icon={<Mail size={14} />} label="Email" value={form.email} />
                  <InfoRow icon={<User size={14} />} label="Membre depuis" value={memberSince || '...'} />
                  <InfoRow icon={<Building2 size={14} />} label="Statut" value={<StatusBadge status="ACTIVE" />} />
                </div>

                <div style={dividerStyle} />

            <NavLink to="/mes-etablissements"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
            >
              <Building2 size={18} />
              Mes établissements
            </NavLink>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-white)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: 'var(--shadow-sm)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--color-border)'
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 600,
  color: 'var(--color-text)'
};

const subtitleStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)'
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--color-text-secondary)'
};

const avatarStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'var(--text-xl)',
  fontWeight: 700,
};

const avatarFrameStyle: React.CSSProperties = {
  position: 'relative',
  width: '88px',
  height: '88px',
  borderRadius: '50%',
  padding: '6px',
  background: 'linear-gradient(145deg, rgba(5, 150, 105, 0.16), rgba(15, 23, 42, 0.04))',
  border: '1px solid var(--color-border)',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
};

const avatarEditButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '2px',
  bottom: '2px',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  backgroundColor: 'white',
  color: 'var(--color-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
};

const roleBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  border: '1px solid rgba(220, 38, 38, 0.18)',
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'var(--color-border)'
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '38px',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-gray)',
  cursor: 'pointer'
};

const editButtonStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
};

const cancelButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
  border: '1px solid var(--color-danger)',
};

const dangerButtonStyle: React.CSSProperties = {
  width: 'auto',
  minWidth: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid var(--color-danger)',
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const linkCardStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  textDecoration: 'none',
  backgroundColor: 'var(--color-gray-bg)',
  color: 'var(--color-text)'
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', textAlign: 'right' }}>{value}</div>
    </div>
  );
}

export default MonProfil;