import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  MoreVertical,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jobsAPI, invalidateQueries } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import JobCreationModal from "./job-creation-modal";
import type { Job } from "@shared/schema";

export default function JobTable() {
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['/api/jobs', { status: statusFilter, department: departmentFilter }],
    queryFn: () => jobsAPI.getAll({ 
      status: statusFilter || undefined, 
      department: departmentFilter || undefined 
    }),
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map((job: Job) => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: number, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    }
  };

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

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Failed to load jobs. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Active Job Postings</CardTitle>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowCreateJob(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
              <Button variant="outline" disabled={selectedJobs.length === 0}>
                Bulk Actions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredJobs.length > 0 && 
                        selectedJobs.length === filteredJobs.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton rows
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-32 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-24 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-28 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-8 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-16 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-12 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="w-8 h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || statusFilter || departmentFilter 
                            ? "Try adjusting your search or filter criteria."
                            : "Create your first job posting to get started."
                          }
                        </p>
                        <Button onClick={() => setShowCreateJob(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Job
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job: Job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={(checked) => 
                            handleSelectJob(job.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.employmentType?.replace('_', '-')} • {job.workLocation?.replace('_', ' ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{job.department || '-'}</TableCell>
                      <TableCell className="text-gray-700">{job.location || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          0
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getAIScoreColor(job.aiScore || 0)}`}
                              style={{ width: `${(job.aiScore || 0)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{job.aiScore || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{Math.min(10, filteredJobs.length)}</span> of{" "}
                <span className="font-medium">{filteredJobs.length}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button size="sm" className="bg-primary text-white">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <JobCreationModal 
        isOpen={showCreateJob} 
        onClose={() => setShowCreateJob(false)} 
      />
    </>
  );
}
