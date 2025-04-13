import { useState, useEffect } from "react";
import { Calendar, User, ThumbsUp, Heart, Star, Flame, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FrequencyType = "daily" | "weekly" | "monthly";

interface Tribe {
  tribe_id: string;
  name: string;
  frequency: FrequencyType;
}

interface CheckIn {
  id: string;
  userId: string;
  username: string;
  tribeId: string;
  tribeName: string;
  content: string;
  date: string;
  reactions: {
    type: string;
    count: number;
  }[];
}

const TribeActivity = () => {
  const [selectedTribe, setSelectedTribe] = useState<string>("all");
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tribes
        const { data: tribesData, error: tribesError } = await supabase
          .from('tribes')
          .select('tribe_id, frequency');

        if (tribesError) {
          toast.error(`Error fetching tribes: ${tribesError.message}`);
          throw tribesError;
        }

        // Format tribes with better names
        const formattedTribes = tribesData ? tribesData.map(tribe => ({
          tribe_id: tribe.tribe_id,
          name: `Tribe ${tribe.tribe_id.substring(0, 4)}`,
          frequency: tribe.frequency as FrequencyType
        })) : [];

        setTribes(formattedTribes);

        // Fetch check-ins with user data
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('check_ins')
          .select(`
            check_in_id,
            check_in_time,
            content,
            user_id,
            tribe_id,
            users!inner(username)
          `)
          .order('check_in_time', { ascending: false })
          .limit(10);

        if (checkInsError) {
          toast.error(`Error fetching check-ins: ${checkInsError.message}`);
          throw checkInsError;
        }

        // Fetch reactions (if you have a reactions table)
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('reactions')
          .select('reaction_id, reaction_type, check_in_id');

        // Group reactions by check-in
        const reactionsMap: Record<string, { type: string; count: number }[]> = {};
        
        if (!reactionsError && reactionsData) {
          reactionsData.forEach(reaction => {
            if (!reactionsMap[reaction.check_in_id]) {
              reactionsMap[reaction.check_in_id] = [];
            }
            
            // Check if this reaction type already exists for this check-in
            const existingReaction = reactionsMap[reaction.check_in_id].find(
              r => r.type === reaction.reaction_type
            );
            
            if (existingReaction) {
              existingReaction.count += 1;
            } else {
              reactionsMap[reaction.check_in_id].push({
                type: reaction.reaction_type,
                count: 1
              });
            }
          });
        }

        // Format check-ins with user and reaction data
        const formattedCheckIns: CheckIn[] = checkInsData ? checkInsData.map(checkIn => {
          // Find the tribe name
          const tribe = formattedTribes.find(t => t.tribe_id === checkIn.tribe_id);
          
          return {
            id: checkIn.check_in_id,
            userId: checkIn.user_id,
            username: checkIn.users?.username || "Unknown User",
            tribeId: checkIn.tribe_id,
            tribeName: tribe ? tribe.name : `Tribe ${checkIn.tribe_id.substring(0, 4)}`,
            content: checkIn.content || "No content provided",
            date: checkIn.check_in_time,
            reactions: reactionsMap[checkIn.check_in_id] || [
              // Default reactions if none exist
              { type: "star", count: Math.floor(Math.random() * 3) },
              { type: "heart", count: Math.floor(Math.random() * 3) }
            ]
          };
        }) : [];

        setCheckIns(formattedCheckIns);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "star": return <Star className="h-4 w-4 text-amber-500" />;
      case "heart": return <Heart className="h-4 w-4 text-rose-500" />;
      case "clap": return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "fire": return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };
  
  const filteredCheckIns = selectedTribe === "all" 
    ? checkIns 
    : checkIns.filter(checkIn => checkIn.tribeId === selectedTribe);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activity data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tribe Activity</h2>
        <Select value={selectedTribe} onValueChange={setSelectedTribe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select tribe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tribes</SelectItem>
            {tribes.map(tribe => (
              <SelectItem key={tribe.tribe_id} value={tribe.tribe_id}>{tribe.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 w-full overflow-x-auto">
        {filteredCheckIns.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No check-ins found for this tribe.</p>
            </CardContent>
          </Card>
        ) : (
          filteredCheckIns.map(checkIn => (
            <Card key={checkIn.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{checkIn.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm font-medium">{checkIn.username}</CardTitle>
                      <CardDescription className="text-xs">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(checkIn.date).toLocaleString()}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{checkIn.tribeName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{checkIn.content}</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  {checkIn.reactions.filter(r => r.count > 0).map((reaction, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center space-x-1">
                      {getReactionIcon(reaction.type)}
                      <span>{reaction.count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TribeActivity;
