import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const slides = [
  {
    title: 'Welcome to Scani',
    description:
      'Follow along with these steps to scan items and find similar items to buy off of retailers',
  },
  {
    title: 'Step 1 - Scan Item',
    description:
      'Use your camera to scan any clothing, shoes, or accessories. Scani instantly recognizes the item for you.',
  },
  {
    title: 'Step 2 - Center Item In Lens Square',
    description:
      'Use the square guide to center your item to get the best results!.',
  },
  {
    title: 'Step 3 - Browse Results',
    description:
      'Browse visually similar items recommended by Scani, so you can find your perfect match in seconds.',
  },
  {
    title: 'Ready?',
    description: 'All Set! Click on the button below to get started',
  },
];

const CARD_WIDTH = screenWidth * 0.8;
const CARD_MARGIN = 10;
const CARD_FULL_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const handleNext = async () => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * CARD_FULL_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    }
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / CARD_FULL_WIDTH
    );
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_FULL_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContainer}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <Text style={[styles.title, { color: text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: textMuted }]}>
              {item.description}
            </Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={onScrollEnd}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? primary : border },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: primary }]}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // push cards down slightly
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flatListContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 40, // space for dots and button
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 24,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});