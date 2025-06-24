import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  User,
  Calendar as CalendarIcon,
  FileText,
  Settings,
  Coffee,
  Laptop
} from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { OnboardingTask, InsertOnboardingTask } from "@shared/schema";

export default function Onboarding() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<Date>();
  const { toast } = useToast();

  // Fetch onboarding tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/onboarding/tasks', selectedEmployee],
    queryFn: async () => {
      const url = selectedEmployee ? 
        `/api/onboarding/tasks?employeeId=${selectedEmployee}` : 
        '/api/onboarding/tasks';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertOnboardingTask) => {
      const response = await fetch('/api/onboarding/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tasks'] });
      setShowCreateTask(false);
      toast({ title: "Success", description: "Onboarding task created successfully" });
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
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/onboarding/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, completedAt: status === 'completed' ? new Date() : null }),
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tasks'] });
      toast({ title: "Success", description: "Task status updated successfully" });
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
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    },
  });

  const filteredTasks = tasks.filter((task: OnboardingTask) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return <User className="w-4 h-4" />;
      case 'it': return <Laptop className="w-4 h-4" />;
      case 'admin': return <FileText className="w-4 h-4" />;
      case 'training': return <Coffee className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const completedTasks = tasks.filter((task: OnboardingTask) => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Onboarding</h1>
          <p className="text-muted-foreground">Manage employee onboarding tasks and workflows</p>
        </div>
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Onboarding Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createTaskMutation.mutate({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as any,
                priority: formData.get('priority') as any,
                employeeId: formData.get('employeeId') as string,
                assignedTo: formData.get('assignedTo') as string,
                dueDate: newTaskDate,
              });
            }} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" name="title" placeholder="Complete IT setup" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Task description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" name="employeeId" placeholder="Employee ID" required />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input id="assignedTo" name="assignedTo" placeholder="Assignee ID" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDate ? format(newTaskDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDate}
                      onSelect={setNewTaskDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Onboarding Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Tasks</span>
                <span className="font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Onboardings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5</div>
              <p className="text-sm text-muted-foreground">New hires this month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">94%</div>
              <p className="text-sm text-muted-foreground">Average completion rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all-tasks" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedEmployee || undefined} onValueChange={(value) => setSelectedEmployee(value === "all" ? "" : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                <SelectItem value="emp1">John Doe</SelectItem>
                <SelectItem value="emp2">Jane Smith</SelectItem>
                <SelectItem value="emp3">Mike Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">Create your first onboarding task to get started.</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task: OnboardingTask) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getCategoryIcon(task.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <Badge variant="secondary" className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">{task.category}</Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>Employee: {task.employeeId}</span>
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Priority: {task.priority}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskMutation.mutate({ 
                              id: task.id, 
                              status: task.status === 'pending' ? 'in_progress' : 'completed' 
                            })}
                            disabled={updateTaskMutation.isPending}
                          >
                            {task.status === 'pending' ? (
                              <>
                                <Clock className="w-4 h-4 mr-1" />
                                Start
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Complete
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tasks waiting to be started...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tasks currently being worked on...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Successfully completed tasks...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tasks that are past their due date...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
