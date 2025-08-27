import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock, Mail, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RegistrationCompleteProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
  userEmail?: string;
}

export function RegistrationComplete({ onLoginSuccess, onBackToLanding, userEmail }: RegistrationCompleteProps) {
  const [email, setEmail] = useState(userEmail || '');
  const [password, setPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      localStorage.setItem('msc-user', JSON.stringify(data.user));
      toast({
        title: "Login Successful",
        description: "Welcome back! Your membership is approved.",
      });
      onLoginSuccess();
    },
    onError: (error: any) => {
      // Check if this is a membership status error
      if (error?.response?.status === 403) {
        const errorData = error.response?.data;
        if (errorData?.status === 'pending') {
          toast({
            title: "Account Pending Approval",
            description: errorData.message || "Your membership is awaiting admin approval.",
            variant: "destructive",
          });
          return;
        }
        if (errorData?.status === 'expired') {
          toast({
            title: "Membership Expired",
            description: errorData.message || "Your membership has expired. Please contact admin for renewal.",
            variant: "destructive",
          });
          return;
        }
      }
      
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-green-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Registration Complete!
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your account has been created successfully
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">
                    Account Successfully Created
                  </h4>
                  <p className="text-sm text-green-700">
                    Your membership application has been submitted and is pending admin approval.
                  </p>
                </div>
              </div>
            </div>

            {userEmail && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Account: <span className="font-medium">{userEmail}</span>
                </p>
              </div>
            )}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">
                    Next Steps
                  </h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Admin will review your membership application</li>
                    <li>• You'll be able to login once approved</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showLoginForm ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowLoginForm(true)}
                  className="w-full bg-[#116149] hover:bg-[#0d4f3c]"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Try Login Now
                </Button>
                
                <Button 
                  onClick={onBackToLanding}
                  variant="outline" 
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Login to Your Account</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    If your membership has been approved, you can login below:
                  </p>
                  
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#116149] hover:bg-[#0d4f3c]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Checking...' : 'Login'}
                    </Button>
                  </form>
                </div>

                <Button 
                  onClick={() => setShowLoginForm(false)}
                  variant="outline" 
                  className="w-full"
                >
                  Cancel Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}