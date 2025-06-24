import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Check, 
  Trash2, 
  Settings,
  Mail,
  MessageSquare,
  Calendar,
  UserPlus,
  Briefcase,
  AlertCircle,
  Info,
  CheckCircle,
  Clock
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'hr' | 'interview' | 'application' | 'onboarding';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    interviewReminders: true,
    applicationUpdates: true,
    systemAlerts: true,
    weeklyDigest: false
  });
  const { toast } = useToast();

  // Mock notifications data - replace with actual API call
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Job Application',
      message: 'John Doe applied for Senior Developer position',
      type: 'info',
      category: 'application',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/candidates'
    },
    {
      id: '2',
      title: 'Interview Scheduled',
      message: 'Interview scheduled for tomorrow at 2:00 PM with Jane Smith',
      type: 'success',
      category: 'interview',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: '/interviews'
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window this weekend',
      type: 'warning',
      category: 'system',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '4',
      title: 'Onboarding Complete',
      message: 'Sarah Wilson completed her onboarding process',
      type: 'success',
      category: 'onboarding',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      actionUrl: '/onboarding'
    },
    {
      id: '5',
      title: 'Profile Update Required',
      message: 'Please update your emergency contact information',
      type: 'warning',
      category: 'hr',
      read: false,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      actionUrl: '/profile'
    }
  ];

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock API call - replace with actual implementation
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({ title: "Notification marked as read" });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock API call - replace with actual implementation
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({ title: "Notification deleted" });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Mock API call - replace with actual implementation
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({ title: "All notifications marked as read" });
    }
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'interview':
        return <Calendar className="w-4 h-4" />;
      case 'application':
        return <UserPlus className="w-4 h-4" />;
      case 'hr':
        return <Briefcase className="w-4 h-4" />;
      case 'onboarding':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with important events and updates</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              variant="outline"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 mt-1">
                          {getCategoryIcon(notification.category)}
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.category.toUpperCase()}
                            </Badge>
                            
                            <div className="flex items-center gap-2">
                              {notification.actionUrl && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => window.location.href = notification.actionUrl!}
                                >
                                  View
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Interview Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about upcoming interviews
                      </p>
                    </div>
                    <Switch 
                      checked={settings.interviewReminders}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, interviewReminders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Application Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Updates about job applications and candidates
                      </p>
                    </div>
                    <Switch 
                      checked={settings.applicationUpdates}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, applicationUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        System Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Important system announcements and maintenance
                      </p>
                    </div>
                    <Switch 
                      checked={settings.systemAlerts}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, systemAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Weekly Digest
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of activities and updates
                      </p>
                    </div>
                    <Switch 
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, weeklyDigest: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}