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
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface AnalyticsData {
  contacts: {
    total: number
    leads: number
    prospects: number
    customers: number
    growth: number
  }
  deals: {
    total: number
    totalValue: number
    avgValue: number
    winRate: number
    monthlyRevenue: number
    growth: number
  }
  tasks: {
    total: number
    completed: number
    overdue: number
    completionRate: number
  }
  activities: {
    total: number
    thisWeek: number
    growth: number
  }
}

export function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Get contacts data
      const contacts = await blink.db.contacts.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })

      // Get deals data
      const deals = await blink.db.deals.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })

      // Get tasks data
      const tasks = await blink.db.tasks.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })

      // Get activities data
      const activities = await blink.db.activities.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })

      // Calculate analytics
      const contactStats = {
        total: contacts.length,
        leads: contacts.filter(c => c.status === 'lead').length,
        prospects: contacts.filter(c => c.status === 'prospect').length,
        customers: contacts.filter(c => c.status === 'customer').length,
        growth: 12.5 // Mock growth percentage
      }

      const dealStats = {
        total: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
        avgValue: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
        winRate: deals.length > 0 ? (deals.filter(d => d.stage === 'closed-won').length / deals.length) * 100 : 0,
        monthlyRevenue: deals.filter(d => d.stage === 'closed-won').reduce((sum, deal) => sum + deal.value, 0),
        growth: 23.8 // Mock growth percentage
      }

      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => {
          if (!t.due_date) return false
          return new Date(t.due_date) < new Date() && t.status !== 'completed'
        }).length,
        completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
      }

      const activityStats = {
        total: activities.length,
        thisWeek: activities.filter(a => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(a.created_at) >= weekAgo
        }).length,
        growth: 15.2 // Mock growth percentage
      }

      setAnalytics({
        contacts: contactStats,
        deals: dealStats,
        tasks: taskStats,
        activities: activityStats
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500 mb-6">Start adding contacts and deals to see your analytics.</p>
          <Button onClick={loadAnalytics} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: analytics.contacts.total.toLocaleString(),
      change: `+${analytics.contacts.growth}%`,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.deals.totalValue),
      change: `+${analytics.deals.growth}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Win Rate',
      value: formatPercentage(analytics.deals.winRate),
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Task Completion',
      value: formatPercentage(analytics.tasks.completionRate),
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Insights and performance metrics for your CRM</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
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

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Contact Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.contacts.leads}</span>
                  <Progress 
                    value={(analytics.contacts.leads / analytics.contacts.total) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Prospects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.contacts.prospects}</span>
                  <Progress 
                    value={(analytics.contacts.prospects / analytics.contacts.total) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.contacts.customers}</span>
                  <Progress 
                    value={(analytics.contacts.customers / analytics.contacts.total) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Deal Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Deals</span>
                <span className="text-lg font-semibold">{analytics.deals.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Deal Size</span>
                <span className="text-lg font-semibold">{formatCurrency(analytics.deals.avgValue)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(analytics.deals.monthlyRevenue)}
                </span>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Win Rate Progress</span>
                  <span className="text-sm font-medium">{formatPercentage(analytics.deals.winRate)}</span>
                </div>
                <Progress value={analytics.deals.winRate} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Task Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.tasks.total}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{analytics.tasks.completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{analytics.tasks.overdue}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium">{formatPercentage(analytics.tasks.completionRate)}</span>
                </div>
                <Progress value={analytics.tasks.completionRate} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Activities</span>
                <span className="text-lg font-semibold">{analytics.activities.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{analytics.activities.thisWeek}</span>
                  <Badge variant="default" className="gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +{analytics.activities.growth}%
                  </Badge>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Weekly Activity Rate</span>
                  <span className="text-sm font-medium">
                    {analytics.activities.total > 0 ? 
                      Math.round((analytics.activities.thisWeek / analytics.activities.total) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics.activities.total > 0 ? 
                    (analytics.activities.thisWeek / analytics.activities.total) * 100 : 0} 
                  className="h-3" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Contact Growth</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">+{analytics.contacts.growth}%</p>
              <p className="text-sm text-blue-700">vs last period</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Revenue Growth</span>
              </div>
              <p className="text-2xl font-bold text-green-600">+{analytics.deals.growth}%</p>
              <p className="text-sm text-green-700">vs last period</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Activity Growth</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">+{analytics.activities.growth}%</p>
              <p className="text-sm text-purple-700">vs last period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}