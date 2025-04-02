
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, FileText, Upload, X, CheckCircle } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGoals, Goal, CheckInType } from "@/hooks/useGoals";

// Define the schema based on check-in type
const createCheckInSchema = (checkInType: CheckInType) => {
  if (checkInType === "text") {
    return z.object({
      type: z.literal("text"),
      content: z.string().min(1, { message: "Content is required" }).max(500),
      photoContent: z.string().optional(),
    });
  }
  
  if (checkInType === "photo") {
    return z.object({
      type: z.literal("photo"),
      content: z.string().max(500).optional(),
      photoContent: z.string().min(1, { message: "A photo is required" }),
    });
  }
  
  // For "both" type
  return z.object({
    type: z.enum(["text", "photo", "both"]),
    content: z.string().min(1, { message: "Content is required" }).max(500),
    photoContent: z.string().min(1, { message: "A photo is required" }),
  });
};

type CheckInFormValues = {
  type: "text" | "photo" | "both";
  content: string;
  photoContent?: string;
};

const CheckInForm = ({activeGoal}) => {
  console.log(activeGoal, 'activeGoal')
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const navigate = useNavigate();
  const { addCheckIn } = useGoals();

  
  const checkInType = activeGoal?.checkInType || "text";
  
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(createCheckInSchema(checkInType as CheckInType)),
    defaultValues: {
      type: checkInType as "text" | "photo" | "both",
      content: "",
      photoContent: "",
    },
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("photoContent", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImagePreview = () => {
    setImagePreview(null);
    form.setValue("photoContent", "");
  };
  
  const onSubmit = async (data: CheckInFormValues) => {
    try {
      console.log("Submitting check-in data:", { ...data, imagePreview });
      const checkInData = {
        goalId: activeGoal.id, 
        ...data,
      };
  
      // Get current check-ins from localStorage before adding new one (for debugging)
      const existingCheckInsRaw = localStorage.getItem("check-ins");
      // Use the addCheckIn function to add the check-in
      const success = addCheckIn(checkInData?.goalId, data.content, data.photoContent);
      
      if (success) {
        // Verify the check-in was added to localStorage
        const updatedCheckInsRaw = localStorage.getItem("check-ins");
        
        // Check if localStorage was actually updated
        if (updatedCheckInsRaw !== existingCheckInsRaw) {
          console.log("localStorage was successfully updated with new check-in");
        } else {
          console.warn("localStorage may not have been updated properly");
        }
        
        toast.success("Check-in posted successfully!");
        
        // Add a small delay before navigating to ensure state is updated
        setTimeout(() => {
          navigate("/tribe");
        }, 500);
      } else {
        toast.error("Failed to post check-in. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to post check-in. Please try again.");
    }
  };
  
  if (!activeGoal) {
    return (
      <Card className="w-full glass shadow-lg animate-fade-in">
        <CardContent className="p-6">
          <div className="text-center">
            <p>Loading goal information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full glass shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Check In</CardTitle>
        <CardDescription>
          Share your progress on: <span className="font-medium">{activeGoal.title}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Text input - shown for text or both check-in types */}
            {(checkInType === "text" || checkInType === "both") && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Update</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your progress, challenges, or wins..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be honest about your progress - your tribe is here to support you!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Photo upload - shown for photo or both check-in types */}
            {(checkInType === "photo" || checkInType === "both") && (
              <div className="space-y-4">
                {checkInType === "photo" && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a caption to your photo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="photoContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Photo</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {!imagePreview ? (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-8 cursor-pointer hover:bg-muted/10 transition-colors">
                              <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleImageUpload(e);
                                }}
                              />
                              <Label htmlFor="photo-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center">
                                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Click to upload an image</span>
                                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF (max 5MB)</span>
                                </div>
                              </Label>
                            </div>
                          ) : (
                            <div className="relative">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-lg overflow-hidden"
                              >
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-full object-cover max-h-[300px]" 
                                />
                              </motion.div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={clearImagePreview}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <input 
                            type="hidden" 
                            {...field}
                            value={imagePreview || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Post Check-In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CheckInForm;
