import { enableScreens } from 'react-native-screens';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

import { HomeScreen }           from './screens/HomeScreen';
import { SearchScreen }         from './screens/SearchScreen';
import { PostScreen }           from './screens/PostScreen';
import { ListingDetailScreen }  from './screens/ListingDetailScreen';
import { AgentsScreen }         from './screens/AgentsScreen';
import { AgentProfileScreen }   from './screens/AgentProfileScreen';
import { LoginScreen }          from './screens/LoginScreen';
import { ProfileScreen }        from './screens/ProfileScreen';
import { MesAnnoncesScreen }    from './screens/MesAnnoncesScreen';
import { MoreScreen }           from './screens/MoreScreen';
import { MapScreen }            from './screens/MapScreen';
import { AboutScreen }          from './screens/AboutScreen';
import { ResetPasswordScreen }  from './screens/ResetPasswordScreen';
import { supabase }             from './lib/supabase';

enableScreens();

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const BLUE  = '#1B4FD8';
const GRAY  = '#9CA3AF';

// ── Deep linking config ──────────────────────────────────────────────────────
const prefix = Linking.createURL('/');

const linking = {
  prefixes: ['darni://', prefix],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Main: '*',
    },
  },
} as any;

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen() {
  const [fadeAnim] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim]);

  return (
    <View style={{ flex: 1, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={{ fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: -2 }}>
          darni
        </Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: 1 }}>
          Immobilier Algérie
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Icônes ───────────────────────────────────────────────────────────────────
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

// ── Onglet Connexion / Profil ─────────────────────────────────────────────────
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

// ── Tab Navigator ─────────────────────────────────────────────────────────────
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

// ── App principale ────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main"          component={TabNavigator}        />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
          <Stack.Screen name="Agences"       component={AgentsScreen}        />
          <Stack.Screen name="MesAnnonces"   component={MesAnnoncesScreen}   />
          <Stack.Screen name="AgentProfile"  component={AgentProfileScreen}  />
          <Stack.Screen name="Map"           component={MapScreen}           />
          <Stack.Screen name="About"         component={AboutScreen}         />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}