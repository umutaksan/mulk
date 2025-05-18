import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Users, TrendingUp, Settings, FileBarChart, Sun, PenTool as Tool, Home, Euro, TrendingDown, ChevronDown, ChevronRight, Database } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { t } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview', 'PropertyManagement']);

  const navigationGroups = [
    {
      id: 'Overview',
      title: 'Overview',
      items: [
        { id: 'daily', icon: Sun, label: t('navigation.daily') },
        { id: 'overview', icon: LayoutDashboard, label: t('navigation.overview') }
      ]
    },
    {
      id: 'PropertyManagement',
      title: 'Property Management',
      items: [
        { id: 'rental', icon: Home, label: t('navigation.rental') },
        { id: 'bookings', icon: Calendar, label: t('navigation.bookings') },
        { id: 'guests', icon: Users, label: t('navigation.guests') },
        { id: 'maintenance', icon: Tool, label: t('navigation.maintenance') },
        { id: 'reports', icon: FileBarChart, label: t('navigation.reports') }
      ]
    },
    {
      id: 'Financial',
      title: 'Financial',
      items: [
        { id: 'revenue', icon: TrendingUp, label: t('navigation.revenue') },
        { id: 'expenses', icon: TrendingDown, label: t('navigation.expenses') }
      ]
    },
    {
      id: 'Tools',
      title: 'Tools',
      items: [
        { id: 'sql', icon: Database, label: 'SQL Editor' },
        { id: 'settings', icon: Settings, label: t('navigation.settings') }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-16">
      <nav className="p-4">
        <div className="space-y-2">
          {navigationGroups.map((group) => (
            <div key={group.id} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{group.title}</span>
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {expandedGroups.includes(group.id) && (
                <div className="pl-4 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar