import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT * FROM Ingredients WHERE id = ?", [id])
      if (!rows.length) return res.status(404).json({ error: "Not found" })
      return res.status(200).json(rows[0])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "PUT") {
    const { name, image, calories, type } = req.body
    try {
      await pool.query(
        "UPDATE Ingredients SET name=?, image=?, calories=?, type=? WHERE id=?",
        [name, image || null, calories || null, type || null, id]
      )
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM Ingredients WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)