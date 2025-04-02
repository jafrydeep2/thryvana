
import { Alert, AlertDescription } from "@/components/ui/alert";
import GoalCreationForm from "@/components/goals/GoalCreationForm";
import { Info } from "lucide-react";

const GoalCreation = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create a New Goal</h1>
      <Alert className="mb-6">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription>
          Photo check-ins will be available soon! For now, you can track your progress with text check-ins.
        </AlertDescription>
      </Alert>
      <GoalCreationForm />
    </div>
  );
};

export default GoalCreation;
