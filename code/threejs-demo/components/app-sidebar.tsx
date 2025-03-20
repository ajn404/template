import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { getMenuItems } from "@/utils/getMenuItems"
import { ClientSideMenuItem } from "./client-side-menu-item"

export async function AppSidebar() {
    const menuItems = await getMenuItems();

    return (
        <Sidebar className="border-r min-h-screen bg-background">
            <SidebarHeader className="p-4 border-b">
                <h2 className="text-lg font-semibold">Three.js Demo</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-2 space-y-1">
                    {menuItems.map(item => (
                        <ClientSideMenuItem 
                            key={item.href}
                            item={item}
                        />
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                <p className="text-sm text-muted-foreground">© 2024 Three.js Demo</p>
            </SidebarFooter>
        </Sidebar>
    )
}
