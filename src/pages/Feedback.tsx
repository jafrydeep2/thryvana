
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageSquare, Loader2, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

const Feedback = () => {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const navigate = useNavigate();
  const { userDetails, user } = useAuth();
  
  // Pre-fill email if user is logged in
  useState(() => {
    setFormData({
      name: userDetails?.username || "",
      email: userDetails?.email || user?.email || "",
      message: ""
    });
  }, [userDetails, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending....");
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      formDataToSend.append("access_key", "9597bdc8-2bbc-4cee-87e2-f253fe06b2a1");
      
      // Add user ID if available
      if (user?.id) {
        formDataToSend.append("user_id", user.id);
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully");
        toast.success("Feedback submitted successfully!");
        setFormData({
          name: userDetails?.username || "",
          email: userDetails?.email || user?.email || "",
          message: ""
        });
      } else {
        console.log("Error", data);
        setResult(data.message);
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setResult("An error occurred while submitting the form");
      toast.error("Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Send Feedback
            </CardTitle>
            <CardDescription>
              We appreciate your thoughts and suggestions to help improve Thryvana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Your Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email (optional)"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium">
                  Your Feedback
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
              
              {result && !isSubmitting && (
                <p className={`text-sm text-center ${result.includes("Successfully") ? "text-primary" : "text-destructive"}`}>
                  {result}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Feedback;
