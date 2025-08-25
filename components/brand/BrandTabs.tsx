'use client';

import React, { useState, useEffect } from 'react';
import { Search, Wrench, ShoppingCart } from 'lucide-react';

interface BrandTabsProps {
  brandSlug: string;
  hasSerialLookup: boolean;
  hasFaultCodes: boolean;
  children: React.ReactNode;
}

type TabType = 'serial' | 'fault-codes' | 'parts';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function BrandTabs({ brandSlug, hasSerialLookup, hasFaultCodes, children }: BrandTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('serial');

  const tabs: Tab[] = [
    {
      id: 'serial',
      label: 'Serial Lookup',
      icon: <Search className="w-4 h-4" />,
      enabled: hasSerialLookup
    },
    {
      id: 'fault-codes',
      label: 'Fault Codes',
      icon: <Wrench className="w-4 h-4" />,
      enabled: hasFaultCodes
    },
    {
      id: 'parts',
      label: 'Parts Request',
      icon: <ShoppingCart className="w-4 h-4" />,
      enabled: true // Always enabled
    }
  ];

  // Track tab view for analytics
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/brands/${brandSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'track_view', tab: activeTab })
        });
      } catch (error) {
        // Silent fail for analytics
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackView();
  }, [activeTab, brandSlug]);

  // Set default tab to first enabled tab
  useEffect(() => {
    const firstEnabledTab = tabs.find(tab => tab.enabled);
    if (firstEnabledTab && !tabs.find(tab => tab.id === activeTab)?.enabled) {
      setActiveTab(firstEnabledTab.id);
    }
  }, [hasSerialLookup, hasFaultCodes]);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.filter(tab => tab.enabled).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              activeTab,
              brandSlug,
              isActive: child.props.tabId === activeTab
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

// Tab Content Wrapper Component
interface TabContentProps {
  tabId: TabType;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ tabId, isActive = false, children, className = '' }: TabContentProps) {
  if (!isActive) return null;

  return (
    <div className={`tab-content ${className}`} role="tabpanel" aria-labelledby={`${tabId}-tab`}>
      {children}
    </div>
  );
}
