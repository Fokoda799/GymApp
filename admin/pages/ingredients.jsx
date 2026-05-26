import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../components/Layout"
import Modal from "../components/Modal"
import FormField from "../components/FormField"
import ImageUpload from "../components/ImageUpload"
import Pagination from "../components/Pagination"
import ConfirmDelete from "../components/ConfirmDelete"

const empty = { name: "", image: "", calories: "", type: "" }

const typeOptions = [
  { value: "protein", label: "Protein" },
  { value: "carb", label: "Carbohydrate" },
  { value: "fat", label: "Fat" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fruit", label: "Fruit" },
  { value: "dairy", label: "Dairy" },
  { value: "other", label: "Other" }
]

export default function Ingredients() {
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
  const LIMIT = 12

  const load = useCallback(async () => {
    try {
      const r = await axios.get("/api/ingredients", { params: { page, limit: LIMIT, search } })
      setData(r.data.data)
      setTotal(r.data.total)
    } catch (e) {
      if (e.response?.status === 401) router.replace("/login")
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  function openCreate() { setForm(empty); setError(""); setModal("create") }
  function openEdit(item) { setForm({ ...item, calories: item.calories ?? "" }); setError(""); setModal("edit") }
  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      if (modal === "create") await axios.post("/api/ingredients", form)
      else await axios.put(`/api/ingredients/${form.id}`, form)
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
      await axios.delete(`/api/ingredients/${delTarget}`)
      setDelTarget(null)
      load()
    } catch { setDelTarget(null) }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-2xl font-bold">Ingredients</h1>
          <p className="text-muted text-sm mt-1">{total} total</p>
        </div>
        <button onClick={openCreate} className="bg-accent text-black font-bold px-4 py-2 rounded text-sm hover:bg-white transition-colors font-mono">
          + NEW INGREDIENT
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search ingredients..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm bg-card border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center text-muted text-sm py-12">No ingredients found</div>
        ) : data.map(item => (
          <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden group">
            <div className="h-32 bg-surface flex items-center justify-center overflow-hidden">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <span className="text-4xl">🥗</span>
              }
            </div>
            <div className="p-3">
              <p className="text-white font-medium text-sm truncate">{item.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted text-xs">{item.calories ? `${item.calories} kcal` : "—"}</span>
                {item.type && <span className="text-accent text-xs font-mono capitalize">{item.type}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(item)} className="flex-1 text-xs font-mono text-accent border border-accent/30 hover:bg-accent hover:text-black rounded py-1 transition-colors">EDIT</button>
                <button onClick={() => setDelTarget(item.id)} className="flex-1 text-xs font-mono text-red-400 border border-red-400/30 hover:bg-red-400 hover:text-black rounded py-1 transition-colors">DEL</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "New Ingredient" : "Edit Ingredient"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUpload label="Image" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
            <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Calories (kcal)" name="calories" type="number" value={form.calories} onChange={handleChange} />
              <FormField label="Type" name="type" type="select" value={form.type} onChange={handleChange} options={typeOptions} />
            </div>
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

      {delTarget && <ConfirmDelete label="ingredient" onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
    </Layout>
  )
}
