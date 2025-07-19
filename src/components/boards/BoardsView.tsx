import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { boardService } from '@/services/boardService'
import { blink } from '@/lib/blink'

interface Board {
  id: string
  name: string
  description: string
  color: string
  created_at: string
  user_id: string
}

interface BoardColumn {
  id: string
  board_id: string
  name: string
  color: string
  position: number
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  board_id: string
  column_id: string
  position: number
  created_at: string
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
  urgent: 'bg-purple-100 text-purple-800'
}

const statusIcons = {
  'not-started': Circle,
  'in-progress': Clock,
  'completed': CheckCircle2,
  'blocked': AlertCircle
}

export function BoardsView() {
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBoards()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedBoard) {
      loadBoardData(selectedBoard.id)
    }
  }, [selectedBoard])

  const loadBoards = async () => {
    try {
      const user = await blink.auth.me()
      const boardsData = await blink.db.boards.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      setBoards(boardsData)
      if (boardsData.length > 0 && !selectedBoard) {
        setSelectedBoard(boardsData[0])
      }
    } catch (error) {
      console.error('Failed to load boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBoardData = async (boardId: string) => {
    try {
      const [columnsData, tasksData] = await Promise.all([
        blink.db.board_columns.list({
          where: { board_id: boardId },
          orderBy: { position: 'asc' }
        }),
        blink.db.tasks.list({
          where: { board_id: boardId },
          orderBy: { position: 'asc' }
        })
      ])
      setColumns(columnsData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load board data:', error)
    }
  }

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.column_id === columnId)
      .sort((a, b) => a.position - b.position)
  }

  const getAssigneeInitials = (assignedTo: string) => {
    if (!assignedTo) return 'UN'
    return assignedTo.split(' ').map(name => name[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (boards.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No boards found</h3>
          <p className="text-gray-500 mb-6">Create your first board to start organizing your work.</p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Board
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Board Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Boards</h2>
          <div className="flex gap-2">
            {boards.map((board) => (
              <Button
                key={board.id}
                variant={selectedBoard?.id === board.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBoard(board)}
                className="gap-2"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: board.color }}
                />
                {board.name}
              </Button>
            ))}
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Board
        </Button>
      </div>

      {/* Board Content */}
      {selectedBoard && (
        <div className="space-y-4">
          {/* Board Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedBoard.color }}
                  />
                  <div>
                    <CardTitle>{selectedBoard.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedBoard.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tasks.length} tasks</Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => {
              const columnTasks = getTasksByColumn(column.id)
              
              return (
                <div key={column.id} className="space-y-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-medium text-gray-900">{column.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    {columnTasks.map((task) => {
                      const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle
                      
                      return (
                        <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                  {task.title}
                                </h4>
                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Task Meta */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="w-4 h-4 text-gray-400" />
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(task.due_date)}
                                    </div>
                                  )}
                                  
                                  {task.assigned_to && (
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                                        {getAssigneeInitials(task.assigned_to)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                    {/* Add Task Button */}
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}