import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function FakeAdminDemo() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Red warning bar */}
      <div className="bg-red-600 text-white p-3 text-center font-medium">
        ⚠️ Session timed out. Please contact admin.
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">System Management Panel</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-400 text-sm">No data to display</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-400 text-sm">Manual entry only</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-400 text-sm">Coming soon...</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-500 text-sm">System offline</div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-sm mb-2">No data to display</div>
                    <div className="text-xs">Database connection required</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Coming soon...</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                  Export Data (Disabled)
                </Button>
                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                  Send Notifications (Offline)
                </Button>
                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                  Generate Reports (Manual Only)
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="text-red-500">Disconnected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API:</span>
                    <span className="text-red-500">Error 500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security:</span>
                    <span className="text-yellow-500">Warning</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backup:</span>
                    <span className="text-gray-400">Not configured</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Manual entry only</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-700">Data Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-sm mb-1">No data to display</div>
                  <div className="text-xs">Please contact system administrator</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}