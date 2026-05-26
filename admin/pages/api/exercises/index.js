import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  if (req.method === "GET") {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ""
    const offset = (page - 1) * limit
    try {
      let where = ""
      let params = []
      if (search) {
        where = "WHERE e.name LIKE ? OR e.muscle LIKE ?"
        params = [`%${search}%`, `%${search}%`]
      }
      const [rows] = await pool.query(
        `SELECT e.*, b.name as bodyPartName FROM Exercises e LEFT JOIN BodyParts b ON e.bodyPartID = b.id ${where} ORDER BY e.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM Exercises e ${where}`,
        params
      )
      return res.status(200).json({ data: rows, total, page, limit })
    } catch (err) {
      return res.status(500).json({ error: err })
    }
  }

  if (req.method === "POST") {
    const { name, image, muscle, video, description, bodyPartID } = req.body
    if (!name) return res.status(400).json({ error: "Name required" })
    try {
      const [result] = await pool.query(
        "INSERT INTO Exercises (name, image, muscle, video, description, bodyPartID) VALUES (?, ?, ?, ?, ?, ?)",
        [name, image || null, muscle || null, video || null, description || null, bodyPartID || null]
      )
      return res.status(201).json({ id: result.insertId })
    } catch (err) {
      return res.status(500).json({ error: err })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
