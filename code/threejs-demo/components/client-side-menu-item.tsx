"use client"

import { SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ClientSideMenuItemProps {
    item: {
        href: string
        name: string
    }
}

export function ClientSideMenuItem({ item }: ClientSideMenuItemProps) {
    const pathname = usePathname()

    return (
        <SidebarMenuItem 
            className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
        >
            <Link
                href={item.href}
                className="w-full"
            >
                {item.name}
            </Link>
        </SidebarMenuItem>
    )
} 