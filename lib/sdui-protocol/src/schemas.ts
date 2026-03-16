import { z } from "zod";

export const SdColorSchema = z.string();

export const SdSizeSchema = z.enum(["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);

export const SdAlignmentSchema = z.enum(["start", "center", "end", "stretch", "between", "around", "evenly"]);

export const SdModifiersSchema = z.object({
  padding: SdSizeSchema.optional(),
  paddingX: SdSizeSchema.optional(),
  paddingY: SdSizeSchema.optional(),
  margin: SdSizeSchema.optional(),
  marginX: SdSizeSchema.optional(),
  marginY: SdSizeSchema.optional(),
  backgroundColor: SdColorSchema.optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).optional(),
  borderWidth: z.enum(["none", "thin", "medium", "thick"]).optional(),
  borderColor: SdColorSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxHeight: z.number().optional(),
  flex: z.number().optional(),
  hidden: z.boolean().optional(),
}).strict().partial();

export const SdActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("navigate"),
    screen: z.string(),
    params: z.record(z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("api_mutation"),
    endpoint: z.string(),
    method: z.enum(["POST", "PUT", "PATCH", "DELETE"]),
    payload: z.record(z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("open_url"),
    url: z.string(),
    external: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("copy_text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("share"),
    title: z.string().optional(),
    message: z.string(),
    url: z.string().optional(),
  }),
  z.object({
    type: z.literal("trigger_workflow"),
    workflowId: z.string(),
    input: z.record(z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("deep_link"),
    uri: z.string(),
  }),
  z.object({
    type: z.literal("request_hardware_access"),
    hardware: z.enum(["camera", "location", "microphone", "bluetooth", "nfc", "biometrics"]),
  }),
]);

export const SdTextVariantSchema = z.enum(["h1", "h2", "h3", "h4", "body", "caption", "label", "overline"]);

const SdBaseNodeFields = {
  id: z.string().optional(),
  modifiers: SdModifiersSchema.optional(),
  onPress: SdActionSchema.optional(),
  testId: z.string().optional(),
} as const;

export const SdTextNodeSchema = z.object({
  ...SdBaseNodeFields,
  type: z.literal("text"),
  variant: SdTextVariantSchema,
  content: z.string(),
  color: SdColorSchema.optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  weight: z.enum(["normal", "medium", "semibold", "bold", "extrabold"]).optional(),
  numberOfLines: z.number().optional(),
});

export const SdButtonVariantSchema = z.enum(["solid", "outline", "ghost", "link"]);
export const SdButtonSizeSchema = z.enum(["sm", "md", "lg"]);

export const SdButtonNodeSchema = z.object({
  ...SdBaseNodeFields,
  type: z.literal("button"),
  label: z.string(),
  variant: SdButtonVariantSchema.optional(),
  size: SdButtonSizeSchema.optional(),
  color: SdColorSchema.optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  action: SdActionSchema,
});

export const SdImageNodeSchema = z.object({
  ...SdBaseNodeFields,
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  aspectRatio: z.number().optional(),
  contentMode: z.enum(["cover", "contain", "fill", "center"]).optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).optional(),
});

export const SdMapMarkerSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  title: z.string().optional(),
  icon: z.string().optional(),
  color: SdColorSchema.optional(),
  action: SdActionSchema.optional(),
});

export const SdMapNodeSchema = z.object({
  ...SdBaseNodeFields,
  type: z.literal("map"),
  latitude: z.number(),
  longitude: z.number(),
  zoom: z.number().optional(),
  height: z.number().optional(),
  markers: z.array(SdMapMarkerSchema).optional(),
});

export type SdTextNode = z.infer<typeof SdTextNodeSchema>;
export type SdButtonNode = z.infer<typeof SdButtonNodeSchema>;
export type SdImageNode = z.infer<typeof SdImageNodeSchema>;
export type SdMapNode = z.infer<typeof SdMapNodeSchema>;

export interface SdStackNode {
  type: "stack";
  id?: string;
  modifiers?: z.infer<typeof SdModifiersSchema>;
  onPress?: z.infer<typeof SdActionSchema>;
  testId?: string;
  direction?: "horizontal" | "vertical";
  spacing?: z.infer<typeof SdSizeSchema>;
  align?: z.infer<typeof SdAlignmentSchema>;
  justify?: z.infer<typeof SdAlignmentSchema>;
  wrap?: boolean;
  children: SdNode[];
}

export interface SdCardNode {
  type: "card";
  id?: string;
  modifiers?: z.infer<typeof SdModifiersSchema>;
  onPress?: z.infer<typeof SdActionSchema>;
  testId?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAspectRatio?: number;
  badge?: string;
  children?: SdNode[];
}

export interface SdCarouselNode {
  type: "carousel";
  id?: string;
  modifiers?: z.infer<typeof SdModifiersSchema>;
  onPress?: z.infer<typeof SdActionSchema>;
  testId?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  itemWidth?: number;
  children: SdNode[];
}

export interface SdGridNode {
  type: "grid";
  id?: string;
  modifiers?: z.infer<typeof SdModifiersSchema>;
  onPress?: z.infer<typeof SdActionSchema>;
  testId?: string;
  columns: number;
  spacing?: z.infer<typeof SdSizeSchema>;
  children: SdNode[];
}

export type SdNode =
  | SdTextNode
  | SdButtonNode
  | SdImageNode
  | SdStackNode
  | SdCardNode
  | SdCarouselNode
  | SdGridNode
  | SdMapNode;

export type SdModifiers = z.infer<typeof SdModifiersSchema>;
export type SdAction = z.infer<typeof SdActionSchema>;

const SdNodeSchemaLazy: z.ZodType<SdNode> = z.lazy(() =>
  z.union([
    SdTextNodeSchema,
    SdButtonNodeSchema,
    SdImageNodeSchema,
    z.object({
      ...SdBaseNodeFields,
      type: z.literal("stack"),
      direction: z.enum(["horizontal", "vertical"]).optional(),
      spacing: SdSizeSchema.optional(),
      align: SdAlignmentSchema.optional(),
      justify: SdAlignmentSchema.optional(),
      wrap: z.boolean().optional(),
      children: z.array(SdNodeSchemaLazy),
    }),
    z.object({
      ...SdBaseNodeFields,
      type: z.literal("card"),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      image: z.string().optional(),
      imageAspectRatio: z.number().optional(),
      badge: z.string().optional(),
      children: z.array(SdNodeSchemaLazy).optional(),
    }),
    z.object({
      ...SdBaseNodeFields,
      type: z.literal("carousel"),
      autoPlay: z.boolean().optional(),
      autoPlayInterval: z.number().optional(),
      showDots: z.boolean().optional(),
      itemWidth: z.number().optional(),
      children: z.array(SdNodeSchemaLazy),
    }),
    z.object({
      ...SdBaseNodeFields,
      type: z.literal("grid"),
      columns: z.number().min(1).max(12),
      spacing: SdSizeSchema.optional(),
      children: z.array(SdNodeSchemaLazy),
    }),
    SdMapNodeSchema,
  ])
);

export const SdNodeSchema = SdNodeSchemaLazy;

export const SdCapabilitiesSchema = z.object({
  os: z.enum(["ios", "android", "web", "macos", "windows", "linux", "tvos", "watchos", "carplay"]),
  osVersion: z.string().optional(),
  screenClass: z.enum(["mobile", "mobile_large", "tablet", "desktop", "desktop_wide", "tv_1080p"]),
  inputMethods: z.array(z.enum(["touch", "keyboard", "mouse", "voice", "dpad", "pen"])),
  supportsCamera: z.boolean().optional(),
  supportsLocation: z.boolean().optional(),
  supportsBluetooth: z.boolean().optional(),
  supportsNfc: z.boolean().optional(),
  supportsBiometrics: z.boolean().optional(),
  supportsNotifications: z.boolean().optional(),
});

export type SdCapabilities = z.infer<typeof SdCapabilitiesSchema>;

export const SdPayloadSchema = z.object({
  version: z.string(),
  screenId: z.string(),
  title: z.string().optional(),
  root: SdNodeSchema,
  metadata: z.record(z.unknown()).optional(),
  ttl: z.number().optional(),
  cacheKey: z.string().optional(),
});

export type SdPayload = z.infer<typeof SdPayloadSchema>;
