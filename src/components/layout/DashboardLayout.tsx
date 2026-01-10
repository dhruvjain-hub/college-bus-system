import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bus,
  Home,
  Map,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Users,
  Route,
  FileText,
  Settings,
  Navigation,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: <Home className="w-5 h-5" /> },
  { label: 'Track Bus', href: '/student/track', icon: <Map className="w-5 h-5" /> },
  { label: 'My Schedule', href: '/student/schedule', icon: <Route className="w-5 h-5" /> },
  { label: 'Attendance', href: '/student/attendance', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
];

const driverNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/driver', icon: <Home className="w-5 h-5" /> },
  { label: 'Trip Control', href: '/driver/trip', icon: <Navigation className="w-5 h-5" /> },
  { label: 'Students', href: '/driver/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Attendance', href: '/driver/attendance', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Report Issue', href: '/driver/report', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'Profile', href: '/driver/profile', icon: <User className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Live Fleet', href: '/admin/fleet', icon: <Map className="w-5 h-5" /> },
  { label: 'Buses', href: '/admin/buses', icon: <Bus className="w-5 h-5" /> },
  { label: 'Drivers', href: '/admin/drivers', icon: <Users className="w-5 h-5" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Routes', href: '/admin/routes', icon: <Route className="w-5 h-5" /> },
  { label: 'Requests', href: '/admin/requests', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'Reports', href: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === 'student' 
    ? studentNavItems 
    : user?.role === 'driver' 
      ? driverNavItems 
      : adminNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground h-16 flex items-center justify-between px-4 shadow-medium">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <div className="flex items-center gap-2">
          <Bus className="w-6 h-6" />
          <span className="font-display font-bold">SCTMS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Bus className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">SCTMS</h1>
              <p className="text-xs text-sidebar-foreground/70">Transport System</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-sidebar-border mt-16 lg:mt-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft" 
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border hidden lg:block">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
