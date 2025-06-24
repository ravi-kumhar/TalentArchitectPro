import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, TrendingUp, Bot, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">TalentArchitect</h1>
              <p className="text-xs text-gray-500">AI-Powered HR Platform</p>
            </div>
          </div>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your HR Operations with{" "}
            <span className="text-primary">AI-Powered Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline recruitment, enhance hiring decisions, and accelerate onboarding 
            with our comprehensive AI-driven HR management platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Smart Recruitment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered job description generation, resume parsing, and candidate 
                matching to find the perfect fit faster.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-accent h-6 w-6" />
              </div>
              <CardTitle>Interview Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Streamlined scheduling, automated feedback collection, and AI-powered 
                interview summaries for better hiring decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-green-600 h-6 w-6" />
              </div>
              <CardTitle>Seamless Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Guided onboarding workflows, task automation, and personalized 
                experience for new hires from day one.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-purple-600 h-6 w-6" />
              </div>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive dashboards, real-time insights, and predictive 
                analytics to optimize your HR strategies.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="text-orange-600 h-6 w-6" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                24/7 intelligent chatbot for HR queries, policy questions, and 
                automated assistance for employees and managers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-red-600 h-6 w-6" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                GDPR compliant, role-based access control, and enterprise-grade 
                security to protect your sensitive HR data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-primary rounded-2xl p-12 text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-8">Trusted by Growing Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-primary-foreground/80">Faster Hiring Process</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-primary-foreground/80">Improved Candidate Quality</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">67%</div>
              <div className="text-primary-foreground/80">Reduced Time-to-Hire</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of companies already using TalentArchitect to build better teams.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
