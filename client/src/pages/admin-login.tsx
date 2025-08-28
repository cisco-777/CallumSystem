import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

export function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the admin login API
      const response = await apiRequest('/api/admin/login', 'POST', {
        email,
        password
      });

      if (response.success && response.admin) {
        // Store admin authentication information
        localStorage.setItem('msc-admin-authenticated', 'true');
        localStorage.setItem('msc-admin-data', JSON.stringify(response.admin));
        setLocation('/admin');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#116149] to-[#0d4d3a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#116149]">
            Admin Access
          </CardTitle>
          <CardDescription>
            Secure login for club administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin123@gmail.com"
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
                placeholder="Enter admin password"
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
              disabled={isLoading}
              className="w-full bg-[#116149] hover:bg-[#0d4d3a] text-white disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login to Admin'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Super Admin Credentials:</strong><br />
            Email: admin123@gmail.com<br />
            Password: admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}