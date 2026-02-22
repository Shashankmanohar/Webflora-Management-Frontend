import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Banknote, TrendingUp, Calendar, PieChart as PieChartIcon } from "lucide-react";
import { useAllSalaries, useSalaryStats } from "@/hooks/useSalary";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);

const Salaries = () => {
    const { user } = useAuth();
    const { data: salaries = [], isLoading } = useAllSalaries();
    const { data: salaryStats = [] } = useSalaryStats();
    const [searchTerm, setSearchTerm] = useState("");
    const isAdmin = user?.role === 'admin';

    const filteredSalaries = salaries.filter(s =>
        s.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const safeFormat = (dateStr: string, formatStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Invalid Date";
            return format(date, formatStr);
        } catch (e) {
            return "Invalid Date";
        }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Monthly Data
    const monthlyData = salaryStats.reduce((acc: any[], stat) => {
        const label = `${stat._id.month} ${stat._id.year}`;
        const existing = acc.find(d => d.name === label);
        const amountKey = stat._id.payeeModel === 'employee' ? 'Employee' : 'Intern';

        if (existing) {
            existing[amountKey] = (existing[amountKey] || 0) + stat.totalAmount;
        } else {
            acc.push({
                name: label,
                [amountKey]: stat.totalAmount,
                rawMonth: stat._id.month,
                rawYear: stat._id.year
            });
        }
        return acc;
    }, []).sort((a, b) => (a.rawYear !== b.rawYear ? a.rawYear - b.rawYear : months.indexOf(a.rawMonth) - months.indexOf(b.rawMonth)));

    // Yearly Data
    const yearlyData = salaryStats.reduce((acc: any[], stat) => {
        const label = `${stat._id.year}`;
        const existing = acc.find(d => d.name === label);
        const amountKey = stat._id.payeeModel === 'employee' ? 'Employee' : 'Intern';

        if (existing) {
            existing[amountKey] = (existing[amountKey] || 0) + stat.totalAmount;
        } else {
            acc.push({
                name: label,
                [amountKey]: stat.totalAmount
            });
        }
        return acc;
    }, []).sort((a, b) => Number(a.name) - Number(b.name));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Salaries"
                subtitle={isAdmin ? "Manage and track all team salary payments" : "View your salary payment history"}
            />

            <Tabs defaultValue="history" className="w-full">
                {isAdmin && (
                    <TabsList className="bg-muted/50 p-1 mb-6 rounded-2xl h-12">
                        <TabsTrigger value="history" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Transaction History
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <PieChartIcon className="w-4 h-4 mr-2" />
                            Visual Insights
                        </TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="history" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, month or remarks..."
                                className="pl-9 bg-background/50 border-white/5"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : filteredSalaries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mb-2">
                                    <Banknote className="w-10 h-10 opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-foreground">No records found</p>
                                    <p className="text-sm">Try adjusting your search criteria</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead className="font-bold text-foreground h-14">Payee Name</TableHead>
                                            <TableHead className="font-bold text-foreground text-center h-14">Period</TableHead>
                                            <TableHead className="font-bold text-foreground text-center h-14">Payment Date</TableHead>
                                            <TableHead className="font-bold text-foreground text-right h-14">Amount</TableHead>
                                            <TableHead className="font-bold text-foreground h-14">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSalaries.map((record) => (
                                            <TableRow key={record._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <TableCell className="font-black text-foreground py-4">
                                                    {record.payeeName}
                                                    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                                                        {record.payeeModel}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-bold">
                                                    {record.month} {record.year}
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground font-medium">
                                                    {safeFormat(record.paymentDate, "dd MMM yyyy")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-success/10 text-success border border-success/20">
                                                        {formatCurrency(record.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground font-medium italic">
                                                    {record.remarks || "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="insights" className="space-y-8 mt-0">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Monthly Spend (Current)</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-3xl font-black text-foreground">
                                        {formatCurrency(monthlyData[monthlyData.length - 1]?.Employee + monthlyData[monthlyData.length - 1]?.Intern || 0)}
                                    </h4>
                                    <span className="text-xs text-muted-foreground mb-1 font-bold">{monthlyData[monthlyData.length - 1]?.name}</span>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Annual Spend (Latest)</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-3xl font-black text-warning">
                                        {formatCurrency(yearlyData[yearlyData.length - 1]?.Employee + yearlyData[yearlyData.length - 1]?.Intern || 0)}
                                    </h4>
                                    <span className="text-xs text-muted-foreground mb-1 font-bold">{yearlyData[yearlyData.length - 1]?.name}</span>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Avg. Monthly Payout</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-3xl font-black text-primary">
                                        {formatCurrency(monthlyData.length > 0 ? monthlyData.reduce((acc, d) => acc + (d.Employee || 0) + (d.Intern || 0), 0) / monthlyData.length : 0)}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Expenditure Chart */}
                            <div className="glass-card p-8 rounded-[3rem] border border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black tracking-tight text-foreground">Monthly Expenditure</h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Spending Trends by Month</p>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                formatter={(value: number) => formatCurrency(value)}
                                                cursor={false}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Employee" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                                            <Bar dataKey="Intern" stackId="a" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Yearly Expenditure Chart */}
                            <div className="glass-card p-8 rounded-[3rem] border border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-warning" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black tracking-tight text-foreground">Yearly Summary</h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Total Payouts Year over Year</p>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                formatter={(value: number) => formatCurrency(value)}
                                                cursor={false}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Employee" fill="hsl(var(--primary))" radius={[10, 10, 10, 10]} barSize={34} />
                                            <Bar dataKey="Intern" fill="hsl(var(--success))" radius={[10, 10, 10, 10]} barSize={34} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Data Table */}
                        <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-xl font-black text-foreground">Detailed Expenditure Data</h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Breakdown of all processed payouts</p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="font-bold text-foreground pl-8 h-12">Period</TableHead>
                                        <TableHead className="font-bold text-foreground text-center h-12">Employee Payouts</TableHead>
                                        <TableHead className="font-bold text-foreground text-center h-12">Intern Payouts</TableHead>
                                        <TableHead className="font-bold text-foreground text-right pr-8 h-12">Total Spend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...monthlyData].reverse().map((data) => (
                                        <TableRow key={data.name} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="font-black text-foreground pl-8 py-4">{data.name}</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatCurrency(data.Employee || 0)}</TableCell>
                                            <TableCell className="text-center font-bold text-success">{formatCurrency(data.Intern || 0)}</TableCell>
                                            <TableCell className="text-right font-black text-foreground pr-8">
                                                {formatCurrency((data.Employee || 0) + (data.Intern || 0))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default Salaries;
