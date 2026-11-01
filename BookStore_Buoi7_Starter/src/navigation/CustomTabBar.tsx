import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBar, TabItem } from "../components/TabBar";
import { useCart } from "../store/hooks";

const TAB_EMOJIS: Record<string, string> = {
  Home: "🏠",
  Categories: "📁",
  Cart: "🛒",
  Account: "👤",
};

// Nối Tab Bar tự dựng với React Navigation: nhận { state, descriptors, navigation }
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { totalQuantity } = useCart();

  const items: TabItem[] = state.routes.map((route) => {
    const { options } = descriptors[route.key];
    const label = (options.title ?? options.tabBarLabel ?? route.name) as string;
    const emoji = TAB_EMOJIS[route.name] ?? "📌";
    const badge = route.name === "Cart" && totalQuantity > 0 ? totalQuantity : undefined;

    return {
      key: route.key,
      label,
      emoji,
      badge,
    };
  });

  const onPress = (key: string) => {
    const route = state.routes.find((r) => r.key === key);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    const isFocused = state.routes[state.index].key === key;
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return <TabBar items={items} activeKey={state.routes[state.index].key} onPress={onPress} />;
}
