import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface SDUIProps {
  component: any;
  depth?: number;
}

export function SDUIRenderer({ component, depth = 0 }: SDUIProps) {
  if (!component) return null;

  const { type, children, ...props } = component;

  // Animation variants for staggered entrance
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const renderChildren = (customClass?: string) => {
    if (!children || !Array.isArray(children)) return null;
    return (
      <div className={customClass}>
        {children.map((child: any, idx: number) => (
          <SDUIRenderer key={`${depth}-${idx}`} component={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  switch (type) {
    case "stack":
      const stackClass = cn(
        "flex",
        props.direction === "horizontal" ? "flex-row flex-wrap items-center" : "flex-col",
        props.spacing === "sm" ? "gap-2" : props.spacing === "md" ? "gap-4" : props.spacing === "lg" ? "gap-6" : "gap-4",
        "w-full"
      );
      return renderChildren(stackClass);

    case "grid":
      const gridClass = cn(
        "grid w-full",
        props.columns === 2 ? "grid-cols-1 md:grid-cols-2" : props.columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
        props.spacing === "sm" ? "gap-2" : props.spacing === "md" ? "gap-4" : props.spacing === "lg" ? "gap-6" : "gap-4"
      );
      return renderChildren(gridClass);

    case "card":
      return (
        <motion.div 
          variants={itemVariants}
          className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 w-full flex flex-col group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">{props.title}</h3>
              {props.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{props.subtitle}</p>
              )}
            </div>
            {props.badge && (
              <span className="px-3 py-1 bg-accent/15 text-accent-foreground font-semibold text-xs rounded-full border border-accent/20">
                {props.badge}
              </span>
            )}
          </div>
          
          {props.image && (
            <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative z-10">
              <img src={props.image} alt={props.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="flex-1 relative z-10 flex flex-col justify-end">
            {renderChildren("w-full")}
          </div>
        </motion.div>
      );

    case "stat":
      const isPositive = props.trend?.startsWith("+");
      const isNegative = props.trend?.startsWith("-");
      const isNeutral = props.trend === "stable";
      
      return (
        <div className="flex-1 min-w-[140px] bg-secondary/30 rounded-xl p-4 border border-border/40 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-lg">{props.icon}</span>
            <span className="text-sm font-medium">{props.label}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              {props.value}
            </span>
            {props.trend && (
              <span className={cn(
                "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                isPositive ? "text-green-500 bg-green-500/10" : 
                isNegative ? "text-red-500 bg-red-500/10" : 
                "text-yellow-500 bg-yellow-500/10"
              )}>
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : 
                 isNegative ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : 
                 <Minus className="w-3 h-3 mr-0.5" />}
                {props.trend.replace("+", "").replace("-", "")}
              </span>
            )}
          </div>
        </div>
      );

    case "list":
      return (
        <motion.div variants={itemVariants} className="w-full bg-card border border-border/50 rounded-2xl overflow-hidden shadow-md shadow-black/5">
          {props.title && (
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
              <h3 className="text-lg font-display font-bold text-foreground">{props.title}</h3>
            </div>
          )}
          <div className="divide-y divide-border/50">
            {props.items?.map((item: any, idx: number) => (
              <button 
                key={idx}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/40 transition-colors text-left group"
                onClick={() => console.log("List action triggered:", item.action)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    {item.icon || <Activity className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </motion.div>
      );

    case "text":
      const textClass = cn(
        "text-foreground",
        props.variant === "label" ? "text-sm font-semibold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg" : 
        props.variant === "body" ? "text-sm sm:text-base text-foreground/80 flex items-center gap-2" : "text-base"
      );
      return <div className={textClass}>{props.content}</div>;

    case "button":
      const btnClass = cn(
        "font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2",
        props.variant === "solid" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20" : 
        "bg-transparent border-2 border-border hover:border-primary/50 text-foreground hover:bg-primary/5"
      );
      return (
        <button className={btnClass} onClick={() => console.log("Button clicked", props.action)}>
          {props.label}
        </button>
      );

    default:
      console.warn(`Unknown SDUI component type: ${type}`);
      return null;
  }
}
