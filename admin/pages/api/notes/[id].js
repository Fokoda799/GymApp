import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM Notes WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
