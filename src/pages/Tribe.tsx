
import { useEffect, useState } from "react";
import TribeView from "@/components/tribe/TribeView";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";

const Tribe = () => {
  const { getTribeCheckIns, checkIns } = useGoals();
  const [isLoading, setIsLoading] = useState(true);
  
  // Force refresh check-ins when the page loads
  useEffect(() => {
    try {
      console.log("Tribe page loaded, getting check-ins");
      const fetchedCheckIns = getTribeCheckIns();
      console.log("Fetched check-ins:", fetchedCheckIns);
      
      // Log the current state of check-ins for debugging
      console.log("Current check-ins state:", checkIns);
      
      // Check if localStorage has check-ins
      const storedCheckIns = localStorage.getItem("check-ins");
      console.log("Raw localStorage check-ins:", storedCheckIns);
      
      // Set loading to false when done
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      toast.error("Failed to load check-ins. Please refresh the page.");
      setIsLoading(false);
    }finally{
      setIsLoading(false);
    }
  }, []);
  
  return <TribeView isLoading={isLoading} />;
};

export default Tribe;
