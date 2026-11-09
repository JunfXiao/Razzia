import clsx from "clsx"
import React from "react"

type Props = React.ComponentProps<"input"> & {
  variant?: "sm" | "md"
}

const Input = ({
  className,
  type = "text",
  variant = "md",
  ...otherProps
}: Props) => (
  <input
    type={type}
    className={clsx(
      "focus:border-primary border-accent text-foreground rounded-lg border-2 font-semibold focus:outline-none",
      variant === "md" && "p-2 text-lg",
      variant === "sm" && "px-3 py-2 text-sm",
      // Masks the last typed character that mobile browsers briefly reveal.
      type === "password" && "font-password placeholder:font-display",
      className,
    )}
    {...otherProps}
  />
)

export default Input
