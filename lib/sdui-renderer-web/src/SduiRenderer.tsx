import React from "react";
import type {
  SdNode,
  SdTextNode,
  SdButtonNode,
  SdImageNode,
  SdStackNode,
  SdCardNode,
  SdCarouselNode,
  SdGridNode,
  SdMapNode,
} from "@workspace/sdui-protocol";
import { getSemanticColors } from "@workspace/design-tokens";
import { modifiersToClassName, modifiersToStyle } from "./ModifierStyles";
import { dispatchAction } from "./ActionHandler";

interface SduiRendererProps {
  node: SdNode;
  theme?: "light" | "dark";
}

const textVariantMap: Record<string, { tag: string; className: string }> = {
  h1: { tag: "h1", className: "text-4xl font-bold" },
  h2: { tag: "h2", className: "text-3xl font-bold" },
  h3: { tag: "h3", className: "text-xl font-semibold" },
  h4: { tag: "h4", className: "text-lg font-semibold" },
  body: { tag: "p", className: "text-base" },
  caption: { tag: "span", className: "text-xs" },
  label: { tag: "span", className: "text-sm font-medium" },
  overline: { tag: "span", className: "text-xs font-semibold uppercase tracking-wider" },
};

const weightMap: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const alignMap: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function SdTextRenderer({ node, theme }: { node: SdTextNode; theme: string }) {
  const variant = textVariantMap[node.variant] || textVariantMap.body;
  const Tag = variant.tag as keyof JSX.IntrinsicElements;
  const className = [
    variant.className,
    node.weight ? weightMap[node.weight] : "",
    node.align ? alignMap[node.align] : "",
    modifiersToClassName(node.modifiers),
  ].filter(Boolean).join(" ");

  const style: React.CSSProperties = {
    ...(node.color ? { color: node.color } : {}),
    ...(node.numberOfLines ? { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: node.numberOfLines, WebkitBoxOrient: "vertical" as any } : {}),
    ...modifiersToStyle(node.modifiers),
  };

  const el = <Tag className={className} style={style}>{node.content}</Tag>;
  if (node.onPress) {
    return <button onClick={() => dispatchAction(node.onPress!)} className="cursor-pointer bg-transparent border-none p-0 text-left">{el}</button>;
  }
  return el;
}

function SdButtonRenderer({ node, theme }: { node: SdButtonNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  const variant = node.variant || "solid";
  const size = node.size || "md";

  const sizeClasses = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg" };

  const variantClasses: Record<string, string> = {
    solid: "text-white rounded-md font-semibold",
    outline: "bg-transparent rounded-md font-semibold border-2",
    ghost: "bg-transparent rounded-md font-semibold",
    link: "bg-transparent font-semibold underline",
  };

  const className = [
    "inline-flex items-center justify-center cursor-pointer transition-opacity",
    sizeClasses[size],
    variantClasses[variant],
    node.disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80",
    modifiersToClassName(node.modifiers),
  ].join(" ");

  const btnColor = node.color || colors.primary;
  const style: React.CSSProperties = {
    ...(variant === "solid" ? { backgroundColor: btnColor } : {}),
    ...(variant === "outline" ? { borderColor: btnColor, color: btnColor } : {}),
    ...(variant === "ghost" || variant === "link" ? { color: btnColor } : {}),
    ...modifiersToStyle(node.modifiers),
  };

  return (
    <button
      className={className}
      style={style}
      onClick={() => !node.disabled && !node.loading && dispatchAction(node.action)}
      disabled={node.disabled || node.loading}
    >
      {node.loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {node.label}
    </button>
  );
}

function SdImageRenderer({ node }: { node: SdImageNode }) {
  const radiusMap: Record<string, string> = {
    none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg",
    xl: "rounded-xl", "2xl": "rounded-2xl", full: "rounded-full",
  };
  const fitMap: Record<string, string> = {
    cover: "object-cover", contain: "object-contain", fill: "object-fill", center: "object-center",
  };

  const className = [
    node.borderRadius ? radiusMap[node.borderRadius] : "",
    node.contentMode ? fitMap[node.contentMode] : "object-cover",
    modifiersToClassName(node.modifiers),
  ].filter(Boolean).join(" ");

  const style: React.CSSProperties = {
    width: node.width || "100%",
    height: node.height,
    aspectRatio: node.aspectRatio,
    ...modifiersToStyle(node.modifiers),
  };

  return <img src={node.src} alt={node.alt || ""} className={className} style={style} />;
}

function SdStackRenderer({ node, theme }: { node: SdStackNode; theme: string }) {
  const direction = node.direction || "vertical";
  const gapMap: Record<string, string> = {
    xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6", "2xl": "gap-8", "3xl": "gap-12",
  };
  const alignCss: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch",
  };
  const justifyCss: Record<string, string> = {
    start: "justify-start", center: "justify-center", end: "justify-end",
    between: "justify-between", around: "justify-around", evenly: "justify-evenly",
  };

  const className = [
    "flex",
    direction === "horizontal" ? "flex-row" : "flex-col",
    node.spacing ? gapMap[node.spacing] : "gap-3",
    node.align ? alignCss[node.align] : "",
    node.justify ? justifyCss[node.justify] : "",
    node.wrap ? "flex-wrap" : "",
    modifiersToClassName(node.modifiers),
  ].filter(Boolean).join(" ");

  return (
    <div className={className} style={modifiersToStyle(node.modifiers)}>
      {(node.children as SdNode[]).map((child, i) => (
        <SduiRenderer key={child.id || `child-${i}`} node={child} theme={theme as "light" | "dark"} />
      ))}
    </div>
  );
}

function SdCardRenderer({ node, theme }: { node: SdCardNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  const className = [
    "rounded-lg overflow-hidden shadow-md",
    modifiersToClassName(node.modifiers),
  ].join(" ");

  const content = (
    <div className={className} style={{ backgroundColor: colors.card, ...modifiersToStyle(node.modifiers) }}>
      {node.image && (
        <img src={node.image} alt="" className="w-full object-cover" style={{ aspectRatio: node.imageAspectRatio || 16 / 9 }} />
      )}
      <div className="p-4">
        {node.badge && (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white mb-2" style={{ backgroundColor: colors.primary }}>
            {node.badge}
          </span>
        )}
        {node.title && <h3 className="text-lg font-semibold mb-1" style={{ color: colors.text }}>{node.title}</h3>}
        {node.subtitle && <p className="text-sm" style={{ color: colors.textSecondary }}>{node.subtitle}</p>}
        {node.children && (node.children as SdNode[]).map((child, i) => (
          <SduiRenderer key={child.id || `card-child-${i}`} node={child} theme={theme as "light" | "dark"} />
        ))}
      </div>
    </div>
  );

  if (node.onPress) {
    return <button onClick={() => dispatchAction(node.onPress!)} className="cursor-pointer bg-transparent border-none p-0 text-left w-full">{content}</button>;
  }
  return content;
}

function SdCarouselRenderer({ node, theme }: { node: SdCarouselNode; theme: string }) {
  const itemWidth = node.itemWidth || 280;
  return (
    <div className={`overflow-x-auto flex gap-4 snap-x snap-mandatory pb-2 ${modifiersToClassName(node.modifiers)}`} style={modifiersToStyle(node.modifiers)}>
      {(node.children as SdNode[]).map((child, i) => (
        <div key={child.id || `carousel-${i}`} className="snap-start flex-shrink-0" style={{ width: itemWidth }}>
          <SduiRenderer node={child} theme={theme as "light" | "dark"} />
        </div>
      ))}
    </div>
  );
}

function SdGridRenderer({ node, theme }: { node: SdGridNode; theme: string }) {
  const gapMap: Record<string, string> = {
    xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6", "2xl": "gap-8", "3xl": "gap-12",
  };
  const colsMap: Record<number, string> = {
    1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
    5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
    9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
  };

  const className = [
    "grid",
    colsMap[node.columns] || `grid-cols-${node.columns}`,
    node.spacing ? gapMap[node.spacing] : "gap-3",
    modifiersToClassName(node.modifiers),
  ].join(" ");

  return (
    <div className={className} style={modifiersToStyle(node.modifiers)}>
      {(node.children as SdNode[]).map((child, i) => (
        <SduiRenderer key={child.id || `grid-${i}`} node={child} theme={theme as "light" | "dark"} />
      ))}
    </div>
  );
}

function SdMapRenderer({ node, theme }: { node: SdMapNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${modifiersToClassName(node.modifiers)}`}
      style={{ height: node.height || 200, backgroundColor: colors.elevated, ...modifiersToStyle(node.modifiers) }}
    >
      <span className="text-sm" style={{ color: colors.textSecondary }}>
        Map: {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
        {node.markers && ` (${node.markers.length} markers)`}
      </span>
    </div>
  );
}

export function SduiRenderer({ node, theme = "light" }: SduiRendererProps) {
  switch (node.type) {
    case "text":
      return <SdTextRenderer node={node as SdTextNode} theme={theme} />;
    case "button":
      return <SdButtonRenderer node={node as SdButtonNode} theme={theme} />;
    case "image":
      return <SdImageRenderer node={node as SdImageNode} />;
    case "stack":
      return <SdStackRenderer node={node as SdStackNode} theme={theme} />;
    case "card":
      return <SdCardRenderer node={node as SdCardNode} theme={theme} />;
    case "carousel":
      return <SdCarouselRenderer node={node as SdCarouselNode} theme={theme} />;
    case "grid":
      return <SdGridRenderer node={node as SdGridNode} theme={theme} />;
    case "map":
      return <SdMapRenderer node={node as SdMapNode} theme={theme} />;
    default:
      return null;
  }
}
