import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Settings, 
  HelpCircle, 
  Plus,
  Filter,
  SortAsc,
  MoreHorizontal,
  Users
} from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Custom actions */}
          {actions}
          
          {/* Default actions */}
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <SortAsc className="w-4 h-4" />
            Sort
          </Button>
          
          <div className="w-px h-6 bg-gray-200" />
          
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>
    </div>
  )
}