import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT * FROM BodyParts WHERE id = ?", [id])
      if (!rows.length) return res.status(404).json({ error: "Not found" })
      return res.status(200).json(rows[0])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "PUT") {
    const { name, image } = req.body
    try {
      await pool.query("UPDATE BodyParts SET name=?, image=? WHERE id=?", [name, image || null, id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM BodyParts WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)