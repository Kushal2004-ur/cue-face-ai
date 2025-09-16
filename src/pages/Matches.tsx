import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Eye, Search, Users, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  case_id: string;
  suspect_id: string;
  score: number;
  threshold: number;
  created_at: string;
  evidence: any;
  cases: {
    title: string;
    status: string;
  };
  suspects: {
    name: string;
    photo_url: string;
  };
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          cases!inner(title, status),
          suspects!inner(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500";
    if (score >= 0.8) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return "Very High";
    if (score >= 0.8) return "High";
    if (score >= 0.7) return "Medium";
    return "Low";
  };

  const highConfidenceMatches = matches.filter(match => match.score >= 0.8);
  const mediumConfidenceMatches = matches.filter(match => match.score >= 0.7 && match.score < 0.8);
  const lowConfidenceMatches = matches.filter(match => match.score < 0.7);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Suspect Matches</h1>
        <p className="text-muted-foreground">
          AI-powered facial similarity matches between sketches and suspects
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highConfidenceMatches.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Confidence</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumConfidenceMatches.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Confidence</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowConfidenceMatches.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Matches by Confidence Level */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="high">High Confidence</TabsTrigger>
          <TabsTrigger value="medium">Medium Confidence</TabsTrigger>
          <TabsTrigger value="low">Low Confidence</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <MatchesList matches={matches} />
        </TabsContent>
        
        <TabsContent value="high" className="space-y-4">
          <MatchesList matches={highConfidenceMatches} />
        </TabsContent>
        
        <TabsContent value="medium" className="space-y-4">
          <MatchesList matches={mediumConfidenceMatches} />
        </TabsContent>
        
        <TabsContent value="low" className="space-y-4">
          <MatchesList matches={lowConfidenceMatches} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MatchesList = ({ matches }: { matches: Match[] }) => {
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No matches found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={match.suspects.photo_url} alt={match.suspects.name} />
                  <AvatarFallback>
                    {match.suspects.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{match.suspects.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Case: {match.cases.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={match.cases.status === 'open' ? 'default' : 'secondary'}>
                      {match.cases.status}
                    </Badge>
                    <Badge 
                      className={`text-white ${
                        match.score >= 0.9 ? 'bg-green-500' : 
                        match.score >= 0.8 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                    >
                      {getConfidenceLevel(match.score)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-2xl font-bold">
                  {(match.score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Similarity Score
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(match.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Match Type: AI Facial Similarity</span>
                  {match.evidence?.model && (
                    <span>Model: {match.evidence.model}</span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Case File
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getConfidenceLevel = (score: number) => {
  if (score >= 0.9) return "Very High";
  if (score >= 0.8) return "High";
  if (score >= 0.7) return "Medium";
  return "Low";
};

export default Matches;