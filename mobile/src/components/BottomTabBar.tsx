import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabItem = {
  key: string;
  label: string;
  icon: string;
  activeColor?: string;
};

interface BottomTabBarProps {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  maxVisible?: number;
}

const DEFAULT_ACTIVE = 'text-indigo-600';

const BottomTabBar: React.FC<BottomTabBarProps> = ({ items, activeKey, onSelect, maxVisible = 3 }) => {
  const insets = useSafeAreaInsets();
  const [moreOpen, setMoreOpen] = useState(false);

  const hasMore = items.length > maxVisible;
  const visibleItems = hasMore ? items.slice(0, maxVisible) : items;
  const moreItems = hasMore ? items.slice(maxVisible) : [];
  const isMoreActive = moreItems.some((item) => item.key === activeKey);

  const handleSelect = (key: string) => {
    setMoreOpen(false);
    onSelect(key);
  };

  return (
    <>
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        }}
      >
        <View className="flex-row px-2 justify-around items-center">
          {visibleItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleSelect(item.key)}
              className="items-center py-1 flex-1"
            >
              <Text className="text-2xl mb-1">{item.icon}</Text>
              <Text
                className={`text-xs font-extrabold ${
                  activeKey === item.key ? item.activeColor || DEFAULT_ACTIVE : 'text-slate-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {hasMore && (
            <TouchableOpacity onPress={() => setMoreOpen(true)} className="items-center py-1 flex-1">
              <Text className="text-2xl mb-1">☰</Text>
              <Text className={`text-xs font-extrabold ${isMoreActive ? DEFAULT_ACTIVE : 'text-slate-400'}`}>
                More
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' }}
          onPress={() => setMoreOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View className="items-center pb-2">
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
            </View>
            {moreItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleSelect(item.key)}
                className="flex-row items-center px-6 py-4"
              >
                <Text className="text-2xl mr-4">{item.icon}</Text>
                <Text
                  className={`text-base font-bold ${
                    activeKey === item.key ? item.activeColor || DEFAULT_ACTIVE : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default BottomTabBar;
