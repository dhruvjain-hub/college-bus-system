import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Bell, Shield, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">SCTMS</span>
          </div>
          <Link to="/login">
            <Button variant="default" size="lg">
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 50+ Colleges</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Smart College{' '}
              <span className="text-gradient">Transport</span>{' '}
              Management
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real-time GPS tracking, digital attendance, and instant notifications. 
              Modernize your campus transport with our comprehensive solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="hero" size="xl">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Buses Managed' },
              { value: '50K+', label: 'Students Served' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-card shadow-soft">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete transport management solution designed for modern educational institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Live GPS Tracking',
                description: 'Track all buses in real-time on an interactive map with ETA calculations.',
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: 'Instant Notifications',
                description: 'Get alerts for delays, route changes, holidays, and emergencies.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Student Management',
                description: 'Manage student profiles, bus assignments, and pickup stops effortlessly.',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Digital Attendance',
                description: 'Automated attendance tracking for pickup and drop-off.',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Emergency Assistance',
                description: 'Quick access to help when students miss their bus or face issues.',
              },
              {
                icon: <Bus className="w-6 h-6" />,
                title: 'Fleet Management',
                description: 'Complete oversight of vehicles, drivers, and routes.',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-6 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Built for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tailored dashboards and features for every stakeholder
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                role: 'Students',
                color: 'from-info to-info/70',
                features: ['Track bus live', 'View schedule', 'Request assistance', 'Check attendance'],
              },
              {
                role: 'Drivers',
                color: 'from-success to-success/70',
                features: ['Trip management', 'Mark attendance', 'Report issues', 'Send alerts'],
              },
              {
                role: 'Admin',
                color: 'from-primary to-primary/70',
                features: ['Fleet overview', 'Manage users', 'View reports', 'Handle requests'],
              },
            ].map((item, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90`} />
                <div className="relative z-10 p-8 text-white">
                  <h3 className="font-display text-2xl font-bold mb-6">{item.role}</h3>
                  <ul className="space-y-3">
                    {item.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary via-primary to-info rounded-3xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Transport?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join hundreds of educational institutions that trust SCTMS for safe and efficient campus transport.
              </p>
              <Link to="/login">
                <Button variant="accent" size="xl">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">SCTMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Smart College Transport Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
