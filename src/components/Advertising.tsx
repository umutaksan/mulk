import React from 'react';
import { Megaphone, Globe, Target, TrendingUp, Share2, Instagram, Linkedin } from 'lucide-react';

const Advertising: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Advertising Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Online Presence</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Booking.com</span>
              <a href="https://admin.booking.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Airbnb</span>
              <a href="https://airbnb.com/hosting" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Lodgify</span>
              <a href="https://app.lodgify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Chekin</span>
              <a href="https://dashboard.chekin.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>PriceLabs</span>
              <a href="https://app.pricelabs.co/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Marketing Campaigns</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Instagram Promotion</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Budget: €200/month</div>
                <div>Platform: Instagram Ads</div>
                <div>Target: Spain, UK</div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Google Search</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Budget: €300/month</div>
                <div>Platform: Google Ads</div>
                <div>Keywords: Marbella rentals</div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Meta Retargeting</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Budget: €150/month</div>
                <div>Platform: Meta Ads</div>
                <div>Audience: Website visitors</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Social Media</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </div>
              <a href="https://www.instagram.com/ldguestmarbella" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                @ldguestmarbella
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </div>
              <span className="text-gray-500">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Monthly Marketing Budget</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Instagram Ads</div>
            <div className="text-2xl font-bold text-green-700">€200</div>
            <div className="text-sm text-green-600">Monthly budget</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Google Ads</div>
            <div className="text-2xl font-bold text-blue-700">€300</div>
            <div className="text-sm text-blue-600">Monthly budget</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Meta Retargeting</div>
            <div className="text-2xl font-bold text-purple-700">€150</div>
            <div className="text-sm text-purple-600">Monthly budget</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advertising;