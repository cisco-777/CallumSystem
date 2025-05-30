import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { openExternalLink } from '@/lib/utils';

export function BouncerChatPage() {
  const handleOpenBouncerChat = () => {
    // TODO: Replace with actual bouncer chat link provided by user
    const bouncerChatUrl = process.env.BOUNCER_CHAT_URL || '';
    if (bouncerChatUrl) {
      openExternalLink(bouncerChatUrl);
    } else {
      alert('Bouncer chat link will be integrated here. Please provide the link for implementation.');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center p-4">
      <div className="glassmorphism p-8 rounded-2xl max-w-md w-full text-center">
        <i className="fas fa-crown text-6xl text-white mb-6"></i>
        <h1 className="font-inter font-bold text-3xl text-white mb-6">VIP Bouncer Chat</h1>
        <p className="text-gray-200 mb-8">
          Exclusive access to premium cannabis experiences, private consultations, 
          and VIP community features. Professional verification required.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleOpenBouncerChat}
            className="w-full bg-white text-warm-gold px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:bg-gray-100"
          >
            <i className="fas fa-external-link-alt mr-3"></i>Open VIP Chat
          </Button>
          <Link href="/">
            <Button className="w-full border-2 border-white text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-white hover:text-warm-gold bg-transparent">
              <i className="fas fa-arrow-left mr-3"></i>Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-300">
          <p>
            <i className="fas fa-shield-alt mr-2"></i>
            Secure VIP link will be provided
          </p>
        </div>
      </div>
    </div>
  );
}
