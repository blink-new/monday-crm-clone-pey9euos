import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Save, 
  Trash2, 
  X, 
  Plus,
  Mail,
  Phone,
  Building,
  User,
  Tag
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Contact {
  id?: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: string
  tags: string
  notes: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact?: Contact | null
  onSave: (contact: Contact) => void
  onDelete?: (contactId: string) => void
}

const statusOptions = [
  { value: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800' },
  { value: 'prospect', label: 'Prospect', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
]

export function ContactModal({ isOpen, onClose, contact, onSave, onDelete }: ContactModalProps) {
  const [formData, setFormData] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    status: 'lead',
    tags: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        status: 'lead',
        tags: '',
        notes: ''
      })
    }
  }, [contact, isOpen])

  const handleSave = async () => {
    try {
      setSaving(true)
      const user = await blink.auth.me()
      
      const contactData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (contact?.id) {
        // Update existing contact
        await blink.db.contacts.update(contact.id, contactData)
        onSave({ ...contactData, id: contact.id })
      } else {
        // Create new contact
        const newContact = await blink.db.contacts.create({
          id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...contactData,
          created_at: new Date().toISOString()
        })
        onSave(newContact)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save contact:', error)
      alert('Failed to save contact. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contact?.id || !onDelete) return
    
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await blink.db.contacts.delete(contact.id)
      onDelete(contact.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const updateField = (field: keyof Contact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getTagsArray = (tags: string) => {
    if (!tags) return []
    return tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }

  const addTag = () => {
    if (!newTag.trim()) return
    
    const currentTags = getTagsArray(formData.tags)
    if (!currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()].join(', ')
      updateField('tags', updatedTags)
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = getTagsArray(formData.tags)
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove).join(', ')
    updateField('tags', updatedTags)
  }

  const getInitials = (name: string) => {
    if (!name) return 'C'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    return statusOption?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                {getInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10"
                  />
                </div>
              </div>

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
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              
              {getTagsArray(formData.tags).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getTagsArray(formData.tags).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notes</h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Add notes about this contact..."
              rows={4}
            />
          </div>

          {/* Status Preview */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant="secondary" className={getStatusColor(formData.status)}>
              {statusOptions.find(option => option.value === formData.status)?.label}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {contact && onDelete && (
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
              {saving ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}