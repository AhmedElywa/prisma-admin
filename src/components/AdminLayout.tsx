'use client';

import {
  Bell,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  models: Array<{
    id: string;
    name: string;
    [key: string]: any;
  }>;
}

export function AdminLayout({ children, models }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'relative flex flex-col border-r bg-card transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between border-b p-4">
          {!sidebarCollapsed && (
            <h2 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-transparent text-xl">
              Admin Panel
            </h2>
          )}
          <Button
            className="hidden md:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            size="icon"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <Link
            aria-current={pathname === '/admin' ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname === '/admin' && 'bg-accent text-accent-foreground'
            )}
            data-testid="nav-link-dashboard"
            href="/admin"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {!sidebarCollapsed && (
            <div className="pt-4 pb-2">
              <h3 className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Models
              </h3>
            </div>
          )}

          {models.map((model) => {
            const href = `/admin/${model.id.toLowerCase()}`;
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground'
                )}
                data-testid={`nav-link-${model.id.toLowerCase()}`}
                href={href}
                key={model.id}
              >
                <Database className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{model.name}</span>}
              </Link>
            );
          })}

          <div className="pt-4">
            <Link
              aria-current={
                pathname.startsWith('/admin/settings') ? 'page' : undefined
              }
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                pathname.startsWith('/admin/settings') &&
                  'bg-accent text-accent-foreground'
              )}
              data-testid="nav-link-settings"
              href="/admin/settings"
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </nav>

        {/* Theme Toggle */}
        <div className="border-t p-3">
          <Button
            className={cn(
              'w-full justify-start',
              sidebarCollapsed && 'justify-center px-2'
            )}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant="ghost"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5 shrink-0" />
              ) : (
                <Moon className="h-5 w-5 shrink-0" />
              )
            ) : (
              <div className="h-5 w-5 shrink-0" />
            )}
            {!sidebarCollapsed && mounted && (
              <span className="ml-3">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">
              {pathname === '/admin' && 'Dashboard'}
              {
                models.find((m) => pathname === `/admin/${m.id.toLowerCase()}`)
                  ?.name
              }
              {pathname === '/admin/settings' && 'Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-64 p-0" side="left">
                <MobileNav
                  models={models}
                  mounted={mounted}
                  pathname={pathname}
                  setTheme={setTheme}
                  theme={theme}
                />
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="-translate-y-1/2 absolute start-3 top-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="w-64 ps-9"
                placeholder="Search..."
                type="text"
              />
            </div>

            {/* Notifications */}
            <Button className="relative" size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
              <Badge
                className="-top-1 -end-1 absolute flex h-5 w-5 items-center justify-center p-0"
                variant="destructive"
              >
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full" size="icon" variant="ghost">
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt="User" src="/avatar.jpg" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="me-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="me-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="me-2 h-4 w-4 rtl:scale-x-[-1]" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Mobile Navigation Component
function MobileNav({
  models,
  pathname,
  theme,
  setTheme,
  mounted,
}: {
  models: Array<{
    id: string;
    name: string;
    [key: string]: any;
  }>;
  pathname: string;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  mounted: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo/Header */}
      <div className="border-b p-4">
        <h2 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-transparent text-xl">
          Admin Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <Link
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            pathname === '/admin' && 'bg-accent text-accent-foreground'
          )}
          href="/admin"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <div className="pt-4 pb-2">
          <h3 className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Models
          </h3>
        </div>

        {models.map((model) => {
          const href = `/admin/${model.id.toLowerCase()}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground'
              )}
              data-testid={`nav-link-${model.id.toLowerCase()}`}
              href={href}
              key={model.id}
            >
              <Database className="h-5 w-5" />
              <span>{model.name}</span>
            </Link>
          );
        })}

        <div className="pt-4">
          <Link
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname === '/admin/settings' &&
                'bg-accent text-accent-foreground'
            )}
            href="/admin/settings"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="border-t p-3">
        <Button
          className="w-full justify-start"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="ghost"
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
          {mounted && (
            <span className="ms-3">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
