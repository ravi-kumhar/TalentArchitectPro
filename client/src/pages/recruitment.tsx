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
import JobViewModal from "@/components/jobs/job-view-modal";
import JobEditModal from "@/components/jobs/job-edit-modal";
import type { Job } from "@shared/schema";

export default function Recruitment() {
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showViewJob, setShowViewJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowViewJob(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setShowEditJob(true);
  };

  const handleEditFromView = () => {
    setShowViewJob(false);
    setShowEditJob(true);
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
                        <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditJob(job)}>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recruitment Pipeline</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export</Button>
                <Button size="sm">Manage Pipeline</Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Applied</h3>
                      <Badge variant="secondary">8</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100">
                        <p className="font-medium text-sm">John Smith</p>
                        <p className="text-xs text-muted-foreground">Frontend Developer</p>
                        <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100">
                        <p className="font-medium text-sm">Sarah Wilson</p>
                        <p className="text-xs text-muted-foreground">Product Manager</p>
                        <p className="text-xs text-blue-600 mt-1">5 hours ago</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100">
                        <p className="font-medium text-sm">Alex Chen</p>
                        <p className="text-xs text-muted-foreground">Backend Engineer</p>
                        <p className="text-xs text-blue-600 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Screening</h3>
                      <Badge variant="secondary">4</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100">
                        <p className="font-medium text-sm">Mike Chen</p>
                        <p className="text-xs text-muted-foreground">UX Designer</p>
                        <p className="text-xs text-yellow-600 mt-1">In review</p>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100">
                        <p className="font-medium text-sm">Emma Davis</p>
                        <p className="text-xs text-muted-foreground">Data Analyst</p>
                        <p className="text-xs text-yellow-600 mt-1">Phone screening</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Interview</h3>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100">
                        <p className="font-medium text-sm">Lisa Garcia</p>
                        <p className="text-xs text-muted-foreground">Data Scientist</p>
                        <p className="text-xs text-orange-600 mt-1">Tech interview today</p>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100">
                        <p className="font-medium text-sm">David Kim</p>
                        <p className="text-xs text-muted-foreground">Backend Engineer</p>
                        <p className="text-xs text-orange-600 mt-1">Final round tomorrow</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Offer</h3>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100">
                        <p className="font-medium text-sm">Anna Taylor</p>
                        <p className="text-xs text-muted-foreground">Marketing Manager</p>
                        <p className="text-xs text-green-600 mt-1">Offer sent</p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100">
                        <p className="font-medium text-sm">Robert Johnson</p>
                        <p className="text-xs text-muted-foreground">Senior Developer</p>
                        <p className="text-xs text-green-600 mt-1">Negotiating</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Hired</h3>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100">
                        <p className="font-medium text-sm">Jennifer Lee</p>
                        <p className="text-xs text-muted-foreground">UI Designer</p>
                        <p className="text-xs text-emerald-600 mt-1">Starting next week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Templates</h2>
              <Button onClick={() => setShowCreateJob(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg">Software Engineer Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Full-stack development roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills included:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">React</Badge>
                      <Badge variant="secondary">Node.js</Badge>
                      <Badge variant="secondary">TypeScript</Badge>
                      <Badge variant="secondary">AWS</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Technical requirements</li>
                      <li>• Experience expectations</li>
                      <li>• Team structure details</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg">Product Manager Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Strategic product leadership roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills included:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">Strategy</Badge>
                      <Badge variant="secondary">Analytics</Badge>
                      <Badge variant="secondary">Leadership</Badge>
                      <Badge variant="secondary">Agile</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Product strategy requirements</li>
                      <li>• Leadership expectations</li>
                      <li>• Stakeholder management</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg">UX Designer Template</CardTitle>
                  <p className="text-sm text-muted-foreground">User experience design roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills included:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">UI/UX</Badge>
                      <Badge variant="secondary">Figma</Badge>
                      <Badge variant="secondary">Research</Badge>
                      <Badge variant="secondary">Prototyping</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Design process requirements</li>
                      <li>• Portfolio expectations</li>
                      <li>• Research methodologies</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg">Data Scientist Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Data analysis and machine learning roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills included:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">Python</Badge>
                      <Badge variant="secondary">Machine Learning</Badge>
                      <Badge variant="secondary">SQL</Badge>
                      <Badge variant="secondary">Statistics</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Technical requirements</li>
                      <li>• Research expectations</li>
                      <li>• Model development</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg">Marketing Manager Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Digital marketing and growth roles</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills included:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">Digital Marketing</Badge>
                      <Badge variant="secondary">SEO/SEM</Badge>
                      <Badge variant="secondary">Analytics</Badge>
                      <Badge variant="secondary">Content</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Campaign management</li>
                      <li>• Growth strategy</li>
                      <li>• Team leadership</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group border-dashed border-2">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Create Custom Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Build your own reusable job template</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <JobCreationModal 
        isOpen={showCreateJob} 
        onClose={() => setShowCreateJob(false)} 
      />
      
      <JobViewModal
        isOpen={showViewJob}
        onClose={() => setShowViewJob(false)}
        job={selectedJob}
        onEdit={handleEditFromView}
      />
      
      <JobEditModal
        isOpen={showEditJob}
        onClose={() => setShowEditJob(false)}
        job={selectedJob}
      />
    </div>
  );
}