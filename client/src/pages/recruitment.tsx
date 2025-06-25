import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Eye, Edit, Copy, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { jobsAPI, invalidateQueries } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import JobCreationModal from "@/components/jobs/job-creation-modal";
import type { Job } from "@shared/schema";

export default function Recruitment() {
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['/api/jobs', { status: statusFilter }],
    queryFn: () => jobsAPI.getAll({ status: statusFilter || undefined }),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: number) => jobsAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.jobs();
      toast({ title: "Success", description: "Job deleted successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to delete job", 
        variant: "destructive" 
      });
    },
  });

  const duplicateJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const job = await jobsAPI.getById(jobId);
      const { id, createdAt, updatedAt, ...jobData } = job;
      return jobsAPI.create({
        ...jobData,
        title: `${jobData.title} (Copy)`,
        status: 'draft'
      });
    },
    onSuccess: () => {
      invalidateQueries.jobs();
      toast({ title: "Success", description: "Job duplicated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to duplicate job", 
        variant: "destructive" 
      });
    },
  });

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    if (score >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recruitment</h1>
          <p className="text-muted-foreground">Manage job postings and track applications</p>
        </div>
        <Button onClick={() => setShowCreateJob(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      <Tabs defaultValue="active-jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="job-pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active-jobs" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search job postings..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="space-y-1">
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search criteria." : "Create your first job posting to get started."}
                </p>
                <Button onClick={() => setShowCreateJob(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
            ) : (
              filteredJobs.map((job: Job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {job.department} • {job.employmentType?.replace('_', '-')}
                        </p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{job.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applications</p>
                        <p className="font-medium">0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Posted</p>
                        <p className="font-medium">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AI Score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getAIScoreColor(job.aiScore || 0)}`}
                              style={{ width: `${(job.aiScore || 0)}%` }}
                            />
                          </div>
                          <span className="text-sm">{job.aiScore || 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => duplicateJobMutation.mutate(job.id)}
                            disabled={duplicateJobMutation.isPending}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteJobMutation.mutate(job.id)}
                            disabled={deleteJobMutation.isPending}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="job-pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Applied</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-sm">John Smith</p>
                      <p className="text-xs text-muted-foreground">Frontend Developer</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-sm">Sarah Wilson</p>
                      <p className="text-xs text-muted-foreground">Product Manager</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Screening</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-sm">Mike Chen</p>
                      <p className="text-xs text-muted-foreground">UX Designer</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Interview</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-medium text-sm">Lisa Garcia</p>
                      <p className="text-xs text-muted-foreground">Data Scientist</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-medium text-sm">David Kim</p>
                      <p className="text-xs text-muted-foreground">Backend Engineer</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Offer</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-sm">Anna Taylor</p>
                      <p className="text-xs text-muted-foreground">Marketing Manager</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time to Fill</span>
                    <span className="font-medium">32 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Hire</span>
                    <span className="font-medium">$4,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer Acceptance</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LinkedIn</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct Applications</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referrals</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applications</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviews</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hires</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Software Engineer Template</CardTitle>
                <p className="text-sm text-muted-foreground">For technical roles</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Full-stack</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Product Manager Template</CardTitle>
                <p className="text-sm text-muted-foreground">For product roles</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">Strategy</Badge>
                  <Badge variant="secondary">Analytics</Badge>
                  <Badge variant="secondary">Leadership</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Designer Template</CardTitle>
                <p className="text-sm text-muted-foreground">For design roles</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">UI/UX</Badge>
                  <Badge variant="secondary">Figma</Badge>
                  <Badge variant="secondary">Research</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <JobCreationModal 
        isOpen={showCreateJob} 
        onClose={() => setShowCreateJob(false)} 
      />
    </div>
  );
}