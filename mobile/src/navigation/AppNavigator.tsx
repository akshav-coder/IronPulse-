import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import OwnerNavigator from './OwnerNavigator';
import TrainerNavigator from './TrainerNavigator';
import MemberNavigator from './MemberNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const role = user?.role ? user.role.toLowerCase() : '';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user === null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : role === 'owner' ? (
          <Stack.Screen name="OwnerRoot" component={OwnerNavigator} />
        ) : role === 'trainer' || role === 'staff' ? (
          <Stack.Screen name="TrainerRoot" component={TrainerNavigator} />
        ) : role === 'member' ? (
          <Stack.Screen name="MemberRoot" component={MemberNavigator} />
        ) : (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
