import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[hsl(222_40%_10%/0.95)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/40 group-[.toaster]:shadow-card group-[.toaster]:rounded-xl group-[.toaster]:border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-secondary/50 group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:border group-[.toast]:border-border/40",
          success:
            "group-[.toaster]:border-green-500/30 group-[.toaster]:shadow-[0_0_20px_-5px_rgba(34,197,94,0.15)]",
          error:
            "group-[.toaster]:border-destructive/30 group-[.toaster]:shadow-[0_0_20px_-5px_rgba(220,38,38,0.15)]",
          warning:
            "group-[.toaster]:border-yellow-500/30 group-[.toaster]:shadow-[0_0_20px_-5px_rgba(234,179,8,0.15)]",
          info:
            "group-[.toaster]:border-primary/30 group-[.toaster]:shadow-[0_0_20px_-5px_rgba(255,122,24,0.15)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
