import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, UserCircle, Target, Users, CheckCircle, ShieldCheck, LockKeyhole, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import thryvanaLogo from '../assets/images/thyvana-logo-3.png'

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Set Meaningful Goals",
      description: "Create clear, achievable goals with built-in accountability systems.",
    },
    {
      icon: Users,
      title: "Join a Tribe",
      description: "Connect with like-minded individuals who support your journey.",
    },
    {
      icon: CheckCircle,
      title: "Regular Check-ins",
      description: "Track your progress with scheduled check-ins that keep you motivated.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy First",
      description: "Your information is secure with our anonymous tribe system.",
    },
  ];

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="w-full py-4 px-4 flex justify-between items-center glass z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={thryvanaLogo} alt="thryvanaLogo" className="w-[150px]" />
        </Link>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
          <Button
            onClick={() => navigate("/auth")}
          >
            Sign Up
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 z-0"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                >
                  Find Your Tribe,<br />
                  <span className="text-primary">Achieve Your Goals</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-muted-foreground"
                >
                  Thryvana connects you with a supportive community that helps you stay accountable and motivated on your personal growth journey.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="group"
                  >
                    Achieve Your Goals Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const featuresSection = document.getElementById("features");
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    The 3 Steps to a Better You
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="aspect-square max-w-md mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                  <div className="absolute inset-4 glass rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UserCircle className="h-32 w-32 text-primary/70" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-4"
              >
                How Thryvana Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Our platform is designed to help you build lasting habits through community support and accountability.
              </motion.p>
            </div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full glass card-hover">
                    <CardHeader>
                      <feature.icon className="h-12 w-12 text-primary" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold">Ready to Join Your Tribe?</h2>
              <p className="text-lg text-muted-foreground">
                Start your journey today and connect with people who share your goals and values.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="group"
              >
                Join Thryvana
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            {/* <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
              <span className="font-bold text-xs">T</span>
            </div>
            <span className="font-medium">Thryvana</span> */}
            <Link to="/" className="flex items-center gap-2">
              <img src={thryvanaLogo} alt="thryvanaLogo" className="w-[150px]" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => navigate("/feedback")}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Send Feedback
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => navigate("/admin")}
            >
              <LockKeyhole className="h-3.5 w-3.5" />
              Admin Login
            </Button>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Thryvana by Sunnydaesgroup. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
