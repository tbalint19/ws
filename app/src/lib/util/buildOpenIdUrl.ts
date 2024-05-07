type Params = {
  url: string
  clientId: string
  redirectUri: string
}

export const builOpenIdUrl = ({
  url, clientId, redirectUri
}: Params): string => {
  const searchParams = new URLSearchParams()
  searchParams.append('response_type', 'code')
  searchParams.append('scope', 'openid email profile')
  searchParams.append('client_id', clientId)
  searchParams.append('redirect_uri', redirectUri)
  searchParams.append('prompt', 'consent')
  const googleAuthUrl = `${url}?${searchParams.toString()}`
  return googleAuthUrl
}
