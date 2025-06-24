import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";

export default function UpcomingInterviews() {
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['/api/interviews/today'],
    queryFn: async () => {
      const response = await fetch('/api/interviews/today', { credentials: 'include' });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Mock data for display purposes since we don't have actual interview data yet
  const mockInterviews = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      position: "Senior Frontend Developer",
      time: "2:00 PM - 3:00 PM",
      type: "on-site",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1c?w=100"
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      position: "Product Manager",
      time: "3:30 PM - 4:30 PM",
      type: "remote",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      position: "UX Designer",
      time: "5:00 PM - 6:00 PM",
      type: "on-site",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    }
  ];

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayInterviews = interviews.length > 0 ? interviews : mockInterviews;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Interviews
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayInterviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews today</h3>
            <p className="text-muted-foreground">All clear for today! Check your upcoming schedule.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayInterviews.slice(0, 3).map((interview: any) => (
              <div key={interview.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={interview.avatar} />
                  <AvatarFallback>
                    {interview.candidateName?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{interview.candidateName}</p>
                  <p className="text-sm text-muted-foreground">{interview.position}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{interview.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className={
                      interview.type === "on-site" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {interview.type === "on-site" ? "On-site" : "Remote"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
