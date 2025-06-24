import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Star, 
  TrendingUp, 
  Target, 
  Award,
  Calendar,
  FileText,
  BarChart3
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Performance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateReview, setShowCreateReview] = useState(false);
  const { toast } = useToast();

  // Mock performance data - in production this would come from the API
  const performanceData = [
    {
      id: 1,
      employeeId: "1",
      employeeName: "John Smith",
      employeeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      position: "Senior Software Engineer",
      department: "Engineering",
      period: "Q4 2024",
      type: "quarterly",
      rating: 4.5,
      status: "completed",
      goals: [
        { title: "Complete microservices migration", progress: 85, status: "in_progress" },
        { title: "Mentor 2 junior developers", progress: 100, status: "completed" },
        { title: "Improve code review response time", progress: 90, status: "completed" }
      ],
      achievements: "Led the successful migration of 3 services to microservices architecture, resulting in 40% performance improvement.",
      feedback: "John has shown exceptional technical leadership and mentoring skills this quarter.",
      dueDate: "2024-12-31",
      reviewedAt: "2024-12-15"
    },
    {
      id: 2,
      employeeId: "2",
      employeeName: "Sarah Johnson",
      employeeImage: "https://images.unsplash.com/photo-1494790108755-2616b332c1c?w=100",
      position: "Product Manager",
      department: "Product",
      period: "Q4 2024",
      type: "quarterly",
      rating: 4.8,
      status: "completed",
      goals: [
        { title: "Launch new feature set", progress: 100, status: "completed" },
        { title: "Increase user engagement by 25%", progress: 120, status: "completed" },
        { title: "Improve customer satisfaction score", progress: 95, status: "completed" }
      ],
      achievements: "Successfully launched 3 major features that increased user engagement by 30% and improved customer satisfaction by 15%.",
      feedback: "Sarah has consistently delivered exceptional results and shown strong leadership in cross-functional collaboration.",
      dueDate: "2024-12-31",
      reviewedAt: "2024-12-10"
    },
    {
      id: 3,
      employeeId: "3",
      employeeName: "Michael Chen",
      employeeImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      position: "UX Designer",
      department: "Design",
      period: "Q4 2024",
      type: "quarterly",
      rating: 4.2,
      status: "draft",
      goals: [
        { title: "Complete design system overhaul", progress: 75, status: "in_progress" },
        { title: "Conduct 10 user research sessions", progress: 80, status: "in_progress" },
        { title: "Improve design-to-dev handoff process", progress: 60, status: "in_progress" }
      ],
      achievements: "Made significant progress on design system modernization and conducted valuable user research.",
      feedback: "",
      dueDate: "2024-12-31",
      reviewedAt: null
    }
  ];

  const filteredReviews = performanceData.filter(review =>
    review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const averageRating = performanceData.reduce((sum, review) => sum + review.rating, 0) / performanceData.length;
  const completedReviews = performanceData.filter(review => review.status === 'completed').length;
  const pendingReviews = performanceData.filter(review => review.status === 'draft').length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Management</h1>
          <p className="text-muted-foreground">Track and manage employee performance reviews and goals</p>
        </div>
        <Dialog open={showCreateReview} onOpenChange={setShowCreateReview}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Performance Review</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select name="employee" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period">Review Period</Label>
                <Input id="period" name="period" placeholder="Q1 2024" required />
              </div>
              <div>
                <Label htmlFor="type">Review Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="30_day">30 Day</SelectItem>
                    <SelectItem value="60_day">60 Day</SelectItem>
                    <SelectItem value="90_day">90 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateReview(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Review
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Across all reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedReviews}</div>
            <p className="text-sm text-muted-foreground">Reviews completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingReviews}</div>
            <p className="text-sm text-muted-foreground">Reviews pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Goal Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">87%</div>
            <p className="text-sm text-muted-foreground">Average goal completion</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reviews" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews Grid */}
          <div className="space-y-6">
            {filteredReviews.map(review => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.employeeImage} />
                        <AvatarFallback>{review.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{review.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">{review.position}</p>
                        <p className="text-sm text-muted-foreground">{review.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Goals Progress */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Goals Progress
                      </h4>
                      <div className="space-y-3">
                        {review.goals.map((goal, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{goal.title}</span>
                              <span className={`text-sm ${getGoalStatusColor(goal.status)}`}>
                                {goal.progress}%
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Review Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Period</p>
                          <p className="font-medium">{review.period}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{review.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">{new Date(review.dueDate).toLocaleDateString()}</p>
                        </div>
                        {review.reviewedAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Reviewed</p>
                            <p className="font-medium">{new Date(review.reviewedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.achievements && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Achievements</h4>
                      <p className="text-sm text-gray-600">{review.achievements}</p>
                    </div>
                  )}

                  {review.feedback && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                      <p className="text-sm text-gray-600">{review.feedback}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or create a new review.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reviews awaiting completion...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Completed performance reviews...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Employee goals and objectives tracking...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance trends and analytics...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
