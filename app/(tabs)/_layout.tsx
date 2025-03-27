import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#ffd33d',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {
      backgroundColor: '#25292e',
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', 
                                           tabBarIcon: ({ color, focused }) => (
                                              <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                                           ), 
                                        }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', 
                                           tabBarIcon: ({ color, focused }) => (
                                              <Ionicons name={focused ? 'chatbubble-sharp' : 'chatbubble-outline'} color={color} size={24} />
                                           ), 
                                        }} />      
      <Tabs.Screen name="images" options={{ title: 'Images', 
                                           tabBarIcon: ({ color, focused }) => (
                                              <Ionicons name={focused ? 'image-sharp' : 'image-outline'} color={color} size={24} />
                                           ), 
                                        }} />                                    
      <Tabs.Screen name="about" options={{ title: 'About',
                                            tabBarIcon: ({ color, focused }) => (
                                              <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24} />
                                           ), 
                                        }} />
    </Tabs>
  );
}