import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from "react";
import { Linking } from "react-native"; 

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  const [recommended, setRecommended] = useState<any[]>([]);

useEffect(() => {
  const fetchZalando = async () => {
    try {
      //for debugging - test ios
      console.log("Fetching Zalando...");

      const response = await fetch(
        "https://zalando-api2.p.rapidapi.com/scrapers/api/zalando/product/listing-by-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": "93762778bfmsh6e144875c579c72p11c56bjsneb80b286093c", //will remove - here for testing not many runs on it left
            "x-rapidapi-host": "zalando-api2.p.rapidapi.com",
          },
          body: JSON.stringify({
            url: "https://www.zalando.nl/dameskleding-jurken/",
          }),
        }
      );

      const result = await response.json();
      //debugging in console - need to test on ios ( web and android fine)
      console.log("ZALANDO RESPONSE:", result);

      //to avoid crashing
      if (Array.isArray(result.data)) {
        setRecommended(result.data);
      } else {
        setRecommended([]);
        console.log("No products found");
      }
    } catch (error) {
      console.log("Zalando fetch error:", error);
    }
  };

  fetchZalando();
}, []);



  return (
  <ScrollView
    style={[styles.container, { backgroundColor: background }]}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/scanilogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.subtitle, { color: textMuted }]}>
        Discover fashion pieces in a click
      </Text>
    </View>

    <TouchableOpacity
      style={[styles.scanCard, { backgroundColor: primary }]}
      onPress={() => navigation.navigate("camera")}
    >
      <Ionicons name="scan" size={36} color="#FFFFFF" />
      <Text style={[styles.scanTitle, { color: "#FFFFFF" }]}>
        Scan Clothing
      </Text>
      <Text style={[styles.scanSubtitle, { color: "#FFFFFF", opacity: 0.85 }]}>
        Take a photo and find similar items
      </Text>
    </TouchableOpacity>

    <View style={styles.grid}>
      {[
        { name: "help", label: "How To Guide", route: "guide" },
        { name: "time", label: "Scan History", route: "history" },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.gridCard, { backgroundColor: surface }]}
          onPress={() => navigation.navigate(item.route)}
        >
          <Ionicons name={item.name as any} size={28} color={primary} />
          <Text style={[styles.gridTitle, { color: text }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={{ marginTop: 20 }}>
  <Text style={[styles.carouselTitle, { color: text }]}>
    You Might Also Like
  </Text>


  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
    {Array.isArray(recommended) && recommended.length > 0 ? (
      recommended.map((item) => {
        
        const imageUri = item?.small_default_media?.uri;
        const productUrl = item?.uri;

        //if it has neither don't display it 
        if (!imageUri || !productUrl) return null; 

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.productCard, { backgroundColor: surface }]}
            onPress={() => {
              Linking.openURL(productUrl).catch(err =>
                console.log("Failed to open URL:", err)
              );
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
            />
            <Text numberOfLines={2} style={[styles.productName, { color: text }]}>
              {item.name}
            </Text>
            <Text style={[styles.productPrice, { color: primary }]}>
              € {item.display_price?.tracking_current_amount?.toFixed(2)}
            </Text>
          </TouchableOpacity>
        );
      })
    ) : (
      <Text style={{ color: textMuted, marginTop: 10 }}>
        No recommendations found
      </Text>
    )}
  </ScrollView>
  </View>
  </ScrollView>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 10,
    maxWidth: 300,
  },
  scanCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  scanSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  logo: {
  width: 150,        
  height: 150,        
  marginBottom: -50, 
  marginLeft: -10,
  marginTop: -50,
},
carouselTitle: {
  fontSize: 18,
  fontWeight: "700",
},

productCard: {
  width: 160,
  borderRadius: 16,
  padding: 12,
  marginRight: 15,
},

productImage: {
  width: "100%",
  height: 160,
  borderRadius: 12,
  marginBottom: 10,
},

productName: {
  fontSize: 13,
  fontWeight: "600",
},

productPrice: {
  fontSize: 14,
  fontWeight: "700",
  marginTop: 6,
},

});