import { ArrowRight, Code2, Database, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const features = [
    {
      icon: Database,
      title: 'Prisma Integration',
      description:
        'Full CRUD operations with Prisma ORM and PostgreSQL database',
    },
    {
      icon: Code2,
      title: 'GraphQL API',
      description: 'GraphQL Yoga server with Nexus schema generation',
    },
    {
      icon: Layers,
      title: 'Modern UI',
      description:
        'Beautiful admin interface with Tailwind CSS 4 and shadcn/ui',
    },
    {
      icon: Zap,
      title: 'Type Safety',
      description: 'End-to-end type safety with TypeScript and generated types',
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="z-10 w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4 text-center">
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-5xl text-transparent tracking-tight">
            PalJS Admin Example
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            A modern admin panel built with Next.js 15, GraphQL Yoga, Nexus, and
            @paljs/admin
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/admin">
              Go to Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="/api/graphql" rel="noopener noreferrer" target="_blank">
              GraphQL Playground
            </a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card className="border-2" key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="mt-12 space-y-4 text-center">
          <h2 className="font-semibold text-2xl">Built With</h2>
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
              '@paljs/admin',
            ].map((tech) => (
              <span
                className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-sm"
                key={tech}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
