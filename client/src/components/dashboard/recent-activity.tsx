import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/dashboard/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent-activity?limit=5', { credentials: 'include' });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Mock data for display purposes
  const mockActivities = [
    {
      id: 1,
      description: "New application received for Senior Developer position",
      timestamp: "2 minutes ago",
      type: "application"
    },
    {
      id: 2,
      description: "Interview scheduled with Sarah Johnson",
      timestamp: "15 minutes ago",
      type: "interview"
    },
    {
      id: 3,
      description: "Job posting 'Product Manager' published",
      timestamp: "1 hour ago",
      type: "job"
    },
    {
      id: 4,
      description: "Offer letter sent to Michael Chen",
      timestamp: "3 hours ago",
      type: "offer"
    },
    {
      id: 5,
      description: "Onboarding started for Emma Wilson",
      timestamp: "5 hours ago",
      type: "onboarding"
    }
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-green-500';
      case 'interview': return 'bg-blue-500';
      case 'job': return 'bg-yellow-500';
      case 'offer': return 'bg-purple-500';
      case 'onboarding': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-muted-foreground">Activity will appear here as actions are performed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.slice(0, 5).map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-2 h-2 ${getActivityColor(activity.type || 'default')} rounded-full mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp || 'Recently'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
