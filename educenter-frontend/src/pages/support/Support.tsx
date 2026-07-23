import React from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  ExternalLink, 
  Mail, 
  Phone,
  BookOpen,
  ShieldCheck,
  Video
} from 'lucide-react';
const SupportPage: React.FC = () => {
  const supportCategories = [
    {
      title: 'Guide d\'utilisation',
      description: 'Apprenez à utiliser toutes les fonctionnalités de la plateforme.',
      icon: <BookOpen size={24} color="var(--color-primary)" />,
      link: '#',
    },
    {
      title: 'Tutoriels Vidéo',
      description: 'Découvrez des démonstrations visuelles pas à pas.',
      icon: <Video size={24} color="#6366f1" />,
      link: '#',
    },
    {
      title: 'Documentation API',
      description: 'Pour les intégrateurs et les développeurs tiers.',
      icon: <FileText size={24} color="#10b981" />,
      link: '#',
    },
    {
      title: 'Sécurité & Confidentialité',
      description: 'Comprendre comment nous protégeons vos données.',
      icon: <ShieldCheck size={24} color="#f59e0b" />,
      link: '#',
    },
  ];

  const contactOptions = [
    {
      label: 'Assistance Technique',
      value: 'support@educenter.com',
      icon: <Mail size={16} />,
      type: 'email'
    },
    {
      label: 'Ligne d\'urgence',
      value: '+221 33 000 00 00',
      icon: <Phone size={16} />,
      type: 'phone'
    },
    {
      label: 'WhatsApp Business',
      value: '+221 77 000 00 00',
      icon: <MessageCircle size={16} />,
      type: 'whatsapp'
    }
  ];

  const faqItems = [
    {
      q: "Comment créer une nouvelle classe ?",
      a: "Accédez à l'onglet 'Classes', cliquez sur le bouton 'Nouvelle Classe' en haut à droite et remplissez les informations requises."
    },
    {
      q: "Comment enregistrer un paiement ?",
      a: "Allez dans 'Paiements', sélectionnez l'étudiant concerné, puis cliquez sur 'Effectuer un paiement'."
    },
    {
      q: "Puis-je exporter les données des étudiants ?",
      a: "Oui, un bouton d'exportation Excel est disponible dans la liste des étudiants pour les administrateurs."
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Aide & Support
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
          Trouvez des réponses à vos questions et obtenez de l'aide technique pour EduCenter ERP.
        </p>
      </div>

      {/* Resources Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '40px' 
      }}>
        {supportCategories.map((cat, i) => (
          <div 
            key={i}
            style={{ 
              padding: '24px', 
              backgroundColor: 'white', 
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(55, 48, 163, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cat.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '4px' }}>{cat.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {cat.description}
              </p>
            </div>
            <div style={{ 
              marginTop: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--color-primary)', 
              fontSize: 'var(--text-sm)',
              fontWeight: 500
            }}>
              Consulter <ExternalLink size={14} />
            </div>
          </div>
        ))}
      </div>

      <div>
        {/* FAQ Section */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={22} color="var(--color-primary)" /> Questions Fréquentes (FAQ)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
            {faqItems.map((item, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-border)' 
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}>
                  {item.q}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             Contactez l'Assistance
          </h3>
          <div style={{ 
            backgroundColor: 'var(--color-primary)', 
            padding: '24px', 
            borderRadius: '12px', 
            color: 'white',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr auto',
            alignItems: 'center',
            gap: '40px'
          }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9, lineHeight: 1.6 }}>
                Besoin de parler à un expert ? Nos conseillers sont disponibles du Lundi au Samedi (8h - 18h).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
              {contactOptions.map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {opt.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                      {opt.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ 
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'white',
              color: 'var(--color-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}>
              <MessageCircle size={18} />
              Ouvrir un ticket
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;