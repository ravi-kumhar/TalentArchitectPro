import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  BarChart3, 
  Search, 
  UserRoundCheck, 
  Calendar, 
  GraduationCap,
  TrendingUp,
  Bot,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Recruitment", href: "/recruitment", icon: Search },
  { name: "Candidates", href: "/candidates", icon: UserRoundCheck },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Onboarding", href: "/onboarding", icon: GraduationCap },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className={cn("bg-white shadow-lg flex flex-col border-r border-border", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white text-lg" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-xl text-gray-900">TalentArchitect</h1>
                <p className="text-xs text-muted-foreground">AI-Powered HR Platform</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImageUrl || ""} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.role?.replace('_', ' ') || 'Employee'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "sidebar-nav-item",
                    isActive 
                      ? "sidebar-nav-item-active" 
                      : "sidebar-nav-item-inactive"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && item.name}
                </a>
              </Link>
            );
          })}
        </div>

        {/* AI Assistant */}
        <div className="mt-8 px-3">
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-white"
            onClick={() => {
              // This would open the AI assistant modal
              // For now, just a placeholder
              console.log("Open AI Assistant");
            }}
          >
            <Bot className="w-4 h-4 mr-2" />
            {!isCollapsed && "AI Assistant"}
          </Button>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="w-4 h-4 mr-3" />
            {!isCollapsed && "Settings"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
