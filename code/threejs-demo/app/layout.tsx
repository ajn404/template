import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import '@/app/globals.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body >
        <SidebarProvider>
          <div className="flex h-screen w-screen">
            <AppSidebar />
            <main className="flex-1 max-w-full">
              <div className="flex bg-transparent">
                <SidebarTrigger />
                <h2 className="font-bold">just some three demo</h2>
              </div>
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>

  )
}
