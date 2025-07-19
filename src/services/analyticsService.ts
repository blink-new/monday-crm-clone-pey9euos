import { blink } from '../lib/blink'
import { contactService } from './contactService'
import { dealService } from './dealService'
import { boardService } from './boardService'

export interface DashboardStats {
  contacts: {
    total: number
    leads: number
    prospects: number
    customers: number
    growth: number // percentage change from last month
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

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export class AnalyticsService {
  async getDashboardStats(): Promise<any> {
    // Simplified version for now - return mock data
    return {
      totalContacts: 127,
      totalDeals: 24,
      totalRevenue: 450000,
      conversionRate: 23.5,
      activeBoards: 3,
      completedTasks: 45,
      pendingTasks: 18,
      teamMembers: 5
    }
  }

  async getDashboardStatsDetailed(userId: string): Promise<DashboardStats> {
    // Get current data
    const [contactStats, dealStats, tasks, activities] = await Promise.all([
      contactService.getContactStats(userId),
      dealService.getDealStats(userId),
      this.getTaskStats(userId),
      this.getActivityStats(userId)
    ])

    // Calculate growth rates (simplified - in real app would compare with previous period)
    const contactGrowth = this.calculateGrowth(contactStats.total, contactStats.total * 0.9) // Mock previous data
    const dealGrowth = this.calculateGrowth(dealStats.totalValue, dealStats.totalValue * 0.85)
    const activityGrowth = this.calculateGrowth(activities.thisWeek, activities.thisWeek * 0.8)

    return {
      contacts: {
        total: contactStats.total,
        leads: contactStats.leads,
        prospects: contactStats.prospects,
        customers: contactStats.customers,
        growth: contactGrowth
      },
      deals: {
        total: dealStats.total,
        totalValue: dealStats.totalValue,
        avgValue: dealStats.avgValue,
        winRate: dealStats.winRate,
        monthlyRevenue: dealStats.monthlyRevenue,
        growth: dealGrowth
      },
      tasks: {
        total: tasks.total,
        completed: tasks.completed,
        overdue: tasks.overdue,
        completionRate: tasks.completionRate
      },
      activities: {
        total: activities.total,
        thisWeek: activities.thisWeek,
        growth: activityGrowth
      }
    }
  }

  async getContactsChart(userId: string): Promise<ChartData> {
    const contacts = await contactService.getContacts(userId)
    
    // Group by month for the last 6 months
    const months = this.getLast6Months()
    const data = months.map(month => {
      return contacts.filter(contact => {
        const contactMonth = new Date(contact.createdAt).toISOString().slice(0, 7)
        return contactMonth === month
      }).length
    })

    return {
      labels: months.map(month => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      datasets: [{
        label: 'New Contacts',
        data,
        backgroundColor: '#6C5CE7',
        borderColor: '#6C5CE7'
      }]
    }
  }

  async getDealsChart(userId: string): Promise<ChartData> {
    const deals = await dealService.getDeals(userId)
    
    // Group by stage
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    const data = stages.map(stage => 
      deals.filter(deal => deal.stage === stage).length
    )

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3']

    return {
      labels: stages.map(stage => stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [{
        label: 'Deals by Stage',
        data,
        backgroundColor: colors,
        borderColor: colors
      }]
    }
  }

  async getRevenueChart(userId: string): Promise<ChartData> {
    const deals = await dealService.getDeals(userId)
    const wonDeals = deals.filter(deal => deal.stage === 'closed_won' && deal.actualCloseDate)
    
    // Group by month for the last 6 months
    const months = this.getLast6Months()
    const data = months.map(month => {
      return wonDeals
        .filter(deal => deal.actualCloseDate!.slice(0, 7) === month)
        .reduce((sum, deal) => sum + deal.value, 0)
    })

    return {
      labels: months.map(month => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      datasets: [{
        label: 'Monthly Revenue',
        data,
        backgroundColor: '#00D9FF',
        borderColor: '#00D9FF'
      }]
    }
  }

  async getTaskCompletionChart(userId: string): Promise<ChartData> {
    const boards = await boardService.getBoards(userId)
    const allTasks = []
    
    for (const board of boards) {
      const tasks = await boardService.getTasks(board.id)
      allTasks.push(...tasks)
    }

    // Group by week for the last 8 weeks
    const weeks = this.getLast8Weeks()
    const completedData = weeks.map(week => {
      return allTasks.filter(task => {
        if (task.status !== 'completed') return false
        const taskWeek = this.getWeekString(new Date(task.updatedAt))
        return taskWeek === week
      }).length
    })

    const createdData = weeks.map(week => {
      return allTasks.filter(task => {
        const taskWeek = this.getWeekString(new Date(task.createdAt))
        return taskWeek === week
      }).length
    })

    return {
      labels: weeks.map(week => `Week ${week.split('-W')[1]}`),
      datasets: [
        {
          label: 'Tasks Created',
          data: createdData,
          backgroundColor: '#FF6B6B',
          borderColor: '#FF6B6B'
        },
        {
          label: 'Tasks Completed',
          data: completedData,
          backgroundColor: '#96CEB4',
          borderColor: '#96CEB4'
        }
      ]
    }
  }

  async getActivityTimeline(userId: string, limit = 20) {
    return await boardService.getActivities(undefined, limit)
  }

  private async getTaskStats(userId: string) {
    const boards = await boardService.getBoards(userId)
    const allTasks = []
    
    for (const board of boards) {
      const tasks = await boardService.getTasks(board.id)
      allTasks.push(...tasks)
    }

    const completed = allTasks.filter(task => task.status === 'completed').length
    const overdue = allTasks.filter(task => {
      if (!task.dueDate) return false
      return new Date(task.dueDate) < new Date() && task.status !== 'completed'
    }).length

    return {
      total: allTasks.length,
      completed,
      overdue,
      completionRate: allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0
    }
  }

  private async getActivityStats(userId: string) {
    const activities = await boardService.getActivities()
    const userActivities = activities.filter(activity => activity.userId === userId)
    
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    
    const thisWeekActivities = userActivities.filter(activity => 
      new Date(activity.createdAt) >= thisWeek
    ).length

    return {
      total: userActivities.length,
      thisWeek: thisWeekActivities
    }
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  private getLast6Months(): string[] {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toISOString().slice(0, 7))
    }
    
    return months
  }

  private getLast8Weeks(): string[] {
    const weeks = []
    const now = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
      weeks.push(this.getWeekString(date))
    }
    
    return weeks
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService