import pool from "../../../lib/db"
import bcrypt from "bcrypt"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query("SELECT id, name, email, image, specialty, bio FROM Coaches WHERE id = ?", [id])
      if (!rows.length) return res.status(404).json({ error: "Not found" })
      return res.status(200).json(rows[0])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "PUT") {
    const { name, email, image, specialty, bio, password } = req.body
    try {
      if (password) {
        const hashed = await bcrypt.hash(password, 10)
        await pool.query(
          "UPDATE Coaches SET name=?, email=?, image=?, specialty=?, bio=?, password=? WHERE id=?",
          [name, email, image || null, specialty || null, bio || null, hashed, id]
        )
      } else {
        await pool.query(
          "UPDATE Coaches SET name=?, email=?, image=?, specialty=?, bio=? WHERE id=?",
          [name, email, image || null, specialty || null, bio || null, id]
        )
      }
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM Coaches WHERE id = ?", [id])
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}

export default withAuth(handler)
