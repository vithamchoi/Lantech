"use client";

import { useAppStore } from "../../store/appStore";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const darkMode = useAppStore((state) => state.darkMode);

  return (
    <Sonner
      theme={darkMode ? "dark" : "light"}
      className="toaster group"
      richColors
      closeButton
      duration={4000}
      position="top-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          success: "group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900 group-[.toaster]:border-emerald-200 dark:group-[.toaster]:bg-emerald-950/30 dark:group-[.toaster]:text-emerald-400 dark:group-[.toaster]:border-emerald-900/50",
          error: "group-[.toaster]:bg-rose-50 group-[.toaster]:text-rose-900 group-[.toaster]:border-rose-200 dark:group-[.toaster]:bg-rose-950/30 dark:group-[.toaster]:text-rose-400 dark:group-[.toaster]:border-rose-900/50",
          warning: "group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-950/30 dark:group-[.toaster]:text-amber-400 dark:group-[.toaster]:border-amber-900/50",
          info: "group-[.toaster]:bg-sky-50 group-[.toaster]:text-sky-900 group-[.toaster]:border-sky-200 dark:group-[.toaster]:bg-sky-950/30 dark:group-[.toaster]:text-sky-400 dark:group-[.toaster]:border-sky-900/50",
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
