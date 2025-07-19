import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Save, 
  Trash2, 
  DollarSign,
  Calendar,
  User,
  Target,
  TrendingUp
} from 'lucide-react'
import { blink } from '@/lib/blink'

interface Deal {
  id?: string
  title: string
  description: string
  value: number
  stage: string
  probability: number
  expected_close_date: string
  actual_close_date?: string
  contact_id: string
  assigned_to: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

interface Contact {
  id: string
  name: string
  email: string
  company: string
}

interface DealModalProps {
  isOpen: boolean
  onClose: () => void
  deal?: Deal | null
  onSave: (deal: Deal) => void
  onDelete?: (dealId: string) => void
}

const stageOptions = [
  { value: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { value: 'closed-won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'closed-lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
]

export function DealModal({ isOpen, onClose, deal, onSave, onDelete }: DealModalProps) {
  const [formData, setFormData] = useState<Deal>({
    title: '',
    description: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    expected_close_date: '',
    contact_id: '',
    assigned_to: ''
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
    if (deal) {
      setFormData(deal)
    } else {
      setFormData({
        title: '',
        description: '',
        value: 0,
        stage: 'lead',
        probability: 10,
        expected_close_date: '',
        contact_id: '',
        assigned_to: ''
      })
    }
  }, [deal, isOpen])

  const loadContacts = async () => {
    try {
      setLoadingContacts(true)
      const user = await blink.auth.me()
      const contactsData = await blink.db.contacts.list({
        where: { user_id: user.id },
        orderBy: { name: 'asc' }
      })
      setContacts(contactsData)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const user = await blink.auth.me()
      
      const dealData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      // Set actual close date if deal is closed
      if (formData.stage === 'closed-won' || formData.stage === 'closed-lost') {
        dealData.actual_close_date = new Date().toISOString()
      }

      if (deal?.id) {
        // Update existing deal
        await blink.db.deals.update(deal.id, dealData)
        onSave({ ...dealData, id: deal.id })
      } else {
        // Create new deal
        const newDeal = await blink.db.deals.create({
          id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...dealData,
          created_at: new Date().toISOString()
        })
        onSave(newDeal)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save deal:', error)
      alert('Failed to save deal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deal?.id || !onDelete) return
    
    if (!confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await blink.db.deals.delete(deal.id)
      onDelete(deal.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete deal:', error)
      alert('Failed to delete deal. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const updateField = (field: keyof Deal, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStageColor = (stage: string) => {
    const stageOption = stageOptions.find(option => option.value === stage)
    return stageOption?.color || 'bg-gray-100 text-gray-800'
  }

  const getSelectedContact = () => {
    return contacts.find(contact => contact.id === formData.contact_id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Target className="w-5 h-5" />
              Deal Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter deal title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the deal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Deal Value *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => updateField('value', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="pl-10"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                  {formData.value > 0 && (
                    <p className="text-sm text-gray-500">
                      {formatCurrency(formData.value)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <select
                    id="stage"
                    value={formData.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {stageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Probability and Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Probability & Timeline
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Win Probability (%)</Label>
                <div className="space-y-2">
                  <Input
                    id="probability"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.probability}
                    onChange={(e) => updateField('probability', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">0%</span>
                    <Badge variant="secondary" className="text-sm">
                      {formData.probability}%
                    </Badge>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                  <Progress value={formData.probability} className="h-2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => updateField('expected_close_date', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact & Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_id">Associated Contact</Label>
                <select
                  id="contact_id"
                  value={formData.contact_id}
                  onChange={(e) => updateField('contact_id', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loadingContacts}
                >
                  <option value="">Select a contact...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} {contact.company && `(${contact.company})`}
                    </option>
                  ))}
                </select>
                {loadingContacts && (
                  <p className="text-sm text-gray-500">Loading contacts...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => updateField('assigned_to', e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>
            </div>

            {getSelectedContact() && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Selected Contact:</p>
                <p className="text-sm text-gray-600">
                  {getSelectedContact()?.name}
                  {getSelectedContact()?.company && ` • ${getSelectedContact()?.company}`}
                  {getSelectedContact()?.email && ` • ${getSelectedContact()?.email}`}
                </p>
              </div>
            )}
          </div>

          {/* Deal Preview */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium">Deal Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Value:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {formatCurrency(formData.value)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stage:</span>
                <Badge variant="secondary" className={`ml-2 ${getStageColor(formData.stage)}`}>
                  {stageOptions.find(option => option.value === formData.stage)?.label}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Probability:</span>
                <span className="ml-2 font-semibold">{formData.probability}%</span>
              </div>
              <div>
                <span className="text-gray-600">Expected Value:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(formData.value * (formData.probability / 100))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {deal && onDelete && (
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
              disabled={saving || !formData.title.trim() || formData.value <= 0}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Deal'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}