import React from 'react';
import { Pencil, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import { supabase } from '../../lib/supabaseClient';
import { useCenter } from '../../context/CenterContext';

const centerTypeOptions = [
  { label: 'Centre de langues', value: 'langues' },
  { label: 'Centre de formation', value: 'formation' },
  { label: 'École privée', value: 'ecole' },
  { label: 'Cours particuliers', value: 'cours' },
  { label: 'Autre', value: 'autre' },
];

interface FormState {
  centerName: string;
  centerType: string;
  city: string;
  address: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
}

const defaultEtablissement: FormState = {
  centerName: '',
  centerType: 'langues',
  city: '',
  address: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  website: '',
};

const MonEtablissement: React.FC = () => {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const { setEtablissement } = useCenter();
  const [form, setForm] = React.useState<FormState>(defaultEtablissement);
  const [loading, setLoading] = React.useState(true);

  const [generalEditMode, setGeneralEditMode] = React.useState(false);
  const [contactEditMode, setContactEditMode] = React.useState(false);

  React.useEffect(() => {
    const fetchEtablissement = async () => {
      if (!etablissementId) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('etablissements')
        .select('center_name, center_type, city, address, phone, secondary_phone, email, website')
        .eq('id', etablissementId)
        .maybeSingle();

      if (!error && data) {
        setForm({
          centerName: data.center_name || '',
          centerType: data.center_type || 'langues',
          city: data.city || '',
          address: data.address || '',
          phone: data.phone || '',
          secondaryPhone: data.secondary_phone || '',
          email: data.email || '',
          website: data.website || '',
        });
        setEtablissement({
          id: etablissementId,
          centerName: data.center_name || '',
          centerType: data.center_type || 'langues',
          city: data.city || '',
          address: data.address || '',
          phone: data.phone || '',
          secondaryPhone: data.secondary_phone || '',
          email: data.email || '',
          website: data.website || '',
        });
      }

      setLoading(false);
    };

    fetchEtablissement();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etablissementId]);

  const onChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setForm((current) => ({ ...current, [field]: nextValue }));
  };

  const saveToDb = async (formState: FormState) => {
    if (!etablissementId) return;

    const { error } = await supabase
      .from('etablissements')
      .update({
        center_name: formState.centerName,
        center_type: formState.centerType,
        city: formState.city,
        address: formState.address,
        phone: formState.phone,
        secondary_phone: formState.secondaryPhone || null,
        email: formState.email,
        website: formState.website || null,
      })
      .eq('id', etablissementId);

    if (!error) {
      setEtablissement({
        id: etablissementId,
        centerName: formState.centerName,
        centerType: formState.centerType,
        city: formState.city,
        address: formState.address,
        phone: formState.phone,
        secondaryPhone: formState.secondaryPhone,
        email: formState.email,
        website: formState.website,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 0.95fr)', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section style={cardStyle}>
          <div style={{ ...headerStyle, position: 'relative' }}>
            <div>
              <h3 style={titleStyle}>Informations générales</h3>
              <p style={subtitleStyle}>Ces informations apparaissent dans l'en-tête de tous vos documents</p>
            </div>
            <button
              type="button"
              onClick={() => setGeneralEditMode((current) => !current)}
              title={generalEditMode ? 'Annuler' : 'Modifier les informations'}
              style={{ ...editButtonStyle, ...(generalEditMode ? cancelButtonStyle : {}) }}
            >
              {generalEditMode ? <X size={16} /> : <Pencil size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput label="Nom du centre" value={form.centerName} onChange={onChange('centerName')} required placeholder="Ex: EduSpace Casablanca" disabled={!generalEditMode} editMode={generalEditMode} />
            <FormInput label="Type d'établissement" type="select" value={form.centerType} onChange={onChange('centerType')} options={centerTypeOptions} disabled={!generalEditMode} editMode={generalEditMode} />
            <FormInput label="Ville" value={form.city} onChange={onChange('city')} required placeholder="Casablanca" disabled={!generalEditMode} editMode={generalEditMode} />
            <FormInput label="Adresse complète" type="textarea" value={form.address} onChange={onChange('address')} placeholder="Ex: 23 Rue Ibn Batouta, Maarif, Casablanca" disabled={!generalEditMode} editMode={generalEditMode} />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <PrimaryButton label="Enregistrer" onClick={() => { saveToDb(form); setGeneralEditMode(false); }} disabled={!generalEditMode} />
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ ...headerStyle, position: 'relative' }}>
            <div>
              <h3 style={titleStyle}>Coordonnées</h3>
              <p style={subtitleStyle}>Informations de contact affichées sur les reçus et documents</p>
            </div>
            <button
              type="button"
              onClick={() => setContactEditMode((current) => !current)}
              title={contactEditMode ? 'Annuler' : 'Modifier les coordonnées'}
              style={{ ...editButtonStyle, ...(contactEditMode ? cancelButtonStyle : {}) }}
            >
              {contactEditMode ? <X size={16} /> : <Pencil size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput label="Téléphone principal (Optionnel)" value={form.phone} onChange={onChange('phone')} placeholder="0522 XX XX XX" disabled={!contactEditMode} editMode={contactEditMode} />
            <FormInput label="Téléphone secondaire" value={form.secondaryPhone} onChange={onChange('secondaryPhone')} placeholder="06XX XX XX XX" optional disabled={!contactEditMode} editMode={contactEditMode} />
            <FormInput label="Email du centre (Optionnel)" type="email" value={form.email} onChange={onChange('email')} placeholder="contact@votrecentre.ma" disabled={!contactEditMode} editMode={contactEditMode} />
            <FormInput label="Site web" value={form.website} onChange={onChange('website')} placeholder="www.votrecentre.ma" optional disabled={!contactEditMode} editMode={contactEditMode} />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <PrimaryButton label="Enregistrer" onClick={() => { saveToDb(form); setContactEditMode(false); }} disabled={!contactEditMode} />
            </div>
          </div>
        </section>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section style={cardStyle}>
          <div style={headerStyle}>
            <div>
              <h3 style={titleStyle}>Aperçu de l'en-tête PDF</h3>
              <p style={subtitleStyle}>Aperçu en temps réel de vos documents</p>
            </div>
          </div>

          <div style={previewBoxStyle}>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: 'var(--text-lg)' }}>
              {form.centerName || 'Nom du centre'}
            </div>
            <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
              {centerTypeOptions.find(o => o.value === form.centerType)?.label || 'Type'} — {form.city || 'Ville'}
            </div>
            <div style={{ marginTop: '8px', color: 'var(--color-gray)', fontSize: 'var(--text-sm)' }}>
              {form.address || 'Adresse complète'}
            </div>
            <div style={{ marginTop: '8px', color: 'var(--color-gray)', fontSize: 'var(--text-sm)' }}>
              {form.phone || ''}{form.phone && form.email ? ' | ' : ''}{form.email || ''}
            </div>
            {(form.secondaryPhone || form.website) && (
              <div style={{ marginTop: '4px', color: 'var(--color-gray)', fontSize: 'var(--text-sm)' }}>
                {form.secondaryPhone || ''}{form.secondaryPhone && form.website ? ' | ' : ''}{form.website || ''}
              </div>
            )}
            <div style={dividerStyle} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Aperçu de l'en-tête - tel qu'il apparaît sur vos reçus
            </div>
          </div>

          <p style={{ marginTop: '12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Complétez les informations à gauche pour personnaliser vos documents.
          </p>
        </section>

      </aside>
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

const previewBoxStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '16px',
  minHeight: '120px'
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'var(--color-border)',
  margin: '16px 0'
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

export default MonEtablissement;