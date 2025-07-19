import { BoardService } from './boardService'
import { ContactService } from './contactService'
import { DealService } from './dealService'

export class SeedService {
  static async seedSampleData(userId: string) {
    try {
      console.log('🌱 Starting to seed sample data...')

      // Create sample boards
      const boards = await this.createSampleBoards(userId)
      console.log('✅ Created sample boards')

      // Create sample contacts
      const contacts = await this.createSampleContacts(userId)
      console.log('✅ Created sample contacts')

      // Create sample deals
      await this.createSampleDeals(userId, contacts)
      console.log('✅ Created sample deals')

      // Create sample tasks
      await this.createSampleTasks(userId, boards)
      console.log('✅ Created sample tasks')

      console.log('🎉 Sample data seeded successfully!')
      return true
    } catch (error) {
      console.error('❌ Failed to seed sample data:', error)
      return false
    }
  }

  private static async createSampleBoards(userId: string) {
    const boardsData = [
      {
        name: 'Product Development',
        description: 'Track product development tasks and milestones',
        color: '#6C5CE7',
        userId,
        teamMembers: []
      },
      {
        name: 'Marketing Campaign',
        description: 'Manage marketing campaigns and content creation',
        color: '#00D9FF',
        userId,
        teamMembers: []
      },
      {
        name: 'Customer Support',
        description: 'Handle customer inquiries and support tickets',
        color: '#FF6B6B',
        userId,
        teamMembers: []
      }
    ]

    const boards = []
    for (const boardData of boardsData) {
      const board = await BoardService.createBoard(boardData)
      boards.push(board)
    }

    return boards
  }

  private static async createSampleContacts(userId: string) {
    const contactsData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Inc.',
        position: 'CTO',
        status: 'customer' as const,
        source: 'website' as const,
        tags: ['enterprise', 'tech'],
        notes: 'Key decision maker for enterprise solutions',
        userId
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@innovate.io',
        phone: '+1-555-0124',
        company: 'Innovate Solutions',
        position: 'Product Manager',
        status: 'prospect' as const,
        source: 'referral' as const,
        tags: ['saas', 'product'],
        notes: 'Interested in our SaaS platform',
        userId
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@startup.co',
        phone: '+1-555-0125',
        company: 'StartupCo',
        position: 'Founder',
        status: 'lead' as const,
        source: 'social' as const,
        tags: ['startup', 'founder'],
        notes: 'Met at tech conference, very interested',
        userId
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@enterprise.com',
        phone: '+1-555-0126',
        company: 'Enterprise Corp',
        position: 'VP Sales',
        status: 'prospect' as const,
        source: 'email' as const,
        tags: ['enterprise', 'sales'],
        notes: 'Looking for team collaboration tools',
        userId
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'dwilson@agency.com',
        phone: '+1-555-0127',
        company: 'Creative Agency',
        position: 'Creative Director',
        status: 'lead' as const,
        source: 'website' as const,
        tags: ['agency', 'creative'],
        notes: 'Needs project management solution',
        userId
      }
    ]

    const contacts = []
    for (const contactData of contactsData) {
      const contact = await ContactService.createContact(contactData)
      contacts.push(contact)
    }

    return contacts
  }

  private static async createSampleDeals(userId: string, contacts: any[]) {
    const dealsData = [
      {
        title: 'Enterprise Platform License',
        contactId: contacts[0].id,
        value: 50000,
        currency: 'USD',
        stage: 'proposal' as const,
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Large enterprise deal with multi-year contract potential',
        userId
      },
      {
        title: 'SaaS Subscription',
        contactId: contacts[1].id,
        value: 12000,
        currency: 'USD',
        stage: 'negotiation' as const,
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Annual subscription with growth potential',
        userId
      },
      {
        title: 'Startup Package',
        contactId: contacts[2].id,
        value: 5000,
        currency: 'USD',
        stage: 'qualified' as const,
        probability: 40,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Startup discount package',
        userId
      },
      {
        title: 'Team Collaboration Suite',
        contactId: contacts[3].id,
        value: 25000,
        currency: 'USD',
        stage: 'proposal' as const,
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Enterprise team solution',
        userId
      },
      {
        title: 'Project Management Tool',
        contactId: contacts[4].id,
        value: 8000,
        currency: 'USD',
        stage: 'lead' as const,
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Agency project management needs',
        userId
      }
    ]

    for (const dealData of dealsData) {
      await DealService.createDeal(dealData)
    }
  }

  private static async createSampleTasks(userId: string, boards: any[]) {
    const tasksData = [
      // Product Development Board Tasks
      {
        boardId: boards[0].id,
        title: 'Design new user dashboard',
        description: 'Create wireframes and mockups for the new user dashboard interface',
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        position: 0,
        userId
      },
      {
        boardId: boards[0].id,
        title: 'Implement user authentication',
        description: 'Set up secure user authentication system with JWT tokens',
        status: 'completed' as const,
        priority: 'critical' as const,
        position: 1,
        userId
      },
      {
        boardId: boards[0].id,
        title: 'Database optimization',
        description: 'Optimize database queries for better performance',
        status: 'not_started' as const,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        position: 2,
        userId
      },

      // Marketing Campaign Board Tasks
      {
        boardId: boards[1].id,
        title: 'Create social media content',
        description: 'Develop content calendar and create posts for social media',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        position: 0,
        userId
      },
      {
        boardId: boards[1].id,
        title: 'Launch email campaign',
        description: 'Design and send newsletter to subscriber list',
        status: 'not_started' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
        userId
      },

      // Customer Support Board Tasks
      {
        boardId: boards[2].id,
        title: 'Update FAQ section',
        description: 'Review and update frequently asked questions',
        status: 'completed' as const,
        priority: 'low' as const,
        position: 0,
        userId
      },
      {
        boardId: boards[2].id,
        title: 'Respond to customer inquiries',
        description: 'Address pending customer support tickets',
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
        userId
      }
    ]

    // Get columns for each board and assign tasks to appropriate columns
    for (const board of boards) {
      const columns = await BoardService.getColumns(board.id)
      const boardTasks = tasksData.filter(task => task.boardId === board.id)

      for (const task of boardTasks) {
        let columnId = columns[0]?.id // Default to first column

        // Assign to appropriate column based on status
        switch (task.status) {
          case 'not_started':
            columnId = columns.find(col => col.name.toLowerCase().includes('to do') || col.name.toLowerCase().includes('todo'))?.id || columns[0]?.id
            break
          case 'in_progress':
            columnId = columns.find(col => col.name.toLowerCase().includes('progress'))?.id || columns[1]?.id
            break
          case 'completed':
            columnId = columns.find(col => col.name.toLowerCase().includes('done'))?.id || columns[columns.length - 1]?.id
            break
        }

        await BoardService.createTask({
          ...task,
          columnId: columnId || columns[0].id
        })
      }
    }
  }

  static async seedAllData() {
    // Simplified version for frontend
    return this.seedSampleData('current-user')
  }
}

export const seedService = new SeedService()
export default seedService