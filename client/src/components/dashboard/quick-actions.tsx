import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CalendarPlus, Upload, BarChart3 } from "lucide-react";
import JobCreationModal from "@/components/jobs/job-creation-modal";
import ResumeUploadModal from "@/components/candidates/resume-upload-modal";

export default function QuickActions() {
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);

  const actions = [
    {
      title: "Create Job Posting",
      description: "Use AI to generate job descriptions",
      icon: Plus,
      color: "bg-primary-100 text-primary-600",
      onClick: () => setShowCreateJob(true)
    },
    {
      title: "Schedule Interview",
      description: "Book candidate interviews",
      icon: CalendarPlus,
      color: "bg-cyan-100 text-cyan-600",
      onClick: () => console.log("Schedule interview")
    },
    {
      title: "Upload Resume",
      description: "Parse and analyze candidate profiles",
      icon: Upload,
      color: "bg-orange-100 text-orange-600",
      onClick: () => setShowUploadResume(true)
    },
    {
      title: "Generate Report",
      description: "Create analytics and insights",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
      onClick: () => console.log("Generate report")
    }
  ];

  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Card key={index} className="action-card" onClick={action.onClick}>
              <CardContent className="p-6">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <JobCreationModal 
        isOpen={showCreateJob} 
        onClose={() => setShowCreateJob(false)} 
      />
      
      <ResumeUploadModal 
        isOpen={showUploadResume} 
        onClose={() => setShowUploadResume(false)} 
      />
    </>
  );
}
