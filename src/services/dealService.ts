import { blink } from '../lib/blink'
import type { Deal } from '../lib/blink'

export class DealService {
  static async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) {
    const deal = await blink.db.deals.create({
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Log activity
    await this.logActivity({
      type: 'deal_created',
      entityType: 'deal',
      entityId: deal.id,
      description: `Created deal: ${data.title} ($${data.value})`,
      userId: data.userId
    })

    return deal
  }

  static async getDeals(userId: string, filters?: {
    stage?: string
    contactId?: string
    minValue?: number
    maxValue?: number
  }): Promise<Deal[]> {
    const where: any = { userId }

    if (filters?.stage) {
      where.stage = filters.stage
    }

    if (filters?.contactId) {
      where.contactId = filters.contactId
    }

    const deals = await blink.db.deals.list({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Apply value filters
    let result = deals
    if (filters?.minValue !== undefined) {
      result = result.filter(deal => deal.value >= filters.minValue!)
    }
    if (filters?.maxValue !== undefined) {
      result = result.filter(deal => deal.value <= filters.maxValue!)
    }

    return result
  }

  static async getDealById(id: string): Promise<Deal | null> {
    const deals = await blink.db.deals.list({
      where: { id },
      limit: 1
    })

    return deals.length > 0 ? deals[0] : null
  }

  static async updateDeal(id: string, data: Partial<Deal>) {
    const deal = await blink.db.deals.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })

    // Log activity for stage changes
    if (data.stage) {
      await this.logActivity({
        type: 'deal_updated',
        entityType: 'deal',
        entityId: id,
        description: `Deal stage changed to: ${data.stage}`,
        userId: data.userId || ''
      })
    }

    return deal
  }

  static async deleteDeal(id: string) {
    return await blink.db.deals.delete(id)
  }

  static async getDealsByStage(userId: string) {
    const deals = await this.getDeals(userId)
    
    const stages = {
      lead: deals.filter(d => d.stage === 'lead'),
      qualified: deals.filter(d => d.stage === 'qualified'),
      proposal: deals.filter(d => d.stage === 'proposal'),
      negotiation: deals.filter(d => d.stage === 'negotiation'),
      closed_won: deals.filter(d => d.stage === 'closed_won'),
      closed_lost: deals.filter(d => d.stage === 'closed_lost')
    }

    return stages
  }

  static async getDealStats(userId: string) {
    const deals = await this.getDeals(userId)
    
    const stats = {
      total: deals.length,
      totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
      avgValue: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
      wonDeals: deals.filter(d => d.stage === 'closed_won').length,
      lostDeals: deals.filter(d => d.stage === 'closed_lost').length,
      activeDeals: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length,
      winRate: 0,
      byStage: {} as Record<string, number>,
      monthlyRevenue: 0
    }

    // Calculate win rate
    const closedDeals = stats.wonDeals + stats.lostDeals
    if (closedDeals > 0) {
      stats.winRate = (stats.wonDeals / closedDeals) * 100
    }

    // Count by stage
    deals.forEach(deal => {
      stats.byStage[deal.stage] = (stats.byStage[deal.stage] || 0) + 1
    })

    // Calculate monthly revenue (won deals this month)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    stats.monthlyRevenue = deals
      .filter(deal => 
        deal.stage === 'closed_won' && 
        deal.actualCloseDate && 
        new Date(deal.actualCloseDate) >= thisMonth
      )
      .reduce((sum, deal) => sum + deal.value, 0)

    return stats
  }

  static async moveDealToStage(id: string, stage: string, userId: string) {
    const updateData: any = { stage, userId }
    
    // Set close date if moving to closed stages
    if (stage === 'closed_won' || stage === 'closed_lost') {
      updateData.actualCloseDate = new Date().toISOString()
    }

    return await this.updateDeal(id, updateData)
  }

  static async getDealsByContact(contactId: string): Promise<Deal[]> {
    return await blink.db.deals.list({
      where: { contactId },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getUpcomingDeals(userId: string, days = 30): Promise<Deal[]> {
    const deals = await this.getDeals(userId)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return deals.filter(deal => 
      deal.expectedCloseDate && 
      new Date(deal.expectedCloseDate) <= futureDate &&
      !['closed_won', 'closed_lost'].includes(deal.stage)
    )
  }

  private static async logActivity(data: {
    type: string
    entityType: string
    entityId: string
    description: string
    userId: string
  }) {
    await blink.db.activities.create({
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString()
    })
  }
}