import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: (options: { title: string; description?: string; variant?: "default" | "destructive" | "success" }) => {
      toast(options.title, {
        description: options.description,
        // sonner uses 'default', 'error', 'success' as variant
        // we map our variant to sonner's
        variant: options.variant === "destructive" ? "error" : options.variant || "default",
      });
    },
  };
};