import React from "react";
import { cn } from "@/lib/utils";

interface PixelBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PixelBorder = React.forwardRef<HTMLDivElement, PixelBorderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-2 border-gray-400 border-solid relative overflow-hidden",
          className
        )}
        style={{
          borderImageSlice: 2,
          borderImageWidth: 2,
          borderImageOutset: 0,
          borderImageSource: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='6'><path d='M0 2h2v2H0zM2 0h2v2H2zM4 2h2v2H4zM2 4h2v2H2z' fill='%23888'/></svg>\")",
          borderImageRepeat: "space",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PixelBorder.displayName = "PixelBorder";
