'use client';

import { C, SANS } from '@/lib/tokens';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icon';

export type MobileTab = 'plan' | 'worksheet' | 'library' | 'ai';

interface BottomTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}

const TABS: Array<{ id: MobileTab; label: string; icon: IconName }> = [
  { id: 'plan',      label: 'Plan',      icon: 'book' },
  { id: 'worksheet', label: 'Worksheet', icon: 'edit' },
  { id: 'library',   label: 'Library',   icon: 'copy' },
  { id: 'ai',        label: 'AI',        icon: 'sparkle' },
];

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 150,
      height: 'calc(56px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'stretch',
    }}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'transparent', border: 'none', cursor: 'pointer',
              minHeight: 44, padding: '6px 0',
            }}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? C.pink : C.faint2}
              strokeWidth={isActive ? 2 : 1.6}
            />
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? C.pink : C.faint2,
              letterSpacing: '0.02em',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
