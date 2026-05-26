import { verifyToken } from "../lib/auth"
import { parse } from "cookie"

export function withAuth(handler) {
  return async (req, res) => {
    const cookies = parse(req.headers.cookie || "")
    const token = cookies.token
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" })
    }
    req.user = decoded
    return handler(req, res)
  }
}
