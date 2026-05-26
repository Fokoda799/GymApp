import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../../components/Layout"
import Modal from "../../components/Modal"
import FormField from "../../components/FormField"
import ImageUpload from "../../components/ImageUpload"
import Pagination from "../../components/Pagination"
import ConfirmDelete from "../../components/ConfirmDelete"

const empty = { name: "", image: "", muscle: "", video: "", description: "", bodyPartID: "" }

export default function Exercises() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [bodyParts, setBodyParts] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [delTarget, setDelTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const LIMIT = 10

  const load = useCallback(async () => {
    try {
      const r = await axios.get("/api/exercises", { params: { page, limit: LIMIT, search } })
      setData(r.data.data)
      setTotal(r.data.total)
    } catch (e) {
      if (e.response?.status === 401) router.replace("/login")
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    axios.get("/api/bodyparts", { params: { limit: 100 } })
      .then(r => setBodyParts(r.data.data.map(b => ({ value: b.id, label: b.name }))))
      .catch(() => {})
  }, [])

  function openCreate() { setForm(empty); setError(""); setModal("create") }
  function openEdit(item) {
    setForm({ ...item, bodyPartID: item.bodyPartID ?? "" })
    setError("")
    setModal("edit")
  }
  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      if (modal === "create") await axios.post("/api/exercises", form)
      else await axios.put(`/api/exercises/${form.id}`, form)
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
      await axios.delete(`/api/exercises/${delTarget}`)
      setDelTarget(null)
      load()
    } catch { setDelTarget(null) }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-2xl font-bold">Exercises</h1>
          <p className="text-muted text-sm mt-1">{total} total</p>
        </div>
        <button onClick={openCreate} className="bg-accent text-black font-bold px-4 py-2 rounded text-sm hover:bg-white transition-colors font-mono">
          + NEW EXERCISE
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search by name or muscle..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm bg-card border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Image", "Name", "Muscle", "Body Part", ""].map(h => (
                  <th key={h} className="text-left text-muted font-mono text-xs uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-xs">No exercises found</td></tr>
              ) : data.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border border-border" />
                      : <div className="w-10 h-10 rounded bg-surface border border-border flex items-center justify-center text-muted text-lg">◑</div>
                    }
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted capitalize">{item.muscle || "—"}</td>
                  <td className="px-4 py-3 text-muted">{item.bodyPartName || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/exercises/${item.id}`)} className="text-xs font-mono text-white hover:text-accent border border-border hover:border-accent rounded px-2 py-1 transition-colors">VIEW</button>
                      <button onClick={() => openEdit(item)} className="text-xs font-mono text-accent hover:underline">EDIT</button>
                      <button onClick={() => setDelTarget(item.id)} className="text-xs font-mono text-red-400 hover:underline">DEL</button>
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
        <Modal title={modal === "create" ? "New Exercise" : "Edit Exercise"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUpload label="Exercise Image" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
            <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Muscle" name="muscle" value={form.muscle} onChange={handleChange} />
              <FormField label="Body Part" name="bodyPartID" type="select" value={form.bodyPartID} onChange={handleChange} options={bodyParts} />
            </div>
            <FormField label="Video URL" name="video" value={form.video} onChange={handleChange} />
            <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
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

      {delTarget && <ConfirmDelete label="exercise" onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
    </Layout>
  )
}
