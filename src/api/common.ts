import axios from 'axios'
import { AuthHttpClient, SsoService } from '@bogdanovmn/ssofw'
import { handleAuthFailure } from '@/logout'

const apiUrl = import.meta.env.VITE_API_URL

const ssoService = new SsoService(import.meta.env.VITE_SSO_SERVICE_URL)

export const authApi = new AuthHttpClient(
  apiUrl,
  ssoService,
  () => { handleAuthFailure(ssoService) }
)

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Не удалось выполнить запрос'
}

export async function getPublic<T>(url: string): Promise<T> {
  const response = await axios.get<T>(`${apiUrl}${url}`)
  return response.data
}
