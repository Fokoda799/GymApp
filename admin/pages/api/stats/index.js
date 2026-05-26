import pool from "../../../lib/db"
import { withAuth } from "../../../middleware/withAuth"

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end()
  try {
    const [[{ clients }]] = await pool.query("SELECT COUNT(*) as clients FROM Clients")
    const [[{ coaches }]] = await pool.query("SELECT COUNT(*) as coaches FROM Coaches")
    const [[{ exercises }]] = await pool.query("SELECT COUNT(*) as exercises FROM Exercises")
    const [[{ ingredients }]] = await pool.query("SELECT COUNT(*) as ingredients FROM Ingredients")
    const [recent] = await pool.query(
      "SELECT id, name, email, gender, goal FROM Clients ORDER BY id DESC LIMIT 5"
    )
    return res.status(200).json({ clients, coaches, exercises, ingredients, recent })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export default withAuth(handler)