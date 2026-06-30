import { useAuth0 } from '@auth0/auth0-vue'

type FetchProtectedOptions = RequestInit & {
  headers?: HeadersInit
}

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()

  async function fetchProtected(
    url: string,
    options: FetchProtectedOptions = {},
  ): Promise<Response> {
    const token = await getAccessTokenSilently()

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  return { fetchProtected }
}
