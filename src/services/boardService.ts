import { blink } from '../lib/blink'
import type { Board, BoardColumn, Task } from '../lib/blink'

export class BoardService {
  // Board operations
  async createBoard(data: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) {
    const board = await blink.db.boards.create({
      id: `board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      teamMembers: JSON.stringify(data.teamMembers || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Create default columns
    await this.createDefaultColumns(board.id, data.userId)
    
    return board
  }

  async getBoards(userId: string): Promise<Board[]> {
    const boards = await blink.db.boards.list({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return boards.map(board => ({
      ...board,
      teamMembers: JSON.parse(board.teamMembers || '[]')
    }))
  }

  async getBoardById(id: string): Promise<Board | null> {
    const boards = await blink.db.boards.list({
      where: { id },
      limit: 1
    })

    if (boards.length === 0) return null

    const board = boards[0]
    return {
      ...board,
      teamMembers: JSON.parse(board.teamMembers || '[]')
    }
  }

  async updateBoard(id: string, data: Partial<Board>) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    if (data.teamMembers) {
      updateData.teamMembers = JSON.stringify(data.teamMembers)
    }

    return await blink.db.boards.update(id, updateData)
  }

  async deleteBoard(id: string) {
    return await blink.db.boards.delete(id)
  }

  // Column operations
  async createDefaultColumns(boardId: string, userId: string) {
    const defaultColumns = [
      { name: 'To Do', color: '#FF6B6B', position: 0 },
      { name: 'In Progress', color: '#4ECDC4', position: 1 },
      { name: 'Review', color: '#45B7D1', position: 2 },
      { name: 'Done', color: '#96CEB4', position: 3 }
    ]

    for (const col of defaultColumns) {
      await blink.db.boardColumns.create({
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        boardId,
        userId,
        ...col,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  async createColumn(data: Omit<BoardColumn, 'id' | 'createdAt' | 'updatedAt'>) {
    return await blink.db.boardColumns.create({
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async getColumns(boardId: string): Promise<BoardColumn[]> {
    return await blink.db.boardColumns.list({
      where: { boardId },
      orderBy: { position: 'asc' }
    })
  }

  async updateColumn(id: string, data: Partial<BoardColumn>) {
    return await blink.db.boardColumns.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  async deleteColumn(id: string) {
    return await blink.db.boardColumns.delete(id)
  }

  // Task operations
  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const task = await blink.db.tasks.create({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Log activity
    await this.logActivity({
      type: 'task_created',
      entityType: 'task',
      entityId: task.id,
      description: `Created task: ${data.title}`,
      userId: data.userId
    })

    return task
  }

  async getTasks(boardId: string): Promise<Task[]> {
    return await blink.db.tasks.list({
      where: { boardId },
      orderBy: { position: 'asc' }
    })
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    return await blink.db.tasks.list({
      where: { columnId },
      orderBy: { position: 'asc' }
    })
  }

  async updateTask(id: string, data: Partial<Task>) {
    const task = await blink.db.tasks.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })

    // Log activity for status changes
    if (data.status) {
      await this.logActivity({
        type: data.status === 'completed' ? 'task_completed' : 'task_updated',
        entityType: 'task',
        entityId: id,
        description: `Task status changed to: ${data.status}`,
        userId: data.userId || ''
      })
    }

    return task
  }

  async deleteTask(id: string) {
    return await blink.db.tasks.delete(id)
  }

  async moveTask(taskId: string, newColumnId: string, newPosition: number, userId: string) {
    return await this.updateTask(taskId, {
      columnId: newColumnId,
      position: newPosition,
      userId
    })
  }

  // Activity logging
  private async logActivity(data: {
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

  async getActivities(entityId?: string, limit = 50) {
    const where = entityId ? { entityId } : {}
    return await blink.db.activities.list({
      where,
      orderBy: { createdAt: 'desc' },
      limit
    })
  }

  // Simplified methods for frontend
  async getBoards() {
    // Mock data for now
    return [
      {
        id: 'board_1',
        name: 'Product Development',
        description: 'Track product development tasks and milestones',
        color: '#6C5CE7',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'board_2', 
        name: 'Marketing Campaign',
        description: 'Manage marketing campaigns and content creation',
        color: '#00D9FF',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      },
      {
        id: 'board_3',
        name: 'Customer Support',
        description: 'Handle customer inquiries and support tickets', 
        color: '#FF6B6B',
        created_at: new Date().toISOString(),
        user_id: 'current-user'
      }
    ]
  }

  async getBoardColumns(boardId: string) {
    // Mock columns
    return [
      { id: 'col_1', board_id: boardId, name: 'To Do', color: '#FF6B6B', position: 0 },
      { id: 'col_2', board_id: boardId, name: 'In Progress', color: '#4ECDC4', position: 1 },
      { id: 'col_3', board_id: boardId, name: 'Review', color: '#45B7D1', position: 2 },
      { id: 'col_4', board_id: boardId, name: 'Done', color: '#96CEB4', position: 3 }
    ]
  }

  async getBoardTasks(boardId: string) {
    // Mock tasks
    return [
      {
        id: 'task_1',
        title: 'Design new user dashboard',
        description: 'Create wireframes and mockups for the new user dashboard interface',
        status: 'in-progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: 'John Doe',
        board_id: boardId,
        column_id: 'col_2',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'task_2',
        title: 'Implement user authentication',
        description: 'Set up secure user authentication system with JWT tokens',
        status: 'completed',
        priority: 'urgent',
        due_date: '',
        assigned_to: 'Sarah Smith',
        board_id: boardId,
        column_id: 'col_4',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'task_3',
        title: 'Database optimization',
        description: 'Optimize database queries for better performance',
        status: 'not-started',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: 'Mike Johnson',
        board_id: boardId,
        column_id: 'col_1',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'task_4',
        title: 'Create social media content',
        description: 'Develop content calendar and create posts for social media',
        status: 'in-progress',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: 'Emily Davis',
        board_id: boardId,
        column_id: 'col_2',
        position: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'task_5',
        title: 'Update FAQ section',
        description: 'Review and update frequently asked questions',
        status: 'completed',
        priority: 'low',
        due_date: '',
        assigned_to: 'David Wilson',
        board_id: boardId,
        column_id: 'col_4',
        position: 1,
        created_at: new Date().toISOString()
      }
    ]
  }
}

export const boardService = new BoardService()
export default boardService