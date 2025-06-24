import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Briefcase, 
  Users, 
  Upload, 
  Calendar,
  UserCheck,
  BarChart3,
  Settings
} from "lucide-react";

interface FeatureTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  route: string;
  icon: React.ReactNode;
  testFunction: () => Promise<boolean>;
}

export default function TestFeatures() {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'testing' | 'success' | 'error'>>({});

  const features: FeatureTest[] = [
    {
      name: "Job Posting",
      description: "Create, edit, and manage job postings",
      status: 'pending',
      route: '/jobs',
      icon: <Briefcase className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/jobs', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Candidates Management",
      description: "View and manage candidate profiles",
      status: 'pending',
      route: '/candidates',
      icon: <Users className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/candidates', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Resume Upload & Parse",
      description: "Upload and parse candidate resumes",
      status: 'pending',
      route: '/candidates',
      icon: <Upload className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const formData = new FormData();
          const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
          formData.append('resume', testFile);
          const response = await fetch('/api/candidates/parse-resume', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Interviews",
      description: "Schedule and manage interviews",
      status: 'pending',
      route: '/interviews',
      icon: <Calendar className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/interviews', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Onboarding",
      description: "Manage employee onboarding tasks",
      status: 'pending',
      route: '/onboarding',
      icon: <UserCheck className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/onboarding/tasks', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Employees",
      description: "Manage employee profiles and data",
      status: 'pending',
      route: '/employees',
      icon: <Users className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/employees', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Performance Management",
      description: "Track and manage employee performance",
      status: 'pending',
      route: '/performance',
      icon: <BarChart3 className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/performance/reviews', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: "Analytics & Reports",
      description: "Generate HR analytics and reports",
      status: 'pending',
      route: '/analytics',
      icon: <Settings className="w-5 h-5" />,
      testFunction: async () => {
        try {
          const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
          return response.ok;
        } catch {
          return false;
        }
      }
    }
  ];

  const testFeature = async (feature: FeatureTest) => {
    setTestResults(prev => ({ ...prev, [feature.name]: 'testing' }));
    
    try {
      const success = await feature.testFunction();
      setTestResults(prev => ({ ...prev, [feature.name]: success ? 'success' : 'error' }));
    } catch (error) {
      console.error(`Test failed for ${feature.name}:`, error);
      setTestResults(prev => ({ ...prev, [feature.name]: 'error' }));
    }
  };

  const testAllFeatures = async () => {
    for (const feature of features) {
      await testFeature(feature);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (featureName: string) => {
    const status = testResults[featureName] || 'pending';
    switch (status) {
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (featureName: string) => {
    const status = testResults[featureName] || 'pending';
    const variants = {
      pending: 'secondary',
      testing: 'outline',
      success: 'default',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const successCount = Object.values(testResults).filter(status => status === 'success').length;
  const errorCount = Object.values(testResults).filter(status => status === 'error').length;
  const totalTests = features.length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feature Testing</h1>
          <p className="text-muted-foreground">Test all HR application features and functionality</p>
        </div>
        <Button onClick={testAllFeatures} className="bg-primary hover:bg-primary/90">
          Test All Features
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-600">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalTests > 0 ? Math.round(((successCount + errorCount) / totalTests) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </div>
                {getStatusIcon(feature.name)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                {getStatusBadge(feature.name)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testFeature(feature)}
                  disabled={testResults[feature.name] === 'testing'}
                >
                  Test
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => window.location.href = feature.route}
              >
                View Feature
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}