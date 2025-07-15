import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getAllModels } from '@/lib/admin/settings'

// Icon mapping for models
const iconMap: Record<string, any> = {
  User: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Post: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Category: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Tag: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Profile: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Default: Database
}

// Color mapping for models
const colorMap: Record<string, string> = {
  User: 'from-blue-500 to-blue-600',
  Post: 'from-green-500 to-green-600',
  Profile: 'from-purple-500 to-purple-600',
  Category: 'from-orange-500 to-orange-600',
  Tag: 'from-pink-500 to-pink-600',
}

export default async function AdminDashboard() {
  // Get all models from settings
  const models = await getAllModels()
  
  // Fetch counts for each model
  const modelStats = await Promise.all(
    models.map(async (model) => {
      try {
        const count = await (prisma as any)[model.id].count()
        return { 
          ...model, 
          count,
          Icon: iconMap[model.id] || iconMap.Default,
          color: colorMap[model.id] || 'from-gray-500 to-gray-600'
        }
      } catch (error) {
        console.error(`Failed to count ${model.id}:`, error)
        return { 
          ...model, 
          count: 0,
          Icon: iconMap[model.id] || iconMap.Default,
          color: colorMap[model.id] || 'from-gray-500 to-gray-600'
        }
      }
    })
  )

  const totalRecords = modelStats.reduce((sum, model) => sum + model.count, 0)

  const stats = [
    { label: 'Total Records', value: totalRecords.toLocaleString(), change: '+0%', icon: BarChart3 },
    { label: 'Active Models', value: models.length.toString(), change: '+0%', icon: Database },
    { label: 'Growth Rate', value: '0%', change: '+0%', icon: Activity },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your admin panel. Manage your data and monitor activity.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Models Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Data Models</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modelStats.map((model) => {
            const Icon = model.Icon
            return (
              <Card key={model.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${model.color} text-white`}>
                      <Icon />
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/${model.id.toLowerCase()}`}>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                  <CardTitle className="mt-4">{model.name}</CardTitle>
                  <CardDescription>Manage {model.name.toLowerCase()} records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold">{model.count}</span>
                    <span className="text-sm text-muted-foreground">Total records</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and helpful tips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Navigate Models</p>
                <p className="text-sm text-muted-foreground">Use the sidebar to browse and manage different data models</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Manage Data</p>
                <p className="text-sm text-muted-foreground">Click on any model card to view, create, edit, or delete records</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">JSON Field Support</p>
                <p className="text-sm text-muted-foreground">Edit JSON fields with our visual editor featuring syntax highlighting</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Settings-Driven</p>
                <p className="text-sm text-muted-foreground">Configure fields, permissions, and display options in adminSettings.json</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}