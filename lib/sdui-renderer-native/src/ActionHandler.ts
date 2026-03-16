import type { SdAction } from "@workspace/sdui-protocol";

export type NavigateHandler = (screen: string, params?: Record<string, unknown>) => void;
export type MutationHandler = (endpoint: string, method: string, payload?: Record<string, unknown>) => Promise<unknown>;
export type HardwareAccessHandler = (hardware: string) => Promise<boolean>;
export type CopyTextHandler = (text: string) => Promise<void>;
export type ShareHandler = (data: { title?: string; message: string; url?: string }) => Promise<void>;
export type OpenUrlHandler = (url: string) => Promise<void>;

export interface ActionHandlerConfig {
  onNavigate?: NavigateHandler;
  onMutation?: MutationHandler;
  onHardwareAccess?: HardwareAccessHandler;
  onCopyText?: CopyTextHandler;
  onShare?: ShareHandler;
  onOpenUrl?: OpenUrlHandler;
}

let config: ActionHandlerConfig = {};

export function configureActionHandler(cfg: ActionHandlerConfig) {
  config = { ...config, ...cfg };
}

export async function dispatchAction(action: SdAction): Promise<void> {
  switch (action.type) {
    case "navigate":
      if (config.onNavigate) {
        config.onNavigate(action.screen, action.params as Record<string, unknown> | undefined);
      }
      break;

    case "api_mutation":
      if (config.onMutation) {
        await config.onMutation(action.endpoint, action.method, action.payload as Record<string, unknown> | undefined);
      }
      break;

    case "open_url":
      if (config.onOpenUrl) {
        await config.onOpenUrl(action.url);
      }
      break;

    case "copy_text":
      if (config.onCopyText) {
        await config.onCopyText(action.text);
      }
      break;

    case "share":
      if (config.onShare) {
        await config.onShare({
          title: action.title,
          message: action.message,
          url: action.url,
        });
      }
      break;

    case "trigger_workflow":
      if (config.onMutation) {
        await config.onMutation(`/api/workflows/${action.workflowId}/trigger`, "POST", action.input as Record<string, unknown> | undefined);
      }
      break;

    case "deep_link":
      if (config.onOpenUrl) {
        await config.onOpenUrl(action.uri);
      }
      break;

    case "request_hardware_access":
      if (config.onHardwareAccess) {
        await config.onHardwareAccess(action.hardware);
      }
      break;
  }
}
