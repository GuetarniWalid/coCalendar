import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore, signOut } from '@project/shared';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Scene {
  id: string;
  slug: string;
  title: string;
  age_stage: 'kid' | 'teen' | 'adult';
  topic: string;
}

export default function HomeScreen() {
  const [supabase] = useAuthStore.supabase();
  const [user] = useAuthStore.user();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('content_scenes')
        .select('id, slug, title, age_stage, topic')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      setScenes(data || []);
    } catch (error) {
      console.error('Error loading scenes:', error);
      Alert.alert('Error', 'Failed to load scenes');
    } finally {
      setLoading(false);
    }
  };

  const handleScenePress = (_scene: Scene) => {
    // RNN: implement navigation when Game screen exists
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>coCalendar</Text>
        <Text style={styles.subtitle}>Your shared agenda</Text>
        {user && (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={scenes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sceneCard}
            onPress={() => handleScenePress(item)}
          >
            <Text style={styles.sceneTitle}>{item.title}</Text>
            <Text style={styles.sceneTopic}>{item.topic}</Text>
            <View style={styles.sceneMeta}>
              <Text style={styles.ageStage}>{item.age_stage}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.sceneList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  signOutButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  sceneList: {
    padding: 20,
  },
  sceneCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sceneTopic: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sceneMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ageStage: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
