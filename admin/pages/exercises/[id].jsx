import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Layout from "../../components/Layout"
import ConfirmDelete from "../../components/ConfirmDelete"

export default function ExerciseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [exercise, setExercise] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [delNote, setDelNote] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    axios.get(`/api/exercises/${id}`)
      .then(r => setExercise(r.data))
      .catch(e => { if (e.response?.status === 401) router.replace("/login") })
    loadNotes()
  }, [id])

  function loadNotes() {
    if (!id) return
    axios.get("/api/notes", { params: { exerciseID: id } })
      .then(r => setNotes(r.data.data))
      .catch(() => {})
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    setError("")
    try {
      await axios.post("/api/notes", { content: noteText, exerciseID: id })
      setNoteText("")
      loadNotes()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add note")
    } finally {
      setAddingNote(false)
    }
  }

  async function handleDeleteNote() {
    try {
      await axios.delete(`/api/notes/${delNote}`)
      setDelNote(null)
      loadNotes()
    } catch { setDelNote(null) }
  }

  if (!exercise) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted font-mono text-sm">Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <button onClick={() => router.push("/exercises")} className="text-muted hover:text-accent text-sm font-mono mb-6 flex items-center gap-2 transition-colors">
        ← BACK TO EXERCISES
      </button>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {exercise.image ? (
              <img src={exercise.image} alt={exercise.name} className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-56 bg-surface flex items-center justify-center text-6xl">◑</div>
            )}
            <div className="p-5">
              <h1 className="text-white text-2xl font-bold">{exercise.name}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {exercise.muscle && (
                  <span className="bg-surface border border-border rounded px-2.5 py-1 text-xs font-mono text-accent capitalize">
                    {exercise.muscle}
                  </span>
                )}
                {exercise.bodyPartName && (
                  <span className="bg-surface border border-border rounded px-2.5 py-1 text-xs font-mono text-white capitalize">
                    {exercise.bodyPartName}
                  </span>
                )}
              </div>
              {exercise.description && (
                <p className="text-muted text-sm mt-4 leading-relaxed">{exercise.description}</p>
              )}
              {exercise.video && (
                <a
                  href={exercise.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-accent text-sm font-mono hover:underline"
                >
                  ▶ WATCH VIDEO
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-white font-bold mb-4">Notes ({notes.length})</h2>

            <form onSubmit={handleAddNote} className="mb-5">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={3}
                placeholder="Add a note..."
                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors resize-none mb-2"
              />
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="bg-accent text-black font-bold px-4 py-2 rounded text-sm hover:bg-white transition-colors disabled:opacity-40 font-mono"
              >
                {addingNote ? "ADDING..." : "+ ADD NOTE"}
              </button>
            </form>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-muted text-sm text-center py-6">No notes yet</p>
              ) : notes.map(note => (
                <div key={note.id} className="bg-surface border border-border rounded p-3 group">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-white text-sm leading-relaxed flex-1">{note.content}</p>
                    <button
                      onClick={() => setDelNote(note.id)}
                      className="text-muted hover:text-red-400 transition-colors shrink-0 font-mono text-xs opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {delNote && <ConfirmDelete label="note" onConfirm={handleDeleteNote} onCancel={() => setDelNote(null)} />}
    </Layout>
  )
}
