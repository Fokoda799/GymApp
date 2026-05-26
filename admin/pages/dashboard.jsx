import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../components/Layout"
import StatCard from "../components/StatCard"

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    axios.get("/api/stats")
      .then(r => setStats(r.data))
      .catch(err => {
        if (err.response?.status === 401) router.replace("/login")
        else setError("Failed to load stats")
      })
  }, [])

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back to GymFuel Admin</p>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients" value={stats?.clients} icon="◈" />
        <StatCard label="Total Coaches" value={stats?.coaches} icon="◉" />
        <StatCard label="Exercises" value={stats?.exercises} icon="◑" />
        <StatCard label="Ingredients" value={stats?.ingredients} icon="◍" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-white font-bold">Recent Clients</h2>
          <button onClick={() => router.push("/clients")} className="text-accent text-xs font-mono hover:underline">
            VIEW ALL →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted font-mono text-xs uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-muted font-mono text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-muted font-mono text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Gender</th>
                <th className="text-left text-muted font-mono text-xs uppercase tracking-wider px-5 py-3">Goal</th>
              </tr>
            </thead>
            <tbody>
              {!stats ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-muted text-xs">Loading...</td></tr>
              ) : stats.recent.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-muted text-xs">No clients yet</td></tr>
              ) : stats.recent.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted hidden sm:table-cell">{c.email}</td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell capitalize">{c.gender || "—"}</td>
                  <td className="px-5 py-3 text-muted truncate max-w-xs">{c.goal || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
