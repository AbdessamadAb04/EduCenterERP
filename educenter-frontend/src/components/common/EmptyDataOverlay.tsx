import React from "react";

const styleId = "empty-data-overlay-keyframes";

const EmptyDataOverlay: React.FC<{ topOffset?: string }> = ({ topOffset }) => {
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes emptyFade {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div style={{
      position: "absolute",
      top: topOffset || 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      pointerEvents: "none",
      animation: "emptyFade 0.3s ease-out forwards"
    }}>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)",
        padding: "10px 18px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--color-gray)",
        border: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, flexShrink: 0 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 3" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="13" y2="13" />
        </svg>
        Aucune donnée enregistrée
      </div>
    </div>
  );
};

export default EmptyDataOverlay;