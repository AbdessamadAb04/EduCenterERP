import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MetricCard from "../../components/common/MetricCard";
import DataTable, { type Column } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import WhatsAppButton from "../../components/common/WhatsAppButton";
import EmptyDataOverlay from "../../components/common/EmptyDataOverlay";
import { dashboardService, type DashboardStats, type DashboardStudent, type DashboardPayment, type DashboardClass } from "../../api/apiService";
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

const SHORT_MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface ChartDatum {
  name: string;
  value: number;
}

interface OverdueChartDatum {
  name: string;
  compare: number;
  value: number;
}

function parseDateValue(value?: string | null): number {
  if (!value) return NaN;
  const normalized = value.length === 10 ? `${value}T00:00:00` : value;
  return new Date(normalized).getTime();
}

function buildEnrollmentSeries(students: DashboardStudent[]): ChartDatum[] {
  const now = new Date();
  const result: ChartDatum[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = students
      .map(s => parseDateValue(s.enrollment_date ?? s.created_at))
      .filter((t): t is number => !Number.isNaN(t))
      .filter(t => t >= monthStart.getTime() && t < monthEnd.getTime())
      .length;
    result.push({ name: SHORT_MONTHS_FR[monthStart.getMonth()], value: count });
  }
  return result;
}

function buildRevenueSeries(payments: DashboardPayment[]): ChartDatum[] {
  const now = new Date();
  const result: ChartDatum[] = [];
  let cumulative = 0;
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPaid = payments
      .filter(p => p.status === 'PAID' && p.payment_date)
      .filter(p => {
        const pd = new Date(p.payment_date + 'T00:00:00');
        return pd.getMonth() === monthStart.getMonth() && pd.getFullYear() === monthStart.getFullYear();
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    cumulative += monthPaid;
    result.push({ name: SHORT_MONTHS_FR[monthStart.getMonth()], value: cumulative });
  }
  return result;
}

function buildOverdueSeries(payments: DashboardPayment[]): OverdueChartDatum[] {
  const now = new Date();
  const result: OverdueChartDatum[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inMonth = (dateStr?: string | null) => {
      if (!dateStr) return false;
      const d = new Date(dateStr + 'T00:00:00');
      return d.getMonth() === monthStart.getMonth() && d.getFullYear() === monthStart.getFullYear();
    };
    const paid = payments
      .filter(p => p.status === 'PAID' && inMonth(p.payment_date))
      .length;
    const overdue = payments
      .filter(p => p.status === 'PENDING' && (p.days_late ?? 0) > 0 && inMonth(p.due_date))
      .length;
    result.push({ name: SHORT_MONTHS_FR[monthStart.getMonth()], compare: paid, value: overdue });
  }
  return result;
}

function buildClassesSeries(classes: DashboardClass[], students: DashboardStudent[]): ChartDatum[] {
  return classes
    .filter(c => c.status === 'ACTIVE')
    .map(c => ({
      name: c.name,
      value: students.filter(s => s.classe_id === c.id && s.status === 'ACTIVE').length,
    }))
    .filter(d => d.value > 0);
}

type MetricKey = "students" | "revenue" | "overdue" | "classes";

interface DashboardRow {
  name?: string;
  class?: string;
  status?: string;
  student?: string;
  amount?: number;
  method?: string;
  daysLate?: number;
  phone?: string;
  date?: string;
  level?: string;
  students?: number;
}

const columnDefs: Record<MetricKey, Column<DashboardRow>[]> = {
  students: [
    { header: "Nom", key: "name" },
    { header: "Classe", key: "class" },
    { header: "Statut", key: "status", render: (row) => <StatusBadge status={row.status ?? ''} /> },
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
      render: (row) => <WhatsAppButton phone={row.phone ?? ''} studentName={row.name ?? ''} amount={row.amount ?? 0} dueDate={row.date ?? ''} />
    },
  ],
  classes: [
    { header: "Classe", key: "name" },
    { header: "Niveau", key: "level" },
    { header: "Étudiants", key: "students", render: (row) => <span style={{ fontWeight: 600 }}>{row.students} inscrits</span> },
  ]
};

const CLASSES_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const base = `/mes-etablissements/etablissement/${etablissementId}`;
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>("students");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!etablissementId) return;
    let cancelled = false;
    dashboardService.getStats(etablissementId)
      .then((data) => {
        if (cancelled) return;
        setStats(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [etablissementId]);

  const activeStudentsCount = stats?.activeStudents ?? 0;
  const activeClassesCount = stats?.activeClasses ?? 0;
  const monthRevenue = stats?.monthRevenue ?? 0;
  const overduePaymentsCount = stats?.overduePayments ?? 0;
  const overdueAmount = stats?.overdueAmount ?? 0;
  const allStudents = stats?.students ?? [];
  const allPayments = stats?.payments ?? [];
  const allClasses = stats?.classes ?? [];

  const activeData = allStudents.filter(s => s.status === 'ACTIVE').slice(0, 5).map(s => ({ name: s.full_name, class: s.classes?.name ?? '', status: s.status }));
  const paidData = allPayments.filter(p => p.status === 'PAID').slice(0, 5).map(p => ({ student: p.students?.full_name || '', amount: p.amount, method: p.method }));
  const overdueData = allPayments.filter(p => p.status === 'PENDING' && (p.days_late ?? 0) > 0).slice(0, 5).map(p => ({ name: p.students?.full_name || '', daysLate: p.days_late ?? 0, amount: p.amount, phone: p.students?.phone || '', date: p.due_date }));
  const classData = allClasses.filter(c => c.status === 'ACTIVE').slice(0, 5).map(c => ({
    name: c.name,
    level: c.level,
    students: allStudents.filter(s => s.classe_id === c.id && s.status === 'ACTIVE').length,
  }));

  const enrollmentChartData = buildEnrollmentSeries(allStudents);
  const revenueChartData = buildRevenueSeries(allPayments);
  const overdueChartData = buildOverdueSeries(allPayments);
  const classesChartData = buildClassesSeries(allClasses, allStudents);

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
      case "students": return "Inscriptions sur 6 mois";
      case "revenue": return "Revenus cumulés par période";
      case "overdue": return "Effectués vs En retard (nb paiements)";
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

  const chartHasData = activeMetric === "students" ? enrollmentChartData.some(d => d.value > 0)
    : activeMetric === "revenue" ? revenueChartData.some(d => d.value > 0)
    : activeMetric === "overdue" ? overdueChartData.some(d => d.compare > 0 || d.value > 0)
    : classesChartData.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", paddingBottom: "40px" }}>
      <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "0px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", gap: "24px", width: "100%" }}>
        <MetricCard
          label="Total Étudiants"
          value={loading ? "..." : String(allStudents.length)}
          color="dark"
          sub={`${activeStudentsCount} actif(s)`}
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
          <div style={{ flex: 1, backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "0px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "4px", textTransform: "capitalize" }}>
              {getChartTitle()}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-gray)" }}>
              {getChartSubtitle()}
            </p>
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
            {!chartHasData && <EmptyDataOverlay />}
            {activeMetric === "classes" ? (
              <div style={{ display: "flex", width: "100%", height: "100%", gap: "16px" }}>
                <div style={{ width: "60%", height: "100%", position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%" key="pie">
                    <PieChart>
                      <Pie
                        data={classesChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        dataKey="value"
                        stroke="white"
                        strokeWidth={2}
                        labelLine={false}
                      >
                        {classesChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CLASSES_COLORS[index % CLASSES_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: "40%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", overflowY: "auto" }}>
                  {classesChartData.map((d, index) => (
                    <div key={`legend-${index}`} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: CLASSES_COLORS[index % CLASSES_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "13px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>{d.value} actif(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" key={activeMetric}>
                {activeMetric === "overdue" ? (
                  <BarChart data={overdueChartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={50} tickCount={7} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                    <Bar name="Effectués" dataKey="compare" fill="var(--color-success)" radius={[0, 0, 0, 0]} barSize={16} />
                    <Bar name="En retard" dataKey="value" fill="var(--color-danger)" radius={[0, 0, 0, 0]} barSize={16} />
                  </BarChart>
                ) : activeMetric === "students" ? (
                  <BarChart data={enrollmentChartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={50} tickCount={7} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                    <Bar dataKey="value" fill={getChartFillColor()} radius={[0, 0, 0, 0]} barSize={32} />
                  </BarChart>
                ) : (
                  <AreaChart data={revenueChartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartFillColor()} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={getChartFillColor()} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={50} tickCount={7} />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} itemStyle={{ fontWeight: 600, color: getChartFillColor() }} />
                    <Area type="linear" dataKey="value" stroke={getChartFillColor()} strokeWidth={2} fillOpacity={1} fill="url(#metricGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "35%" }}>
        <div style={{ flex: 1, backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "0px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
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
