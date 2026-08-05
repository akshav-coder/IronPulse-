import { createNavigationContainerRef } from '@react-navigation/native';

// Shared across the app so components outside any Screen (e.g. a custom
// persistent tab bar) can trigger navigation. Attached to the single
// NavigationContainer in AppNavigator.tsx; navigate() on this ref resolves
// screen names anywhere in the tree, including nested navigators.
export const navigationRef = createNavigationContainerRef<any>();

export const navigate = (name: string, params?: any) => {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as (...args: any[]) => void)(name, params);
  }
};
