import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MetricCard from "../../components/common/MetricCard";
import DataTable, { type Column } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import WhatsAppButton from "../../components/common/WhatsAppButton";
import EmptyDataOverlay from "../../components/common/EmptyDataOverlay";
import { dashboardService } from "../../api/supabaseService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Users,
  TrendingUp,
  AlertCircle,
  BookOpen,
  CreditCard,
  Plus
} from "lucide-react";

const emptyData: { name: string; value: number }[] = [];

const columnDefs: Record<string, Column<any>[]> = {
  students: [
    { header: "Nom", key: "name" },
    { header: "Classe", key: "class" },
    { header: "Statut", key: "status", render: (row) => <StatusBadge status={row.status} /> },
  ],
  revenue: [
    { header: "Étudiant", key: "student" },
    { header: "Montant", key: "amount", render: (row) => <b style={{ color: "var(--color-success)" }}>{row.amount} MAD</b> },
    { header: "Mode", key: "method" },
  ],
  overdue: [
    { header: "Étudiant", key: "name" },
    { header: "Retard", key: "daysLate", render: (row) => <span style={{ color: "var(--color-danger)", fontWeight: 600 }}>{row.daysLate}j</span> },
    {
      header: "WhatsApp",
      key: "action",
      render: (row) => <WhatsAppButton phone={row.phone} studentName={row.name} amount={row.amount} dueDate={row.date} />
    },
  ],
  classes: [
    { header: "Classe", key: "name" },
    { header: "Niveau", key: "level" },
    { header: "Étudiants", key: "students", render: (row) => <span style={{ fontWeight: 600 }}>{row.students} inscrits</span> },
  ]
};

const CLASSES_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

type MetricKey = "students" | "revenue" | "overdue" | "classes";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const base = `/mes-etablissements/etablissement/${etablissementId}`;
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>("students");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!etablissementId) return;
    setLoading(true);
    dashboardService.getStats(etablissementId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [etablissementId]);

  const activeStudentsCount = stats?.activeStudents ?? 0;
  const activeClassesCount = stats?.activeClasses ?? 0;
  const monthRevenue = stats?.monthRevenue ?? 0;
  const overduePaymentsCount = stats?.overduePayments ?? 0;
  const overdueAmount = stats?.overdueAmount ?? 0;
  const allStudents = stats?.students ?? [];
  const allPayments = stats?.payments ?? [];
  const allClasses = stats?.classes ?? [];

  const activeData = allStudents.filter((s: any) => s.status === 'ACTIVE').slice(0, 5).map((s: any) => ({ name: s.full_name, class: s.classe_id || '', status: s.status }));
  const paidData = allPayments.filter((p: any) => p.status === 'PAID').slice(0, 5).map((p: any) => ({ student: p.students?.full_name || '', amount: p.amount, method: p.method }));
  const overdueData = allPayments.filter((p: any) => p.status === 'PENDING' && p.daysLate > 0).slice(0, 5).map((p: any) => ({ name: p.students?.full_name || '', daysLate: p.daysLate, amount: p.amount, phone: p.students?.phone || '', date: p.due_date }));
  const classData = allClasses.filter((c: any) => c.status === 'ACTIVE').slice(0, 5).map((c: any) => ({ name: c.name, level: c.level, students: 0 }));

  const getChartTitle = () => {
    switch (activeMetric) {
      case "students": return "Évolution des Inscriptions";
      case "revenue": return "Flux des Revenus";
      case "overdue": return "Comparaison des Paiements";
      case "classes": return "Distribution des Classes";
    }
  };

  const getChartSubtitle = () => {
    switch (activeMetric) {
      case "students": return "Inscriptions hebdomadaires";
      case "revenue": return "Revenus cumulés par période";
      case "overdue": return "Effectués vs En retard (MAD)";
      case "classes": return "Nombre d'étudiants par niveau/classe";
    }
  };

  const getTableTitle = () => {
    switch (activeMetric) {
      case "students": return "Dernières Inscriptions";
      case "revenue": return "Paiements Réussis";
      case "overdue": return "Retards Critiques";
      case "classes": return "Classes les plus actives";
    }
  };

  const getChartFillColor = () => {
    switch (activeMetric) {
      case "revenue": return "#059669";
      case "overdue": return "#ef4444";
      case "classes": return "#1d4ed8";
      default: return "#059669";
    }
  };

  const currentTableData = activeMetric === "students" ? activeData
    : activeMetric === "revenue" ? paidData
    : activeMetric === "overdue" ? overdueData
    : classData;

  const chartHasData = activeMetric === "students" ? allStudents.length > 0
    : activeMetric === "revenue" ? allPayments.length > 0
    : activeMetric === "overdue" ? allPayments.length > 0
    : allClasses.length > 0;

  const hasChartData = chartHasData;

  const EmptyOverlay = () => <EmptyDataOverlay />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", gap: "24px", width: "100%" }}>
        <MetricCard
          label="Total Étudiants Actifs"
          value={loading ? "..." : String(activeStudentsCount)}
          color="dark"
          sub={`${allStudents.filter((s: any) => s.status === 'ON_HOLD').length} en attente`}
          icon={<Users size={32} strokeWidth={2} />}
          onClick={() => setActiveMetric("students")}
          active={activeMetric === "students"}
        />
        <MetricCard
          label="Revenus du Mois (MAD)"
          value={loading ? "..." : monthRevenue.toLocaleString()}
          color="success"
          sub={`${allPayments.length} paiements`}
          icon={<TrendingUp size={32} strokeWidth={2} />}
          onClick={() => setActiveMetric("revenue")}
          active={activeMetric === "revenue"}
        />
        <MetricCard
          label="Paiements en retard"
          value={loading ? "..." : String(overduePaymentsCount)}
          color="danger"
          sub={`${overdueAmount.toLocaleString()} MAD`}
          icon={<AlertCircle size={32} strokeWidth={2} />}
          onClick={() => setActiveMetric("overdue")}
          active={activeMetric === "overdue"}
        />
        <MetricCard
          label="Classes Actives"
          value={loading ? "..." : String(activeClassesCount)}
          color="info"
          sub={`${allClasses.length} Classe(s)`}
          icon={<BookOpen size={32} strokeWidth={2} />}
          onClick={() => setActiveMetric("classes")}
          active={activeMetric === "classes"}
        />
      </div>

      <div style={{ display: "flex", gap: "24px", width: "100%", alignItems: "stretch", height: "450px" }}>
        <div style={{ flex: 1, backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "4px", textTransform: "capitalize" }}>
              {getChartTitle()}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-gray)" }}>
              {getChartSubtitle()}
            </p>
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
            {!hasChartData && <EmptyOverlay />}
            {activeMetric === "classes" ? (
              <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%" key="pie">
                  <PieChart>
                    <Pie
                      data={emptyData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      dataKey="value"
                      stroke="white"
                      strokeWidth={2}
                      labelLine={false}
                    >
                      {emptyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CLASSES_COLORS[index % CLASSES_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" key={activeMetric}>
                {activeMetric === "overdue" ? (
                  <BarChart data={emptyData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} tickCount={7} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                    <Bar name="Effectués" dataKey="compare" fill="var(--color-success)" radius={[0, 0, 0, 0]} barSize={16} />
                    <Bar name="En retard" dataKey="value" fill="var(--color-danger)" radius={[0, 0, 0, 0]} barSize={16} />
                  </BarChart>
                ) : activeMetric === "students" ? (
                  <BarChart data={emptyData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} tickCount={7} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                    <Bar dataKey="value" fill={getChartFillColor()} radius={[0, 0, 0, 0]} barSize={32} />
                  </BarChart>
                ) : (
                  <AreaChart data={emptyData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartFillColor()} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={getChartFillColor()} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} tickCount={7} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} itemStyle={{ fontWeight: 600, color: getChartFillColor() }} />
                    <Area type="linear" dataKey="value" stroke={getChartFillColor()} strokeWidth={2} fillOpacity={1} fill="url(#metricGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "35%" }}>
          <div style={{ flex: 1, backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "var(--text-lg)" }}>
                {getTableTitle()}
              </h3>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <DataTable
                key={activeMetric}
                columns={columnDefs[activeMetric]}
                data={currentTableData}
                noBorderRadius
              />
            </div>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", paddingTop: "16px" }}>
              <button
                onClick={() => {
                  const routes: Record<MetricKey, string> = {
                    students: `${base}/students`,
                    revenue: `${base}/finance`,
                    overdue: `${base}/finance`,
                    classes: `${base}/classes`
                  };
                  navigate(routes[activeMetric]);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px",
                  backgroundColor: "transparent", color: "var(--color-gray)", border: "none",
                  borderRadius: "4px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-gray)"; }}
              >
                Voir tout <span style={{ fontSize: "18px" }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Actions Rapides</h3>
        <div style={{ display: "flex", gap: "24px" }}>
          <div
            onClick={() => navigate(`${base}/students?action=add`)}
            style={{
              flex: 1,
              backgroundColor: "var(--color-primary)",
              padding: "24px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Users size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "white", marginBottom: "4px" }}>
                Nouvel Étudiant
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>
                Ajouter un nouvel étudiant
              </div>
            </div>
            <div style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}>
              <Plus size={14} color="var(--color-primary)" strokeWidth={3} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${base}/finance?action=add`)}
            style={{
              flex: 1,
              backgroundColor: "var(--color-primary)",
              padding: "24px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <CreditCard size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "white", marginBottom: "4px" }}>
                Nouveau Paiement
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>
                Enregistrer un paiement
              </div>
            </div>
            <div style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}>
              <Plus size={14} color="var(--color-primary)" strokeWidth={3} />
            </div>
          </div>

          <div
            onClick={() => navigate(`${base}/classes?action=add`)}
            style={{
              flex: 1,
              backgroundColor: "var(--color-primary)",
              padding: "24px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <BookOpen size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "white", marginBottom: "4px" }}>
                Nouvelle Classe
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>
                Créer une nouvelle classe
              </div>
            </div>
            <div style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}>
              <Plus size={14} color="var(--color-primary)" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
