import React, { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { DashboardView } from './components/dashboard/DashboardView'
import { BoardsView } from './components/boards/BoardsView'
import { ContactsView } from './components/contacts/ContactsView'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <CardTitle className="text-2xl">Monday CRM</CardTitle>
            <p className="text-gray-500">Please sign in to continue</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard'
      case 'boards': return 'Boards'
      case 'contacts': return 'Contacts'
      case 'deals': return 'Deals'
      case 'analytics': return 'Analytics'
      case 'settings': return 'Settings'
      default: return 'Dashboard'
    }
  }

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Overview of your CRM performance'
      case 'boards': return 'Manage your projects and tasks'
      case 'contacts': return 'Manage your customer relationships'
      case 'deals': return 'Track your sales pipeline'
      case 'analytics': return 'Insights and reports'
      case 'settings': return 'Configure your workspace'
      default: return ''
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'boards':
        return <BoardsView />
      case 'contacts':
        return <ContactsView />
      case 'deals':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deals View</h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics View</h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings View</h3>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        )
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar 
          title={getViewTitle()} 
          subtitle={getViewSubtitle()}
        />
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderView()}
        </div>
      </div>
    </div>
  )
}

export default App