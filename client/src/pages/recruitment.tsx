import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Eye, Edit, Copy } from "lucide-react";
import JobCreationModal from "@/components/jobs/job-creation-modal";

export default function Recruitment() {
  const [showCreateJob, setShowCreateJob] = useState(false);

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
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Active Job Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Senior Frontend Developer</CardTitle>
                    <p className="text-sm text-muted-foreground">Engineering • Full-time</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">San Francisco, CA</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applications</p>
                    <p className="font-medium">24</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Posted</p>
                    <p className="font-medium">3 days ago</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AI Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-gray-200 rounded-full">
                        <div className="w-6 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">85%</span>
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
                  <Button size="sm" variant="ghost">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add more job cards here */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Product Manager</CardTitle>
                    <p className="text-sm text-muted-foreground">Product • Full-time</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">New York, NY</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applications</p>
                    <p className="font-medium">18</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Posted</p>
                    <p className="font-medium">1 week ago</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AI Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-gray-200 rounded-full">
                        <div className="w-7 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">78%</span>
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
                  <Button size="sm" variant="ghost">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">UX Designer</CardTitle>
                    <p className="text-sm text-muted-foreground">Design • Full-time</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Draft
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">Austin, TX</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applications</p>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">2 days ago</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AI Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-gray-200 rounded-full">
                        <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">92%</span>
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
                  <Button size="sm" variant="ghost">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="job-pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pipeline view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Job Description Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Template library coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <JobCreationModal 
        isOpen={showCreateJob} 
        onClose={() => setShowCreateJob(false)} 
      />
    </div>
  );
}
