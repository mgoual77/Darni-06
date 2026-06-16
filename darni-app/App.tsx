import { enableScreens } from 'react-native-screens';
enableScreens();

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen }          from './screens/HomeScreen';
import { SearchScreen }        from './screens/SearchScreen';
import { PostScreen }          from './screens/PostScreen';
import { ListingDetailScreen } from './screens/ListingDetailScreen';
import { AgentsScreen }        from './screens/AgentsScreen';
import { AgentProfileScreen }  from './screens/AgentProfileScreen';
import { LoginScreen }         from './screens/LoginScreen';
import { ProfileScreen }       from './screens/ProfileScreen';
import { MoreScreen }          from './screens/MoreScreen';
import { MapScreen }           from './screens/MapScreen';
import { AboutScreen }         from './screens/AboutScreen';
import { supabase }            from './lib/supabase';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const BLUE  = '#1B4FD8';
const GRAY  = '#9CA3AF';

function PersonIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 24 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5,  backgroundColor: color }} />
      <View style={{ width: 16, height: 8,  borderRadius: 4,  backgroundColor: color, marginTop: 2 }} />
    </View>
  );
}

function DotsIcon({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', height: 24 }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      ))}
    </View>
  );
}

function TabIcon({ label, active }: { label: string; active: boolean }) {
  const color = active ? BLUE : GRAY;
  if (label === 'Publier') {
    return (
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 26, color: '#fff', fontWeight: '400', lineHeight: 30 }}>+</Text>
      </View>
    );
  }
  if (label === 'Connexion') return <PersonIcon color={color} />;
  if (label === 'Plus')      return <DotsIcon color={color} />;
  const icons: Record<string, string> = { Accueil: '⌂', Recherche: '⌕' };
  return (
    <View style={{ width: 28, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color, fontWeight: '600' }}>{icons[label] ?? '·'}</Text>
    </View>
  );
}

function ConnexionTab(props: any) {
  const [user,  setUser]  = React.useState<any>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  );
  return user ? <ProfileScreen {...props} /> : <LoginScreen {...props} />;
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  '#E5E7EB',
          borderTopWidth:  1,
          height:          58 + insets.bottom,
          paddingBottom:   insets.bottom || 6,
          paddingTop:      5,
          elevation: 8,
        },
        tabBarActiveTintColor:   BLUE,
        tabBarInactiveTintColor: GRAY,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} active={focused} />,
      })}
    >
      <Tab.Screen name="Accueil"   component={HomeScreen}   />
      <Tab.Screen name="Recherche" component={SearchScreen} />
      <Tab.Screen name="Publier"   component={PostScreen}   options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Connexion" component={ConnexionTab} />
      <Tab.Screen name="Plus"      component={MoreScreen}   />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main"          component={TabNavigator}        />
          <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
          <Stack.Screen name="Agences"       component={AgentsScreen}        />
          <Stack.Screen name="AgentProfile"  component={AgentProfileScreen}  />
          <Stack.Screen name="Map"           component={MapScreen}           />
          <Stack.Screen name="About"         component={AboutScreen}         />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}