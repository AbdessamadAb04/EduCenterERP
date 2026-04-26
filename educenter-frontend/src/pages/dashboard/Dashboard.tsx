import React from "react";
import MetricCard from "../../components/common/MetricCard";
import DataTable, { type Column } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import WhatsAppButton from "../../components/common/WhatsAppButton";
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
  BookOpen 
} from "lucide-react";


const overduePayments = [
  { id: 101, name: 'Karim Idrissi', amount: 450, date: '26 mars 2026', phone: '0661234567' },
  { id: 102, name: 'Sara Benali', amount: 300, date: '19 mars 2026', phone: '0667654321' },
  { id: 103, name: 'Nadia Ouali', amount: 600, date: '28 mars 2026', phone: '0660123456' },
];
const chartDataSets = {
  students: [
    { name: 'Jan', value: 35 }, { name: 'Fév', value: 42 }, { name: 'Mar', value: 50 }, 
    { name: 'Avr', value: 45 }, { name: 'Mai', value: 60 }, { name: 'Juin', value: 55 },
    { name: 'Juil', value: 48 }, { name: 'Août', value: 52 }, { name: 'Sep', value: 65 },
    { name: 'Oct', value: 70 }, { name: 'Nov', value: 68 }, { name: 'Déc', value: 75 },
    { name: '12 Mar', value: 6 }, { name: '13 Mar', value: 4 }, { name: '14 Mar', value: 8 },
    { name: '15 Mar', value: 5 }, { name: '16 Mar', value: 9 }, { name: '17 Mar', value: 7 },
    { name: '18 Mar', value: 6 }, { name: '19 Mar', value: 10 }, { name: '20 Mar', value: 8 },
    { name: '21 Mar', value: 4 }, { name: '22 Mar', value: 3 }, { name: '23 Mar', value: 5 },
    { name: '24 Mar', value: 9 }, { name: '25 Mar', value: 4 }, { name: '26 Mar', value: 7 }, 
    { name: '27 Mar', value: 5 }, { name: '28 Mar', value: 8 }, { name: '29 Mar', value: 6 }, 
    { name: '30 Mar', value: 4 }, { name: '31 Mar', value: 9 }
  ],
  revenue: [
    { name: 'Jan', value: 12400 }, { name: 'Fév', value: 15600 }, 
    { name: 'Mar', value: 13200 }, { name: 'Avr', value: 18400 },
    { name: 'Mai', value: 14000 }, { name: 'Juin', value: 16500 },
    { name: 'Juil', value: 15200 }, { name: 'Août', value: 17800 },
    { name: 'Sep', value: 16200 }, { name: 'Oct', value: 19100 },
    { name: 'Nov', value: 18500 }, { name: 'Déc', value: 21000 },
    { name: '12 Mar', value: 1100 }, { name: '13 Mar', value: 1500 }, { name: '14 Mar', value: 1800 },
    { name: '15 Mar', value: 1400 }, { name: '16 Mar', value: 1900 }, { name: '17 Mar', value: 1700 },
    { name: '18 Mar', value: 1600 }, { name: '19 Mar', value: 2000 }, { name: '20 Mar', value: 1800 },
    { name: '21 Mar', value: 1200 }, { name: '22 Mar', value: 1000 }, { name: '23 Mar', value: 1400 },
    { name: '24 Mar', value: 1900 }, { name: '25 Mar', value: 1200 }, { name: '26 Mar', value: 1400 }, 
    { name: '27 Mar', value: 1100 }, { name: '28 Mar', value: 1600 }, { name: '29 Mar', value: 1300 }, 
    { name: '30 Mar', value: 1500 }, { name: '31 Mar', value: 1700 }
  ],
  overdue: [
    { name: 'Jan', value: 1200, compare: 8500 }, { name: 'Fév', value: 800, compare: 9200 }, { name: 'Mar', value: 1500, compare: 10500 }, 
    { name: 'Avr', value: 1100, compare: 11200 }, { name: 'Mai', value: 900, compare: 12100 }, { name: 'Juin', value: 1300, compare: 13400 },
    { name: 'Juil', value: 1000, compare: 12800 }, { name: 'Août', value: 1400, compare: 14500 }, { name: 'Sep', value: 1200, compare: 13900 },
    { name: 'Oct', value: 1600, compare: 15200 }, { name: 'Nov', value: 1100, compare: 16800 }, { name: 'Déc', value: 900, compare: 18500 },
    { name: '12 Mar', value: 500, compare: 2100 }, { name: '13 Mar', value: 700, compare: 1800 }, { name: '14 Mar', value: 900, compare: 2500 },
    { name: '15 Mar', value: 1100, compare: 1900 }, { name: '16 Mar', value: 1300, compare: 2400 }, { name: '17 Mar', value: 1000, compare: 2200 },
    { name: '18 Mar', value: 800, compare: 2600 }, { name: '19 Mar', value: 1200, compare: 2100 }, { name: '20 Mar', value: 1500, compare: 2800 },
    { name: '21 Mar', value: 1100, compare: 1900 }, { name: '22 Mar', value: 900, compare: 1500 }, { name: '23 Mar', value: 1300, compare: 2200 },
    { name: '24 Mar', value: 1000, compare: 2600 }, { name: '25 Mar', value: 400, compare: 2900 }, { name: '26 Mar', value: 800, compare: 2400 }, 
    { name: '27 Mar', value: 1200, compare: 2100 }, { name: '28 Mar', value: 1500, compare: 2300 }, { name: '29 Mar', value: 900, compare: 2700 }, 
    { name: '30 Mar', value: 600, compare: 2900 }, { name: '31 Mar', value: 300, compare: 3200 }
  ],
  classes: [
    { name: 'Anglais A1', value: 42 }, { name: 'Anglais B2', value: 38 }, 
    { name: 'Français A1', value: 25 }, { name: 'Français B1', value: 31 },
    { name: 'Allemand B1', value: 18 }, { name: 'Espagnol A2', value: 12 }
  ]
};

const dataSets = {
  students: [
    { id: 1, name: "Karim Idrissi", class: "Anglais B2", date: "28 mars 2026", status: "ACTIVE" },
    { id: 2, name: "Sara Benali", class: "Français A1", date: "25 mars 2026", status: "ON_HOLD" },
    { id: 3, name: "Nadia Ouali", class: "Allemand B1", date: "20 mars 2026", status: "ACTIVE" },
    { id: 4, name: "Youssef Ait B.", class: "Anglais B2", date: "15 mars 2026", status: "ACTIVE" },
    { id: 5, name: "Ahmed Mansouri", class: "Français B1", date: "12 mars 2026", status: "ACTIVE" },
    { id: 6, name: "Fatima Zahra", class: "Espagnol A2", date: "10 mars 2026", status: "ACTIVE" },
  ],
  revenue: [
    { id: 201, student: "Omar Zaid", amount: 1500, date: "2026-03-29", method: "Cash" },
    { id: 202, student: "Laila Amrani", amount: 850, date: "28 mars 2026", method: "Transfert" },
    { id: 203, student: "Mehdi Ben S.", amount: 1200, date: "2026-03-27", method: "Cash" },
    { id: 204, student: "Sanaa M.", amount: 900, date: "2026-03-26", method: "Cash" },
    { id: 205, student: "Hassan B.", amount: 2100, date: "2026-03-25", method: "Transfert" },
    { id: 206, student: "Rim Alaoui", amount: 750, date: "2026-03-24", method: "Cash" },
  ],
  overdue: [
    { id: 101, name: "Karim Idrissi", amount: 450, daysLate: 5, date: "2026-03-26", phone: "0661234567" },
    { id: 102, name: "Sara Benali", amount: 300, daysLate: 12, date: "2026-03-19", phone: "0667654321" },
    { id: 103, name: "Nadia Ouali", amount: 600, daysLate: 3, date: "28 mars 2026", phone: "0660123456" },
    { id: 104, name: "Yassine S.", amount: 850, daysLate: 7, date: "2026-03-24", phone: "0661112233" },
    { id: 105, name: "Zineb B.", amount: 1200, daysLate: 15, date: "2026-03-16", phone: "0664445566" },
    { id: 106, name: "Othmane L.", amount: 950, daysLate: 21, date: "2026-03-10", phone: "0669998877" },
  ],
  classes: [
    { id: 401, name: "Anglais B2 (Soir)", level: "B2", students: 12, schedule: "Soir" },
    { id: 402, name: "Français A1 (Matin)", level: "A1", students: 8, schedule: "Matin" },
    { id: 403, name: "Allemand B1 (Samedi)", level: "B1", students: 15, schedule: "Weekend" },
    { id: 404, name: "Anglais A1 (Soir)", level: "A1", students: 10, schedule: "Soir" },
    { id: 405, name: "Espagnol A2 (Soir)", level: "A2", students: 9, schedule: "Soir" },
    { id: 406, name: "Français B1 (Matin)", level: "B1", students: 6, schedule: "Matin" },
    { id: 402, name: "Français A1 (Matin)", level: "A1", students: 8, schedule: "Matin" },
    { id: 403, name: "Allemand B1 (Nuit)", level: "B1", students: 6, schedule: "Nuit" },
    { id: 404, name: "Anglais A1 (Matin)", level: "A1", students: 15, schedule: "Matin" },
  ]
};

const overdueColumns: Column<any>[] = [
  { header: 'Étudiant', key: 'name' },
  { header: 'Montant', key: 'amount', render: (row) => <b style={{color: 'var(--color-danger)'}}>{row.amount} MAD</b> },
  { header: 'Date', key: 'date' },
  { header: 'WhatsApp', key: 'whatsapp', render: (row) => (row.isEmpty ? '' : <WhatsAppButton phone={row.phone} studentName={row.name} amount={row.amount} dueDate={row.date} />) }
];
const columnDefs: Record<string, Column<any>[]> = {
  students: [
    { header: "Nom", key: "name" },
    { header: "Classe", key: "class" },
    { header: "Statut", key: "status", render: (row) => <StatusBadge status={row.status} /> },
  ],
  revenue: [
    { header: "Étudiant", key: "student" },
    { header: "Montant", key: "amount", render: (row) => <b style={{color: "var(--color-success)"}}>{row.amount} MAD</b> },
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

const formatYAxis = (value: number) => {
  if (value === 0) return "";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

type TimeScope = "12months" | "6months" | "15days";

const Dashboard: React.FC = () => {
  const [activeMetric, setActiveMetric] = React.useState<"students" | "revenue" | "overdue" | "classes">("students");
  const [timeScope, setTimeScope] = React.useState<TimeScope>("15days");

  const getFilteredData = () => {
    // Return classes data directly as it's a distribution pie chart
    if (activeMetric === "classes") return chartDataSets.classes;

    const data = chartDataSets[activeMetric as keyof typeof chartDataSets] || [];
    
    switch (timeScope) {
      case "12months":
        // First 12 items are monthly data
        return data.filter(d => ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].includes(d.name));
      case "6months":
        // Last 6 months from the monthly range
        return data.filter(d => ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].includes(d.name));
      case "15days":
        // Last 15 days specifically
        return data.slice(-15);
      default:
        return data;
    }
  };

  const currentData = getFilteredData();

  const getMetricColor = () => {
    switch(activeMetric) {
      case "revenue": return "#059669"; // Darker Emerald
      case "overdue": return "#ef4444"; // Red/Danger
      case "classes": return "#1d4ed8"; // Darker Blue
      default: return "var(--color-dark-gray)"; // Dark gray for student text
    }
  };

  const formatXAxis = (tickItem: string, index: number) => {
    if (timeScope === "15days") {
      // Show every 2nd day, starting from the first one
      return (index % 2 === 0) ? tickItem : "";
    }
    return tickItem;
  };

  const getChartFillColor = () => {
    switch(activeMetric) {
      case "revenue": return "#059669";
      case "overdue": return "#ef4444";
      case "classes": return "#1d4ed8";
      default: return "#059669"; // Slightly lighter green for student graph
    }
  };

  const isSixMonthView = timeScope === "6months";

  const CLASSES_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", gap: "24px", width: "100%" }}>
        <MetricCard 
          label="Total Étudiants Actifs" 
          value="142" 
          color="dark" 
          active={activeMetric === "students"} 
          onClick={() => setActiveMetric("students")} 
          sub="+3 ce mois" 
          icon={<Users size={32} strokeWidth={2} />}
        />
        <MetricCard 
          label="Revenus du Mois (MAD)" 
          value="24 500" 
          color="success" 
          active={activeMetric === "revenue"} 
          onClick={() => setActiveMetric("revenue")} 
          sub="Objectif: 30k" 
          icon={<TrendingUp size={32} strokeWidth={2} />}
        />
        <MetricCard 
          label="Paiements en retard" 
          value="3" 
          color="danger" 
          active={activeMetric === "overdue"} 
          onClick={() => setActiveMetric("overdue")} 
          sub="1 350 MAD" 
          icon={<AlertCircle size={32} strokeWidth={2} />}
        />
        <MetricCard 
          label="Classes Actives" 
          value="18" 
          color="info" 
          active={activeMetric === "classes"} 
          onClick={() => setActiveMetric("classes")} 
          sub="6 Langues" 
          icon={<BookOpen size={32} strokeWidth={2} />}
        />
      </div>

      <div style={{ display: "flex", gap: "24px", width: "100%", alignItems: "stretch", height: "450px" }}>
        <div style={{ width: "65%", flex: "none", backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "4px", textTransform: "capitalize" }}>
              {activeMetric === "students" ? "Évolution des Inscriptions" : 
               activeMetric === "revenue" ? "Flux des Revenus" : 
               activeMetric === "overdue" ? "Comparaison des Paiements" : "Distribution des Classes"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-gray)" }}>
              {activeMetric === "students" ? "Inscriptions hebdomadaires" : 
               activeMetric === "revenue" ? "Revenus cumulés par période" : 
               activeMetric === "overdue" ? "Effectués vs En retard (MAD)" : "Nombre d'étudiants par niveau/classe"}
            </p>
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0, position: "relative" }}>
            {activeMetric === "classes" ? (
              <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center" }}>
                <div style={{ flex: "0 0 35%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataSets.classes}
                        cx="50%"
                        cy="50%"
                        outerRadius="100%"
                        dataKey="value"
                        stroke="white"
                        strokeWidth={2}
                        labelLine={false}
                      >
                        {chartDataSets.classes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CLASSES_COLORS[index % CLASSES_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ 
                  flex: "0 0 60%",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "10px", 
                  padding: "20px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  borderRadius: "12px",
                  maxHeight: "90%",
                  overflowY: "auto",
                  marginLeft: "auto"
                }}>
                  {chartDataSets.classes.map((item, index) => {
                    const total = chartDataSets.classes.reduce((sum, curr) => sum + curr.value, 0);
                    const percent = ((item.value / total) * 100).toFixed(0);
                    return (
                      <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ 
                            width: "12px", 
                            height: "12px", 
                            borderRadius: "3px", 
                            backgroundColor: CLASSES_COLORS[index % CLASSES_COLORS.length],
                            flexShrink: 0 
                          }}></div>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-gray-dark)", whiteSpace: "nowrap" }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: "14px", color: "var(--color-gray)", marginLeft: "auto", fontWeight: 700 }}>
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {activeMetric === "overdue" ? (
                  <BarChart data={currentData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatXAxis}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatYAxis} 
                      width={40} 
                      tickCount={7}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                    <Bar name="Effectués" dataKey="compare" fill="var(--color-success)" radius={[0, 0, 0, 0]} barSize={isSixMonthView ? 32 : 16} />
                    <Bar name="En retard" dataKey="value" fill="var(--color-danger)" radius={[0, 0, 0, 0]} barSize={isSixMonthView ? 32 : 16} />
                  </BarChart>
                ) : activeMetric === "students" ? (
                  <BarChart data={currentData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatXAxis}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatYAxis} 
                      width={40} 
                      tickCount={7}
                    />
                    <Tooltip contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }} />
                    <Bar dataKey="value" fill={getChartFillColor()} radius={[0, 0, 0, 0]} barSize={isSixMonthView ? 64 : 32} />
                  </BarChart>
                ) : (
                  <AreaChart data={currentData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatXAxis}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatYAxis} 
                      width={40} 
                      tickCount={7}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "0px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}
                      itemStyle={{ fontWeight: 600, color: getMetricColor() }}
                    />
                    <Area 
                      type="linear" 
                      dataKey="value" 
                      stroke={getMetricColor()} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#metricGradient)" 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          
          {activeMetric !== "classes" && (
            <div style={{ 
              marginTop: "32px", 
              display: "flex", 
              gap: "12px", 
              padding: "6px", 
              backgroundColor: "rgba(0,0,0,0.03)", 
              borderRadius: "10px",
              width: "fit-content",
              alignSelf: "center"
            }}>
              {[
                { id: "12months", label: "12 derniers mois" },
                { id: "6months", label: "6 derniers mois" },
                { id: "15days", label: "15 derniers jours" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTimeScope(item.id as TimeScope)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: timeScope === item.id ? "var(--color-white)" : "transparent",
                    color: timeScope === item.id ? "var(--color-text-primary)" : "var(--color-gray)",
                    fontSize: "13px",
                    fontWeight: timeScope === item.id ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: timeScope === item.id ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "35%", height: "auto" }}>
          <div style={{ flex: 1, backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "var(--text-lg)" }}>
                {activeMetric === "students" ? "Dernières Inscriptions" : 
                 activeMetric === "revenue" ? "Paiements Réussis" : 
                 activeMetric === "overdue" ? "Retards Critiques" : "Classes les plus actives"}
              </h3>
            </div>
            <div style={{ flex: 1 }}>
              <DataTable 
                columns={columnDefs[activeMetric]} 
                data={[
                  ...dataSets[activeMetric].map(item => ({ ...item, isEmpty: false })),
                  ...Array(Math.max(0, 5 - dataSets[activeMetric].length))
                    .fill(null)
                    .map((_, i) => ({ id: `empty-${i}`, isEmpty: true }))
                ].slice(0, 5)}
                noBorderRadius
              />
            </div>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", paddingTop: "16px" }}>
              <button
                onClick={() => {
                  const routes = {
                    students: "/students",
                    revenue: "/finance",
                    overdue: "/finance",
                    classes: "/classes"
                  };
                  window.location.href = routes[activeMetric];
                }}
                className="hover-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  color: "var(--color-gray)",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-gray)";
                }}
              >
                Voir tout <span style={{ fontSize: "18px" }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





