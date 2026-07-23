import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, X, LayoutDashboard, Users, BookOpen, CreditCard,
  Settings, HelpCircle, User, FileText, Building2,
  School, PlusCircle, FileDown, FileUp,
  Wallet, BarChart3, ArrowRight
} from 'lucide-react';

interface SearchItem {
  category: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  keywords: string[];
  description: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const basePath = etablissementId ? `/mes-etablissements/etablissement/${etablissementId}` : '';
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const allItems: SearchItem[] = React.useMemo(() => {
    if (!etablissementId) return [];

    return [
      { category: 'Modules', label: 'Tableau de bord', path: `${basePath}/dashboard`, icon: <LayoutDashboard size={18} />, keywords: ['dashboard', 'accueil', 'home', 'statistiques', 'stats', 'aperçu'], description: "Vue d'ensemble des activités et statistiques" },
      { category: 'Modules', label: 'Étudiants', path: `${basePath}/students`, icon: <Users size={18} />, keywords: ['students', 'élèves', 'apprenants', 'inscriptions', 'list'], description: 'Gestion des étudiants, inscriptions et suivis' },
      { category: 'Modules', label: 'Classes', path: `${basePath}/classes`, icon: <BookOpen size={18} />, keywords: ['class', 'cours', 'matières', 'niveaux', 'groupes', 'emploi'], description: "Gestion des classes, matières et emplois du temps" },
      { category: 'Modules', label: 'Paiements', path: `${basePath}/finance`, icon: <CreditCard size={18} />, keywords: ['finance', 'payments', 'encaissements', 'frais', 'scolarité', 'reçus'], description: 'Gestion des paiements, échéances et reçus' },
      { category: 'Modules', label: 'Mon profil', path: `${basePath}/profil`, icon: <User size={18} />, keywords: ['profile', 'compte', 'mot de passe', 'informations'], description: 'Votre profil et paramètres de connexion' },
      { category: 'Modules', label: 'Mon établissement', path: `${basePath}/parametres`, icon: <FileText size={18} />, keywords: ['établissement', 'centre', 'infos', 'coordonnées', 'paramètres'], description: "Informations de l'établissement et coordonnées" },
      { category: 'Modules', label: 'Aide & Support', path: `${basePath}/support`, icon: <HelpCircle size={18} />, keywords: ['help', 'support', 'aide', 'contact', 'assistance'], description: "Centre d'aide et support technique" },
      { category: 'Modules', label: 'Paramètres', path: `${basePath}/settings`, icon: <Settings size={18} />, keywords: ['settings', 'configuration', 'système', 'préférences'], description: 'Paramètres généraux du système' },
      { category: 'Actions rapides', label: 'Ajouter un étudiant', path: `${basePath}/students`, icon: <PlusCircle size={18} />, keywords: ['ajouter', 'créer', 'nouvel étudiant', 'inscrire', 'add student', 'nouveau'], description: 'Inscrire un nouvel étudiant' },
      { category: 'Actions rapides', label: 'Créer une classe', path: `${basePath}/classes`, icon: <School size={18} />, keywords: ['créer classe', 'new class', 'nouvelle classe', 'groupe', 'matière'], description: 'Ajouter une nouvelle classe ou un groupe' },
      { category: 'Actions rapides', label: 'Enregistrer un paiement', path: `${basePath}/finance`, icon: <Wallet size={18} />, keywords: ['paiement', 'payment', 'encaisser', 'reçu', 'frais'], description: 'Saisir un nouveau paiement' },
      { category: 'Actions rapides', label: 'Exporter les données', path: `${basePath}/finance`, icon: <FileDown size={18} />, keywords: ['export', 'exporter', 'pdf', 'csv', 'rapport', 'relevé'], description: 'Exporter les listes et rapports' },
      { category: 'Actions rapides', label: 'Importer des données', path: `${basePath}/students`, icon: <FileUp size={18} />, keywords: ['import', 'importer', 'upload', 'fichier', 'csv'], description: 'Importer des étudiants depuis un fichier' },
      { category: 'Actions rapides', label: 'Voir les statistiques', path: `${basePath}/dashboard`, icon: <BarChart3 size={18} />, keywords: ['stats', 'statistiques', 'graphiques', 'analytics'], description: "Accéder aux indicateurs et graphiques" },
      { category: 'Actions rapides', label: 'Gérer mes établissements', path: '/mes-etablissements', icon: <Building2 size={18} />, keywords: ['établissements', 'centres', 'mes centres', 'liste'], description: 'Retour à la liste des établissements' },
    ];
  }, [basePath, etablissementId]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter((item) => {
      const searchable = [item.label.toLowerCase(), item.description.toLowerCase(), ...item.keywords.map(k => k.toLowerCase())];
      return searchable.some(s => s.includes(q));
    });
  }, [query, allItems]);

  const handleNavigate = (item: SearchItem) => {
    navigate(item.path);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleNavigate(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '6px',
        width: '420px',
        maxHeight: 'min(440px, calc(100vh - 120px))',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 200,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 14px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <Search size={18} color="var(--color-gray)" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher pages et actions..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: '0.9rem', color: 'var(--color-text)',
            backgroundColor: 'transparent',
          }}
        />
        <X size={16} cursor="pointer" color="var(--color-gray)" onClick={handleClose} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Aucun résultat pour "<strong>{query}</strong>"
          </div>
        ) : (
          (() => {
            let lastCategory = '';
            return filtered.map((item, idx) => {
              const showHeader = item.category !== lastCategory;
              lastCategory = item.category;
              return (
                <React.Fragment key={`${item.path}-${idx}`}>
                  {showHeader && (
                    <div style={{
                      padding: '6px 16px 2px',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                    }}>
                      {item.category}
                    </div>
                  )}
                  <div
                    onClick={() => handleNavigate(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 14px', cursor: 'pointer',
                      backgroundColor: selectedIndex === idx ? 'var(--color-gray-bg)' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      backgroundColor: selectedIndex === idx ? 'var(--color-primary)' : 'var(--color-gray-bg)',
                      color: selectedIndex === idx ? 'white' : 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    </div>
                    <ArrowRight size={12} color="var(--color-gray)" style={{ flexShrink: 0 }} />
                  </div>
                </React.Fragment>
              );
            });
          })()
        )}
      </div>

    </div>
  );
};

export default SearchModal;
