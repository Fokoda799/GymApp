import pool from "../../../lib/db"
import bcrypt from "bcrypt"
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
        where = "WHERE name LIKE ? OR email LIKE ?"
        params = [`%${search}%`, `%${search}%`]
      }
      const [rows] = await pool.query(
        `SELECT id, name, email, image, specialty, bio FROM Coaches ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM Coaches ${where}`, params)
      return res.status(200).json({ data: rows, total, page, limit })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "POST") {
    const { name, email, image, specialty, bio, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" })
    try {
      const hashed = await bcrypt.hash(password, 10)
      const [result] = await pool.query(
        "INSERT INTO Coaches (name, email, image, specialty, bio, password) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, image || null, specialty || null, bio || null, hashed]
      )
      return res.status(201).json({ id: result.insertId })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
