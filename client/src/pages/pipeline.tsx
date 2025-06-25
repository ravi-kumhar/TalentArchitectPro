import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, Plus, Filter, MoreHorizontal, MessageSquare, Calendar, 
  Phone, Mail, MapPin, Briefcase, Clock, Star, TrendingUp, Download, Settings 
} from "lucide-react";
import PipelineExport from "@/components/pipeline/pipeline-export";
import { candidatesAPI } from "@/lib/api";
import type { Candidate } from "@shared/schema";

export default function Pipeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [showExport, setShowExport] = useState(false);

  const { data: candidates = [] } = useQuery({
    queryKey: ['/api/candidates'],
    queryFn: () => candidatesAPI.getAll()
  });

  const filteredCandidates = candidates.filter((candidate: Candidate) => {
    const matchesSearch = 
      candidate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = selectedStage === "all" || candidate.status === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const stages = [
    { id: "all", name: "All Candidates", count: candidates.length },
    { id: "new", name: "New", count: candidates.filter(c => c.status === "new").length },
    { id: "reviewing", name: "Reviewing", count: candidates.filter(c => c.status === "reviewing").length },
    { id: "interviewing", name: "Interviewing", count: candidates.filter(c => c.status === "interviewing").length },
    { id: "shortlisted", name: "Shortlisted", count: candidates.filter(c => c.status === "shortlisted").length },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'new': { label: 'New', className: 'bg-blue-100 text-blue-800' },
      'reviewing': { label: 'Reviewing', className: 'bg-yellow-100 text-yellow-800' },
      'interviewing': { label: 'Interviewing', className: 'bg-purple-100 text-purple-800' },
      'shortlisted': { label: 'Shortlisted', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Pipeline</h1>
          <p className="text-muted-foreground">Track candidates through your hiring process</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(!showExport)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage Pipeline
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card 
            key={stage.id} 
            className={`cursor-pointer transition-colors ${
              selectedStage === stage.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedStage(stage.id)}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stage.count}</p>
                <p className="text-sm text-muted-foreground">{stage.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCandidates.map((candidate: Candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {candidate.firstName} {candidate.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {candidate.currentPosition || 'No position'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                {getStatusBadge(candidate.status)}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm">4.2</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{candidate.experience || 0} years exp</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" className="flex-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding some candidates to your pipeline'}
            </p>
          </CardContent>
        </Card>
      )}

      {showExport && (
        <div className="mt-6">
          <PipelineExport />
        </div>
      )}
    </div>
  );
}