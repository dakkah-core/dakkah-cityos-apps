export {
  SdColorSchema,
  SdSizeSchema,
  SdAlignmentSchema,
  SdModifiersSchema,
  SdActionSchema,
  SdTextVariantSchema,
  SdTextNodeSchema,
  SdButtonVariantSchema,
  SdButtonSizeSchema,
  SdButtonNodeSchema,
  SdImageNodeSchema,
  SdStackNodeSchema,
  SdCardNodeSchema,
  SdCarouselNodeSchema,
  SdGridNodeSchema,
  SdMapNodeSchema,
  SdNodeSchema,
  SdCapabilitiesSchema,
  SdPayloadSchema,
} from "./schemas";

import type { z } from "zod";
import type {
  SdModifiersSchema,
  SdActionSchema,
  SdTextNodeSchema,
  SdButtonNodeSchema,
  SdImageNodeSchema,
  SdStackNodeSchema,
  SdCardNodeSchema,
  SdCarouselNodeSchema,
  SdGridNodeSchema,
  SdMapNodeSchema,
  SdNodeSchema,
  SdCapabilitiesSchema,
  SdPayloadSchema,
} from "./schemas";

export type SdModifiers = z.infer<typeof SdModifiersSchema>;
export type SdAction = z.infer<typeof SdActionSchema>;
export type SdTextNode = z.infer<typeof SdTextNodeSchema>;
export type SdButtonNode = z.infer<typeof SdButtonNodeSchema>;
export type SdImageNode = z.infer<typeof SdImageNodeSchema>;
export type SdStackNode = z.infer<typeof SdStackNodeSchema>;
export type SdCardNode = z.infer<typeof SdCardNodeSchema>;
export type SdCarouselNode = z.infer<typeof SdCarouselNodeSchema>;
export type SdGridNode = z.infer<typeof SdGridNodeSchema>;
export type SdMapNode = z.infer<typeof SdMapNodeSchema>;
export type SdNode = z.infer<typeof SdNodeSchema>;
export type SdCapabilities = z.infer<typeof SdCapabilitiesSchema>;
export type SdPayload = z.infer<typeof SdPayloadSchema>;
