import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";

export default function Interviews() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interviews</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Today's Interviews */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Interview Item 1 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b332c1c" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">Senior Frontend Developer</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>2:00 PM - 3:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Conference Room A</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                  On-site
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Join</Button>
                  <Button size="sm">View Profile</Button>
                </div>
              </div>
            </div>

            {/* Interview Item 2 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">Michael Chen</h3>
                <p className="text-sm text-muted-foreground">Product Manager</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>3:30 PM - 4:30 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>Video Call</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                  Remote
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Join Call</Button>
                  <Button size="sm">View Profile</Button>
                </div>
              </div>
            </div>

            {/* Interview Item 3 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">Emily Rodriguez</h3>
                <p className="text-sm text-muted-foreground">UX Designer</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>5:00 PM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Conference Room B</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                  On-site
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Join</Button>
                  <Button size="sm">View Profile</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Technical Interview</p>
                  <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Final Round</p>
                  <p className="text-sm text-muted-foreground">Friday, 2:00 PM</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed Today</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled This Week</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
