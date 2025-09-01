import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function OnboardingPage() {
  const [, setLocation] = useLocation();

  const handleBeginOnboarding = () => {
    window.open('https://bizichat.ai/webchat/?p=1899468&ref=1747235127465', '_blank');
  };

  const handleGoHome = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#116149] to-[#0d4d3a] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#116149] mb-2">
            Welcome to Social Club
          </CardTitle>
          <CardDescription className="text-lg">
            Please complete onboarding to access your member portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Button 
              onClick={handleBeginOnboarding}
              size="lg"
              className="bg-[#116149] hover:bg-[#0d4d3a] text-white px-8 py-4 text-lg font-semibold rounded-lg w-full"
            >
              Begin Onboarding
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Already completed onboarding?
            </p>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="text-[#116149] border-[#116149] hover:bg-[#116149] hover:text-white"
            >
              Go to Member Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}