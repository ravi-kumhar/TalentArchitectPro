import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

export default function RecruitmentFunnel() {
  // Mock funnel data - in production this would come from the API
  const funnelData = {
    applications: 156,
    screening: 89,
    interviews: 34,
    offers: 12
  };

  const stages = [
    { name: "Applications", value: funnelData.applications, percentage: 100 },
    { name: "Screening", value: funnelData.screening, percentage: (funnelData.screening / funnelData.applications) * 100 },
    { name: "Interviews", value: funnelData.interviews, percentage: (funnelData.interviews / funnelData.applications) * 100 },
    { name: "Offers", value: funnelData.offers, percentage: (funnelData.offers / funnelData.applications) * 100 }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recruitment Funnel</CardTitle>
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <TrendingUp className="text-4xl text-primary w-12 h-12" />
              </div>
              <p className="text-muted-foreground text-sm">Interactive recruitment funnel visualization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Funnel conversion: {((funnelData.offers / funnelData.applications) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="text-center">
              <div className="mb-2">
                <Progress value={stage.percentage} className="h-2" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stage.value}</div>
              <div className="text-sm text-muted-foreground">{stage.name}</div>
              <div className="text-xs text-primary font-medium">
                {stage.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
