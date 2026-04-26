import React from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Database, 
  Globe, 
  Palette,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const settingsSections = [
    {
      title: 'Profil & Compte',
      icon: <User size={20} />,
      items: [
        { label: 'Informations personnelles', desc: 'Gérez votre nom, e-mail et avatar' },
        { label: 'Changer le mot de passe', desc: 'Mettez à jour vos identifiants de sécurité' }
      ]
    },
    {
      title: 'Système',
      icon: <Database size={20} />,
      items: [
        { label: 'Configuration de l\'institution', desc: 'Nom, adresse et logo de l\'école' },
        { label: 'Sauvegarde des données', desc: 'Gérez les exports et copies de sécurité' }
      ]
    },
    {
      title: 'Apparence',
      icon: <Palette size={20} />,
      items: [
        { label: 'Thème visuel', desc: 'Basculer entre mode clair, sombre ou émeraude' },
        { label: 'Langue du système', desc: 'Français, Anglais, Arabe' }
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      items: [
        { label: 'Alertes WhatsApp', desc: 'Configurer l\'API de rappel automatique' },
        { label: 'E-mails de gestion', desc: 'Fréquence des rapports quotidiens' }
      ]
    }
  ];

  return (
    <div style={{ padding: '0 32px 32px 0', maxWidth: '1200px', margin: '0' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ color: 'var(--color-gray)', marginTop: '-24px' }}>Configurez votre environnement EduCenter ERP selon vos besoins et préférences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {settingsSections.map((section, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-gray-bg)' }}>
              <div style={{ 
                backgroundColor: 'var(--color-primary-light)', 
                color: 'var(--color-primary)', 
                padding: '8px', 
                borderRadius: '8px' 
              }}>
                {section.icon}
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{section.title}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gray-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '15px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray)' }}>{item.desc}</div>
                  </div>
                  <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600 }}>Modifier</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '24px', 
        borderRadius: '12px', 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fee2e2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h4 style={{ color: '#991b1b', fontWeight: 600 }}>Zone de Danger</h4>
          <p style={{ color: '#b91c1c', fontSize: '14px' }}>Réinitialisation complète des données ou suppression du compte institution.</p>
        </div>
        <button style={{ 
          backgroundColor: '#dc2626', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          fontWeight: 600, 
          cursor: 'pointer' 
        }}>
          Action Critique
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;