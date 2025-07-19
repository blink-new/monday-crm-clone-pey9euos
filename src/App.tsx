import React, { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { DashboardView } from './components/dashboard/DashboardView'
import { BoardsView } from './components/boards/BoardsView'
import { ContactsView } from './components/contacts/ContactsView'
import { DealsView } from './components/deals/DealsView'
import { AnalyticsView } from './components/analytics/AnalyticsView'
import { SettingsView } from './components/settings/SettingsView'
import { ContactModal } from './components/modals/ContactModal'
import { DealModal } from './components/modals/DealModal'
import { BoardModal } from './components/modals/BoardModal'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isDealModalOpen, setIsDealModalOpen] = useState(false)
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)

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
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <CardTitle className="text-2xl">LEVERAGE CRM</CardTitle>
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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-contact':
        setIsContactModalOpen(true)
        break
      case 'create-deal':
        setIsDealModalOpen(true)
        break
      case 'new-board':
        setIsBoardModalOpen(true)
        break
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
        return <DealsView />
      case 'analytics':
        return <AnalyticsView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        onQuickAction={handleQuickAction}
      />
      
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

      {/* Global Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={() => {}} // Will be handled by individual views
      />
      
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSave={() => {}} // Will be handled by individual views
      />
      
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={() => {}} // Will be handled by individual views
      />
    </div>
  )
}

export default App