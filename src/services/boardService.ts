import { blink } from '../lib/blink'
import type { Board, BoardColumn, Task } from '../lib/blink'

export class BoardService {
  // Board operations
  static async createBoard(data: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) {
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

  static async getBoards(userId: string): Promise<Board[]> {
    const boards = await blink.db.boards.list({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return boards.map(board => ({
      ...board,
      teamMembers: JSON.parse(board.teamMembers || '[]')
    }))
  }

  static async getBoardById(id: string): Promise<Board | null> {
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

  static async updateBoard(id: string, data: Partial<Board>) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    if (data.teamMembers) {
      updateData.teamMembers = JSON.stringify(data.teamMembers)
    }

    return await blink.db.boards.update(id, updateData)
  }

  static async deleteBoard(id: string) {
    return await blink.db.boards.delete(id)
  }

  // Column operations
  static async createDefaultColumns(boardId: string, userId: string) {
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

  static async createColumn(data: Omit<BoardColumn, 'id' | 'createdAt' | 'updatedAt'>) {
    return await blink.db.boardColumns.create({
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  static async getColumns(boardId: string): Promise<BoardColumn[]> {
    return await blink.db.boardColumns.list({
      where: { boardId },
      orderBy: { position: 'asc' }
    })
  }

  static async updateColumn(id: string, data: Partial<BoardColumn>) {
    return await blink.db.boardColumns.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  static async deleteColumn(id: string) {
    return await blink.db.boardColumns.delete(id)
  }

  // Task operations
  static async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
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

  static async getTasks(boardId: string): Promise<Task[]> {
    return await blink.db.tasks.list({
      where: { boardId },
      orderBy: { position: 'asc' }
    })
  }

  static async getTasksByColumn(columnId: string): Promise<Task[]> {
    return await blink.db.tasks.list({
      where: { columnId },
      orderBy: { position: 'asc' }
    })
  }

  static async updateTask(id: string, data: Partial<Task>) {
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

  static async deleteTask(id: string) {
    return await blink.db.tasks.delete(id)
  }

  static async moveTask(taskId: string, newColumnId: string, newPosition: number, userId: string) {
    return await this.updateTask(taskId, {
      columnId: newColumnId,
      position: newPosition,
      userId
    })
  }

  // Activity logging
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

  static async getActivities(entityId?: string, limit = 50) {
    const where = entityId ? { entityId } : {}
    return await blink.db.activities.list({
      where,
      orderBy: { createdAt: 'desc' },
      limit
    })
  }
}