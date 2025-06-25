import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { candidatesAPI, invalidateQueries } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeUploadModal({ isOpen, onClose }: ResumeUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [candidateData, setCandidateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: '',
    location: ''
  });
  const { toast } = useToast();

  const parseResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/candidates/parse-resume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to parse resume');
      return response.json();
    },
    onSuccess: (data) => {
      setCandidateData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        currentPosition: data.currentPosition || '',
        location: data.location || ''
      });
      toast({ title: "Resume Parsed", description: "Resume information extracted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Parse Error", 
        description: "Failed to parse resume. You can enter details manually.", 
        variant: "destructive" 
      });
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: (candidate: any) => candidatesAPI.create(candidate),
    onSuccess: () => {
      invalidateQueries.candidates();
      toast({ title: "Success", description: "Candidate added successfully" });
      handleClose();
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
        description: "Failed to add candidate", 
        variant: "destructive" 
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.includes('document')) {
        setSelectedFile(file);
        parseResumeMutation.mutate(file);
      } else {
        toast({ 
          title: "Invalid File", 
          description: "Please upload a PDF or Word document", 
          variant: "destructive" 
        });
      }
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCandidateData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentPosition: '',
      location: ''
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateData.firstName || !candidateData.lastName || !candidateData.email) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in required fields", 
        variant: "destructive" 
      });
      return;
    }

    createCandidateMutation.mutate({
      ...candidateData,
      status: 'new',
      resumeUrl: selectedFile ? selectedFile.name : undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resume & Add Candidate</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={parseResumeMutation.isPending}
            />
            
            {parseResumeMutation.isPending ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <div className="text-left">
                  <p className="font-medium">Parsing resume...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting candidate information
                  </p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setCandidateData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      currentPosition: '',
                      location: ''
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Drop your resume here</p>
                  <p className="text-muted-foreground">or click to browse files</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports PDF, DOC, DOCX (max 10MB) - AI will extract candidate info
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <div className="space-y-4">
            <h3 className="font-medium">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  value={candidateData.firstName}
                  onChange={(e) => setCandidateData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  value={candidateData.lastName}
                  onChange={(e) => setCandidateData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com"
                  value={candidateData.email}
                  onChange={(e) => setCandidateData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567"
                  value={candidateData.phone}
                  onChange={(e) => setCandidateData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Current Position</Label>
              <Input 
                id="position" 
                placeholder="Software Engineer at Company"
                value={candidateData.currentPosition}
                onChange={(e) => setCandidateData(prev => ({ ...prev, currentPosition: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="San Francisco, CA"
                value={candidateData.location}
                onChange={(e) => setCandidateData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCandidateMutation.isPending || parseResumeMutation.isPending}
            >
              {createCandidateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Candidate'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}