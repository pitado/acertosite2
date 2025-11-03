import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center px-3 py-2 rounded-md border border-transparent " +
        className
      }
    />
  );
}

export default Button;
