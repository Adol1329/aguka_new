import { isFirebaseConfigured, requestFcmToken, onForegroundMessage } from "./firebase";
import { notificationsApi } from "@/api/notifications";
import { toast } from "sonner";

let registeredToken: string | null = null;

export async function registerPushToken(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    const token = await requestFcmToken();
    if (!token || token === registeredToken) return;

    registeredToken = token;
    await notificationsApi.registerDevice({ fcmToken: token, platform: "web" });
  } catch {
    // Silently fail - push notifications are not critical for app function
  }
}

export function setupForegroundHandler(): () => void {
  return onForegroundMessage((payload) => {
    const { title, body } = payload.data || {};
    if (title) {
      toast(title, {
        description: body || "",
      });
    }
  });
}
