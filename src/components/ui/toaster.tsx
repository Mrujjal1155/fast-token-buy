import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon =
          variant === "destructive" ? (
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          ) : variant === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          );

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Gradient accent bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                variant === "destructive"
                  ? "bg-gradient-to-b from-destructive to-destructive/40"
                  : variant === "success"
                  ? "bg-gradient-to-b from-green-400 to-green-400/40"
                  : "bg-gradient-to-b from-primary to-primary/40"
              }`}
            />
            {icon}
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
