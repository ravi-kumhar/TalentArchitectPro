import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Users,
  Briefcase,
  Award
} from "lucide-react";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Mock employee data - in production this would come from the API
  const employees = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      department: "Engineering",
      role: "hr_manager",
      isActive: true,
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      position: "Senior Software Engineer",
      joinDate: "2023-01-15",
      location: "San Francisco, CA"
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 234-5678",
      department: "Product",
      role: "manager",
      isActive: true,
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b332c1c?w=100",
      position: "Product Manager",
      joinDate: "2022-08-20",
      location: "New York, NY"
    },
    {
      id: "3",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@company.com",
      phone: "+1 (555) 345-6789",
      department: "Design",
      role: "employee",
      isActive: true,
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      position: "UX Designer",
      joinDate: "2023-03-10",
      location: "Austin, TX"
    },
    {
      id: "4",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@company.com",
      phone: "+1 (555) 456-7890",
      department: "Marketing",
      role: "employee",
      isActive: true,
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      position: "Marketing Specialist",
      joinDate: "2023-05-01",
      location: "Los Angeles, CA"
    },
    {
      id: "5",
      firstName: "David",
      lastName: "Park",
      email: "david.park@company.com",
      phone: "+1 (555) 567-8901",
      department: "Engineering",
      role: "employee",
      isActive: false,
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      position: "Data Scientist",
      joinDate: "2022-11-15",
      location: "Seattle, WA"
    }
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesRole = !roleFilter || employee.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'hr_manager': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">HR Manager</Badge>;
      case 'recruiter': return <Badge variant="secondary" className="bg-green-100 text-green-800">Recruiter</Badge>;
      case 'manager': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Manager</Badge>;
      default: return <Badge variant="outline">Employee</Badge>;
    }
  };

  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const departments = [...new Set(employees.map(emp => emp.department))];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-muted-foreground">Manage employee profiles and information</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
            <p className="text-sm text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-sm text-muted-foreground">Currently employed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{departments.length}</div>
            <p className="text-sm text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              New Hires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">3</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-employees">All Employees</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="all-employees" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profileImageUrl} />
                        <AvatarFallback>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {employee.firstName} {employee.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getRoleBadge(employee.role)}
                      <Badge variant={employee.isActive ? "secondary" : "outline"} 
                             className={employee.isActive ? "bg-green-100 text-green-800" : ""}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Currently active employees...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Former employees...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Organization directory view...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
