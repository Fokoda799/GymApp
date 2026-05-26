import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await axios.post("/api/auth/login", form)
      router.push("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-mono text-3xl font-bold text-white">
            GYM<span className="text-accent">FUEL</span>
          </h1>
          <p className="text-muted text-sm mt-2 font-mono tracking-widest">ADMIN PANEL</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-white font-bold text-lg mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded px-3 py-2 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black font-bold py-2.5 rounded text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
