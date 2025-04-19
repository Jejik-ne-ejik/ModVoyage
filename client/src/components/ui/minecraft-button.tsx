import React from "react";
import { cn } from "@/lib/utils";

interface MinecraftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg";
}

export const MinecraftButton = React.forwardRef<HTMLButtonElement, MinecraftButtonProps>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "relative inline-block text-white text-center cursor-pointer active:translate-y-[2px] active:border-b-2";
    
    const variantStyles = {
      primary: "bg-primary border-2 border-primary-dark border-b-4 text-shadow-primary hover:bg-primary-dark",
      secondary: "bg-secondary border-2 border-secondary-dark border-b-4 text-shadow-secondary hover:bg-secondary-dark",
    };
    
    const sizeStyles = {
      xs: "text-xs py-1 px-2",
      sm: "text-sm py-1 px-3",
      md: "py-2 px-4",
      lg: "text-lg py-3 px-6",
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MinecraftButton.displayName = "MinecraftButton";
