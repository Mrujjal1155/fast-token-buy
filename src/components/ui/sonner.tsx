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
            "group toast group-[.toaster]:bg-[hsl(222_40%_8%/0.95)] group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-foreground group-[.toaster]:border-border/30 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:px-5 group-[.toaster]:py-4",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:font-semibold group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-secondary/50 group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:border group-[.toast]:border-border/40",
          closeButton:
            "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:bg-secondary/50 group-[.toast]:border-border/30 group-[.toast]:hover:border-border/60",
          success:
            "group-[.toaster]:!border-green-500/30 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(34,197,94,0.2),0_0_0_1px_rgba(34,197,94,0.1)]",
          error:
            "group-[.toaster]:!border-destructive/30 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(220,38,38,0.2),0_0_0_1px_rgba(220,38,38,0.1)]",
          warning:
            "group-[.toaster]:!border-yellow-500/30 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(234,179,8,0.2),0_0_0_1px_rgba(234,179,8,0.1)]",
          info:
            "group-[.toaster]:!border-primary/30 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(255,122,24,0.2),0_0_0_1px_rgba(255,122,24,0.1)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
