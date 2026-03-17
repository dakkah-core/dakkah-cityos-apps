import React from "react";
import { SduiRenderer as SharedRenderer, configureActionHandler } from "@cityos/sdui-renderer-web";
import type { SdNode } from "@cityos/sdui-protocol";

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

type ExtendedNode = SdNode | StatNode | ListNode | { type: string; children?: ExtendedNode[]; [key: string]: unknown };

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

export function SduiRenderer({ node }: { node: ExtendedNode }) {
  if (!node) return null;

  if (node.type === "stat") return <StatRenderer node={node as StatNode} />;
  if (node.type === "list") return <ListRenderer node={node as ListNode} />;

  const standardTypes = ["text", "button", "image", "stack", "card", "carousel", "grid", "map"];
  if (standardTypes.includes(node.type)) {
    return <SharedRenderer node={node as SdNode} theme="light" />;
  }

  if ("children" in node && Array.isArray(node.children)) {
    return (
      <div className="space-y-3">
        {node.children.map((child: ExtendedNode, i: number) => (
          <SduiRenderer key={i} node={child} />
        ))}
      </div>
    );
  }

  return null;
}
