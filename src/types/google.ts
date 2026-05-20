export interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

export interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (
    element: HTMLElement | null,
    options: {
      type?: 'standard' | 'icon'
      size?: 'large' | 'medium' | 'small'
      theme?: 'filled_blue' | 'outline'
      text?: 'signin' | 'signup'
    }
  ) => void
  prompt: (onSuccess?: () => void, onError?: () => void) => void
}

export interface GoogleAccounts {
  id: GoogleAccountsId
}

export interface GoogleObject {
  accounts: GoogleAccounts
}

declare global {
  interface Window {
    google?: GoogleObject
  }
}
