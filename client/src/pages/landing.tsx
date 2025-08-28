import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import beachImage from '@assets/Marbella_1750505556334.jpg';
import marinaImage from '@assets/pexels-arvid-knutsen-1892648-3511307.jpg';

interface LandingPageProps {
  onToggleChat: () => void;
}

export function LandingPage({ onToggleChat }: LandingPageProps) {
  return (
    <div className="pt-16">
      {/* Hero Section 1 - Beach Scene */}
      <section 
        className="min-h-screen flex items-center relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${beachImage})` }}
      >
        <div className="gradient-overlay absolute inset-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-inter font-bold text-5xl md:text-7xl text-white mb-6 leading-tight">
            Elevate Your <br />
            <span className="text-warm-gold">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with premium cannabis experiences through our intelligent chat platform. 
            Professional guidance, curated recommendations, and elevated conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onToggleChat}
              className="bg-cannabis hover:bg-forest text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <i className="fas fa-comments mr-3"></i>Start Chatting
            </Button>
            <Link href="/main-chat">
              <Button className="glassmorphism text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-transparent border-white border hover:bg-white hover:text-charcoal">
                <i className="fas fa-arrow-right mr-3"></i>Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-inter font-bold text-4xl md:text-5xl text-charcoal mb-6">Premium Cannabis Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our AI-powered platform connects you with expert knowledge and premium experiences in the cannabis industry.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-cannabis hover:text-white transition-all duration-300 transform hover:scale-105 group">
              <div className="bg-cannabis group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <i className="fas fa-brain text-2xl text-white group-hover:text-cannabis"></i>
              </div>
              <h3 className="font-inter font-semibold text-xl mb-4">Intelligent Recommendations</h3>
              <p className="text-gray-600 group-hover:text-gray-100">AI-powered suggestions tailored to your preferences and experience level.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-cannabis hover:text-white transition-all duration-300 transform hover:scale-105 group">
              <div className="bg-sage group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <i className="fas fa-shield-alt text-2xl text-white group-hover:text-sage"></i>
              </div>
              <h3 className="font-inter font-semibold text-xl mb-4">Secure & Professional</h3>
              <p className="text-gray-600 group-hover:text-gray-100">Enterprise-grade security with professional moderation and compliance.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-cannabis hover:text-white transition-all duration-300 transform hover:scale-105 group">
              <div className="bg-warm-gold group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <i className="fas fa-users text-2xl text-white group-hover:text-warm-gold"></i>
              </div>
              <h3 className="font-inter font-semibold text-xl mb-4">Expert Community</h3>
              <p className="text-gray-600 group-hover:text-gray-100">Connect with licensed professionals and experienced enthusiasts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section 2 - Marina Scene */}
      <section 
        className="min-h-screen flex items-center relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${marinaImage})` }}
      >
        <div className="gradient-overlay absolute inset-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-inter font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
                Premium <br />
                <span className="text-warm-gold">Lifestyle</span> <br />
                Elevated
              </h2>
              <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                Experience cannabis culture at its finest. Our platform curates premium experiences, 
                connects sophisticated users, and provides expert guidance for the discerning enthusiast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/bouncer-chat">
                  <Button className="bg-warm-gold hover:bg-yellow-600 text-charcoal px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    <i className="fas fa-crown mr-3"></i>VIP Access
                  </Button>
                </Link>
                <Button 
                  onClick={onToggleChat}
                  className="glassmorphism text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-transparent border-white border hover:bg-white hover:text-charcoal"
                >
                  <i className="fas fa-play mr-3"></i>Try Demo
                </Button>
              </div>
            </div>
            <div className="glassmorphism p-8 rounded-2xl">
              <h3 className="font-inter font-semibold text-2xl text-white mb-6">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <i className="fas fa-check-circle text-cannabis mr-4"></i>
                  <span>AI-Powered Cannabis Concierge</span>
                </div>
                <div className="flex items-center text-white">
                  <i className="fas fa-check-circle text-cannabis mr-4"></i>
                  <span>Professional Strain Recommendations</span>
                </div>
                <div className="flex items-center text-white">
                  <i className="fas fa-check-circle text-cannabis mr-4"></i>
                  <span>Compliance & Safety First</span>
                </div>
                <div className="flex items-center text-white">
                  <i className="fas fa-check-circle text-cannabis mr-4"></i>
                  <span>Premium User Community</span>
                </div>
                <div className="flex items-center text-white">
                  <i className="fas fa-check-circle text-cannabis mr-4"></i>
                  <span>24/7 Expert Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-forest">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-inter font-bold text-4xl md:text-5xl text-white mb-6">Ready to Elevate?</h2>
          <p className="text-xl text-gray-200 mb-8">Join thousands of cannabis enthusiasts who trust ElevateChat for premium experiences and expert guidance.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/main-chat">
              <Button className="bg-cannabis hover:bg-sage text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                <i className="fas fa-rocket mr-3"></i>Launch Main Chat
              </Button>
            </Link>
            <Link href="/bouncer-chat">
              <Button className="bg-warm-gold hover:bg-yellow-600 text-charcoal px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                <i className="fas fa-star mr-3"></i>VIP Bouncer Chat
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
