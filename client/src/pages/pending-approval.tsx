import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, LogOut } from 'lucide-react';

interface PendingApprovalProps {
  onLogout: () => void;
  userEmail?: string;
}

export function PendingApproval({ onLogout, userEmail }: PendingApprovalProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-orange-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Membership Pending
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your account is awaiting admin approval
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">
                    Account Status: Pending Approval
                  </h4>
                  <p className="text-sm text-orange-700">
                    Your membership application is currently being reviewed by our admin team.
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

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Admin will review your membership application</li>
                  <li>• You'll receive access once approved</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Need help?</h4>
                <p className="text-sm text-gray-700">
                  Contact our admin team if you have questions about your membership status.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={onLogout}
                variant="outline" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}