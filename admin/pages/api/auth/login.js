import pool from "../../../lib/db"
import bcrypt from "bcrypt"
import { signToken } from "../../../lib/auth"
import { serialize } from "cookie"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()
  const { password } = req.body
  console.log(password)
  if (!password) return res.status(400).json({ error: "Email and password required" })

  try {
    // const [rows] = await pool.query("SELECT * FROM coaches WHERE email = ?", [email])
    if (password !== "uFgW9loKIuJde35Z") return res.status(401).json({ error: "Invalid password" })
    const token = signToken({ ok: true })
    res.setHeader("Set-Cookie", serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/"
    }))
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}