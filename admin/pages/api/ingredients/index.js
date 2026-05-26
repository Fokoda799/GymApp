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
        where = "WHERE name LIKE ?"
        params = [`%${search}%`]
      }
      const [rows] = await pool.query(
        `SELECT * FROM Ingredients ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM Ingredients ${where}`, params)
      return res.status(200).json({ data: rows, total, page, limit })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "POST") {
    const { name, image, calories, type } = req.body
    if (!name) return res.status(400).json({ error: "Name required" })
    try {
      const [result] = await pool.query(
        "INSERT INTO Ingredients (name, image, calories, type) VALUES (?, ?, ?, ?)",
        [name, image || null, calories || null, type || null]
      )
      return res.status(201).json({ id: result.insertId })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
