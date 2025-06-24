import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";

export default function TopMatches() {
  // Mock data for AI-matched candidates
  const topMatches = [
    {
      id: 1,
      name: "David Park",
      title: "Senior Software Engineer",
      experience: "5+ years experience",
      matchScore: 94,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
    },
    {
      id: 2,
      name: "Lisa Thompson",
      title: "Marketing Manager",
      experience: "7+ years experience",
      matchScore: 91,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1c?w=100"
    },
    {
      id: 3,
      name: "Alex Kumar",
      title: "Data Scientist",
      experience: "4+ years experience",
      matchScore: 87,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
    }
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Top AI Matches
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMatches.map((candidate) => (
            <div key={candidate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback>
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.title}</p>
                  <p className="text-xs text-muted-foreground">{candidate.experience}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <Badge variant="secondary" className={getMatchScoreColor(candidate.matchScore)}>
                  {candidate.matchScore}% match
                </Badge>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
