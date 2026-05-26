import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        "SELECT c.*, co.name as coachName FROM Clients c LEFT JOIN Coaches co ON c.coachID = co.id WHERE c.id = ?",
        [id]
      )
      if (!rows.length) return res.status(404).json({ error: "Not found" })
      return res.status(200).json(rows[0])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "PUT") {
    const { name, email, image, birth, gender, weight, height, goal, coachID } = req.body
    try {
      await pool.query(
        "UPDATE Clients SET name=?, email=?, image=?, birth=?, gender=?, weight=?, height=?, goal=?, coachID=? WHERE id=?",
        [name, email, image || null, birth || null, gender || null, weight || null, height || null, goal || null, coachID || null, id]
      )
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM Clients WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
