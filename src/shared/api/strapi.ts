export const STRAPI_URL: string = import.meta.env.VITE_STRAPI_URL ?? 'http://localhost:1337'

interface StrapiSingleResponse<T> {
  data: T
}

interface StrapiCollectionResponse<T> {
  data: T[]
}

async function request<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString()
  const response = await fetch(`${STRAPI_URL}/api/${path}${query ? `?${query}` : ''}`)
  if (!response.ok) {
    throw new Error(`Strapi request failed: ${path} (${response.status})`)
  }
  return (await response.json()) as T
}

export async function fetchOne<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { data } = await request<StrapiSingleResponse<T>>(path, params)
  return data
}

export async function fetchMany<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  const { data } = await request<StrapiCollectionResponse<T>>(path, params)
  return data
}

export function mediaUrl(media: { url: string } | null | undefined): string | null {
  if (!media?.url) return null
  return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`
}
