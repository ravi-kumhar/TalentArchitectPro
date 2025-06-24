import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  UserCheck,
  UserX
} from "lucide-react";

export default function Analytics() {
  // Mock analytics data - in production this would come from the API
  const recruitmentMetrics = {
    timeToHire: { value: 28, change: -12, trend: "down" },
    costPerHire: { value: 3450, change: 8, trend: "up" },
    sourceEffectiveness: [
      { source: "LinkedIn", applications: 145, hires: 12, conversionRate: 8.3 },
      { source: "Career Page", applications: 89, hires: 8, conversionRate: 9.0 },
      { source: "Referrals", applications: 34, hires: 6, conversionRate: 17.6 },
      { source: "Job Boards", applications: 78, hires: 4, conversionRate: 5.1 }
    ],
    funnelData: {
      applications: 346,
      screening: 189,
      interviews: 67,
      offers: 23,
      hires: 18
    }
  };

  const diversityMetrics = {
    genderDistribution: { male: 58, female: 40, other: 2 },
    ethnicityDistribution: [
      { ethnicity: "White", percentage: 45 },
      { ethnicity: "Asian", percentage: 28 },
      { ethnicity: "Hispanic", percentage: 15 },
      { ethnicity: "Black", percentage: 8 },
      { ethnicity: "Other", percentage: 4 }
    ],
    departmentDiversity: [
      { department: "Engineering", diversityScore: 72 },
      { department: "Product", diversityScore: 85 },
      { department: "Design", diversityScore: 78 },
      { department: "Marketing", diversityScore: 91 }
    ]
  };

  const performanceMetrics = {
    averageRating: 4.2,
    goalCompletion: 87,
    retentionRate: 94,
    promotionRate: 12,
    topPerformers: [
      { name: "Sarah Johnson", rating: 4.9, department: "Product" },
      { name: "Michael Chen", rating: 4.8, department: "Design" },
      { name: "David Park", rating: 4.7, department: "Engineering" }
    ]
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-red-500" : "text-green-500";
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive HR analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recruitment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recruitment" className="space-y-6">
          {/* Key Recruitment Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Time to Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{recruitmentMetrics.timeToHire.value}</div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(recruitmentMetrics.timeToHire.trend)}
                    <span className={`text-sm ${getTrendColor(recruitmentMetrics.timeToHire.trend)}`}>
                      {Math.abs(recruitmentMetrics.timeToHire.change)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Average days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Cost per Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">${recruitmentMetrics.costPerHire.value}</div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(recruitmentMetrics.costPerHire.trend)}
                    <span className={`text-sm ${getTrendColor(recruitmentMetrics.costPerHire.trend)}`}>
                      {Math.abs(recruitmentMetrics.costPerHire.change)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Average cost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  Offer Acceptance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">78%</div>
                <p className="text-sm text-muted-foreground">Acceptance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Quality of Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">4.3</div>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Recruitment Funnel & Source Effectiveness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Applications</span>
                    <span className="font-bold">{recruitmentMetrics.funnelData.applications}</span>
                  </div>
                  <Progress value={100} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Screening</span>
                    <span className="font-bold">{recruitmentMetrics.funnelData.screening}</span>
                  </div>
                  <Progress value={(recruitmentMetrics.funnelData.screening / recruitmentMetrics.funnelData.applications) * 100} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Interviews</span>
                    <span className="font-bold">{recruitmentMetrics.funnelData.interviews}</span>
                  </div>
                  <Progress value={(recruitmentMetrics.funnelData.interviews / recruitmentMetrics.funnelData.applications) * 100} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Offers</span>
                    <span className="font-bold">{recruitmentMetrics.funnelData.offers}</span>
                  </div>
                  <Progress value={(recruitmentMetrics.funnelData.offers / recruitmentMetrics.funnelData.applications) * 100} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hires</span>
                    <span className="font-bold">{recruitmentMetrics.funnelData.hires}</span>
                  </div>
                  <Progress value={(recruitmentMetrics.funnelData.hires / recruitmentMetrics.funnelData.applications) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentMetrics.sourceEffectiveness.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-muted-foreground">
                          {source.applications} applications • {source.hires} hires
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {source.conversionRate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diversity" className="space-y-6">
          {/* Diversity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Male</span>
                    <span className="font-medium">{diversityMetrics.genderDistribution.male}%</span>
                  </div>
                  <Progress value={diversityMetrics.genderDistribution.male} />
                  
                  <div className="flex items-center justify-between">
                    <span>Female</span>
                    <span className="font-medium">{diversityMetrics.genderDistribution.female}%</span>
                  </div>
                  <Progress value={diversityMetrics.genderDistribution.female} />
                  
                  <div className="flex items-center justify-between">
                    <span>Other</span>
                    <span className="font-medium">{diversityMetrics.genderDistribution.other}%</span>
                  </div>
                  <Progress value={diversityMetrics.genderDistribution.other} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ethnicity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diversityMetrics.ethnicityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.ethnicity}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Diversity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diversityMetrics.departmentDiversity.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.department}</span>
                        <span className="font-bold">{dept.diversityScore}%</span>
                      </div>
                      <Progress value={dept.diversityScore} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{performanceMetrics.averageRating}</div>
                <p className="text-sm text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Goal Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{performanceMetrics.goalCompletion}%</div>
                <p className="text-sm text-muted-foreground">Average completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{performanceMetrics.retentionRate}%</div>
                <p className="text-sm text-muted-foreground">Employee retention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Promotion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{performanceMetrics.promotionRate}%</div>
                <p className="text-sm text-muted-foreground">Annual promotions</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold">{performer.rating}</div>
                      <div className="flex text-yellow-400">★★★★★</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Employee Retention Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Retention trends and analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Create custom reports and analytics...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
