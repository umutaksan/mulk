import React from 'react';
import { Megaphone, Globe, Target, TrendingUp, Share2 } from 'lucide-react';

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
                <span className="font-medium">Summer Campaign</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Budget: €500</div>
                <div>Platform: Meta Ads</div>
                <div>Duration: 30 days</div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Winter Promotion</span>
                <span className="text-gray-600">Scheduled</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Budget: €300</div>
                <div>Platform: Google Ads</div>
                <div>Duration: 15 days</div>
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
              <span>Instagram</span>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Facebook</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>LinkedIn</span>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Manage
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Click-through Rate</div>
            <div className="text-2xl font-bold text-green-700">2.8%</div>
            <div className="text-sm text-green-600">+0.5% from last month</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-blue-700">1.5%</div>
            <div className="text-sm text-blue-600">+0.2% from last month</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">ROI</div>
            <div className="text-2xl font-bold text-purple-700">245%</div>
            <div className="text-sm text-purple-600">+15% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advertising;