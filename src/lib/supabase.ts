import { createClient } from "@supabase/supabase-js"
import { projectId, publicAnonKey } from "../../utils/supabase/info"

export { publicAnonKey }
export const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey)
export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2f11454b`

export async function api(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(`${serverUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data.error || (response.status === 404
      ? "The deployed MedLink server is outdated and does not include this partner feature. Redeploy make-server-2f11454b from the current project source."
      : `Server request failed (${response.status})`)
    const error = new Error(message)
    Object.assign(error, { status: response.status })
    throw error
  }
  return data
}
