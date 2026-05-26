export async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "GymApp")

  const res = await fetch("https://api.cloudinary.com/v1_1/dlqcknocf/image/upload", {
    method: "POST",
    body: formData
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || "Upload failed")
  }

  const data = await res.json()
  return data.secure_url
}
