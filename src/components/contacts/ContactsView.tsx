import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Star,
  Edit,
  Trash2
} from 'lucide-react'
import { contactService } from '@/services/contactService'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: string
  tags: string
  notes: string
  created_at: string
  user_id: string
}

const statusColors = {
  lead: 'bg-blue-100 text-blue-800',
  prospect: 'bg-yellow-100 text-yellow-800',
  customer: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchTerm, selectedStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = contacts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(contact => contact.status === selectedStatus)
    }

    setFilteredContacts(filtered)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTagsArray = (tags: string) => {
    if (!tags) return []
    return tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Contacts</h2>
          <p className="text-gray-500 mt-1">{filteredContacts.length} contacts found</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'lead', 'prospect', 'customer', 'inactive'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-6">
            {contacts.length === 0 
              ? "Add your first contact to start building your network."
              : "Try adjusting your search or filters."
            }
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-medium">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{contact.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={statusColors[contact.status as keyof typeof statusColors]}
                  >
                    {contact.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Added {formatDate(contact.created_at)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {contact.tags && (
                  <div className="flex flex-wrap gap-1">
                    {getTagsArray(contact.tags).slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {getTagsArray(contact.tags).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{getTagsArray(contact.tags).length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Notes Preview */}
                {contact.notes && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {contact.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}