import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipelineAPI } from "@/lib/api";

export default function PipelineExport() {
  const [exportFormat, setExportFormat] = useState("csv");
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: (format: string) => pipelineAPI.export(format),
    onSuccess: (data, format) => {
      if (format === 'csv') {
        const url = window.URL.createObjectURL(data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.log('JSON data:', data);
      }
      toast({ title: "Success", description: "Pipeline data exported successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to export pipeline data", 
        variant: "destructive" 
      });
    },
  });

  const handleExport = () => {
    exportMutation.mutate(exportFormat);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Pipeline Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JSON File
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="mt-6"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Export includes candidate names, contact information, positions, status, experience, location, and application dates.
        </div>
      </CardContent>
    </Card>
  );
}