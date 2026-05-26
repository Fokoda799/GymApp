import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../components/Layout"
import Modal from "../components/Modal"
import FormField from "../components/FormField"
import ImageUpload from "../components/ImageUpload"
import Pagination from "../components/Pagination"
import ConfirmDelete from "../components/ConfirmDelete"

const empty = { name: "", email: "", image: "", specialty: "", bio: "", password: "" }

export default function Coaches() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [delTarget, setDelTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const LIMIT = 10

  const load = useCallback(async () => {
    try {
      const r = await axios.get("/api/coaches", { params: { page, limit: LIMIT, search } })
      setData(r.data.data)
      setTotal(r.data.total)
    } catch (e) {
      if (e.response?.status === 401) router.replace("/login")
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  function openCreate() { setForm(empty); setError(""); setModal("create") }
  function openEdit(item) { setForm({ ...item, password: "" }); setError(""); setModal("edit") }
  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      if (modal === "create") {
        await axios.post("/api/coaches", form)
      } else {
        await axios.put(`/api/coaches/${form.id}`, form)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await axios.delete(`/api/coaches/${delTarget}`)
      setDelTarget(null)
      load()
    } catch {
      setDelTarget(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-2xl font-bold">Coaches</h1>
          <p className="text-muted text-sm mt-1">{total} total</p>
        </div>
        <button onClick={openCreate} className="bg-accent text-black font-bold px-4 py-2 rounded text-sm hover:bg-white transition-colors font-mono">
          + NEW COACH
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search coaches..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm bg-card border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Photo", "Name", "Email", "Specialty", ""].map(h => (
                  <th key={h} className="text-left text-muted font-mono text-xs uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">No coaches found</td></tr>
              ) : data.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    {c.image
                      ? <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                      : <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted text-xs font-mono">{c.name?.[0]?.toUpperCase()}</div>
                    }
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.specialty || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-xs font-mono text-accent hover:underline">EDIT</button>
                      <button onClick={() => setDelTarget(c.id)} className="text-xs font-mono text-red-400 hover:underline">DEL</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "New Coach" : "Edit Coach"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUpload label="Photo" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <FormField label="Specialty" name="specialty" value={form.specialty} onChange={handleChange} />
            <FormField label="Bio" name="bio" type="textarea" value={form.bio} onChange={handleChange} />
            <FormField
              label={modal === "edit" ? "New Password (leave blank to keep)" : "Password"}
              name="password" type="password" value={form.password} onChange={handleChange}
              required={modal === "create"}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 text-sm rounded border border-border text-white hover:bg-surface transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm rounded bg-accent text-black font-bold hover:bg-white transition-colors disabled:opacity-50 font-mono">
                {saving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {delTarget && <ConfirmDelete label="coach" onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
    </Layout>
  )
}
