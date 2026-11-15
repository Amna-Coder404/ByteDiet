import { Drawer } from 'expo-router/drawer';
import ByteDietDrawerContent from '../../components/ByteDietDrawerContent';

export const unstable_settings = {
  initialRouteName: 'dashboard',
};

export default function AppLayout() {
  return (
    <Drawer
      backBehavior="initialRoute"
      drawerContent={(props) => (
        <ByteDietDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: true,
        drawerStyle: {
          width: 290,
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="ai-plan" options={{ title: 'AI Nutrition' }} />
      <Drawer.Screen name="history" options={{ title: 'History' }} />
    </Drawer>
  );
}