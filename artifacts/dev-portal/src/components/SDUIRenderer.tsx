import { cn } from "@/lib/utils";
import { SDUINode } from "@/hooks/use-sdui";
import { ArrowRight, Box, Code, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function SDUIRenderer({ node, index = 0 }: { node: SDUINode; index?: number }) {
  if (!node) return null;

  switch (node.type) {
    case "stack":
      return (
        <div
          className={cn(
            "flex",
            node.direction === "horizontal" ? "flex-row flex-wrap items-center" : "flex-col",
            node.spacing === "sm" ? "gap-3" : node.spacing === "lg" ? "gap-8" : "gap-6",
            "w-full"
          )}
        >
          {node.children?.map((child, i) => (
            <SDUIRenderer key={i} node={child} index={i} />
          ))}
        </div>
      );

    case "grid":
      return (
        <div
          className={cn(
            "grid w-full",
            node.columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            node.spacing === "sm" ? "gap-3" : "gap-6"
          )}
        >
          {node.children?.map((child, i) => (
            <SDUIRenderer key={i} node={child} index={i} />
          ))}
        </div>
      );

    case "card":
      return (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 w-full"
        >
          {node.image && (
            <div className="h-48 w-full overflow-hidden">
              <img src={node.image} alt={node.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          )}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                {node.title && <h3 className="text-xl font-bold text-foreground tracking-tight font-mono">{node.title}</h3>}
                {node.subtitle && <p className="text-muted-foreground mt-1 text-sm">{node.subtitle}</p>}
              </div>
              {node.badge && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium font-mono border border-primary/20">
                  {node.badge}
                </span>
              )}
            </div>
            <div className="flex-1">
              {node.children && (
                <div className="mt-4 flex flex-col gap-4">
                  {node.children.map((child, i) => (
                    <SDUIRenderer key={i} node={child} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );

    case "stat":
      return (
        <div className="flex-1 bg-background/50 border border-border/50 rounded-lg p-4 flex flex-col justify-center min-w-[140px]">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            {node.icon && <span className="text-lg">{node.icon}</span>}
            <span className="text-sm font-medium">{node.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">{node.value}</span>
            {node.trend && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded font-mono",
                node.trend.startsWith('+') ? "text-emerald-400 bg-emerald-400/10" : 
                node.trend.startsWith('-') ? "text-rose-400 bg-rose-400/10" : 
                "text-blue-400 bg-blue-400/10"
              )}>
                {node.trend}
              </span>
            )}
          </div>
        </div>
      );

    case "text":
      return (
        <p className={cn(
          node.variant === "label" ? "text-sm font-medium text-muted-foreground uppercase tracking-wider" :
          node.variant === "body" ? "text-base text-foreground/90 leading-relaxed" :
          "text-foreground"
        )}>
          {node.content}
        </p>
      );

    case "button":
      return (
        <button
          onClick={() => console.log(`Triggered action:`, node.action || node.onPress)}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 font-mono",
            node.variant === "solid" 
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_-3px_var(--color-primary)] hover:shadow-[0_0_25px_-3px_var(--color-primary)] hover:brightness-110" 
              : "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:border-primary/50"
          )}
        >
          {node.label}
          {node.variant === "solid" && <ArrowRight className="w-4 h-4" />}
        </button>
      );

    case "list":
      return (
        <div className="w-full">
          {node.title && <h4 className="text-lg font-semibold text-foreground mb-4 font-mono flex items-center gap-2"><Code className="w-5 h-5 text-primary"/> {node.title}</h4>}
          <ul className="space-y-3">
            {node.items?.map((item, i) => (
              <li key={i} className="group flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/40 hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg shadow-inner">
                    {item.icon || <Box className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground font-mono">{item.title}</h5>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <button className="text-muted-foreground group-hover:text-primary transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      console.warn(`Unsupported SDUI node type: ${node.type}`);
      return null;
  }
}
