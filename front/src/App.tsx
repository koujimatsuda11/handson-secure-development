import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { CurrentUserProvider } from './contexts/CurrentUserContext'
import { Layout } from './components/Layout'
import { TimelinePage } from './pages/TimelinePage'
import { ProfilePage } from './pages/ProfilePage'
import './App.css'

const queryClient = new QueryClient()

// URLから初期状態を取得する関数
const getInitialStateFromURL = () => {
  const path = window.location.pathname
  if (path.startsWith('/profile/')) {
    const username = path.split('/profile/')[1]
    return { activePage: 'profile' as const, profileUsername: username }
  }
  return { activePage: 'home' as const, profileUsername: undefined }
}

function App() {
  const initialState = getInitialStateFromURL()
  const [activePage, setActivePage] = useState<'home' | 'profile'>(
    initialState.activePage,
  )
  const [profileUsername, setProfileUsername] = useState<string | undefined>(
    initialState.profileUsername,
  )

  // ブラウザバック対応
  useEffect(() => {
    const handlePopState = () => {
      const newState = getInitialStateFromURL()
      setActivePage(newState.activePage)
      setProfileUsername(newState.profileUsername)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (page: string, username?: string) => {
    if (page === 'home') {
      setActivePage('home')
      setProfileUsername(undefined)
      window.history.pushState({}, '', '/')
    } else if (page === 'profile') {
      setActivePage('profile')
      setProfileUsername(username)
      window.history.pushState({}, '', `/profile/${username}`)
    }
  }

  return (
    <Authenticator 
      loginMechanisms={[
        'username',
      ]}
      signUpAttributes={[
        'email',
        'nickname',
      ]}
      hideSignUp={false}
    >
      {() => (
        <QueryClientProvider client={queryClient}>
          <CurrentUserProvider>
            <Layout activePage={activePage} onNavigate={handleNavigate}>
              {activePage === 'profile' ? (
                <ProfilePage username={profileUsername} />
              ) : (
                <TimelinePage onAvatarClick={handleNavigate} />
              )}
            </Layout>
          </CurrentUserProvider>
        </QueryClientProvider>
      )}
    </Authenticator>
  )
}

export default App
