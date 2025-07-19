import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  Target,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Deal {
  id: string
  title: string
  description: string
  value: number
  stage: string
  probability: number
  expected_close_date: string
  actual_close_date: string
  contact_id: string
  assigned_to: string
  created_at: string
  updated_at: string
  user_id: string
}

const stageColors = {
  lead: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  'closed-won': 'bg-green-100 text-green-800',
  'closed-lost': 'bg-red-100 text-red-800'
}

const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']

export function DealsView() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    loadDeals()
  }, [])

  useEffect(() => {
    filterDeals()
  }, [deals, searchTerm, selectedStage]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDeals = async () => {
    try {
      const user = await blink.auth.me()
      const dealsData = await blink.db.deals.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      setDeals(dealsData)
    } catch (error) {
      console.error('Failed to load deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDeals = () => {
    let filtered = deals

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === selectedStage)
    }

    setFilteredDeals(filtered)
  }

  const getDealsByStage = (stage: string) => {
    return filteredDeals.filter(deal => deal.stage === stage)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    if (!name) return 'UN'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTotalValue = () => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getWonDeals = () => {
    return filteredDeals.filter(deal => deal.stage === 'closed-won')
  }

  const getActiveDeals = () => {
    return filteredDeals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Deals</h2>
          <p className="text-gray-500 mt-1">{filteredDeals.length} deals • {formatCurrency(getTotalValue())} total value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-xl font-bold">{getActiveDeals().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Won Deals</p>
                <p className="text-xl font-bold">{getWonDeals().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(getTotalValue())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-xl font-bold">
                  {deals.length > 0 ? Math.round((getWonDeals().length / deals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stage Filter */}
            <div className="flex gap-2">
              {['all', ...stageOrder].map((stage) => (
                <Button
                  key={stage}
                  variant={selectedStage === stage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStage(stage)}
                  className="capitalize"
                >
                  {stage === 'all' ? 'All' : stage.replace('-', ' ')}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stageOrder.map((stage) => {
            const stageDeals = getDealsByStage(stage)
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
            
            return (
              <div key={stage} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {stage.replace('-', ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stageDeals.length} deals • {formatCurrency(stageValue)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Deals */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Deal Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight">
                              {deal.title}
                            </h4>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Deal Value */}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(deal.value)}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={stageColors[deal.stage as keyof typeof stageColors]}
                            >
                              {deal.probability}%
                            </Badge>
                          </div>

                          {/* Deal Description */}
                          {deal.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {deal.description}
                            </p>
                          )}

                          {/* Deal Meta */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {deal.expected_close_date && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(deal.expected_close_date)}
                                </div>
                              )}
                            </div>
                            
                            {deal.assigned_to && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                                  {getInitials(deal.assigned_to)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <Progress value={deal.probability} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Deal Button */}
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deal
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Deal</th>
                    <th className="text-left p-4 font-medium text-gray-900">Value</th>
                    <th className="text-left p-4 font-medium text-gray-900">Stage</th>
                    <th className="text-left p-4 font-medium text-gray-900">Probability</th>
                    <th className="text-left p-4 font-medium text-gray-900">Close Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Assigned To</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{deal.title}</p>
                          {deal.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {deal.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(deal.value)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="secondary" 
                          className={stageColors[deal.stage as keyof typeof stageColors]}
                        >
                          {deal.stage.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={deal.probability} className="h-2 w-16" />
                          <span className="text-sm text-gray-600">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(deal.expected_close_date)}
                        </span>
                      </td>
                      <td className="p-4">
                        {deal.assigned_to && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                                {getInitials(deal.assigned_to)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{deal.assigned_to}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-500 mb-6">
            {deals.length === 0 
              ? "Create your first deal to start tracking your sales pipeline."
              : "Try adjusting your search or filters."
            }
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Deal
          </Button>
        </div>
      )}
    </div>
  )
}