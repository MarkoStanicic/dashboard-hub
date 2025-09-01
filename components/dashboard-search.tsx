'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchIcon, FilterIcon, XIcon, ExternalLinkIcon, FolderIcon } from 'lucide-react'
import { type Dashboard } from '@/lib/api/dashboard-api'
import { type Integration } from '@/lib/api/integration-api'
import Link from 'next/link'

interface Section {
  id: string
  name: string
  dashboards: Dashboard[]
}

interface DashboardSearchProps {
  dashboards: Dashboard[]
  integrations: Integration[]
  sections: Section[]
  isSuperAdmin: boolean
}

export function DashboardSearch({ dashboards, integrations, sections, isSuperAdmin }: DashboardSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique values for filters
  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(dashboards.map(d => d.type))]
    return uniquePlatforms.sort()
  }, [dashboards])

  const companies = useMemo(() => {
    if (!isSuperAdmin) return []
    const uniqueCompanies = [...new Set(dashboards.map(d => d.company?.name).filter(Boolean))]
    return uniqueCompanies.sort()
  }, [dashboards, isSuperAdmin])

  const sectionNames = useMemo(() => {
    const uniqueSections = [...new Set(dashboards.map(d => d.section?.name).filter(Boolean))]
    return uniqueSections.sort()
  }, [dashboards])

  // Filter dashboards based on search and filters
  const filteredDashboards = useMemo(() => {
    return dashboards.filter(dashboard => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = dashboard.title.toLowerCase().includes(query)
        const matchesDescription = dashboard.description?.toLowerCase().includes(query)
        const matchesPlatform = dashboard.type.toLowerCase().includes(query)
        const matchesCompany = dashboard.company?.name.toLowerCase().includes(query)
        const matchesSection = dashboard.section?.name.toLowerCase().includes(query)
        
        if (!matchesTitle && !matchesDescription && !matchesPlatform && !matchesCompany && !matchesSection) {
          return false
        }
      }

      // Platform filter
      if (selectedPlatform !== 'all' && dashboard.type !== selectedPlatform) {
        return false
      }

      // Section filter
      if (selectedSection !== 'all' && dashboard.section?.name !== selectedSection) {
        return false
      }

      // Company filter (for super admin)
      if (selectedCompany !== 'all' && dashboard.company?.name !== selectedCompany) {
        return false
      }

      return true
    })
  }, [dashboards, searchQuery, selectedPlatform, selectedSection, selectedCompany])

  // Group filtered dashboards by sections
  const filteredSections = useMemo(() => {
    const sectionGroups: Section[] = []
    const ungrouped: Dashboard[] = []

    filteredDashboards.forEach(dashboard => {
      if (dashboard.section?.name) {
        const existingSection = sectionGroups.find(s => s.name === dashboard.section!.name)
        if (existingSection) {
          existingSection.dashboards.push(dashboard)
        } else {
          sectionGroups.push({
            id: dashboard.section.id,
            name: dashboard.section.name,
            dashboards: [dashboard]
          })
        }
      } else {
        ungrouped.push(dashboard)
      }
    })

    return { sections: sectionGroups, ungrouped }
  }, [filteredDashboards])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPlatform('all')
    setSelectedSection('all')
    setSelectedCompany('all')
  }

  const hasActiveFilters = searchQuery || selectedPlatform !== 'all' || selectedSection !== 'all' || selectedCompany !== 'all'

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tableau': return '📊'
      case 'salesforce': return '☁️'
      case 'powerbi': return '📈'
      default: return '💹'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tableau': return 'bg-blue-100 text-blue-800'
      case 'salesforce': return 'bg-green-100 text-green-800'
      case 'powerbi': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search dashboards by name, description, platform, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-muted' : ''}
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <XIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Options</CardTitle>
            <CardDescription>
              Narrow down your dashboard search with these filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {getPlatformIcon(platform)} {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sections</SelectItem>
                    {sectionNames.map(section => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isSuperAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All companies</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {hasActiveFilters ? 'Search Results' : 'All Dashboards'}
          </h2>
          <Badge variant="outline">
            {filteredDashboards.length} dashboard{filteredDashboards.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {hasActiveFilters && (
          <div className="flex gap-2 text-sm text-muted-foreground">
            {searchQuery && (
              <Badge variant="secondary">"{searchQuery}"</Badge>
            )}
            {selectedPlatform !== 'all' && (
              <Badge variant="secondary">{selectedPlatform}</Badge>
            )}
            {selectedSection !== 'all' && (
              <Badge variant="secondary">{selectedSection}</Badge>
            )}
            {selectedCompany !== 'all' && (
              <Badge variant="secondary">{selectedCompany}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredDashboards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No dashboards found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by connecting your BI platforms and syncing dashboards'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/company/integrations">
                  Connect Platforms
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Filtered Sections */}
          {filteredSections.sections.map(section => (
            <div key={section.id}>
              <div className="flex items-center mb-4">
                <FolderIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-xl font-semibold">{section.name}</h3>
                <Badge variant="outline" className="ml-2">
                  {section.dashboards.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.dashboards.map(dashboard => (
                  <DashboardCard 
                    key={dashboard.id} 
                    dashboard={dashboard} 
                    isSuperAdmin={isSuperAdmin}
                    getPlatformColor={getPlatformColor}
                    getPlatformIcon={getPlatformIcon}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Ungrouped Dashboards */}
          {filteredSections.ungrouped.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-semibold">Other Dashboards</h3>
                <Badge variant="outline" className="ml-2">
                  {filteredSections.ungrouped.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSections.ungrouped.map(dashboard => (
                  <DashboardCard 
                    key={dashboard.id} 
                    dashboard={dashboard} 
                    isSuperAdmin={isSuperAdmin}
                    getPlatformColor={getPlatformColor}
                    getPlatformIcon={getPlatformIcon}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface DashboardCardProps {
  dashboard: Dashboard
  isSuperAdmin: boolean
  getPlatformColor: (platform: string) => string
  getPlatformIcon: (platform: string) => string
}

function DashboardCard({ dashboard, isSuperAdmin, getPlatformColor, getPlatformIcon }: DashboardCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/dashboard/${dashboard.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{dashboard.title}</CardTitle>
              {dashboard.description && (
                <CardDescription className="line-clamp-2">
                  {dashboard.description}
                </CardDescription>
              )}
            </div>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getPlatformColor(dashboard.type)}>
                {getPlatformIcon(dashboard.type)} {dashboard.type}
              </Badge>
              {isSuperAdmin && dashboard.company && (
                <Badge variant="outline">
                  {dashboard.company.name}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(dashboard.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}