import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, LogOut } from 'lucide-react';
import { getFullName, clearToken } from '../../utils/auth';
import { supabase } from '../../lib/supabaseClient';

interface TopBarProps {
  userName?: string;
  showEtablissementLink?: boolean;
}

const AccountDropdown = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
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

const formatDateTime = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}`;
};

const TopBar: React.FC<TopBarProps> = ({ userName: userNameProp, showEtablissementLink }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = userNameProp ?? getFullName();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: '60px',
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 90,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showEtablissementLink && (
          <button
            onClick={() => navigate('/mes-etablissements')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              backgroundColor: 'var(--color-gray-bg)', color: 'var(--color-text-secondary)',
              fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gray-bg)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <Building2 size={16} />
            Mes établissements
          </button>
        )}
      </div>

      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        color: 'var(--color-gray)',
        backgroundColor: 'var(--color-gray-bg)',
        padding: '6px 16px',
        borderRadius: '20px',
      }}>
        {formatDateTime(currentTime)}
      </div>

      <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--color-gray)' }}>
        <div
          onClick={() => setAccountDropdownOpen((prev) => !prev)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px', cursor: 'pointer', transition: 'opacity 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: '1.2' }}>
              {displayName.length > 12 ? displayName.slice(0, 12) + '...' : displayName}
            </span>
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <User size={18} />
          </div>
        </div>

        {accountDropdownOpen && (
          <AccountDropdown onClose={() => setAccountDropdownOpen(false)} />
        )}
      </div>
    </header>
  );
};

export default TopBar;
