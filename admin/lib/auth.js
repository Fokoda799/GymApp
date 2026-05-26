import jwt from "jsonwebtoken"
import { parse } from "cookie"

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export function getTokenFromRequest(req) {
  const cookies = parse(req.headers.cookie || "")
  return cookies.token || null
}

export function requireAuth(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}
