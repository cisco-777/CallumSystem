import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Phone, Calendar, MapPin, Camera } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WelcomeMessage } from './welcome-message';

interface AuthFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}

type AuthStep = 'email' | 'password' | 'register' | 'welcome' | 'onboarding';

export function AuthFlow({ onBack, onSuccess }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [onboardingData, setOnboardingData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    profileImage: null as File | null,
    idImage: null as File | null,
    idBackImage: null as File | null, // Optional back of ID document
    medicalConditions: '',
    preferredProducts: '',
    referralSource: '',
    emergencyContact: '',
    tobaccoUse: '',
    alcoholUse: '',
    previousCannabisUse: '',
    doctorRecommendation: '',
    privacyConsent: false,
    termsAccepted: false
  });

  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      // If admin email, skip check and go directly to password
      if (email === 'admin123@gmail.com') {
        return { exists: true, isAdmin: true };
      }
      
      return await apiRequest('/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      if (data.exists) {
        setStep('password');
        setIsNewUser(false);
      } else {
        setStep('register');
        setIsNewUser(true);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check email. Please try again.",
        variant: "destructive",
      });
    }
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Check if this is admin login
      if (email === 'admin123@gmail.com' && password === 'admin123') {
        return await apiRequest('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      // Handle admin login
      if (data.admin) {
        localStorage.setItem('msc-admin', JSON.stringify(data.admin));
        window.location.href = '/?admin=true';
        return;
      }
      
      localStorage.setItem('msc-user', JSON.stringify(data.user));
      if (!data.user.isOnboarded) {
        setStep('welcome');
      } else {
        onSuccess();
      }
    },
    onError: (error: any) => {
      // Check if this is a membership status error
      if (error?.response?.status === 403) {
        const errorData = error.response?.data;
        if (errorData?.status === 'pending') {
          // Store user data for the pending approval page
          localStorage.setItem('msc-pending-user', JSON.stringify({ email }));
          toast({
            title: "Membership Pending",
            description: errorData.message || "Your membership is awaiting admin approval.",
            variant: "destructive",
          });
          // Redirect to pending approval state
          window.location.href = '/?status=pending';
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
        title: "Invalid Credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      // DO NOT store user in localStorage - force logout
      // Store email for registration complete page
      localStorage.setItem('msc-registration-email', email);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please complete onboarding.",
      });
      
      setStep('welcome');
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      console.log('Preparing form data for onboarding...');
      const formData = new FormData();
      Object.entries(onboardingData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
          console.log(`Added file: ${key}`);
        } else {
          formData.append(key, String(value));
          console.log(`Added field: ${key} = ${value}`);
        }
      });
      
      console.log('Sending onboarding request...');
      return await apiRequest('/api/auth/complete-onboarding', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data) => {
      console.log('Onboarding completed successfully:', data);
      // DO NOT store user in localStorage - force logout after registration
      // Clear any existing user data and redirect to registration complete
      localStorage.removeItem('msc-user');
      
      toast({
        title: "Registration Complete!",
        description: "Your account is pending admin approval. You must login manually once approved.",
      });
      
      // Redirect to registration complete page
      window.location.href = '/?status=registration-complete';
    },
    onError: (error) => {
      console.error('Onboarding error:', error);
      toast({
        title: "Onboarding Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEmailSubmit = () => {
    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    checkEmailMutation.mutate(email);
  };

  const handlePasswordSubmit = () => {
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    if (isNewUser) {
      registerMutation.mutate();
    } else {
      loginMutation.mutate();
    }
  };

  const handleOnboardingSubmit = () => {
    console.log('Current onboarding data:', onboardingData);
    
    if (!onboardingData.firstName || !onboardingData.lastName || !onboardingData.phoneNumber || 
        !onboardingData.dateOfBirth || !onboardingData.address || !onboardingData.privacyConsent || 
        !onboardingData.termsAccepted) {
      console.log('Validation failed - missing required fields');
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and accept the terms.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Validation passed, submitting onboarding...');
    completeOnboardingMutation.mutate();
  };

  const handleFileUpload = (field: 'profileImage' | 'idImage' | 'idBackImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOnboardingData(prev => ({ ...prev, [field]: file }));
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Handle welcome step separately due to different layout
  if (step === 'welcome') {
    return (
      <WelcomeMessage
        onContinue={() => setStep('onboarding')}
        onBack={() => setStep('email')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-light">Welcome</CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your email to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-[#116149] transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    />
                  </div>
                  <Button
                    onClick={handleEmailSubmit}
                    disabled={checkEmailMutation.isPending}
                    className="w-full h-12 bg-[#116149] hover:bg-[#0d4d3a] text-white rounded-lg transition-all duration-300"
                  >
                    {checkEmailMutation.isPending ? 'Checking...' : 'Continue'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {(step === 'password' || step === 'register') && (
            <motion.div
              key="password"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-light">
                    {isNewUser ? 'Welcome to the Club' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {isNewUser 
                      ? 'Create a password to join our exclusive community' 
                      : 'Enter your password to continue'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    {email}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder={isNewUser ? 'Create password' : 'Your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-[#116149] transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    />
                  </div>
                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={loginMutation.isPending || registerMutation.isPending}
                    className="w-full h-12 bg-[#116149] hover:bg-[#0d4d3a] text-white rounded-lg transition-all duration-300"
                  >
                    {(loginMutation.isPending || registerMutation.isPending) 
                      ? 'Processing...' 
                      : isNewUser ? 'Join Club' : 'Sign In'
                    }
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'onboarding' && (
            <motion.div
              key="onboarding"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-light">Complete Your Profile</CardTitle>
                  <CardDescription className="text-gray-600">
                    Help us personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="First Name *"
                        value={onboardingData.firstName}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-10 h-11 text-sm"
                      />
                    </div>
                    <Input
                      placeholder="Last Name *"
                      value={onboardingData.lastName}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-11 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Phone Number *"
                      value={onboardingData.phoneNumber}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="pl-10 h-11 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="Date of Birth"
                      value={onboardingData.dateOfBirth}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="pl-10 h-11 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Address"
                      value={onboardingData.address}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, address: e.target.value }))}
                      className="pl-10 h-11 text-sm"
                    />
                  </div>

                  {/* Image Uploads */}
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('profileImage')}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label htmlFor="profile-upload" className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        {onboardingData.profileImage ? onboardingData.profileImage.name : 'Upload Selfie'}
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('idImage')}
                        className="hidden"
                        id="id-upload"
                      />
                      <label htmlFor="id-upload" className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        {onboardingData.idImage ? onboardingData.idImage.name : 'Upload ID Document'}
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('idBackImage')}
                        className="hidden"
                        id="id-back-upload"
                      />
                      <label htmlFor="id-back-upload" className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        {onboardingData.idBackImage ? onboardingData.idBackImage.name : 'Upload ID Document (Back)'}
                      </label>
                    </div>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="privacy-consent"
                        checked={onboardingData.privacyConsent}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                        className="mt-1"
                      />
                      <label htmlFor="privacy-consent" className="text-sm text-gray-600 cursor-pointer">
                        I consent to the processing of my personal data
                      </label>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms-accepted"
                        checked={onboardingData.termsAccepted}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                        className="mt-1"
                      />
                      <label htmlFor="terms-accepted" className="text-sm text-gray-600 cursor-pointer">
                        I accept the terms and conditions
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleOnboardingSubmit}
                    disabled={completeOnboardingMutation.isPending}
                    className="w-full h-12 bg-[#116149] hover:bg-[#0d4d3a] text-white rounded-lg transition-all duration-300"
                  >
                    {completeOnboardingMutation.isPending ? 'Completing...' : 'Complete Profile'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}