import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Upload, 
  Filter, 
  Eye, 
  MessageSquare, 
  Star,
  MoreVertical,
  Trash2,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { candidatesAPI, invalidateQueries } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import ResumeUploadModal from "./resume-upload-modal";
import type { Candidate } from "@shared/schema";

interface CandidateTableProps {
  statusFilter?: string;
}

export default function CandidateTable({ statusFilter }: CandidateTableProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['/api/candidates', { status: statusFilter }],
    queryFn: () => candidatesAPI.getAll({ status: statusFilter || undefined }),
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => candidatesAPI.delete?.(id),
    onSuccess: () => {
      invalidateQueries.candidates();
      toast({ title: "Success", description: "Candidate deleted successfully" });
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
        description: "Failed to delete candidate", 
        variant: "destructive" 
      });
    },
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
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'reviewing':
        return <Badge className="bg-yellow-100 text-yellow-800">Reviewing</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>;
      case 'interviewing':
        return <Badge className="bg-purple-100 text-purple-800">Interviewing</Badge>;
      case 'offered':
        return <Badge className="bg-orange-100 text-orange-800">Offered</Badge>;
      case 'hired':
        return <Badge className="bg-emerald-100 text-emerald-800">Hired</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Failed to load candidates. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex items-center justify-between">
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
          <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90">
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCandidates.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria." : "Upload resumes or add candidates to get started."}
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
                        <AvatarFallback>{getInitials(candidate.firstName, candidate.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {candidate.firstName} {candidate.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {candidate.currentPosition || 'Professional'}
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
                      <span className="font-medium">{candidate.experience || 0}+ years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{candidate.location || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added:</span>
                      <span className="font-medium">
                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                  </div>

                  {candidate.skills && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {(candidate.skills as string[])?.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCandidateMutation.mutate(candidate.id)}
                          disabled={deleteCandidateMutation.isPending}
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
      </div>

      <ResumeUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </>
  );
}