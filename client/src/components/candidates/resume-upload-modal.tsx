import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { candidatesAPI, invalidateQueries } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  CloudUpload, 
  FileText, 
  CheckCircle, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  Calendar,
  Upload
} from "lucide-react";

const candidateFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  experience: z.number().min(0).optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeUploadModal({ isOpen, onClose }: ResumeUploadModalProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      experience: undefined,
      currentPosition: "",
      currentCompany: "",
    },
  });

  const parseResumeMutation = useMutation({
    mutationFn: (file: File) => candidatesAPI.parseResume(file),
    onSuccess: (data) => {
      setParsedData(data);
      // Pre-fill form with parsed data
      if (data.firstName) form.setValue("firstName", data.firstName);
      if (data.lastName) form.setValue("lastName", data.lastName);
      if (data.email) form.setValue("email", data.email);
      if (data.phone) form.setValue("phone", data.phone);
      if (data.location) form.setValue("location", data.location);
      if (data.experience) form.setValue("experience", data.experience);
      if (data.currentPosition) form.setValue("currentPosition", data.currentPosition);
      if (data.currentCompany) form.setValue("currentCompany", data.currentCompany);
      
      toast({ title: "Success", description: "Resume parsed successfully" });
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
        description: "Failed to parse resume",
        variant: "destructive",
      });
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: (data: CandidateFormData) => {
      const candidateData = {
        ...data,
        skills: parsedData?.skills || [],
        education: parsedData?.education || [],
        resumeUrl: uploadedFile?.name || "",
        status: "new" as const,
        source: "direct" as const,
      };
      return candidatesAPI.create(candidateData);
    },
    onSuccess: () => {
      invalidateQueries.candidates();
      toast({ title: "Success", description: "Candidate created successfully" });
      handleReset();
      onClose();
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
        description: "Failed to create candidate",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf') && 
        !file.type.includes('document') && 
        !file.type.includes('word')) {
      toast({
        title: "Error",
        description: "Please upload a PDF, DOC, or DOCX file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start parsing after upload completes
          parseResumeMutation.mutate(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleReset = () => {
    setUploadProgress(0);
    setUploadedFile(null);
    setParsedData(null);
    form.reset();
  };

  const onSubmit = (data: CandidateFormData) => {
    createCandidateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload & Parse Resume</DialogTitle>
          <p className="text-sm text-muted-foreground">
            AI will automatically extract candidate information
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!uploadedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-primary text-2xl w-8 h-8" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Drop your resume here</h4>
              <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Supports PDF, DOC, DOCX files up to 10MB
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {uploadedFile && uploadProgress < 100 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploadedFile.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Parsing Status */}
          {uploadProgress === 100 && parseResumeMutation.isPending && (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-blue-700">Parsing resume with AI...</p>
            </div>
          )}

          {/* Parsed Data Success */}
          {parsedData && !parseResumeMutation.isPending && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Resume Parsed Successfully</h4>
              </div>
              <p className="text-sm text-green-700">
                Information has been extracted and pre-filled in the form below. 
                Please review and make any necessary corrections.
              </p>
            </div>
          )}

          {/* Candidate Form */}
          {(parsedData || uploadedFile) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">Candidate Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Years of Experience
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Current Position
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Display extracted skills */}
                {parsedData?.skills && parsedData.skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Extracted Skills
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCandidateMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createCandidateMutation.isPending ? "Saving..." : "Save Candidate"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
