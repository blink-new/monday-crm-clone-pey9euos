import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  Trash2, 
  Kanban,
  Palette
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Board {
  id?: string
  name: string
  description: string
  color: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

interface BoardModalProps {
  isOpen: boolean
  onClose: () => void
  board?: Board | null
  onSave: (board: Board) => void
  onDelete?: (boardId: string) => void
}

const colorOptions = [
  { value: '#6C5CE7', label: 'Purple', class: 'bg-purple-500' },
  { value: '#00D9FF', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#FF6B6B', label: 'Red', class: 'bg-red-500' },
  { value: '#4ECDC4', label: 'Teal', class: 'bg-teal-500' },
  { value: '#45B7D1', label: 'Blue', class: 'bg-blue-500' },
  { value: '#96CEB4', label: 'Green', class: 'bg-green-500' },
  { value: '#FECA57', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#FF9FF3', label: 'Pink', class: 'bg-pink-500' },
  { value: '#54A0FF', label: 'Light Blue', class: 'bg-blue-400' },
  { value: '#5F27CD', label: 'Deep Purple', class: 'bg-purple-700' }
]

export function BoardModal({ isOpen, onClose, board, onSave, onDelete }: BoardModalProps) {
  const [formData, setFormData] = useState<Board>({
    name: '',
    description: '',
    color: '#6C5CE7'
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (board) {
      setFormData(board)
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6C5CE7'
      })
    }
  }, [board, isOpen])

  const handleSave = async () => {
    try {
      setSaving(true)
      const user = await blink.auth.me()
      
      const boardData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (board?.id) {
        // Update existing board
        await blink.db.boards.update(board.id, boardData)
        onSave({ ...boardData, id: board.id })
      } else {
        // Create new board
        const newBoard = await blink.db.boards.create({
          id: `board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...boardData,
          created_at: new Date().toISOString()
        })

        // Create default columns for new board
        const defaultColumns = [
          { name: 'To Do', color: '#FF6B6B', position: 0 },
          { name: 'In Progress', color: '#4ECDC4', position: 1 },
          { name: 'Review', color: '#45B7D1', position: 2 },
          { name: 'Done', color: '#96CEB4', position: 3 }
        ]

        for (const col of defaultColumns) {
          await blink.db.board_columns.create({
            id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            board_id: newBoard.id,
            user_id: user.id,
            ...col,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }

        onSave(newBoard)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save board:', error)
      alert('Failed to save board. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!board?.id || !onDelete) return
    
    if (!confirm('Are you sure you want to delete this board? This will also delete all tasks and columns. This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      
      // Delete all tasks in this board
      const tasks = await blink.db.tasks.list({
        where: { board_id: board.id }
      })
      for (const task of tasks) {
        await blink.db.tasks.delete(task.id)
      }

      // Delete all columns in this board
      const columns = await blink.db.board_columns.list({
        where: { board_id: board.id }
      })
      for (const column of columns) {
        await blink.db.board_columns.delete(column.id)
      }

      // Delete the board
      await blink.db.boards.delete(board.id)
      onDelete(board.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete board:', error)
      alert('Failed to delete board. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const updateField = (field: keyof Board, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: formData.color }}
            >
              <Kanban className="w-6 h-6 text-white" />
            </div>
            {board ? 'Edit Board' : 'Create New Board'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Board Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter board name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what this board is for..."
                rows={3}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Board Color
            </Label>
            <div className="grid grid-cols-5 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateField('color', color.value)}
                  className={`
                    w-12 h-12 rounded-lg border-2 transition-all
                    ${formData.color === color.value 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-200 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Board Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {formData.name || 'Board Name'}
                </p>
                {formData.description && (
                  <p className="text-sm text-gray-500">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!board && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A new board will be created with default columns: 
                To Do, In Progress, Review, and Done. You can customize these later.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {board && onDelete && (
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
              disabled={saving || !formData.name.trim()}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : (board ? 'Save Changes' : 'Create Board')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}