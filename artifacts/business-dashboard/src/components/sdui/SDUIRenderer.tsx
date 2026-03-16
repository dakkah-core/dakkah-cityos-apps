import React from "react";
import { SduiRenderer as SharedRenderer, configureActionHandler } from "@workspace/sdui-renderer-web";
import type { SdNode } from "@workspace/sdui-protocol";
import type { SDUIComponent } from "@/hooks/use-sdui";

configureActionHandler({
  onNavigate: (target) => console.log("Navigate:", target),
  onMutation: async (endpoint, method, payload) => {
    console.log("Mutation:", endpoint, method, payload);
    return { success: true };
  },
  onHardwareAccess: async (hardware) => {
    console.log("Hardware:", hardware);
    return true;
  },
});

interface StatNode {
  type: "stat";
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
}

interface ListItem {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: Record<string, unknown>;
}

interface ListNode {
  type: "list";
  title?: string;
  items: ListItem[];
}

type ExtendedNode = SDUIComponent | SdNode | StatNode | ListNode;

function StatRenderer({ node }: { node: StatNode }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30 border border-border/50 min-w-[120px]">
      {node.icon && <span className="text-xl">{node.icon}</span>}
      <span className="text-xs text-muted-foreground font-medium">{node.label}</span>
      <span className="text-xl font-bold text-foreground">{node.value}</span>
      {node.trend && (
        <span className={`text-xs font-medium ${node.trend.startsWith("+") ? "text-emerald-400" : node.trend.startsWith("-") ? "text-red-400" : "text-muted-foreground"}`}>
          {node.trend}
        </span>
      )}
    </div>
  );
}

function ListRenderer({ node }: { node: ListNode }) {
  return (
    <div className="space-y-1">
      {node.title && <h3 className="text-lg font-semibold text-foreground mb-2">{node.title}</h3>}
      {node.items.map((item, i) => (
        <button
          key={i}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          onClick={() => item.action && console.log("List action:", item.action)}
        >
          {item.icon && <span className="text-lg">{item.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground">{item.title}</div>
            {item.subtitle && <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

export function SDUIRenderer({ component }: { component: ExtendedNode | undefined }) {
  if (!component) return null;

  if (component.type === "stat") return <StatRenderer node={component as StatNode} />;
  if (component.type === "list") return <ListRenderer node={component as ListNode} />;

  const standardTypes = ["text", "button", "image", "stack", "card", "carousel", "grid", "map"];
  if (standardTypes.includes(component.type)) {
    return <SharedRenderer node={component as SdNode} theme="light" />;
  }

  if ("children" in component && Array.isArray((component as SDUIComponent).children)) {
    return (
      <div className="space-y-3">
        {(component as SDUIComponent).children!.map((child, i) => (
          <SDUIRenderer key={i} component={child} />
        ))}
      </div>
    );
  }

  return null;
}
