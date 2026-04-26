import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
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
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const mainItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Paiements', path: '/finance', icon: <CreditCard size={20} /> },
    { name: 'Étudiants', path: '/students', icon: <Users size={20} /> },
    { name: 'Classes', path: '/classes', icon: <BookOpen size={20} /> },
  ];

  const secondaryItems = [
    { name: 'Aide & Support', path: '/support', icon: <HelpCircle size={20} /> },
    { name: 'Paramètres', path: '/settings', icon: <Settings size={20} /> },
  ];

  const NavItem = ({ item }: { item: any }) => (
    <NavLink
      key={item.path}
      to={item.path}
      style={({ isActive }) => {
        const location = useLocation();
        const isDashboardActive = (item.path === '/dashboard' && location.pathname === '/') || isActive;
        
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
      <div style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '12px'
      }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: 'var(--text-xl)',
          fontWeight: 'bold'
        }}>EduCenter</h1>
      </div>

      <nav style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mainItems.map((item) => <NavItem key={item.path} item={item} />)}
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {secondaryItems.map((item) => <NavItem key={item.path} item={item} />)}
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
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
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
    switch(location.pathname) {
      case '/dashboard': return 'Tableau de bord';
      case '/students': return 'Étudiants';
      case '/classes': return 'Classes';
      case '/finance': return 'Paiements';
      case '/settings': return 'Paramètres du Système';
      case '/support': return 'Aide & Support';
      case '/': return 'Tableau de bord';
      default: return 'EduCenter ERP';
    }
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
          {/* Institution Name */}
          <div style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 700, 
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            EduSpace Casablanca
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
            color: 'var(--color-gray)'
          }}>
            <Search size={20} cursor="pointer" />
            <Bell size={20} cursor="pointer" />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 600, 
                  color: 'var(--color-text)',
                  lineHeight: '1.2'
                }}>
                  Admin User
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
                cursor: 'pointer'
              }}>
                <User size={18} />
              </div>
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

export default Layout;

