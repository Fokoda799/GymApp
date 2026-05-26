import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        "SELECT e.*, b.name as bodyPartName FROM Exercises e LEFT JOIN BodyParts b ON e.bodyPartID = b.id WHERE e.id = ?",
        [id]
      )
      if (!rows.length) return res.status(404).json({ error: "Not found" })
      return res.status(200).json(rows[0])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "PUT") {
    const { name, image, muscle, video, description, bodyPartID } = req.body
    try {
      await pool.query(
        "UPDATE Exercises SET name=?, image=?, muscle=?, video=?, description=?, bodyPartID=? WHERE id=?",
        [name, image || null, muscle || null, video || null, description || null, bodyPartID || null, id]
      )
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM Notes WHERE exerciseID = ?", [id])
      await pool.query("DELETE FROM Exercises WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)