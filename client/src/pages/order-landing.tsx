import { useState } from 'react';
import { Button } from '@/components/ui/button';
import beachImage from '@assets/pexels-jarcou-1884417.jpg';
import marinaImage from '@assets/pexels-arvid-knutsen-1892648-3511307.jpg';
import { Leaf, ShoppingBag, Star, Shield, Clock, Truck } from 'lucide-react';

export function OrderLandingPage() {
  const [showWebChat, setShowWebChat] = useState(false);

  const handleMakeOrder = () => {
    setShowWebChat(true);
  };

  const closeWebChat = () => {
    setShowWebChat(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-mesh">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-40 glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Leaf className="w-8 h-8 text-leaf-green mr-3" />
                <span className="font-inter font-semibold text-xl text-foreground">Leafly</span>
              </div>
              <Button 
                onClick={handleMakeOrder}
                className="leaf-gradient text-white px-6 py-2 rounded-full font-medium hover:shadow-medium transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Make an Order
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-inter font-bold text-6xl md:text-7xl text-foreground mb-6 leading-tight">
                Premium Cannabis
                <br />
                <span className="text-leaf-green">Delivered</span>
              </h1>
              <p className="text-xl md:text-2xl text-clean-gray mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience the finest selection of cannabis products with fast, secure delivery. 
                Quality you can trust, service you'll love.
              </p>
              <Button 
                onClick={handleMakeOrder}
                size="lg"
                className="leaf-gradient text-white px-12 py-6 rounded-full text-xl font-semibold hover:shadow-medium transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                Make an Order
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-card p-6 rounded-3xl text-center">
                <div className="bg-soft-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-leaf-green" />
                </div>
                <h3 className="font-inter font-semibold text-lg mb-2">Premium Quality</h3>
                <p className="text-clean-gray text-sm">Curated selection of top-tier products</p>
              </div>
              
              <div className="glass-card p-6 rounded-3xl text-center">
                <div className="bg-soft-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-leaf-green" />
                </div>
                <h3 className="font-inter font-semibold text-lg mb-2">Secure & Safe</h3>
                <p className="text-clean-gray text-sm">Discreet packaging and secure transactions</p>
              </div>
              
              <div className="glass-card p-6 rounded-3xl text-center">
                <div className="bg-soft-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-leaf-green" />
                </div>
                <h3 className="font-inter font-semibold text-lg mb-2">Fast Service</h3>
                <p className="text-clean-gray text-sm">Quick processing and delivery times</p>
              </div>
              
              <div className="glass-card p-6 rounded-3xl text-center">
                <div className="bg-soft-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-leaf-green" />
                </div>
                <h3 className="font-inter font-semibold text-lg mb-2">Free Delivery</h3>
                <p className="text-clean-gray text-sm">Complimentary delivery on all orders</p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Showcase */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative overflow-hidden rounded-3xl shadow-medium">
                <img 
                  src={beachImage} 
                  alt="Premium cannabis lifestyle" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-8">
                    <h3 className="font-inter font-bold text-2xl text-white mb-2">Lifestyle</h3>
                    <p className="text-gray-200">Elevate your everyday moments</p>
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-3xl shadow-medium">
                <img 
                  src={marinaImage} 
                  alt="Premium cannabis products" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-8">
                    <h3 className="font-inter font-bold text-2xl text-white mb-2">Premium</h3>
                    <p className="text-gray-200">Luxury cannabis experiences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-inter font-bold text-5xl md:text-6xl text-foreground mb-8">
              Ready to Experience
              <br />
              <span className="text-leaf-green">Premium Cannabis?</span>
            </h2>
            <p className="text-xl text-clean-gray mb-12 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their cannabis needs. 
              Start your order today and discover the difference.
            </p>
            <Button 
              onClick={handleMakeOrder}
              size="lg"
              className="leaf-gradient text-white px-16 py-8 rounded-full text-2xl font-semibold hover:shadow-medium transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingBag className="w-8 h-8 mr-4" />
              Make an Order
            </Button>
          </div>
        </section>
      </div>

      {/* Web Chat Overlay */}
      {showWebChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 md:inset-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-leaf-green">
              <h3 className="font-inter font-semibold text-xl text-white">Place Your Order</h3>
              <button 
                onClick={closeWebChat}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <iframe
              src="https://bizichat.ai/webchat/?p=1899468&id=zzV863MpKDk"
              className="w-full h-full border-0"
              title="Order Chat"
            />
          </div>
        </div>
      )}
    </>
  );
}