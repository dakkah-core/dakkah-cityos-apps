import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Define a loose type for the SDUI node
export interface SduiNode {
  type: string;
  id?: string;
  children?: SduiNode[];
  [key: string]: any;
}

interface SduiRendererProps {
  node: SduiNode;
}

export function SduiRenderer({ node }: SduiRendererProps) {
  if (!node) return null;

  switch (node.type) {
    case "stack":
      return (
        <div
          className={cn(
            "flex w-full",
            node.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col",
            node.spacing === "sm" ? "gap-3" : node.spacing === "md" ? "gap-6" : "gap-4",
            node.className
          )}
        >
          {node.children?.map((child, idx) => (
            <SduiRenderer key={child.id || idx} node={child} />
          ))}
        </div>
      );

    case "card":
      return (
        <Card className="w-full h-full flex flex-col group/card">
          {(node.title || node.subtitle || node.badge) && (
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  {node.title && <CardTitle>{node.title}</CardTitle>}
                  {node.subtitle && <CardDescription className="mt-1.5 text-base">{node.subtitle}</CardDescription>}
                </div>
                {node.badge && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                    {node.badge}
                  </span>
                )}
              </div>
            </CardHeader>
          )}
          {node.image && (
            <div className="w-full h-48 overflow-hidden bg-muted">
              <img src={node.image} alt={node.title || "Image"} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
            </div>
          )}
          {node.children && node.children.length > 0 && (
            <CardContent className="flex-1 flex flex-col justify-end">
              {node.children.map((child, idx) => (
                <SduiRenderer key={idx} node={child} />
              ))}
            </CardContent>
          )}
        </Card>
      );

    case "stat":
      return (
        <div className="flex-1 min-w-[140px] bg-secondary/50 rounded-xl p-4 border border-border/50 hover:bg-secondary transition-colors">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            {node.icon && <span className="text-xl">{node.icon}</span>}
            <span className="text-sm font-medium">{node.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-foreground">{node.value}</span>
            {node.trend && (
              <span className={cn(
                "text-xs font-semibold",
                node.trend.startsWith("+") || node.trend === "stable" ? "text-emerald-600" : "text-destructive"
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
          "text-foreground",
          node.variant === "label" ? "font-semibold text-sm" : 
          node.variant === "body" ? "text-base leading-relaxed" : 
          "text-base"
        )}>
          {node.content}
        </p>
      );

    case "button":
      return (
        <Button
          variant={node.variant === "solid" ? "default" : node.variant === "outline" ? "outline" : "secondary"}
          className="w-full sm:w-auto justify-start"
          onClick={() => {
            console.log("SDUI Action triggered:", node.action);
            // In a real app, this would route or trigger a mutation based on action type
            alert(`Action triggered: ${JSON.stringify(node.action)}`);
          }}
        >
          {node.label}
        </Button>
      );

    case "list":
      return (
        <Card className="w-full overflow-hidden">
          {(node.title) && (
            <div className="bg-secondary/30 px-6 py-4 border-b border-border/50">
              <h3 className="font-display font-semibold text-lg">{node.title}</h3>
            </div>
          )}
          <div className="divide-y divide-border/50">
            {node.items?.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => console.log("List item action:", item.action)}
              >
                <div className="flex items-center gap-4">
                  {item.icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl shadow-inner">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                    {item.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{item.subtitle}</p>}
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </Card>
      );

    case "grid":
      return (
        <div 
          className="grid gap-6 w-full"
          style={{ 
            gridTemplateColumns: `repeat(auto-fit, minmax(${node.columns ? `calc(100% / ${node.columns} - 24px)` : '280px'}, 1fr))` 
          }}
        >
          {node.children?.map((child, idx) => (
            <SduiRenderer key={idx} node={child} />
          ))}
        </div>
      );

    default:
      console.warn("Unknown SDUI node type:", node.type);
      return null;
  }
}
