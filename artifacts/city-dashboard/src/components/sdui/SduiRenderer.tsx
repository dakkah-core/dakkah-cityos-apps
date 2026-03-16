import React from "react";
import { SduiNode, SduiAction } from "@/hooks/use-sdui";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, ArrowRight, Battery, Car, Droplets, Leaf, Settings, Zap, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface SduiRendererProps {
  node: SduiNode;
}

// Icon mapper helper
const getIcon = (iconStr?: string) => {
  if (!iconStr) return null;
  // Emoji handling (simple pass-through)
  if (/\p{Emoji}/u.test(iconStr)) {
    return <span className="text-xl">{iconStr}</span>;
  }
  return null;
};

const handleAction = (action?: SduiAction) => {
  if (!action) return;
  console.log("Action triggered:", action);
  // In a real app, this would dispatch to an intent handler or router
};

export function SduiRenderer({ node }: SduiRendererProps) {
  if (!node) return null;

  switch (node.type) {
    case "stack":
      return (
        <div
          className={cn(
            "flex w-full",
            node.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col",
            node.spacing === "sm" ? "gap-2" : node.spacing === "md" ? "gap-4" : "gap-6"
          )}
        >
          {node.children?.map((child, i) => (
            <SduiRenderer key={i} node={child} />
          ))}
        </div>
      );

    case "card":
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-5 shadow-lg shadow-black/20"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="flex items-start justify-between mb-4">
            <div>
              {node.title && <h3 className="font-semibold text-lg text-foreground tracking-tight">{node.title}</h3>}
              {node.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{node.subtitle}</p>}
            </div>
            {node.badge && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {node.badge}
              </span>
            )}
          </div>
          
          {node.image && (
            <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl">
              <img src={node.image} alt={node.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-4">
            {node.children?.map((child, i) => (
              <SduiRenderer key={i} node={child} />
            ))}
          </div>
        </motion.div>
      );

    case "stat":
      const isPositive = node.trend?.startsWith("+");
      const isNegative = node.trend?.startsWith("-");
      return (
        <div className="flex-1 min-w-[120px] rounded-xl bg-secondary/50 border border-secondary p-4 hover:bg-secondary/80 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            {getIcon(node.icon)}
            <span className="text-sm font-medium">{node.label}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">{node.value}</span>
            {node.trend && (
              <span className={cn(
                "text-xs font-semibold mb-1",
                isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-muted-foreground"
              )}>
                {node.trend}
              </span>
            )}
          </div>
        </div>
      );

    case "list":
      return (
        <div className="rounded-xl border border-card-border overflow-hidden">
          {node.title && (
            <div className="bg-secondary/30 px-4 py-3 border-b border-card-border">
              <h4 className="text-sm font-semibold text-foreground">{node.title}</h4>
            </div>
          )}
          <div className="divide-y divide-card-border">
            {node.items?.map((item, i) => (
              <button 
                key={i} 
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary/40 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {item.icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      {getIcon(item.icon)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50" />
              </button>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <p className={cn(
          "text-sm text-foreground",
          node.variant === "body" && "text-muted-foreground",
          node.variant === "label" && "font-mono font-medium text-primary",
        )}>
          {node.content}
        </p>
      );

    case "button":
      const action = node.action || node.onPress;
      const isSolid = node.variant_style === "solid" || node.variant === "solid" as any;
      return (
        <button
          onClick={() => handleAction(action)}
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 w-full md:w-auto",
            isSolid 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
              : "bg-secondary text-foreground border border-secondary hover:bg-secondary/80"
          )}
        >
          {node.label || "Action"}
        </button>
      );

    case "grid":
      return (
        <div 
          className={cn(
            "grid w-full",
            node.spacing === "sm" ? "gap-2" : node.spacing === "md" ? "gap-4" : "gap-6",
            node.columns === 2 ? "grid-cols-1 md:grid-cols-2" : 
            node.columns === 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : 
            "grid-cols-1"
          )}
        >
          {node.children?.map((child, i) => (
            <SduiRenderer key={i} node={child} />
          ))}
        </div>
      );

    default:
      return <div className="text-xs text-rose-500 p-2 border border-rose-500/20 rounded bg-rose-500/10">Unsupported node: {node.type}</div>;
  }
}
