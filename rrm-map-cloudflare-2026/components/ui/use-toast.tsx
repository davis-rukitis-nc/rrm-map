// This is a placeholder for the toast component that would be imported from shadcn/ui
// In a real project, this would be provided by shadcn/ui

import { toast as sonnerToast } from "sonner"

export function toast({ title, description, action, variant }: any) {
  return sonnerToast(title, {
    description,
    action,
    className: variant === "destructive" ? "bg-red-500" : "",
  })
}
