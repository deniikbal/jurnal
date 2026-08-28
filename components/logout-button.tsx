"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"

export function LogoutButton() {
  const router = useRouter()

  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/login")
            },
          },
        })
      }
    >
      <LogOutIcon />
      Logout
    </DropdownMenuItem>
  )
}
