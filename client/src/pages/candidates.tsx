import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import CandidateTable from "@/components/candidates/candidate-table";
import ResumeUploadModal from "@/components/candidates/resume-upload-modal";

export default function Candidates() {
  const [showUploadModal, setShowUploadModal] = useState(false);

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

        <TabsContent value="all-candidates">
          <CandidateTable />
        </TabsContent>

        <TabsContent value="new">
          <CandidateTable statusFilter="new" />
        </TabsContent>

        <TabsContent value="screening">
          <CandidateTable statusFilter="reviewing" />
        </TabsContent>

        <TabsContent value="interviewing">
          <CandidateTable statusFilter="interviewing" />
        </TabsContent>

        <TabsContent value="shortlisted">
          <CandidateTable statusFilter="shortlisted" />
        </TabsContent>
      </Tabs>

      <ResumeUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
