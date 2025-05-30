import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { openExternalLink } from '@/lib/utils';

export function MainChatPage() {
  const handleOpenMainChat = () => {
    // TODO: Replace with actual main chat link provided by user
    const mainChatUrl = process.env.MAIN_CHAT_URL || '';
    if (mainChatUrl) {
      openExternalLink(mainChatUrl);
    } else {
      alert('Main chat link will be integrated here. Please provide the link for implementation.');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-cannabis to-forest flex items-center justify-center p-4">
      <div className="glassmorphism p-8 rounded-2xl max-w-md w-full text-center">
        <i className="fas fa-comments text-6xl text-white mb-6"></i>
        <h1 className="font-inter font-bold text-3xl text-white mb-6">Main Chat Portal</h1>
        <p className="text-gray-200 mb-8">
          Connect with our main cannabis consultation platform for general inquiries, 
          strain recommendations, and community discussions.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleOpenMainChat}
            className="w-full bg-white text-cannabis px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:bg-gray-100"
          >
            <i className="fas fa-external-link-alt mr-3"></i>Open Main Chat
          </Button>
          <Link href="/">
            <Button className="w-full border-2 border-white text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-white hover:text-cannabis bg-transparent">
              <i className="fas fa-arrow-left mr-3"></i>Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-300">
          <p>
            <i className="fas fa-info-circle mr-2"></i>
            Link will be provided for integration
          </p>
        </div>
      </div>
    </div>
  );
}
