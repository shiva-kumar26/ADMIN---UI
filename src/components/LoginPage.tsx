import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ADDED
  const [showForcePopup, setShowForcePopup] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<any>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  // ADDED – FORCE LOGOUT HANDLER
  const handleForceLogout = async () => {
    try {
      const response = await fetch("https://10.16.7.96/login/force-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: pendingLogin.username   // ✅ MUST be agent_name
        })
      });

      const result = await response.json();

      if (result.status === "success") {
        toast({
          title: "Session Cleared",
          description: "Previous session has been logged out.",
          variant: "success",
        });

        setShowForcePopup(false);

        // ✅ Retry login after force logout
        await handleFinalLogin(
          pendingLogin.username,
          pendingLogin.password
        );
      } else {
        toast({
          title: "Force Logout Failed",
          description: result.detail || "Unable to clear previous session",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Force logout API request failed",
        variant: "destructive",
      });
    }
  };


  // ADDED – FINAL LOGIN AFTER FORCE LOGOUT
  const handleFinalLogin = async (u: string, p: string) => {
    const requestBody = { username: u, password: p };

    try {
      const response = await fetch('https://10.16.7.96/login/authenticate_Login_and_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.status === 200 && data.authenticated) {
        sessionStorage.setItem("loginDetails", JSON.stringify(data));
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("session_id", data.session_id);
        sessionStorage.clear();

        await login(data);

        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "success",
        });

        const role = data.role;
        switch (role) {
          case 'Admin':
            navigate('/dashboard');
            break;
          case 'Supervisor':
            navigate('/supervisor-dashboard');
            break;
          case 'Agent':
            navigate('/home');
            break;
          default:
            navigate('/home');
        }
      }
    } catch (err) { }
  };

  // UPDATED ONLY THIS BLOCK (MINIMALLY) – ADDED FORCE LOGOUT LOGIC
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    const requestBody = {
      username: username,
      password: password
    };

    try {
      const response = await fetch('https://10.16.7.96/login/authenticate_Login_and_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // ADDED — IF SUPERVISOR ALREADY LOGGED IN
      if (data.force_logout_required === true) {
        setPendingLogin({ username, password });
        setShowForcePopup(true);
        setIsLoading(false);
        return;
      }

      // ORIGINAL CODE UNTOUCHED BELOW THIS LINE
      if (response.status === 200 && data.authenticated) {
        sessionStorage.setItem("loginDetails", JSON.stringify(data));
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("session_id", data.session_id);


        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "success",
        });

        await login(data);

        const role = data.role;
        switch (role) {
          case 'Admin':
            navigate('/dashboard');
            break;
          case 'Supervisor':
            navigate('/supervisor-dashboard');
            break;
          case 'Agent':
            navigate('/home');
            break;
          default:
            navigate('/home');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ADDED POPUP */}
      {showForcePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-lg font-bold mb-2">Force Logout Required</h2>
            <p className="mb-6">This supervisor is already logged in somewhere else. Logout that session?</p>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowForcePopup(false)}>Cancel</Button>
              <Button className="bg-red-600 text-white" onClick={handleForceLogout}>Force Logout</Button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md mx-4 relative z-10 backdrop-blur-sm bg-white/95 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Call Center Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-blue-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021 9c0 5.523-4.477 10-10 10-1.657 0-3.22-.403-4.575-1.125M9.88 9.88a3 3 0 104.24 4.24" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021 9c0 5.523-4.477 10-10 10-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" />
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
