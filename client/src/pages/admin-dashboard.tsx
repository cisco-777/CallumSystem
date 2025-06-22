import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, Activity, AlertTriangle, ExternalLink } from 'lucide-react';

export function AdminDashboard() {
  const [showFailsafe, setShowFailsafe] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const mockOrders = [
    { id: 1, user: "John D.", item: "Blue Dream", quantity: 1, status: "completed", time: "2 hours ago" },
    { id: 2, user: "Sarah M.", item: "Wedding Cake", quantity: 2, status: "pending", time: "1 hour ago" },
    { id: 3, user: "Mike R.", item: "Lemon Haze", quantity: 1, status: "completed", time: "30 mins ago" },
    { id: 4, user: "Emma L.", item: "Zkittlez", quantity: 3, status: "processing", time: "15 mins ago" }
  ];

  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", joined: "2 days ago", status: "active" },
    { id: 2, name: "Sarah Miller", email: "sarah@example.com", joined: "1 week ago", status: "active" },
    { id: 3, name: "Mike Rodriguez", email: "mike@example.com", joined: "3 days ago", status: "pending" },
    { id: 4, name: "Emma Lee", email: "emma@example.com", joined: "5 hours ago", status: "active" }
  ];

  const handleFailsafe = () => {
    setShowFailsafe(true);
    setTimeout(() => setShowFailsafe(false), 3000);
  };

  const scrollToBouncer = () => {
    const bouncerSection = document.getElementById('bouncer-section');
    if (bouncerSection) {
      bouncerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Marbella Social Club Management</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={scrollToBouncer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Bouncer
            </Button>
            <Button
              onClick={handleFailsafe}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              FAILSAFE!
            </Button>
          </div>
        </div>

        {showFailsafe && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-semibold">FAILSAFE ACTIVATED</span>
            </div>
            <p className="mt-1">Emergency protocols initiated. All systems monitoring enabled.</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOrders.length}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Products</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(products) ? products.length : 0}</div>
              <p className="text-xs text-muted-foreground">All in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€420</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.user}</p>
                      <p className="text-sm text-gray-600">{order.item} x{order.quantity}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <Badge 
                      variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Member Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Joined {user.joined}</p>
                    </div>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                    >
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embedded Bouncer Chat */}
        <Card id="bouncer-section" className="mb-8">
          <CardHeader>
            <CardTitle>Bouncer Communication Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <iframe
                src="https://bizichat.ai/webchat/?p=1899468&ref=1748302315388"
                width="100%"
                height="400"
                frameBorder="0"
                className="rounded-lg"
                title="Bouncer Interface"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Management */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.isArray(products) && products.map((product: any) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  <Badge className="mt-2">{product.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}