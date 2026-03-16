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

const textVariantConfig: Record<string, { tag: "h1" | "h2" | "h3" | "h4" | "p" | "span"; className: string }> = {
  h1: { tag: "h1", className: "text-4xl font-bold" },
  h2: { tag: "h2", className: "text-3xl font-bold" },
  h3: { tag: "h3", className: "text-xl font-semibold" },
  h4: { tag: "h4", className: "text-lg font-semibold" },
  body: { tag: "p", className: "text-base" },
  caption: { tag: "span", className: "text-xs" },
  label: { tag: "span", className: "text-sm font-medium" },
  overline: { tag: "span", className: "text-xs font-semibold uppercase tracking-wider" },
};

const weightClassMap: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const alignClassMap: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function SdTextRenderer({ node, theme }: { node: SdTextNode; theme: "light" | "dark" }) {
  const config = textVariantConfig[node.variant] || textVariantConfig.body;
  const className = [
    config.className,
    node.weight ? weightClassMap[node.weight] : "",
    node.align ? alignClassMap[node.align] : "",
    modifiersToClassName(node.modifiers),
  ].filter(Boolean).join(" ");

  const style: React.CSSProperties = {
    ...(node.color ? { color: node.color } : {}),
    ...(node.numberOfLines ? {
      overflow: "hidden" as const,
      display: "-webkit-box",
      WebkitLineClamp: node.numberOfLines,
      WebkitBoxOrient: "vertical" as const,
    } : {}),
    ...modifiersToStyle(node.modifiers),
  };

  const el = React.createElement(config.tag, { className, style }, node.content);

  if (node.onPress) {
    return (
      <button onClick={() => dispatchAction(node.onPress!)} className="cursor-pointer bg-transparent border-none p-0 text-left">
        {el}
      </button>
    );
  }
  return el;
}

function SdButtonRenderer({ node, theme }: { node: SdButtonNode; theme: "light" | "dark" }) {
  const colors = getSemanticColors(theme);
  const variant = node.variant || "solid";
  const size = node.size || "md";

  const sizeClasses: Record<string, string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg" };

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
      {node.loading ? <span className="animate-spin mr-2">&#8987;</span> : null}
      {node.label}
    </button>
  );
}

function SdImageRenderer({ node }: { node: SdImageNode }) {
  const radiusClassMap: Record<string, string> = {
    none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg",
    xl: "rounded-xl", "2xl": "rounded-2xl", full: "rounded-full",
  };
  const fitClassMap: Record<string, string> = {
    cover: "object-cover", contain: "object-contain", fill: "object-fill", center: "object-center",
  };

  const className = [
    node.borderRadius ? radiusClassMap[node.borderRadius] : "",
    node.contentMode ? fitClassMap[node.contentMode] : "object-cover",
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

function SdStackRenderer({ node, theme }: { node: SdStackNode; theme: "light" | "dark" }) {
  const direction = node.direction || "vertical";
  const gapClassMap: Record<string, string> = {
    xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6", "2xl": "gap-8", "3xl": "gap-12",
  };
  const alignCssMap: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch",
  };
  const justifyCssMap: Record<string, string> = {
    start: "justify-start", center: "justify-center", end: "justify-end",
    between: "justify-between", around: "justify-around", evenly: "justify-evenly",
  };

  const className = [
    "flex",
    direction === "horizontal" ? "flex-row" : "flex-col",
    node.spacing ? gapClassMap[node.spacing] : "gap-3",
    node.align ? alignCssMap[node.align] : "",
    node.justify ? justifyCssMap[node.justify] : "",
    node.wrap ? "flex-wrap" : "",
    modifiersToClassName(node.modifiers),
  ].filter(Boolean).join(" ");

  return (
    <div className={className} style={modifiersToStyle(node.modifiers)}>
      {node.children.map((child, i) => (
        <SduiRenderer key={child.id || `child-${i}`} node={child} theme={theme} />
      ))}
    </div>
  );
}

function SdCardRenderer({ node, theme }: { node: SdCardNode; theme: "light" | "dark" }) {
  const colors = getSemanticColors(theme);
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
        {node.children && node.children.map((child, i) => (
          <SduiRenderer key={child.id || `card-child-${i}`} node={child} theme={theme} />
        ))}
      </div>
    </div>
  );

  if (node.onPress) {
    return <button onClick={() => dispatchAction(node.onPress!)} className="cursor-pointer bg-transparent border-none p-0 text-left w-full">{content}</button>;
  }
  return content;
}

function SdCarouselRenderer({ node, theme }: { node: SdCarouselNode; theme: "light" | "dark" }) {
  const itemWidth = node.itemWidth || 280;
  return (
    <div className={`overflow-x-auto flex gap-4 snap-x snap-mandatory pb-2 ${modifiersToClassName(node.modifiers)}`} style={modifiersToStyle(node.modifiers)}>
      {node.children.map((child, i) => (
        <div key={child.id || `carousel-${i}`} className="snap-start flex-shrink-0" style={{ width: itemWidth }}>
          <SduiRenderer node={child} theme={theme} />
        </div>
      ))}
    </div>
  );
}

function SdGridRenderer({ node, theme }: { node: SdGridNode; theme: "light" | "dark" }) {
  const gapClassMap: Record<string, string> = {
    xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6", "2xl": "gap-8", "3xl": "gap-12",
  };
  const colsClassMap: Record<number, string> = {
    1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
    5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
    9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
  };

  const className = [
    "grid",
    colsClassMap[node.columns] || "grid-cols-1",
    node.spacing ? gapClassMap[node.spacing] : "gap-3",
    modifiersToClassName(node.modifiers),
  ].join(" ");

  return (
    <div className={className} style={modifiersToStyle(node.modifiers)}>
      {node.children.map((child, i) => (
        <SduiRenderer key={child.id || `grid-${i}`} node={child} theme={theme} />
      ))}
    </div>
  );
}

function SdMapRenderer({ node, theme }: { node: SdMapNode; theme: "light" | "dark" }) {
  const colors = getSemanticColors(theme);
  const mapHeight = node.height || 200;
  const tileUrl = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
  const zoom = node.zoom || 13;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${node.longitude - 0.02},${node.latitude - 0.02},${node.longitude + 0.02},${node.latitude + 0.02}&layer=mapnik&marker=${node.latitude},${node.longitude}`;

  return (
    <div
      className={`rounded-lg overflow-hidden ${modifiersToClassName(node.modifiers)}`}
      style={{ height: mapHeight, ...modifiersToStyle(node.modifiers) }}
    >
      <iframe
        title={`Map at ${node.latitude.toFixed(4)}, ${node.longitude.toFixed(4)}`}
        src={embedUrl}
        style={{ width: "100%", height: "100%", border: "none" }}
        loading="lazy"
      />
    </div>
  );
}

export function SduiRenderer({ node, theme = "light" }: SduiRendererProps) {
  switch (node.type) {
    case "text":
      return <SdTextRenderer node={node} theme={theme} />;
    case "button":
      return <SdButtonRenderer node={node} theme={theme} />;
    case "image":
      return <SdImageRenderer node={node} />;
    case "stack":
      return <SdStackRenderer node={node} theme={theme} />;
    case "card":
      return <SdCardRenderer node={node} theme={theme} />;
    case "carousel":
      return <SdCarouselRenderer node={node} theme={theme} />;
    case "grid":
      return <SdGridRenderer node={node} theme={theme} />;
    case "map":
      return <SdMapRenderer node={node} theme={theme} />;
    default:
      return null;
  }
}
