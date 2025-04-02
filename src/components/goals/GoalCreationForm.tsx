
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle, FileText, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useGoals, GoalFormValues } from "@/hooks/useGoals";
import { useStepForm, Step } from "@/hooks/useStepForm";

const goalSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  motivator: z.string().min(3, { message: "Motivator must be at least 3 characters" }).max(200),
  timeframe: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Please select a timeframe",
  }),
  celebration: z.string().min(3, { message: "Celebration must be at least 3 characters" }).max(200),
  checkInType: z.enum(["text"], { // Modified to only allow text
    required_error: "Please select a check-in type",
  }),
  duration: z.string().min(1, { message: "Please enter a duration" }),
});

const GoalCreationForm = () => {
  const navigate = useNavigate();
  const { createGoal } = useGoals();
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      motivator: "",
      timeframe: "weekly",
      celebration: "",
      checkInType: "text", // Default to text only
      duration: "30",
    },
    mode: "onChange",
  });

  // Define form steps
  const steps: Step[] = [
    {
      id: "goal-details",
      name: "Goal Details",
      fields: ["title", "description"],
    },
    {
      id: "motivation",
      name: "Motivation",
      fields: ["motivator"],
    },
    {
      id: "tracking",
      name: "Tracking",
      fields: ["timeframe", "checkInType", "duration"],
    },
    {
      id: "celebration",
      name: "Celebration",
      fields: ["celebration"],
    },
  ];
  
  // Use our custom step form hook
  const { 
    activeStep, 
    isLastStep, 
    progressPercentage, 
    handleNext, 
    handleBack,
    loading 
  } = useStepForm<GoalFormValues>({
    steps,
    onComplete: async (data) => {
      await createGoal(data);
      toast.success("Goal created successfully!");
      navigate("/dashboard");
    },
    validateStep: async (stepFields) => {
      return await form.trigger(stepFields as any);
    },
    getFormValues: () => form.getValues(),
  });
  
  return (
    <Card className="w-full glass shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Your Goal</CardTitle>
        <CardDescription>
          Set a clear, achievable goal for your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Progress indicators - Updated to use a lighter purple instead of red */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: index <= steps.indexOf(activeStep) ? 1 : 0.8,
                  backgroundColor: index <= steps.indexOf(activeStep) ? "hsl(var(--primary))" : "hsl(var(--muted))" 
                }}
                className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full text-primary-foreground"
              >
                {index < steps.indexOf(activeStep) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className="text-xs mt-1 text-muted-foreground">{step.name}</span>
            </div>
          ))}
        </div>
        
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              key={activeStep.id}
            >
              {activeStep.id === "goal-details" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What do you want to achieve?" {...field} />
                        </FormControl>
                        <FormDescription>
                          Keep it specific and actionable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your goal in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What does success look like for this goal?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {activeStep.id === "motivation" && (
                <FormField
                  control={form.control}
                  name="motivator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Motivator</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What motivates you to achieve this goal?"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Why is this goal important to you? What will keep you going when things get tough?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {activeStep.id === "tracking" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Frequency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select how often you want to check in" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often will you check in with your tribe on your progress?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Duration (days)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="How many days to complete your goal?" 
                              {...field} 
                            />
                            <span className="text-muted-foreground">days</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Set a timeframe to achieve your goal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkInType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-3"
                          >
                            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                              <RadioGroupItem value="text" id="text" />
                              <Label htmlFor="text" className="flex items-center cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" />
                                Text Updates
                              </Label>
                            </div>
                            <div className="p-3 rounded-md border border-dashed bg-muted/30">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                <p className="text-sm">Photo check-ins will be available soon!</p>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          How would you like to check in with your tribe?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {activeStep.id === "celebration" && (
                <FormField
                  control={form.control}
                  name="celebration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celebration Plan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How will you celebrate when you achieve this goal?"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Planning your celebration can be motivating and rewarding
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </motion.div>
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={steps.indexOf(activeStep) === 0}
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={handleNext}
                disabled={loading}
              >
                {isLastStep ? (loading ? "Creating..." : "Create Goal") : "Next Step"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GoalCreationForm;
