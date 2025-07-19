import { blink } from '../lib/blink'

export class SeedService {
  static async seedSampleData() {
    try {
      console.log('🌱 Starting to seed sample data...')
      const user = await blink.auth.me()

      // Create sample contacts
      await this.createSampleContacts(user.id)
      console.log('✅ Created sample contacts')

      // Create sample deals
      await this.createSampleDeals(user.id)
      console.log('✅ Created sample deals')

      // Create sample boards
      await this.createSampleBoards(user.id)
      console.log('✅ Created sample boards')

      console.log('🎉 Sample data seeded successfully!')
      return true
    } catch (error) {
      console.error('❌ Failed to seed sample data:', error)
      return false
    }
  }

  private static async createSampleContacts(userId: string) {
    const contactsData = [
      {
        id: `contact_${Date.now()}_1`,
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Inc.',
        position: 'CTO',
        status: 'customer',
        tags: 'enterprise,tech',
        notes: 'Key decision maker for enterprise solutions',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `contact_${Date.now()}_2`,
        name: 'Sarah Johnson',
        email: 'sarah.j@innovate.io',
        phone: '+1-555-0124',
        company: 'Innovate Solutions',
        position: 'Product Manager',
        status: 'prospect',
        tags: 'saas,product',
        notes: 'Interested in our SaaS platform',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `contact_${Date.now()}_3`,
        name: 'Michael Chen',
        email: 'mchen@startup.co',
        phone: '+1-555-0125',
        company: 'StartupCo',
        position: 'Founder',
        status: 'lead',
        tags: 'startup,founder',
        notes: 'Met at tech conference, very interested',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `contact_${Date.now()}_4`,
        name: 'Emily Davis',
        email: 'emily.davis@enterprise.com',
        phone: '+1-555-0126',
        company: 'Enterprise Corp',
        position: 'VP Sales',
        status: 'prospect',
        tags: 'enterprise,sales',
        notes: 'Looking for team collaboration tools',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `contact_${Date.now()}_5`,
        name: 'David Wilson',
        email: 'dwilson@agency.com',
        phone: '+1-555-0127',
        company: 'Creative Agency',
        position: 'Creative Director',
        status: 'lead',
        tags: 'agency,creative',
        notes: 'Needs project management solution',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      }
    ]

    for (const contactData of contactsData) {
      await blink.db.contacts.create(contactData)
    }

    return contactsData
  }

  private static async createSampleDeals(userId: string) {
    const dealsData = [
      {
        id: `deal_${Date.now()}_1`,
        title: 'Enterprise Platform License',
        description: 'Large enterprise deal with multi-year contract potential',
        value: 50000,
        stage: 'proposal',
        probability: 75,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: '',
        assigned_to: 'John Doe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `deal_${Date.now()}_2`,
        title: 'SaaS Subscription',
        description: 'Annual subscription with growth potential',
        value: 12000,
        stage: 'negotiation',
        probability: 60,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: '',
        assigned_to: 'Sarah Smith',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `deal_${Date.now()}_3`,
        title: 'Startup Package',
        description: 'Startup discount package',
        value: 5000,
        stage: 'qualified',
        probability: 40,
        expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: '',
        assigned_to: 'Mike Johnson',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `deal_${Date.now()}_4`,
        title: 'Team Collaboration Suite',
        description: 'Enterprise team solution',
        value: 25000,
        stage: 'proposal',
        probability: 80,
        expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: '',
        assigned_to: 'Emily Davis',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `deal_${Date.now()}_5`,
        title: 'Project Management Tool',
        description: 'Agency project management needs',
        value: 8000,
        stage: 'lead',
        probability: 25,
        expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        contact_id: '',
        assigned_to: 'David Wilson',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      }
    ]

    for (const dealData of dealsData) {
      await blink.db.deals.create(dealData)
    }

    return dealsData
  }

  private static async createSampleBoards(userId: string) {
    const boardsData = [
      {
        id: `board_${Date.now()}_1`,
        name: 'Product Development',
        description: 'Track product development tasks and milestones',
        color: '#6C5CE7',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `board_${Date.now()}_2`,
        name: 'Marketing Campaign',
        description: 'Manage marketing campaigns and content creation',
        color: '#00D9FF',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: `board_${Date.now()}_3`,
        name: 'Customer Support',
        description: 'Handle customer inquiries and support tickets',
        color: '#FF6B6B',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      }
    ]

    for (const boardData of boardsData) {
      await blink.db.boards.create(boardData)

      // Create default columns for each board
      const defaultColumns = [
        { name: 'To Do', color: '#FF6B6B', position: 0 },
        { name: 'In Progress', color: '#4ECDC4', position: 1 },
        { name: 'Review', color: '#45B7D1', position: 2 },
        { name: 'Done', color: '#96CEB4', position: 3 }
      ]

      const createdColumns = []
      for (const col of defaultColumns) {
        const column = await blink.db.board_columns.create({
          id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          board_id: boardData.id,
          user_id: userId,
          ...col,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        createdColumns.push(column)
      }

      // Create sample tasks for each board
      const tasksData = [
        {
          title: 'Design new user dashboard',
          description: 'Create wireframes and mockups for the new user dashboard interface',
          status: 'in-progress',
          priority: 'high',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_to: 'John Doe',
          column_id: createdColumns[1].id, // In Progress
          position: 0
        },
        {
          title: 'Implement user authentication',
          description: 'Set up secure user authentication system with JWT tokens',
          status: 'completed',
          priority: 'urgent',
          assigned_to: 'Sarah Smith',
          column_id: createdColumns[3].id, // Done
          position: 0
        },
        {
          title: 'Database optimization',
          description: 'Optimize database queries for better performance',
          status: 'not-started',
          priority: 'medium',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_to: 'Mike Johnson',
          column_id: createdColumns[0].id, // To Do
          position: 0
        }
      ]

      for (const taskData of tasksData) {
        await blink.db.tasks.create({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...taskData,
          board_id: boardData.id,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }

    return boardsData
  }

  static async seedAllData() {
    return this.seedSampleData()
  }
}

export const seedService = new SeedService()
export default seedService