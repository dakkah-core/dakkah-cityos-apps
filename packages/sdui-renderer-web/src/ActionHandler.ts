import type { SdAction } from "@cityos/sdui-protocol";

export type NavigateHandler = (screen: string, params?: Record<string, unknown>) => void;
export type MutationHandler = (endpoint: string, method: string, payload?: Record<string, unknown>) => Promise<unknown>;
export type HardwareAccessHandler = (hardware: string) => Promise<boolean>;
export type IntentHandler = (intent: string, data?: Record<string, unknown>) => void;
export type FormSubmitHandler = (formId: string, endpoint: string, method: string, formData: Record<string, unknown>) => Promise<unknown>;

export interface ActionHandlerConfig {
  onNavigate?: NavigateHandler;
  onMutation?: MutationHandler;
  onHardwareAccess?: HardwareAccessHandler;
  onIntent?: IntentHandler;
  onFormSubmit?: FormSubmitHandler;
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
      if (action.external !== false) {
        window.open(action.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = action.url;
      }
      break;

    case "copy_text":
      await navigator.clipboard.writeText(action.text);
      break;

    case "share":
      if (navigator.share) {
        await navigator.share({
          title: action.title,
          text: action.message,
          url: action.url,
        });
      } else {
        await navigator.clipboard.writeText(action.url || action.message);
      }
      break;

    case "trigger_workflow":
      if (config.onMutation) {
        await config.onMutation(`/api/workflows/${action.workflowId}/trigger`, "POST", action.input as Record<string, unknown> | undefined);
      }
      break;

    case "deep_link":
      window.location.href = action.uri;
      break;

    case "request_hardware_access":
      if (config.onHardwareAccess) {
        await config.onHardwareAccess(action.hardware);
      }
      break;

    case "intent":
      if (config.onIntent) {
        config.onIntent(action.intent, action.data as Record<string, unknown> | undefined);
      }
      break;

    case "submit_form":
      if (config.onFormSubmit) {
        await config.onFormSubmit(action.formId, action.endpoint, action.method || "POST", {});
      }
      break;
  }
}

export async function dispatchFormSubmit(
  formId: string,
  endpoint: string,
  method: string,
  formData: Record<string, unknown>,
): Promise<unknown> {
  if (config.onFormSubmit) {
    return config.onFormSubmit(formId, endpoint, method, formData);
  }
  if (config.onMutation) {
    return config.onMutation(endpoint, method, formData);
  }
  return undefined;
}
