import React from 'react';
import { NavLink, useLocation, Outlet, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings,
  HelpCircle,
  Search,
  Bell,
  User,
  FileText,
  Building2,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useCenter } from '../../context/CenterContext.tsx';
import { getFullName, clearToken } from '../../utils/auth';
import { supabase } from '../../lib/supabaseClient';
import SearchModal from '../common/SearchModal';
import NotificationsPopup from '../common/NotificationsPopup';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const basePath = etablissementId ? `/mes-etablissements/etablissement/${etablissementId}` : '';
  const mainItems = [
    { name: 'Tableau de bord', path: `${basePath}/dashboard`, icon: <LayoutDashboard size={20} /> },
    { name: 'Paiements', path: `${basePath}/finance`, icon: <CreditCard size={20} /> },
    { name: 'Étudiants', path: `${basePath}/students`, icon: <Users size={20} /> },
    { name: 'Classes', path: `${basePath}/classes`, icon: <BookOpen size={20} /> },
  ];

  const accountItems = [
    { name: 'Mon profil', path: `${basePath}/profil`, icon: <User size={20} /> },
    { name: 'Mon établissement', path: `${basePath}/parametres`, icon: <FileText size={20} /> },
  ];

  const secondaryItems = [
    { name: 'Aide & Support', path: `${basePath}/support`, icon: <HelpCircle size={20} /> },
    { name: 'Paramètres', path: `${basePath}/settings`, icon: <Settings size={20} /> },
  ];

  const NavItem = ({ item }: { item: any }) => (
    <NavLink
      key={item.path}
      to={item.path}
      style={({ isActive }) => {
        const isDashboardActive = isActive;
        
        return {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px',
          textDecoration: 'none',
          color: isDashboardActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
          backgroundColor: isDashboardActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderLeft: isDashboardActive ? '4px solid white' : '4px solid transparent',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.05)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease',
          gap: '12px',
          fontSize: 'var(--text-base)',
          fontWeight: isDashboardActive ? 600 : 400,
        };
      }}
    >
      {item.icon}
      <span>{item.name}</span>
    </NavLink>
  );

  return (
    <div className="no-print" style={{
      width: '220px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--color-primary)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      color: 'white'
    }}>
      <div
        onClick={() => navigate('/mes-etablissements')}
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '12px',
          cursor: 'pointer',
        }}
      >
        <Building2 size={22} style={{ marginRight: '10px', flexShrink: 0 }} />
        <h1 style={{ 
          color: 'white', 
          fontSize: 'var(--text-xl)',
          fontWeight: 'bold',
          margin: 0,
        }}>EduCenter</h1>
      </div>

      <nav style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        marginTop: '14px',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SectionTitle label="Menu" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mainItems.map((item) => <NavItem key={item.path} item={item} />)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <SectionTitle label="Comptes" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accountItems.map((item) => <NavItem key={item.path} item={item} />)}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SectionTitle label="Other" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {secondaryItems.map((item) => <NavItem key={item.path} item={item} />)}
          </div>
        </div>
      </nav>

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.05em' }}>EduCenter v0.1</span>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { centerName } = useCenter();

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateTime = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return (
      <span style={{ display: 'flex', gap: '8px' }}>
        <span>{d}/{m}/{y}</span>
        <span>{h}:{min}</span>
      </span>
    );
  };
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/mes-etablissements') return 'Mes établissements';
    if (path.includes('/dashboard')) return 'Tableau de bord';
    if (path.includes('/students')) return 'Étudiants';
    if (path.includes('/classes')) return 'Classes';
    if (path.includes('/finance')) return 'Paiements';
    if (path.includes('/settings')) return 'Paramètres du Système';
    if (path.includes('/support')) return 'Aide & Support';
    if (path.includes('/profil')) return 'Mon profil';
    if (path.includes('/compte')) return 'Mon compte';
    if (path.includes('/parametres')) return 'Mon établissement';
    return 'EduCenter ERP';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <div className="main-layout-content" style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column' }}>
        {/* Sticky Header */}
        <header className="no-print" style={{
          height: '60px',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-white)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 90,
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              onClick={() => navigate('/mes-etablissements')}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                letterSpacing: '0.03em',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Mes établissements
            </div>

            <ChevronRight size={15} style={{ color: 'var(--color-gray)', flexShrink: 0, marginTop: '2px' }} />

            <div
              onClick={() => etablissementId && navigate(`/mes-etablissements/etablissement/${etablissementId}/dashboard`)}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                letterSpacing: '0.03em',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {centerName || 'EduCenter'}
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--text-sm)', 
            fontWeight: 500, 
            color: 'var(--color-gray)',
            backgroundColor: 'var(--color-gray-bg)',
            padding: '6px 16px',
            borderRadius: '20px'
          }}>
            {formatDateTime(currentTime)}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            color: 'var(--color-gray)',
            position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} cursor="pointer" onClick={() => setSearchOpen(!searchOpen)} />
              <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            </div>
            <div style={{ position: 'relative' }}>
              <Bell size={20} cursor="pointer" onClick={() => setNotifOpen(!notifOpen)} />
              <NotificationsPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px', cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 600, 
                    color: 'var(--color-text)',
                    lineHeight: '1.2'
                  }}>
                    {getFullName()}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'var(--color-gray)',
                    fontWeight: 500
                  }}>
                    Administrateur
                  </span>
                </div>
                
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <User size={18} />
                </div>
              </div>

              {accountDropdownOpen && (
                <AccountDropdown
                  etablissementId={etablissementId}
                  onClose={() => setAccountDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        <main className="page-main-content" style={{ 
          padding: '32px',
          minHeight: 'calc(100vh - 60px)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'bold', 
            marginBottom: '32px',
            color: 'var(--color-text)'
          }}>
            {getPageTitle()}
          </h2>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AccountDropdown = ({ etablissementId, onClose }: { etablissementId?: string; onClose: () => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    });
  }, []);

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 'calc(100% + 8px)',
      width: '280px',
      backgroundColor: 'var(--color-white)',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid var(--color-border)',
      zIndex: 200,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          {getFullName()}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray)', marginTop: '4px', wordBreak: 'break-all' }}>
          {email || '...'}
        </div>
      </div>

      <div
        onClick={() => {
          onClose();
          navigate('/profil');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text)',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gray-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <User size={18} style={{ color: 'var(--color-gray)' }} />
        <span>Compte</span>
      </div>

      <div
        onClick={() => {
          onClose();
          clearToken();
          supabase.auth.signOut();
          navigate('/login');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-danger)',
          borderTop: '1px solid var(--color-border)',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <LogOut size={18} />
        <span>Se déconnecter</span>
      </div>
    </div>
  );
};

const SectionTitle = ({ label }: { label: string }) => (
  <div style={{ padding: '0 24px 0 16px' }}>
    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </div>
);

export default Layout;

