import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={
          "w-full px-3 py-2 rounded-md border outline-none " +
          className
        }
      />
    );
  }
);
Input.displayName = "Input";
