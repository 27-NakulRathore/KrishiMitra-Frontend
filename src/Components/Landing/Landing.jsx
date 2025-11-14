import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTractor, faShoppingCart, faRobot, faChartLine, 
  faMobileAlt, faLeaf, faMapMarkerAlt, faPhoneAlt, 
  faEnvelope, faNewspaper, faHandshake, faSeedling
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, faTwitter, faInstagram, faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

// Import your agriculture images
import agri1 from '../../assets/agriculture1.png';
import agri2 from '../../assets/agriculture2.png';
import agri3 from '../../assets/agriculture3.png';
import agri4 from '../../assets/agriculture4.png';

const agricultureImages = [agri1, agri2, agri3, agri4];

function Landing() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    // Fetch agriculture news from NewsAPI
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=agriculture+india&apiKey=61c40eda66f14630a3fc9d4c6ed2e487&pageSize=4`
        );
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([
          {
            title: "India's Agricultural Growth Reaches 3.5% in Q2",
            description: "Recent government data shows positive growth in agricultural sector.",
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200?text=Agriculture+News",
            publishedAt: new Date().toISOString()
          },
          {
            title: "New Farming Techniques Boost Yield in Punjab",
            description: "Farmers adopting innovative methods see 20% increase in production.",
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200?text=Agriculture+News",
            publishedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center overflow-x-hidden">
      {/* Google Translate Widget */}
      <div id="google_translate_element" className="fixed bottom-4 right-4 z-50 bg-white p-2 rounded shadow-lg"></div>

      {/* Header */}
      <header className="flex justify-between items-center p-6 w-full max-w-7xl mx-auto">
        {/* Updated Logo */}
        <div className="flex items-center">
          <div className="relative">
             <FontAwesomeIcon 
                                                 icon={faLeaf} 
                                                 size="2xl" 
                                                 className="text-green-600 mr-3" 
                                             />
                                             <span className="text-3xl font-bold text-green-700">Krishiमित्र</span>
                                         </div>
        </div>
        <Link to="/signin" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300">
          Sign In
        </Link>
      </header>

      {/* Main Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-green-900 leading-tight">
            Welcome to Krishiमित्र
            <br />
            Connecting Farmers and Buyers
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            Join our marketplace to buy and sell fresh, quality crops directly.
          </p>
        </div>

        {/* Register Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
          {/* Register as Farmer */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center border border-gray-300 transform hover:scale-105 h-full">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-500 mb-4">
              <FontAwesomeIcon icon={faTractor} size="lg" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Register as a Farmer</h2>
            <p className="text-gray-500 text-sm mb-4">Sell your crops directly.</p>
            <Link to="/register/farmer" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 text-sm">
              Register as Farmer
            </Link>
          </div>

          {/* Register as Buyer */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center border border-gray-300 transform hover:scale-105 h-full">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-500 mb-4">
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Register as a Buyer</h2>
            <p className="text-gray-500 text-sm mb-4">Find and purchase crops.</p>
            <Link to="/register/buyer" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 text-sm">
              Register as Buyer
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <div className="w-full bg-gradient-to-br from-green-50 to-green-100 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Why Choose Krishiमित्र?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform brings innovation to agriculture with cutting-edge features designed for modern farmers and buyers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 md:px-8">
          {/* AI Crop Quality Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-gray-700 text-center border border-gray-200">
            <div className="h-16 w-16 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faRobot} size="lg" />
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Powered Crop Quality Analysis</h2>
            <p className="text-sm">Leverage AI to assess crop quality, ensuring better transparency and trust.</p>
          </div>

          {/* Market Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-gray-700 text-center border border-gray-200">
            <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faChartLine} size="lg" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Market Trends & Pricing</h2>
            <p className="text-sm">Stay updated with real-time market trends for smarter buying and selling.</p>
          </div>

          {/* User-Friendly Application */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-gray-700 text-center border border-gray-200">
            <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faMobileAlt} size="lg" />
            </div>
            <h2 className="text-xl font-semibold mb-2">User-Friendly Application</h2>
            <p className="text-sm">Enjoy a seamless and intuitive experience for easy participation.</p>
          </div>
        </div>
      </div>

      {/* Agriculture in Action Section */}
      <div className="w-full bg-gradient-to-br from-green-50 to-green-100 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Agriculture in Action</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            See the vibrant community of farmers and buyers making agriculture thrive through our platform.
          </p>
          
          {/* Animated Image Scroller */}
          <div className="relative h-72 w-full overflow-hidden mb-8">
            <div className="absolute flex space-x-8 animate-scroll">
              {agricultureImages.map((img, index) => (
                <div key={index} className="flex-shrink-0 h-72 w-72 rounded-xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-300">
                  <img src={img} alt={`Agriculture ${index}`} className="h-full w-full object-cover" />
                </div>
              ))}
              {/* Duplicate for infinite loop */}
              {agricultureImages.map((img, index) => (
                <div key={`dup-${index}`} className="flex-shrink-0 h-72 w-72 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                  <img src={img} alt={`Agriculture ${index}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to Action */}
          <Link 
            to="/register" 
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300 text-lg mt-8"
          >
            Join Our Growing Community
          </Link>
        </div>
      </div>

      {/* Agriculture News Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <FontAwesomeIcon icon={faNewspaper} className="text-green-500 text-4xl mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-2">Latest Agriculture News</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest developments in Indian agriculture
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {news.map((article, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.urlToImage || "https://via.placeholder.com/300x200?text=Agriculture+News"} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-green-800 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.description || "Read more about this agriculture news story."}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              {/* Updated Footer Logo */}
              <div className="flex items-center">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLeaf} 
                    size="lg" 
                    className="text-green-300 mr-2" 
                  />
                 
                </div>
                <span className="text-2xl font-bold text-green-100">Krishiमित्र</span>
              </div>
              <p className="text-green-200">
                Connecting farmers and buyers through innovative technology for a sustainable agricultural future.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" className="text-green-300 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-green-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/marketplace" className="text-green-300 hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/pricing" className="text-green-300 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/blog" className="text-green-300 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-green-300 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="text-green-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="text-green-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-green-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-100">Contact Us</h3>
              <address className="not-italic space-y-2 text-green-300">
                <p className="flex items-start">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 mr-2" />
                  <span>123 Farm Lane, Agricultural City, AG 12345</span>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                  <a href="tel:+11234567890">+1 (123) 456-7890</a>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  <a href="mailto:info@cropboom.com">info@krishimitr.com</a>
                </p>
              </address>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-300">
            <p>&copy; {new Date().getFullYear()} Krishiमित्र. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;