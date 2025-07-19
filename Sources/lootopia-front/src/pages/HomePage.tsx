import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturedHunts from '../components/Home/FeaturedHunts';
import { Users, Trophy, Star, Zap } from 'lucide-react';
interface HomePageProps {
  onNavigate: (page: string) => void;
}
const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of treasure hunters in epic adventures created by our vibrant community.'
    },
    {
      icon: Trophy,
      title: 'Legendary Rewards',
      description: 'Earn rare artifacts, crowns, and exclusive badges as you complete challenging hunts.'
    },
    {
      icon: Star,
      title: 'Augmented Reality',
      description: 'Experience treasure hunting like never before with cutting-edge AR technology.'
    },
    {
      icon: Zap,
      title: 'Real-time Competition',
      description: 'Compete with other hunters in live leaderboards and dynamic multiplayer events.'
    }
  ];
  return (
    <div className="min-h-screen bg-white">
      <HeroSection onNavigate={onNavigate} />
      <FeaturedHunts onNavigate={onNavigate} />
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Lootopia?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of treasure hunting with our innovative platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the community and discover treasures waiting to be found
          </p>
          <button
            onClick={() => onNavigate('hunts')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Explore Hunts Now
          </button>
        </div>
      </div>
    </div>
  );
};
export default HomePage;