import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
}

import { motion } from "framer-motion";

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon, iconColor, actions }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="stat-card group relative"
    >
      {/* Mesh Gradient background glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              {title}
            </p>
          </div>
          <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
          {change && (
            <div
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                changeType === "positive" && "bg-success/10 text-success border border-success/20",
                changeType === "negative" && "bg-destructive/10 text-destructive border border-destructive/20",
                changeType === "neutral" && "bg-muted/10 text-muted-foreground border border-muted/20"
              )}
            >
              {change}
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,73,0,0.15)]",
            iconColor || "bg-primary/10 border border-primary/20"
          )}
        >
          <Icon className={cn("w-6 h-6", iconColor ? "text-accent-foreground" : "text-primary")} />
        </div>
      </div>
      {actions && (
        <div className="mt-4 pt-4 border-t border-border/50 relative z-10">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
