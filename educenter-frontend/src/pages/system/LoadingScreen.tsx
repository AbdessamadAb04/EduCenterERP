import React from 'react';

const LoadingScreen: React.FC = () => {
  const messages = ['Chargement en cours...', 'Connexion au serveur...', 'Préparation de votre espace...'];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', position: 'relative' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.2; transform: translateY(0);} 50% { opacity: 1; transform: translateY(-4px);} 100% { opacity: 0.2; transform: translateY(0);} }
        .loading-dots { display:flex; gap:8px; justify-content:center; margin-top:12px }
        .loading-dots span { width:8px; height:8px; border-radius:100%; background:white; display:inline-block; opacity:0.2 }
        .loading-dots span:nth-child(1){ animation: pulse 1s infinite; animation-delay: 0s }
        .loading-dots span:nth-child(2){ animation: pulse 1s infinite; animation-delay: 0.15s }
        .loading-dots span:nth-child(3){ animation: pulse 1s infinite; animation-delay: 0.3s }
        .fade-in { animation: fadeIn 0.3s ease both }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      <div style={{ textAlign: 'center', maxWidth: 380 }} className="fade-in">
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.15)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
          EC
        </div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>EduCenter</div>
        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>{messages[index]}</div>

        <div className="loading-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
        EduCenter v0.1
      </div>
    </div>
  );
};

export default LoadingScreen;
