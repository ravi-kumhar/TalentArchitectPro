import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  
  const getPageTitle = (path: string): { title: string; subtitle?: string } => {
    switch (path) {
      case "/":
        return { title: "Dashboard", subtitle: "Welcome back! Here's what's happening." };
      case "/recruitment":
        return { title: "Recruitment", subtitle: "Manage job postings and track applications" };
      case "/candidates":
        return { title: "Candidates", subtitle: "Manage candidate profiles and applications" };
      case "/interviews":
        return { title: "Interviews", subtitle: "Schedule and manage candidate interviews" };
      case "/onboarding":
        return { title: "Onboarding", subtitle: "Manage employee onboarding tasks and workflows" };
      case "/employees":
        return { title: "Employees", subtitle: "Manage employee profiles and information" };
      case "/performance":
        return { title: "Performance Management", subtitle: "Track and manage employee performance reviews and goals" };
      case "/analytics":
        return { title: "Analytics & Reports", subtitle: "Comprehensive HR analytics and insights" };
      default:
        return { title: "TalentArchitect" };
    }
  };

  const { title, subtitle } = getPageTitle(location);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className="w-64 hidden md:flex" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
