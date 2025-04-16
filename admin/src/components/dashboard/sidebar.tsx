'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Folder,
  PenTool,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const mainNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Articles',
      href: '/dashboard/articles',
      icon: FileText,
    },
    {
      title: 'Categories',
      href: '/dashboard/categories',
      icon: Folder,
    },
    {
      title: 'Tags',
      href: '/dashboard/tags',
      icon: Tag,
    },
  ];

  const adminNavItems = [
    {
      title: 'Users',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  // Utility for checking if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Render nav items
  const renderNavItems = (items: typeof mainNavItems) => {
    return items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
          isActiveLink(item.href)
            ? 'bg-slate-800 text-white font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        )}
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    ));
  };

  return (
    <>
      {/* Mobile menu backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu toggle */}
      <button
        className="fixed bottom-4 right-4 z-40 md:hidden bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'fixed inset-y-0 left-0' : 'hidden md:flex'
        )}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6 text-primary" />
            {!isCollapsed && <span className="font-bold">Portfolio Admin</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed ? 'rotate-180' : 'rotate-0'
              )}
            />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-medium text-sm">{user?.firstName || user?.email?.split('@')[0]}</span>
                <span className="text-xs text-slate-400">{user?.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {renderNavItems(mainNavItems)}
          {/* Visit site */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Globe className="h-5 w-5" />
            {!isCollapsed && <span>Visit Site</span>}
          </Link>
          
          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                {!isCollapsed && (
                  <p className="px-3 text-xs font-medium text-slate-500 uppercase">
                    Admin
                  </p>
                )}
                {isCollapsed && <hr className="border-slate-800 mx-2" />}
              </div>
              {renderNavItems(adminNavItems)}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
