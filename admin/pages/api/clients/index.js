import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"
import bcrypt from "bcrypt"

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
        where = "WHERE c.name LIKE ? OR c.email LIKE ?"
        params = [`%${search}%`, `%${search}%`]
      }
      const [rows] = await pool.query(
        `SELECT c.*, co.name as coachName FROM Clients c LEFT JOIN Coaches co ON c.coachID = co.id ${where} ORDER BY c.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM Clients c ${where}`,
        params
      )
      return res.status(200).json({ data: rows, total, page, limit })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "POST") {
    const { name, email, image, birth, gender, weight, height, goal, coachID } = req.body
    if (!name || !email) return res.status(400).json({ error: "Name and email required" })
    try {
      const hashedPassword = await bcrypt.hash("1111", 10)
      const [result] = await pool.query(
        "INSERT INTO Clients (name, email, image, birth, gender, weight, height, goal, coachID, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, image || null, birth || null, gender || null, weight || null, height || null, goal || null, coachID || null, hashedPassword]
      )
      return res.status(201).json({ id: result.insertId })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
