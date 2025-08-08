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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Check for demo member login
    if (email === 'demo@member.com' && password === 'demo123') {
      localStorage.setItem('msc-member-authenticated', 'true');
      setLocation('/member-dashboard');
      return;
    }

    // Demo login for any valid email/password combination
    if (validateEmail(email) && password.length >= 3) {
      localStorage.setItem('msc-authenticated', 'true');
      setLocation('/home');
    } else {
      setError('Invalid email format or password too short');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Registration successful
    localStorage.setItem('msc-authenticated', 'true');
    setLocation('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#116149] to-[#0d4d3a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#116149]">
            Demo Social Club
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

            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

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
                setConfirmPassword('');
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
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Demo Member Access:</strong><br />
              Email: demo@member.com<br />
              Password: demo123
            </div>
          )}

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