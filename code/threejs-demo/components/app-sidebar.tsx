import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getMenuItems } from "@/utils/getMenuItems"
import Link from "next/link"

export function AppSidebar() {
    const menuItems = getMenuItems();
    console.log(menuItems)

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    {menuItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                            <Link
                                href={item.href}>{item.name}
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
