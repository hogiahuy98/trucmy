"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-cream group-[.toaster]:text-dark-olive group-[.toaster]:border-olive-grey/20 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-olive-grey",
          actionButton:
            "group-[.toast]:bg-avocado-green group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-warm-linen group-[.toast]:text-olive-grey",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

