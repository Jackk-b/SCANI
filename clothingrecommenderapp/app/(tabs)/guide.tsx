import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNavigation } from '@react-navigation/native';

const steps = [
  {
    icon: 'camera',
    title: 'Scan an Item',
    description:
      'Tap "Scan Clothing" and take a clear photo of your clothing, shoes, or accessories. Ensure good lighting and center the item.',
  },
  {
    icon: 'analytics',
    title: 'Processing & Recognition',
    description:
      'Scani analyzes your photo to identify type, color, pattern, and style within seconds.',
  },
  {
    icon: 'list',
    title: 'Browse Recommendations',
    description:
      'View visually similar items from various retailers. Scroll, filter, and save your favorites.',
  },
  {
    icon: 'heart',
    title: 'Save Items',
    description:
      'Tap the heart icon to save items to your "Saved Items" for later access.',
  },
  {
    icon: 'time',
    title: 'Scan History',
    description:
      'All previous scans are stored in "Scan History" for quick access or rescanning.',
  },
  {
    icon: 'trending-up',
    title: 'Style Explorer',
    description:
      'Discover trending styles from retailers such as ASOS and Zalando',
  },
];

const GuideScreen = () => {
  const navigation = useNavigation<any>();
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={primary} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: text }]}>How to Use Scani</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {steps.map((step, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: surface }]}
          >
            <Ionicons
              name={step.icon as any}
              size={32}
              color={primary}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: text }]}>{step.title}</Text>
            <Text style={[styles.description, { color: textMuted }]}>
              {step.description}
            </Text>
          </View>
        ))}
      </ScrollView>


    </View>
  );
};

export default GuideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
});