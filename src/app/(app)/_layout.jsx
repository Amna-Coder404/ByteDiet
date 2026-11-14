
import { Drawer } from 'expo-router/drawer';
import ByteDietDrawerContent from '../../components/ByteDietDrawerContent';

export default function AppLayout() {
  return (
    <Drawer
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
      <Drawer.Screen
        name="dashboard"
        options={{ title: 'Dashboard' }}
      />

      <Drawer.Screen
        name="ai-plan"
        options={{ title: 'AI Nutrition' }}
      />
      <Drawer.Screen
        name="history"
        options={{ title: 'History' }}
      />
    </Drawer>
  );
}
