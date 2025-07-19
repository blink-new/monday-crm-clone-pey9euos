import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Trash2, 
  Calendar,
  User,
  Flag,
  CheckSquare
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Task {
  id?: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  board_id: string
  column_id: string
  position: number
  created_at?: string
  updated_at?: string
  user_id?: string
}

interface BoardColumn {
  id: string
  name: string
  color: string
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task | null
  boardId: string
  columnId?: string
  onSave: (task: Task) => void
  onDelete?: (taskId: string) => void
}

const statusOptions = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' }
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

export function TaskModal({ isOpen, onClose, task, boardId, columnId, onSave, onDelete }: TaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    board_id: boardId,
    column_id: columnId || '',
    position: 0
  })
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingColumns, setLoadingColumns] = useState(false)

  useEffect(() => {
    if (isOpen && boardId) {
      loadColumns()
    }
  }, [isOpen, boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (task) {
      setFormData(task)
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'not-started',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        board_id: boardId,
        column_id: columnId || '',
        position: 0
      })
    }
  }, [task, isOpen, boardId, columnId])

  const loadColumns = async () => {
    try {
      setLoadingColumns(true)
      const columnsData = await blink.db.board_columns.list({
        where: { board_id: boardId },
        orderBy: { position: 'asc' }
      })
      setColumns(columnsData)
      
      // If no column is selected and we have columns, select the first one
      if (!formData.column_id && columnsData.length > 0) {
        setFormData(prev => ({ ...prev, column_id: columnsData[0].id }))
      }
    } catch (error) {
      console.error('Failed to load columns:', error)
    } finally {
      setLoadingColumns(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const user = await blink.auth.me()
      
      const taskData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (task?.id) {
        // Update existing task
        await blink.db.tasks.update(task.id, taskData)
        onSave({ ...taskData, id: task.id })
      } else {
        // Create new task
        // Get the position for the new task (last in the column)
        const existingTasks = await blink.db.tasks.list({
          where: { column_id: formData.column_id }
        })
        const position = existingTasks.length

        const newTask = await blink.db.tasks.create({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...taskData,
          position,
          created_at: new Date().toISOString()
        })
        onSave(newTask)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await blink.db.tasks.delete(task.id)
      onDelete(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const updateField = (field: keyof Task, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    return statusOption?.color || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(option => option.value === priority)
    return priorityOption?.color || 'bg-gray-100 text-gray-800'
  }

  const getSelectedColumn = () => {
    return columns.find(column => column.id === formData.column_id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Task Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Status & Priority
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assignment and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
              Assignment & Timeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => updateField('assigned_to', e.target.value)}
                    placeholder="Enter assignee name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => updateField('due_date', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Column Assignment</h3>
            
            <div className="space-y-2">
              <Label htmlFor="column_id">Column</Label>
              <select
                id="column_id"
                value={formData.column_id}
                onChange={(e) => updateField('column_id', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loadingColumns}
              >
                <option value="">Select a column...</option>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
              {loadingColumns && (
                <p className="text-sm text-gray-500">Loading columns...</p>
              )}
            </div>

            {getSelectedColumn() && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Selected Column:</p>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getSelectedColumn()?.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {getSelectedColumn()?.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Task Preview */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h4 className="font-medium">Task Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="secondary" className={getStatusColor(formData.status)}>
                  {statusOptions.find(option => option.value === formData.status)?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <Badge variant="secondary" className={getPriorityColor(formData.priority)}>
                  {priorityOptions.find(option => option.value === formData.priority)?.label}
                </Badge>
              </div>
              {formData.assigned_to && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Assigned to:</span>
                  <span className="text-sm font-medium">{formData.assigned_to}</span>
                </div>
              )}
              {formData.due_date && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Due:</span>
                  <span className="text-sm font-medium">
                    {new Date(formData.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {task && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.title.trim() || !formData.column_id}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Task'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}