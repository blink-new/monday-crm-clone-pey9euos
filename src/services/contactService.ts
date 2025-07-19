import { blink } from '../lib/blink'
import type { Contact } from '../lib/blink'

export class ContactService {
  static async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const contact = await blink.db.contacts.create({
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      tags: JSON.stringify(data.tags || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Log activity
    await this.logActivity({
      type: 'contact_added',
      entityType: 'contact',
      entityId: contact.id,
      description: `Added contact: ${data.firstName} ${data.lastName}`,
      userId: data.userId
    })

    return contact
  }

  static async getContacts(userId: string, filters?: {
    status?: string
    source?: string
    search?: string
  }): Promise<Contact[]> {
    const where: any = { userId }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.source) {
      where.source = filters.source
    }

    const contacts = await blink.db.contacts.list({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Parse tags and apply search filter
    let result = contacts.map(contact => ({
      ...contact,
      tags: JSON.parse(contact.tags || '[]')
    }))

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(contact => 
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm))
      )
    }

    return result
  }

  static async getContactById(id: string): Promise<Contact | null> {
    const contacts = await blink.db.contacts.list({
      where: { id },
      limit: 1
    })

    if (contacts.length === 0) return null

    const contact = contacts[0]
    return {
      ...contact,
      tags: JSON.parse(contact.tags || '[]')
    }
  }

  static async updateContact(id: string, data: Partial<Contact>) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags)
    }

    return await blink.db.contacts.update(id, updateData)
  }

  static async deleteContact(id: string) {
    return await blink.db.contacts.delete(id)
  }

  static async getContactStats(userId: string) {
    const contacts = await this.getContacts(userId)
    
    const stats = {
      total: contacts.length,
      leads: contacts.filter(c => c.status === 'lead').length,
      prospects: contacts.filter(c => c.status === 'prospect').length,
      customers: contacts.filter(c => c.status === 'customer').length,
      inactive: contacts.filter(c => c.status === 'inactive').length,
      bySource: {} as Record<string, number>
    }

    // Count by source
    contacts.forEach(contact => {
      stats.bySource[contact.source] = (stats.bySource[contact.source] || 0) + 1
    })

    return stats
  }

  static async searchContacts(userId: string, query: string): Promise<Contact[]> {
    return this.getContacts(userId, { search: query })
  }

  static async addContactTag(id: string, tag: string) {
    const contact = await this.getContactById(id)
    if (!contact) throw new Error('Contact not found')

    const tags = [...contact.tags]
    if (!tags.includes(tag)) {
      tags.push(tag)
      await this.updateContact(id, { tags })
    }

    return tags
  }

  static async removeContactTag(id: string, tag: string) {
    const contact = await this.getContactById(id)
    if (!contact) throw new Error('Contact not found')

    const tags = contact.tags.filter(t => t !== tag)
    await this.updateContact(id, { tags })

    return tags
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

  // Simplified method for frontend
  static async getContacts() {
    // Mock data for now
    return [
      {
        id: 'contact_1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Inc.',
        position: 'CTO',
        status: 'customer',
        tags: 'enterprise,tech',
        notes: 'Key decision maker for enterprise solutions',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'contact_2',
        name: 'Sarah Johnson',
        email: 'sarah.j@innovate.io',
        phone: '+1-555-0124',
        company: 'Innovate Solutions',
        position: 'Product Manager',
        status: 'prospect',
        tags: 'saas,product',
        notes: 'Interested in our SaaS platform',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'contact_3',
        name: 'Michael Chen',
        email: 'mchen@startup.co',
        phone: '+1-555-0125',
        company: 'StartupCo',
        position: 'Founder',
        status: 'lead',
        tags: 'startup,founder',
        notes: 'Met at tech conference, very interested',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'contact_4',
        name: 'Emily Davis',
        email: 'emily.davis@enterprise.com',
        phone: '+1-555-0126',
        company: 'Enterprise Corp',
        position: 'VP Sales',
        status: 'prospect',
        tags: 'enterprise,sales',
        notes: 'Looking for team collaboration tools',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'contact_5',
        name: 'David Wilson',
        email: 'dwilson@agency.com',
        phone: '+1-555-0127',
        company: 'Creative Agency',
        position: 'Creative Director',
        status: 'lead',
        tags: 'agency,creative',
        notes: 'Needs project management solution',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      }
    ]
  }
}

export const contactService = new ContactService()
export default contactService