export async function getSignedImageUrl(key: string): Promise<string> {
  const response = await fetch(`/api/get-signed-url?key=${encodeURIComponent(key)}`)

  if (!response.ok) {
    throw new Error('Failed to get signed URL')
  }

  const data = await response.json()
  return data.signedUrl
}
