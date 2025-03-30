// @ts-nocheck

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";


export default function Results() {
  const params = useLocalSearchParams();
  const router = useRouter();

  let predictions = []; //parse predictionss
  predictions = params.predictions
    ? JSON.parse(params.predictions)
    : [];

  const colour = params.colour;

  //styling
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  //which is the selected catagory
  const [selectedCategory, setSelectedCategory] = useState(
    predictions.length > 0 ? predictions[0].label : null);

  //store products from api
  const [products, setProducts] = useState([]);

  //loading spinner
  const [loading, setLoading] = useState(false);

  //fetch products from catagory, run again if catagory changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

  //fetch products from SearApi
  const fetchProducts = async (category) => {

    try { //try and catch used inase of an api error
      setLoading(true); //loading symbol

      const query = `${colour} ${category}`;
      const response = await fetch(
        //Api key goes at the end of this string we have 250 calls for free
        `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=ef9328573dbab13812eedabd84a0eced18734ab8e61b45df14e10f8b0fcaded2`
      );

      const data = await response.json();
      const results = data.shopping_results || []; //return array if fails

      const formattedProducts = results.slice(0, 25).map((item, index) => ({
        id: index.toString(),
        title: item.title || "Title unavailable", //default values
        price: item.price || "Price unavailable",
        thumbnail: item.thumbnail || null,
        link: item.product_link || null,
      }));
      setProducts(formattedProducts); //set products

    } catch (error) {
      console.log("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);  //loading symbol again
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Results</Text>
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: surface }]}
          onPress={() => router.replace("/")}
        >
          <Text style={[styles.homeButtonText, { color: primary }]}>
            Home
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.resultCard, { backgroundColor: surface }]}>
        <Text style={[styles.cardLabel, { color: textMuted }]}>Colour</Text>
        <Text style={[styles.cardValue, { color: text }]}>{colour}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: text }]}>Predictions</Text>

      {predictions.map((item, index) => {
        const selected = item.label === selectedCategory;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.resultCard,
              { backgroundColor: selected ? primary : surface },
            ]}
            onPress={() => setSelectedCategory(item.label)}
          >
            <Text style={[styles.cardLabel, { color: textMuted }]}>
              {index === 0 ? "Most likely" : "Also likely"}
            </Text>
            <Text style={[styles.cardValue, { color: text }]}>{item.label}</Text>
            <Text style={[styles.confidence, { color: textMuted }]}>
              {item.percentage}%
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.sectionTitle, { color: text }]}>Similar Items</Text>

      {loading && <ActivityIndicator size="large" color={primary} />}

      {!loading && products.length === 0 && (
        <Text style={[styles.emptyText, { color: textMuted }]}>
          No similar products found
        </Text>
      )}

      {!loading &&
        products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productCard, { backgroundColor: surface }]}
            onPress={() => {
              console.log(product); //debugging purposes
              if (product.link) Linking.openURL(product.link);
            }}
          >
            {product.thumbnail && (
              <Image
                source={{ uri: product.thumbnail }}
                style={styles.productImage}
              />
            )}
            <Text style={[styles.productTitle, { color: text }]}>
              {product.title}
            </Text>
            <Text style={[styles.productPrice, { color: primary }]}>
              {product.price}
            </Text>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 80,
    marginBottom: 20,
  },
  homeButton: {
    position: "absolute",
    right: 0,
    top: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  resultCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
  },
  confidence: {
    marginTop: 4,
  },
  productCard: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  productPrice: {
    marginTop: 4,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
});