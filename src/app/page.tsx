import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Code2, Database, Layers, Zap } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Database,
      title: 'Prisma Integration',
      description: 'Full CRUD operations with Prisma ORM and PostgreSQL database'
    },
    {
      icon: Code2,
      title: 'GraphQL API',
      description: 'GraphQL Yoga server with Nexus schema generation'
    },
    {
      icon: Layers,
      title: 'Modern UI',
      description: 'Beautiful admin interface with Tailwind CSS 4 and shadcn/ui'
    },
    {
      icon: Zap,
      title: 'Type Safety',
      description: 'End-to-end type safety with TypeScript and generated types'
    }
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="z-10 max-w-5xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PalJS Admin Example
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern admin panel built with Next.js 15, GraphQL Yoga, Nexus, and @paljs/admin
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/admin">
              Go to Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/api/graphql" target="_blank" rel="noopener noreferrer">
              GraphQL Playground
            </a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tech Stack */}
        <div className="text-center space-y-4 mt-12">
          <h2 className="text-2xl font-semibold">Built With</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Next.js 15',
              'TypeScript',
              'Tailwind CSS 4',
              'shadcn/ui',
              'GraphQL Yoga',
              'Nexus',
              'Prisma',
              'Apollo Client',
              '@paljs/admin'
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}