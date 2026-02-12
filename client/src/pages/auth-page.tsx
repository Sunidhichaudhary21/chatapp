import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { user, login, register, isLoginPending, isRegisterPending } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register({ username, password });
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary via-indigo-600 to-purple-700 text-white p-12 flex-col justify-between overflow-hidden">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-300 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold">Whisper</h1>
          </div>
          
          <h2 className="text-5xl font-display font-bold leading-tight mb-6">
            Connect with friends <br />
            <span className="text-white/80">in real-time.</span>
          </h2>
          <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
            Experience seamless communication with our modern, secure, and instant messaging platform designed for better conversations.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Zap className="w-8 h-8 mb-4 text-yellow-300" />
            <h3 className="font-semibold text-lg mb-1">Instant Speed</h3>
            <p className="text-sm text-indigo-100">Real-time message delivery with WebSocket technology.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <ShieldCheck className="w-8 h-8 mb-4 text-emerald-300" />
            <h3 className="font-semibold text-lg mb-1">Secure</h3>
            <p className="text-sm text-indigo-100">Private one-on-one conversations that stay between you.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="max-w-md w-full">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <MessageSquare className="w-7 h-7" />
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Register</TabsTrigger>
            </TabsList>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="login">
                <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          placeholder="johndoe" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full h-11 rounded-xl font-semibold" 
                        disabled={isLoginPending}
                        variant="gradient"
                      >
                        {isLoginPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="register">
                <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                  <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-display">Create an account</CardTitle>
                    <CardDescription>Get started with your free account today</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input 
                          id="reg-username" 
                          placeholder="Choose a username" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                          minLength={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          placeholder="Choose a strong password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 rounded-xl"
                          required
                          minLength={6}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full h-11 rounded-xl font-semibold" 
                        disabled={isRegisterPending}
                        variant="gradient"
                      >
                        {isRegisterPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </motion.div>
          </Tabs>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
