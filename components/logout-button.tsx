"use client"

import { LogOutIcon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/auth-actions"

export function LogoutButton() {
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() => logout()}
    >
      <LogOutIcon />
      Logout
    </DropdownMenuItem>
  )
}
