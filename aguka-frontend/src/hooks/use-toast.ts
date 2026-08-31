import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: (options: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "success";
    }) => {
      if (options.variant === "destructive") {
        toast.error(options.title, { description: options.description });
      } else if (options.variant === "success") {
        toast.success(options.title, { description: options.description });
      } else {
        toast(options.title, { description: options.description });
      }
    },
  };
};
