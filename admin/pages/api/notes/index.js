import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  if (req.method === "GET") {
    const { exerciseID } = req.query
    if (!exerciseID) return res.status(400).json({ error: "exerciseID required" })
    try {
      const [rows] = await pool.query(
        "SELECT * FROM Notes WHERE exerciseID = ? ORDER BY id DESC",
        [exerciseID]
      )
      return res.status(200).json({ data: rows })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "POST") {
    const { content, exerciseID } = req.body
    if (!content || !exerciseID) return res.status(400).json({ error: "content and exerciseID required" })
    try {
      const [result] = await pool.query(
        "INSERT INTO Notes (content, exerciseID) VALUES (?, ?)",
        [content, exerciseID]
      )
      return res.status(201).json({ id: result.insertId })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
