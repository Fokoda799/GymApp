import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../components/Layout"
import Modal from "../components/Modal"
import FormField from "../components/FormField"
import ImageUpload from "../components/ImageUpload"
import Pagination from "../components/Pagination"
import ConfirmDelete from "../components/ConfirmDelete"

const empty = { name: "", email: "", image: "", birth: "", gender: "", weight: "", height: "", goal: "", coachID: "" }

export default function Clients() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [coaches, setCoaches] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [delTarget, setDelTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const LIMIT = 10

  const load = useCallback(async () => {
    try {
      const r = await axios.get("/api/clients", { params: { page, limit: LIMIT, search } })
      setData(r.data.data)
      setTotal(r.data.total)
    } catch (e) {
      if (e.response?.status === 401) router.replace("/login")
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    axios.get("/api/coaches", { params: { limit: 100 } })
      .then(r => setCoaches(r.data.data.map(c => ({ value: c.id, label: c.name }))))
      .catch(() => {})
  }, [])

  function openCreate() { setForm(empty); setError(""); setModal("create") }
  function openEdit(item) {
    setForm({
      ...item,
      birth: item.birth ? item.birth.split("T")[0] : "",
      weight: item.weight ?? "",
      height: item.height ?? "",
      coachID: item.coachID ?? ""
    })
    setError("")
    setModal("edit")
  }

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      if (modal === "create") {
        await axios.post("/api/clients", form)
      } else {
        await axios.put(`/api/clients/${form.id}`, form)
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
      await axios.delete(`/api/clients/${delTarget}`)
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
          <h1 className="text-white text-2xl font-bold">Clients</h1>
          <p className="text-muted text-sm mt-1">{total} total</p>
        </div>
        <button onClick={openCreate} className="bg-accent text-black font-bold px-4 py-2 rounded text-sm hover:bg-white transition-colors font-mono">
          + NEW CLIENT
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm bg-card border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Image", "Name", "Email", "Gender", "Weight", "Height", "Coach", ""].map(h => (
                  <th key={h} className="text-left text-muted font-mono text-xs uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted text-xs">No clients found</td></tr>
              ) : data.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    {c.image
                      ? <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                      : <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted text-xs font-mono">{c.name?.[0]?.toUpperCase()}</div>
                    }
                  </td>
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted capitalize">{c.gender || "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.weight ? `${c.weight} kg` : "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.height ? `${c.height} cm` : "—"}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{c.coachName || "—"}</td>
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
        <Modal title={modal === "create" ? "New Client" : "Edit Client"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUpload label="Photo" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Birth Date" name="birth" type="date" value={form.birth} onChange={handleChange} />
              <FormField label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange}
                options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} />
              <FormField label="Height (cm)" name="height" type="number" value={form.height} onChange={handleChange} />
            </div>
            <FormField label="Goal" name="goal" type="textarea" value={form.goal} onChange={handleChange} />
            <FormField label="Coach" name="coachID" type="select" value={form.coachID} onChange={handleChange} options={coaches} />
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

      {delTarget && <ConfirmDelete label="client" onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
    </Layout>
  )
}
