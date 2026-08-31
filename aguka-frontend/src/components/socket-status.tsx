import { useState, useEffect } from "react";
import { onConnectionStatusChange, type ConnectionStatus } from "@/lib/socket";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "bg-green-500" },
  reconnecting: { label: "Reconnecting...", dot: "bg-amber-500" },
  disconnected: { label: "Offline", dot: "bg-red-500" },
};

export function SocketStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    const unsub = onConnectionStatusChange(setStatus);
    return unsub;
  }, []);

  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-colors",
        status === "connected" && "text-green-600 bg-green-500/10",
        status === "reconnecting" && "text-amber-600 bg-amber-500/10",
        status === "disconnected" && "text-red-600 bg-red-500/10",
      )}
      title={config.label}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.dot)} />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
}
