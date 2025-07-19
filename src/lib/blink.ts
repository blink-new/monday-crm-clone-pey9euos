import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'monday-crm-clone-pey9euos',
  authRequired: true
})

// Export types for our CRM data models
export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  role: 'admin' | 'member' | 'viewer'
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: string
  name: string
  description?: string
  color: string
  userId: string
  teamMembers: string[]
  createdAt: string
  updatedAt: string
}

export interface BoardColumn {
  id: string
  boardId: string
  name: string
  color: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  boardId: string
  columnId: string
  title: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'stuck'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigneeId?: string
  dueDate?: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  source: 'website' | 'referral' | 'social' | 'email' | 'cold_call' | 'other'
  tags: string[]
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  contactId: string
  value: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: 'task_created' | 'task_updated' | 'task_completed' | 'contact_added' | 'deal_created' | 'deal_updated' | 'comment_added'
  entityType: 'task' | 'contact' | 'deal' | 'board'
  entityId: string
  description: string
  userId: string
  createdAt: string
}

export interface Comment {
  id: string
  entityType: 'task' | 'contact' | 'deal'
  entityId: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
}