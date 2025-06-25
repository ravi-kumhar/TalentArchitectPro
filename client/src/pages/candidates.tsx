import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Upload, Filter, Eye, MessageSquare, Star } from "lucide-react";
import { candidatesAPI } from "@/lib/api";
import ResumeUploadModal from "@/components/candidates/resume-upload-modal";
import type { Candidate } from "@shared/schema";

export default function Candidates() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['/api/candidates', { status: statusFilter }],
    queryFn: () => candidatesAPI.getAll({ status: statusFilter || undefined }),
  });

  const filteredCandidates = candidates.filter((candidate: Candidate) => {
    const matchesSearch = 
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">New</Badge>;
      case 'reviewing':
        return <Badge className="bg-yellow-100 text-yellow-800">Reviewing</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>;
      case 'interviewing':
        return <Badge className="bg-blue-100 text-blue-800">Interviewing</Badge>;
      case 'offered':
        return <Badge className="bg-purple-100 text-purple-800">Offered</Badge>;
      case 'hired':
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="text-muted-foreground">Manage candidate profiles and applications</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      <Tabs defaultValue="all-candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all-candidates">All Candidates</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>

        <TabsContent value="all-candidates" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
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

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                          <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredCandidates.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search criteria." : "Upload resumes to start building your candidate database."}
                </p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </div>
            ) : (
              filteredCandidates.map((candidate: Candidate) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {candidate.firstName} {candidate.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {candidate.currentPosition || 'Position not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        85% match
                      </Badge>
                      {getStatusBadge(candidate.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium">{candidate.experience || 0} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{candidate.location || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applied:</span>
                        <span className="font-medium">
                          {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills && Array.isArray(candidate.skills) ? (
                          candidate.skills.slice(0, 4).map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                          ))
                        ) : (
                          <>
                            <Badge variant="secondary" className="text-xs">JavaScript</Badge>
                            <Badge variant="secondary" className="text-xs">React</Badge>
                            <Badge variant="secondary" className="text-xs">Node.js</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No new candidates</h3>
                <p className="text-muted-foreground mb-4">New candidate applications will appear here.</p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <CardTitle>Candidates in Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates in screening</h3>
                <p className="text-muted-foreground">Candidates being screened will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviewing">
          <Card>
            <CardHeader>
              <CardTitle>Candidates in Interview Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates interviewing</h3>
                <p className="text-muted-foreground">Candidates in interview stages will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortlisted">
          <Card>
            <CardHeader>
              <CardTitle>Shortlisted Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted candidates</h3>
                <p className="text-muted-foreground">Shortlisted candidates will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ResumeUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}