import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/lib/types';
import { Bus, GraduationCap, Truck, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const roles: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="w-6 h-6" />, description: 'Track your bus & attendance' },
  { value: 'driver', label: 'Driver', icon: <Truck className="w-6 h-6" />, description: 'Manage trips & passengers' },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-6 h-6" />, description: 'Full system control' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password, selectedRole);
    
    if (success) {
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${selectedRole}`,
      });
      navigate(`/${selectedRole}`);
    } else {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-info relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Bus className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">SCTMS</h1>
              <p className="text-primary-foreground/80">Smart College Transport</p>
            </div>
          </div>

          <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
            Safe & Efficient<br />Campus Transport
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Real-time tracking, smart scheduling, and seamless communication for your daily commute.
          </p>

          <div className="space-y-4">
            {[
              'Live GPS tracking for all buses',
              'Instant notifications & alerts',
              'Digital attendance management',
              'Emergency assistance system',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-primary-foreground/90">{feature}</span>
              </div>
            ))}
          </div>

          {/* Floating Bus Animation */}
          <div className="absolute bottom-20 right-20 animate-float">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Bus className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">SCTMS</h1>
              <p className="text-xs text-muted-foreground">Transport System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Select your role</Label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                    selectedRole === role.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {role.icon}
                  </div>
                  <span className="text-sm font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Demo mode: Use any email/password to login
          </p>
        </div>
      </div>
    </div>
  );
}
