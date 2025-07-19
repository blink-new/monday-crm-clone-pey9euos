import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { analyticsService } from '@/services/analyticsService'
import { seedService } from '@/services/seedService'

interface DashboardStats {
  totalContacts: number
  totalDeals: number
  totalRevenue: number
  conversionRate: number
  activeBoards: number
  completedTasks: number
  pendingTasks: number
  teamMembers: number
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dashboardStats = await analyticsService.getDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedData = async () => {
    try {
      await seedService.seedAllData()
      await loadDashboardData() // Refresh data after seeding
    } catch (error) {
      console.error('Failed to seed data:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Monday CRM!</h3>
          <p className="text-gray-500 mb-6">Get started by generating some sample data to explore the platform.</p>
          <Button onClick={handleSeedData} className="gap-2">
            <Plus className="w-4 h-4" />
            Generate Sample Data
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Deals',
      value: stats.totalDeals.toLocaleString(),
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: '-2%',
      trend: 'down',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New contact added', contact: 'Sarah Johnson', time: '2 minutes ago', type: 'contact' },
                { action: 'Deal moved to closing', contact: 'Acme Corp - $50K', time: '15 minutes ago', type: 'deal' },
                { action: 'Task completed', contact: 'Follow up with lead', time: '1 hour ago', type: 'task' },
                { action: 'Meeting scheduled', contact: 'Demo with TechStart', time: '2 hours ago', type: 'meeting' },
                { action: 'New board created', contact: 'Q1 Sales Pipeline', time: '3 hours ago', type: 'board' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'contact' ? 'bg-blue-500' :
                    activity.type === 'deal' ? 'bg-green-500' :
                    activity.type === 'task' ? 'bg-orange-500' :
                    activity.type === 'meeting' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.contact}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Task Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completed Tasks</span>
                    <span>{stats.completedTasks}/{stats.completedTasks + stats.pendingTasks}</span>
                  </div>
                  <Progress 
                    value={(stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-semibold">{stats.teamMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Boards</span>
                  <span className="font-semibold">{stats.activeBoards}</span>
                </div>
                <div className="flex -space-x-2 pt-2">
                  {['JD', 'SM', 'AB', 'KL', 'MN'].slice(0, stats.teamMembers).map((initials, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    >
                      {initials}
                    </div>
                  ))}
                  {stats.teamMembers > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                      +{stats.teamMembers - 5}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Contact
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Target className="w-4 h-4" />
                  Create Deal
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}