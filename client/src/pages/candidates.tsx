import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Upload, Filter, Eye, MessageSquare, Star } from "lucide-react";
import ResumeUploadModal from "@/components/candidates/resume-upload-modal";

export default function Candidates() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="text-muted-foreground">Manage candidate profiles and applications</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      <Tabs defaultValue="all-candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all-candidates">All Candidates</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>

        <TabsContent value="all-candidates" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Candidate Card 1 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">David Park</CardTitle>
                      <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    94% match
                  </Badge>
                  <Badge variant="outline">Shortlisted</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">5+ years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">San Francisco, CA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">2 days ago</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">React</Badge>
                    <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                    <Badge variant="secondary" className="text-xs">Node.js</Badge>
                    <Badge variant="secondary" className="text-xs">Python</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Card 2 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b332c1c" />
                      <AvatarFallback>LT</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Lisa Thompson</CardTitle>
                      <p className="text-sm text-muted-foreground">Marketing Manager</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.6</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    91% match
                  </Badge>
                  <Badge variant="outline">Interviewing</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">7+ years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">New York, NY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">1 week ago</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Digital Marketing</Badge>
                    <Badge variant="secondary" className="text-xs">Analytics</Badge>
                    <Badge variant="secondary" className="text-xs">SEO</Badge>
                    <Badge variant="secondary" className="text-xs">Growth</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Card 3 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                      <AvatarFallback>AK</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Alex Kumar</CardTitle>
                      <p className="text-sm text-muted-foreground">Data Scientist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.5</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    87% match
                  </Badge>
                  <Badge variant="outline">New</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">4+ years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">Seattle, WA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">3 hours ago</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Python</Badge>
                    <Badge variant="secondary" className="text-xs">Machine Learning</Badge>
                    <Badge variant="secondary" className="text-xs">SQL</Badge>
                    <Badge variant="secondary" className="text-xs">TensorFlow</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">New candidates view...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <CardTitle>Candidates in Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Screening candidates view...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviewing">
          <Card>
            <CardHeader>
              <CardTitle>Candidates in Interview Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interviewing candidates view...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortlisted">
          <Card>
            <CardHeader>
              <CardTitle>Shortlisted Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Shortlisted candidates view...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ResumeUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
