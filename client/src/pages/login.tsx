import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock login validation
    if (email === 'demo@msc.com' && password === 'demo123') {
      localStorage.setItem('msc-authenticated', 'true');
      setLocation('/home');
    } else {
      setError('Invalid credentials. Use demo@msc.com / demo123');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // For demo purposes, any registration is successful
    localStorage.setItem('msc-authenticated', 'true');
    localStorage.setItem('msc-first-time', 'true');
    
    // Redirect to onboarding chatbot
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1747235127465', '_blank');
    
    // Then redirect to home
    setTimeout(() => {
      setLocation('/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#116149] to-[#0d4d3a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#116149]">
            Marbella Social Club
          </CardTitle>
          <CardDescription>
            {isLoginMode ? 'Access your private member portal' : 'Join our exclusive community'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white"
            >
              {isLoginMode ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="text-[#116149] hover:underline text-sm"
            >
              {isLoginMode 
                ? "Don't have an account? Register here" 
                : "Already have an account? Login here"
              }
            </button>
          </div>

          {isLoginMode && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <strong>Demo Access:</strong><br />
              Email: demo@msc.com<br />
              Password: demo123
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}