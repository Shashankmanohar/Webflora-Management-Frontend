import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import {
  Banknote,
  Clock,
  Users,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/useInvoices";
import { useEmployees } from "@/hooks/useEmployees";
import { useClients } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useAllAttendance } from "@/hooks/useAttendance";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-xs font-bold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-[10px] font-semibold">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground uppercase">{entry.name}:</span>
            <span className="text-foreground">{formatFullCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  // Fetch real data from backend
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: allAttendance = [], isLoading: attendanceLoading } = useAllAttendance();

  const latestAttendance = [...allAttendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const safeFormat = (dateStr: string, formatStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatStr);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const collectedPayments = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const overduePayments = invoices
    .filter(inv => inv.status === "overdue")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const pendingInvoicesAmount = invoices
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const unInvoicedAmount = projects.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

  const totalPending = pendingInvoicesAmount + unInvoicedAmount;

  const activeProjectsCount = projects.filter(p => p.status === 'active' || p.status === 'In Progress').length;

  const currentYear = new Date().getFullYear();

  // Helper to get latest activity date for a project
  const getProjectLatestDate = (proj: any) => {
    const projInvoices = invoices.filter(inv => inv.projectId === proj.id);
    if (projInvoices.length > 0) {
      return new Date(Math.max(...projInvoices.map(inv => new Date(inv.date).getTime())));
    }
    return new Date(proj.startDate || proj.deadline || new Date());
  };

  // Generate monthly income data
  const monthlyIncomeData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
    const monthInvoicesFiltered = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === i && invDate.getFullYear() === currentYear;
    });
    const collected = monthInvoicesFiltered
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const pendingFromInvoices = monthInvoicesFiltered
      .filter(inv => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const pendingFromProjects = projects.filter(proj => {
      const latestDate = getProjectLatestDate(proj);
      return latestDate.getMonth() === i && latestDate.getFullYear() === currentYear;
    }).reduce((sum, proj) => sum + (proj.dueAmount || 0), 0);

    return { month, collected, pending: pendingFromInvoices + pendingFromProjects };
  });

  // Generate yearly income data
  const yearlyIncomeData = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(year => ({
    year: year.toString(),
    collected: invoices
      .filter(inv => new Date(inv.date).getFullYear() === year && inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0),
    pending: (
      invoices.filter(inv => new Date(inv.date).getFullYear() === year && (inv.status === "pending" || inv.status === "overdue"))
        .reduce((sum, inv) => sum + (inv.amount || 0), 0)
      + projects.filter(proj => getProjectLatestDate(proj).getFullYear() === year)
        .reduce((sum, proj) => sum + (proj.dueAmount || 0), 0)
    ),
  }));

  const paymentStatusData = [
    { name: "Collected", value: collectedPayments, color: "hsl(18, 100%, 48%)" },
    { name: "Pending", value: totalPending, color: "#20b959" },
    { name: "Overdue", value: overduePayments, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  const isLoading = invoicesLoading || employeesLoading || clientsLoading || projectsLoading || attendanceLoading;

  if (isLoading) {
    return (
      <div className="space-y-10">
        <PageHeader title="Command Center" subtitle="Preparing your operational dashboard..." />
        <div className="p-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[450px] rounded-[2rem]" />
            <Skeleton className="h-[450px] rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        title="Command Center"
        subtitle="Operational intelligence and financial performance"
        actions={
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
            <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold uppercase tracking-wider px-4">Export</Button>
            <Button size="sm" className="premium-gradient premium-glow rounded-lg text-xs font-bold uppercase tracking-wider px-4">Live Updates</Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change="+12.5% from last month"
          changeType="positive"
          icon={Banknote}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(collectedPayments)}
          change={`${totalRevenue > 0 ? ((collectedPayments / totalRevenue) * 100).toFixed(1) : "0.0"}% collection rate`}
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-success/10 border border-success/20 text-success"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(totalPending)}
          change={`${invoices.filter(i => i.status === 'overdue').length} overdue`}
          changeType="negative"
          icon={Clock}
        />
        <StatCard
          title="Total Clients"
          value={clients.length.toString()}
          change="Updated just now"
          changeType="neutral"
          icon={Users}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between border-primary/10 shadow-lg"
      >
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Jump directly into common management tasks</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="rounded-xl font-bold text-xs uppercase tracking-tight gap-2 premium-glow"
            onClick={() => navigate("/clients?create=true")}
          >
            <Users className="w-4 h-4" /> Add Client
          </Button>
          <Button
            className="rounded-xl font-bold text-xs uppercase tracking-tight gap-2 premium-glow"
            onClick={() => navigate("/projects?create=true")}
          >
            <FolderKanban className="w-4 h-4" /> New Project
          </Button>
          <Button
            className="rounded-xl font-bold text-xs uppercase tracking-tight gap-2 premium-glow"
            onClick={() => navigate("/invoices?create=true")}
          >
            <Banknote className="w-4 h-4" /> Generate Invoice
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 glass-card p-8 rounded-[2rem]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Financial Trajectory</h3>
              <p className="text-sm text-muted-foreground">Revenue streams over the current fiscal cycle</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
              <Button
                variant={activeTab === 'monthly' ? "secondary" : "ghost"}
                size="sm"
                className="text-xs h-8 px-4 font-bold"
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={activeTab === 'yearly' ? "secondary" : "ghost"}
                size="sm"
                className="text-xs h-8 px-4 font-bold"
                onClick={() => setActiveTab('yearly')}
              >
                Yearly
              </Button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {activeTab === 'monthly' ? (
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={monthlyIncomeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(0,0%,100%,0.05)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsla(0,0%,100%,0.1)', strokeWidth: 2 }} />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke="hsl(18, 100%, 48%)"
                    strokeWidth={4}
                    dot={{ fill: 'hsl(18, 100%, 48%)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#20b959"
                    strokeWidth={4}
                    dot={{ fill: '#20b959', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={yearlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(0,0%,100%,0.05)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(0,0%,100%,0.03)' }} />
                  <Bar dataKey="collected" name="Collected" fill="hsl(18, 100%, 48%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#20b959" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Small Chart */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-full mb-8">
            <h3 className="text-xl font-bold tracking-tight">Payment Health</h3>
            <p className="text-sm text-muted-foreground">Distribution by transaction status</p>
          </div>

          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatFullCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '12px',
                    color: '#fff',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-3xl font-black text-foreground tracking-tighter">
                {Math.round((collectedPayments / totalRevenue) * 100) || 0}%
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Settled</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-8 relative z-10">
            {paymentStatusData.map((item, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/[0.05] p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.name}</span>
                </div>
                <p className="text-sm font-bold">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Performance Bar Chart */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="glass-card p-8 rounded-[2rem]"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold tracking-tight">Revenue Realization</h3>
            <p className="text-sm text-muted-foreground">Collected vs Outstanding per operational month</p>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(0,0%,100%,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(0,0%,100%,0.03)' }} />
                <Bar
                  dataKey="collected"
                  name="Collected"
                  fill="hsl(18, 100%, 48%)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#20b959"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-8 mt-10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg bg-primary premium-glow" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground leading-none">Collected Revenue</p>
                <p className="text-[10px] text-muted-foreground">Successfully settled</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-lg bg-[#20b959]" style={{ boxShadow: '0 0 20px rgba(32,185,89,0.2)' }} />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground leading-none">Pending / Due</p>
                <p className="text-[10px] text-muted-foreground">Invoiced or expected</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Latest Attendance Card */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="glass-card p-8 rounded-[2rem]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Latest Attendance</h3>
              <p className="text-sm text-muted-foreground">Real-time check-in activity</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase" onClick={() => window.location.href = '/employees'}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {latestAttendance.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-medium">
                No recent attendance activity.
              </div>
            ) : (
              latestAttendance.map((record: any) => (
                <div key={record._id || record.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-xs font-bold text-primary">{record.userName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{record.userName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{record.userModel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{safeFormat(record.date, "MMM dd, yyyy")}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{record.timeIn ? safeFormat(record.timeIn, "hh:mm a") : "—"}</p>
                    </div>
                    <Badge
                      className={
                        record.status === "present"
                          ? "bg-success/20 text-success border-success/30 hover:bg-success/10 capitalize font-bold text-[10px]"
                          : "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/10 capitalize font-bold text-[10px]"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
