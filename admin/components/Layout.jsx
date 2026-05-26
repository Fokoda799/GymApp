import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import axios from "axios"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/clients", label: "Clients", icon: "◈" },
  { href: "/coaches", label: "Coaches", icon: "◉" },
  { href: "/ingredients", label: "Ingredients", icon: "◍" },
  { href: "/bodyparts", label: "Body Parts", icon: "◐" },
  { href: "/exercises", label: "Exercises", icon: "◑" }
]

export default function Layout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await axios.post("/api/auth/logout")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-dark flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-surface border-r border-border flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-border">
          <span className="font-mono text-accent text-xl font-bold tracking-tight">GYM<span className="text-white">FUEL</span></span>
          <p className="text-muted text-xs mt-1 font-mono">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const active = router.pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 ${active ? "bg-accent text-black font-bold" : "text-white hover:bg-card hover:text-accent"}`}>
                <span className="font-mono text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-muted hover:text-white hover:bg-card transition-all duration-150">
            <span className="font-mono">⊗</span> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-surface border-b border-border flex items-center px-4 lg:px-6 gap-4">
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted font-mono">LIVE</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
