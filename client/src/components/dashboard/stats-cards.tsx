import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Calendar, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Open Positions",
      value: stats?.openPositions || 0,
      change: "+12% from last month",
      trend: "up",
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Active Candidates",
      value: stats?.activeCandidates || 0,
      change: "+8% from last month",
      trend: "up",
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100"
    },
    {
      title: "Interviews Today",
      value: stats?.interviewsToday || 0,
      change: "Next at 2:00 PM",
      trend: "neutral",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "New Hires",
      value: stats?.newHires || 0,
      change: "This month",
      trend: "up",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center mt-1 text-sm">
                  {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600 mr-1" />}
                  {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
                  <span className={
                    stat.trend === "up" ? "text-green-600" :
                    stat.trend === "down" ? "text-red-600" : 
                    "text-blue-600"
                  }>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.color} text-xl w-6 h-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
