import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Check,
  Info, Phone, MapPin, Globe, DollarSign, Image,
} from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useCenter } from '../../context/CenterContext';
import { getFullName } from '../../utils/auth';
import { supabase } from '../../lib/supabaseClient';
import TopBar from '../../components/common/TopBar';

const centerTypeOptions = [
  { label: 'Centre de langues', value: 'langues' },
  { label: 'Soutien scolaire', value: 'soutien' },
  { label: 'Centre de formation', value: 'formation' },
  { label: 'École privée', value: 'ecole' },
  { label: 'Université', value: 'universite' },
  { label: 'Autre', value: 'autre' },
];

interface FormState {
  centerName: string;
  centerType: string;
  customCenterType: string;
  city: string;
  address: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
  registrationFee: string;
  logo: string;
}

interface FormErrors {
  centerName?: string;
  centerType?: string;
  customCenterType?: string;
  city?: string;
  address?: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  website?: string;
  registrationFee?: string;
  logo?: string;
}

const defaultForm: FormState = {
  centerName: '',
  centerType: '',
  customCenterType: '',
  city: '',
  address: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  website: '',
  registrationFee: '0',
  logo: '',
};

const NouvelEtablissement: React.FC = () => {
  const navigate = useNavigate();
  const { setEtablissement } = useCenter();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState(getFullName());

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const fromMeta = session.user.user_metadata?.full_name as string | undefined;
      if (fromMeta) setUserName(fromMeta);
    };
    fetchUser();
  }, []);
  const validateField = (field: keyof FormState, value: string | number, currentForm: FormState): string | undefined => {
    const strVal = typeof value === 'string' ? value : String(value);
    const trimmed = strVal.trim();

    switch (field) {
      case 'centerName': {
        if (!trimmed) return 'Le nom du centre est requis';
        if (trimmed.length < 3) return 'Le nom du centre doit contenir au moins 3 caractères';
        if (trimmed.length > 100) return 'Le nom du centre ne doit pas dépasser 100 caractères';
        if (strVal !== trimmed) return 'Le nom du centre ne peut pas commencer ou finir par un espace';
        if (strVal.includes('  ')) return 'Le nom du centre ne peut pas contenir d\'espaces consécutifs';
        if (!/^[a-zA-Z0-9À-ÿ'\-& ]+$/.test(strVal)) return 'Caractères non autorisés (lettres, chiffres, \', -, &)';
        return undefined;
      }
      case 'centerType': {
        if (!value) return 'Le type d\'établissement est requis';
        return undefined;
      }
      case 'customCenterType': {
        if (currentForm.centerType !== 'autre') return undefined;
        if (!trimmed) return 'Veuillez préciser le type d\'établissement';
        if (trimmed.length < 3) return 'Le type doit contenir au moins 3 caractères';
        if (trimmed.length > 50) return 'Le type ne doit pas dépasser 50 caractères';
        if (strVal !== trimmed) return 'Le type ne peut pas commencer ou finir par un espace';
        if (!/^[a-zA-Z0-9À-ÿ\- ]+$/.test(trimmed)) return 'Caractères non autorisés (lettres, chiffres, espaces, tirets)';
        return undefined;
      }
      case 'city': {
        if (!trimmed) return 'La ville est requise';
        return undefined;
      }
      case 'address': {
        if (!trimmed) return 'L\'adresse est requise';
        if (trimmed.length < 10) return 'L\'adresse doit contenir au moins 10 caractères';
        if (trimmed.length > 255) return 'L\'adresse ne doit pas dépasser 255 caractères';
        if (strVal !== trimmed) return 'L\'adresse ne peut pas commencer ou finir par un espace';
        if (!/^[a-zA-Z0-9À-ÿ,.\/#\- ]+$/.test(trimmed)) return 'Caractères non autorisés dans l\'adresse';
        return undefined;
      }
      case 'phone': {
        const cleaned = strVal.replace(/[\s-]/g, '');
        if (!cleaned) return 'Le téléphone principal est requis';
        if (!/^(0[567]|\+212[567])\d{8}$/.test(cleaned)) return 'Format de téléphone marocain invalide (ex: 0612345678)';
        return undefined;
      }
      case 'secondaryPhone': {
        if (!strVal) return undefined;
        const cleaned = strVal.replace(/[\s-]/g, '');
        if (!/^(0[567]|\+212[567])\d{8}$/.test(cleaned)) return 'Format de téléphone marocain invalide (ex: 0612345678)';
        return undefined;
      }
      case 'email': {
        const lower = trimmed.toLowerCase();
        if (!lower) return 'L\'email du centre est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) return 'Format d\'email invalide';
        return undefined;
      }
      case 'website': {
        if (!strVal) return undefined;
        if (strVal.length > 255) return 'L\'URL ne doit pas dépasser 255 caractères';
        let testUrl = strVal;
        if (!/^https?:\/\//i.test(testUrl)) testUrl = `https://${testUrl}`;
        try {
          new URL(testUrl);
        } catch {
          return 'Format d\'URL invalide';
        }
        return undefined;
      }
      case 'registrationFee': {
        const num = Number(strVal);
        if (strVal === '' || isNaN(num)) return 'Les frais d\'inscription sont requis';
        if (num < 0) return 'Les frais doivent être supérieurs ou égaux à 0';
        if (!/^\d+(\.\d{1,2})?$/.test(strVal)) return 'Maximum 2 décimales autorisées';
        return undefined;
      }
      case 'logo': {
        if (!strVal) return undefined;
        if (strVal.length > 500) return 'L\'URL ne doit pas dépasser 500 caractères';
        if (!/^https?:\/\//i.test(strVal)) return 'L\'URL doit commencer par http:// ou https://';
        try {
          new URL(strVal);
        } catch {
          return 'Format d\'URL invalide';
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const onChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let value: string | number = e.target.value;

    if (field === 'phone' || field === 'secondaryPhone') {
      value = value.replace(/[\s-]/g, '');
    } else if (field === 'email') {
      value = value.toLowerCase();
    } else if (field === 'registrationFee') {
      value = e.target.value;
    }

    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    const error = validateField(field, value, updatedForm);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleWebsiteBlur = () => {
    const v = form.website.trim();
    if (v && !/^https?:\/\//i.test(v)) {
      const updated = `https://${v}`;
      setForm((prev) => ({ ...prev, website: updated }));
      const error = validateField('website', updated, { ...form, website: updated });
      setErrors((prev) => ({ ...prev, website: error }));
    }
  };

  const validate = (): string | null => {
    const newErrors: FormErrors = {};
    const fields: (keyof FormState)[] = [
      'centerName', 'centerType', 'customCenterType', 'city', 'address',
      'phone', 'secondaryPhone', 'email', 'website', 'registrationFee', 'logo',
    ];
    let firstErrorField: string | null = null;
    for (const field of fields) {
      const error = validateField(field, form[field], form);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        if (!firstErrorField) firstErrorField = field;
      }
    }
    setErrors(newErrors);
    return firstErrorField;
  };

  const scrollToField = (fieldName: string) => {
    const el = document.getElementById(`field-${fieldName}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const firstError = validate();
    if (firstError) {
      scrollToField(firstError);
      return;
    }

    setSubmitting(true);

    let websiteVal = form.website.trim();
    if (websiteVal && !/^https?:\/\//i.test(websiteVal)) {
      websiteVal = `https://${websiteVal}`;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setSubmitError('Session expirée. Veuillez vous reconnecter.');
      setSubmitting(false);
      return;
    }

    const { data: etabId, error: rpcError } = await supabase.rpc('create_establishment', {
      p_center_name: form.centerName.trim(),
      p_center_type: form.centerType,
      p_city: form.city.trim(),
      p_address: form.address.trim(),
      p_phone: form.phone.replace(/[\s-]/g, ''),
      p_secondary_phone: form.secondaryPhone.replace(/[\s-]/g, '') || null,
      p_email: form.email.trim().toLowerCase(),
      p_website: websiteVal || null,
      p_registration_fee: Number(form.registrationFee),
      p_logo: form.logo || null,
    });

    if (rpcError || !etabId) {
      setSubmitError(`Erreur lors de la création de l'établissement: ${rpcError?.message || 'réponse invalide'}`);
      setSubmitting(false);
      return;
    }

    setEtablissement({
      id: etabId,
      centerName: form.centerName.trim(),
      centerType: form.centerType,
      city: form.city.trim(),
      address: form.address.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      secondaryPhone: form.secondaryPhone.replace(/[\s-]/g, ''),
      email: form.email.trim().toLowerCase(),
      website: websiteVal,
    });

    navigate(`/mes-etablissements/etablissement/${etabId}/dashboard`);
  };

  const getCenterTypeLabel = (value: string) => {
    if (!value) return "Type d'établissement";
    if (value === 'autre') return form.customCenterType?.trim() || "Type d'établissement";
    return centerTypeOptions.find((o) => o.value === value)?.label || "Type d'établissement";
  };

  return (
    <div style={pageStyle}>
      <TopBar userName={userName} showEtablissementLink />

      <main style={mainStyle}>
        <div style={pageHeaderStyle}>
          <button
            onClick={() => navigate('/mes-etablissements')}
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

          <div style={{ marginTop: '12px' }}>
            <h1 style={pageTitleStyle}>Nouvel établissement</h1>
            <p style={pageSubtitleStyle}>
              Remplissez les informations ci-dessous pour créer votre centre éducatif.
            </p>
          </div>
        </div>

        {submitError && (
          <div style={{
            padding: '14px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#b91c1c',
            fontSize: '0.9rem',
            fontWeight: 500,
            marginBottom: '20px',
          }}>
            {submitError}
          </div>
        )}

        <div style={gridStyle}>
          <div style={leftColumnStyle}>
            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={sectionIconWrapStyle}>
                  <Info size={18} />
                </div>
                <div>
                  <h3 style={sectionTitleStyle}>Informations générales</h3>
                  <p style={sectionSubtitleStyle}>Ces informations identifient votre établissement</p>
                </div>
              </div>

              <div style={formGroupStyle}>
                <FormInput
                  inputId="field-centerName"
                  label="Nom du centre"
                  value={form.centerName}
                  onChange={onChange('centerName')}
                  required
                  placeholder="Ex: EduSpace Casablanca"
                  error={errors.centerName}
                  editMode
                />
                <FormInput
                  inputId="field-centerType"
                  label="Type d'établissement"
                  type="select"
                  value={form.centerType}
                  onChange={onChange('centerType')}
                  options={centerTypeOptions}
                  placeholder="Choisir type établissement"
                  required
                  error={errors.centerType}
                  editMode
                />
                {form.centerType === 'autre' && (
                  <FormInput
                    inputId="field-customCenterType"
                    label="Précisez le type"
                    value={form.customCenterType}
                    onChange={onChange('customCenterType')}
                    placeholder="Ex: Centre de sport, Institut de musique..."
                    error={errors.customCenterType}
                    editMode
                  />
                )}
                <FormInput
                  inputId="field-city"
                  label="Ville"
                  value={form.city}
                  onChange={onChange('city')}
                  required
                  placeholder="Casablanca"
                  error={errors.city}
                  editMode
                />
                <FormInput
                  inputId="field-address"
                  label="Adresse complète"
                  type="textarea"
                  value={form.address}
                  onChange={onChange('address')}
                  placeholder="Ex: 23 Rue Ibn Batouta, Maarif, Casablanca"
                  error={errors.address}
                  editMode
                />
              </div>
            </section>

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ ...sectionIconWrapStyle, backgroundColor: 'var(--color-info)' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h3 style={sectionTitleStyle}>Coordonnées</h3>
                  <p style={sectionSubtitleStyle}>Comment vos clients peuvent vous joindre</p>
                </div>
              </div>

              <div style={formGroupStyle}>
                <FormInput
                  inputId="field-phone"
                  label="Téléphone principal"
                  value={form.phone}
                  onChange={onChange('phone')}
                  required
                  placeholder="0522 XX XX XX"
                  error={errors.phone}
                  editMode
                />
                <FormInput
                  inputId="field-secondaryPhone"
                  label="Téléphone secondaire"
                  value={form.secondaryPhone}
                  onChange={onChange('secondaryPhone')}
                  placeholder="0612345678"
                  error={errors.secondaryPhone}
                  optional
                  editMode
                />
                <FormInput
                  inputId="field-email"
                  label="Email du centre"
                  type="email"
                  value={form.email}
                  onChange={onChange('email')}
                  required
                  placeholder="contact@votrecentre.ma"
                  error={errors.email}
                  editMode
                />
                <FormInput
                  inputId="field-website"
                  label="Site web"
                  value={form.website}
                  onChange={onChange('website')}
                  onBlur={handleWebsiteBlur}
                  placeholder="www.votrecentre.ma"
                  error={errors.website}
                  optional
                  editMode
                />
              </div>
            </section>

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ ...sectionIconWrapStyle, backgroundColor: 'var(--color-warning)' }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 style={sectionTitleStyle}>Paramètres financiers</h3>
                  <p style={sectionSubtitleStyle}>Frais et configuration monétaire</p>
                </div>
              </div>

              <div style={formGroupStyle}>
                <FormInput
                  inputId="field-registrationFee"
                  label="Frais d'inscription (par défaut)"
                  type="number"
                  value={form.registrationFee}
                  onChange={onChange('registrationFee')}
                  placeholder="0"
                  min={0}
                  required
                  error={errors.registrationFee}
                  editMode
                />
              </div>
            </section>

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ ...sectionIconWrapStyle, backgroundColor: 'var(--color-dark-gray)' }}>
                  <Image size={18} />
                </div>
                <div>
                  <h3 style={sectionTitleStyle}>Logo</h3>
                  <p style={sectionSubtitleStyle}>Image ou URL de votre logo</p>
                </div>
              </div>

              <div style={formGroupStyle}>
                <FormInput
                  inputId="field-logo"
                  label="URL du logo"
                  optional
                  value={form.logo}
                  onChange={onChange('logo')}
                  placeholder="https://exemple.com/logo.png"
                  error={errors.logo}
                  editMode
                />
              </div>
            </section>

            <div style={actionBarStyle}>
              <button
                onClick={() => navigate('/mes-etablissements')}
                style={cancelButtonStyle}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gray-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Annuler
              </button>
              <PrimaryButton
                label={submitting ? "Création en cours..." : "Créer l'établissement"}
                onClick={handleSubmit}
                icon={<Check size={18} />}
                disabled={submitting}
              />
            </div>
          </div>

          <aside style={rightColumnStyle}>
            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h3 style={sectionTitleStyle}>Aperçu</h3>
                  <p style={sectionSubtitleStyle}>Récapitulatif de votre établissement</p>
                </div>
              </div>

              <div style={previewCardStyle}>
                <div style={previewHeaderStyle}>
                  <div style={previewLogoStyle}>
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" style={previewLogoImgStyle} />
                    ) : (
                      <Building2 size={24} color="var(--color-primary)" />
                    )}
                  </div>
                  <div>
                    <div style={previewNameStyle}>
                      {form.centerName || 'Nom du centre'}
                    </div>
                    <div style={previewTypeStyle}>
                      {getCenterTypeLabel(form.centerType)} — {form.city || 'Ville'}
                    </div>
                  </div>
                </div>

                <div style={dividerStyle} />

                <div style={detailListStyle}>
                  {form.address && (
                    <div style={detailRowStyle}>
                      <MapPin size={14} color="var(--color-gray)" />
                      <span style={detailTextStyle}>{form.address}</span>
                    </div>
                  )}
                  {form.phone && (
                    <div style={detailRowStyle}>
                      <Phone size={14} color="var(--color-gray)" />
                      <span style={detailTextStyle}>{form.phone}</span>
                    </div>
                  )}
                  {form.email && (
                    <div style={detailRowStyle}>
                      <Globe size={14} color="var(--color-gray)" />
                      <span style={detailTextStyle}>{form.email}</span>
                    </div>
                  )}
                </div>

                {Number(form.registrationFee) > 0 && (
                  <>
                    <div style={dividerStyle} />
                    <div style={feeRowStyle}>
                      <DollarSign size={14} color="var(--color-warning)" />
                      <span>
                        Frais d'inscription : <strong>{Number(form.registrationFee)} DH</strong>
                      </span>
                    </div>
                  </>
                )}
              </div>

              <p style={previewHintStyle}>
                Tous les champs marqués d'un astérisque (*) sont obligatoires.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--color-background)',
};

const mainStyle: React.CSSProperties = {
  padding: '32px 48px 48px',
  flex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  boxSizing: 'border-box',
};

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: '28px',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--color-text)',
  margin: 0,
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--color-text-secondary)',
  margin: '6px 0 0',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 0.9fr)',
  gap: '24px',
  alignItems: 'start',
};

const leftColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const rightColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  position: 'sticky',
  top: '92px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-white)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: 'var(--shadow-sm)',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--color-border)',
};

const sectionIconWrapStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 600,
  color: 'var(--color-text)',
  margin: 0,
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  marginTop: '2px',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
};

const actionBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '12px',
  paddingTop: '4px',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-base)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const previewCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '16px',
};

const previewHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const previewLogoStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: 'var(--color-primary-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const previewLogoImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const previewNameStyle: React.CSSProperties = {
  fontWeight: 700,
  color: 'var(--color-primary)',
  fontSize: 'var(--text-base)',
};

const previewTypeStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  marginTop: '2px',
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'var(--color-border)',
  margin: '14px 0',
};

const detailListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const detailTextStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const feeRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const previewHintStyle: React.CSSProperties = {
  marginTop: '12px',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  fontStyle: 'italic',
  lineHeight: 1.5,
};

export default NouvelEtablissement;
