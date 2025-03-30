// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const HISTORY_KEY = "user_uploaded_photos";

const History = () => {
  const navigation = useNavigation<any>();

  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, 'primary');

  const [images, setImages] = useState<string[]>([]);

  // load saved photos
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        if (stored) {
          setImages(JSON.parse(stored));
        }
      } catch (error) {
        console.log("Failed to load history:", error);
      }
    };
    loadHistory();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: background }]}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={primary} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: text }]}>Upload History</Text>
      </View>

      {images.length === 0 ? (
        <Text style={[styles.emptyText, { color: textMuted }]}>
          No uploaded photos yet
        </Text>
      ) : (
        <View style={styles.grid}>
          {images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.imageItem}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 15,
  },
});
