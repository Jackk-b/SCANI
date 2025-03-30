import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { makePrediction } from '@/js_scripts/predict_image'
import { squareImage } from '@/js_scripts/square_image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const router = useRouter();
const HISTORY_KEY = "user_uploaded_photos";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  //function to save to history
    const saveToHistory = async (imageUri: string) => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      let images = stored ? JSON.parse(stored) : [];
      images.unshift(imageUri);
      if (images.length > 50) images.pop(); // optional limit
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(images));
    } catch (error) {
      console.log("Failed to save history:", error);
    }
  };

  //function takes picture
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (!photo?.uri) return;
    //pass to function to square the image
    const squaredUri = await squareImage(photo);

    setUri(squaredUri);
    
    //save to history
    await saveToHistory(squaredUri);

    //pass to make prediction
    const prediction = await makePrediction(squaredUri);

    router.push({
      pathname: "./results",
      params: { 
        colour: prediction.colour,
        predictions: JSON.stringify(prediction.prediction)
      },
    });

  };
  //function allows user to upload image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission to access the library is required to pick an image")
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], //sqaure image already
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri
      //pass to function to make prediction
      const prediction = await makePrediction(uri);
      
      router.push({
      pathname: "./results",
      params: { 
        colour: prediction.colour,
        predictions: JSON.stringify(prediction.prediction)
        },
    } );

    }
  }

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderPicture = (uri: string) => {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: 500, aspectRatio: 1 }}
        />
        <Button onPress={() => setUri(null)} title="Take another picture" />
        {/* work in progress on this line, need to change its on press  */}
        <Button title="Use this photo" />
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={[styles.camera, { width: "100%", aspectRatio: 1 }]}
          ref={ref}
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        <View pointerEvents="none" style={styles.squareOverlayContainer}>
        <View style={styles.squareOverlay} />
        </View>
        <View style={styles.shutterContainer}>
          <Pressable onPress={pickImage}>
            {({ pressed }) => (
              <View style={[styles.libraryBtn, { opacity: pressed ? 0.5 : 1 }]} />
            )}
          </Pressable>
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}
              >
                <View style={[styles.shutterBtnInner, { backgroundColor: "white" }]} />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </View>
    );
  };

  return <View style={styles.container}>{uri ? renderPicture(uri) : renderCamera()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  squareOverlay: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 10,
  },
  squareOverlayContainer: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "center",
  alignItems: "center",
  },

  libraryBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
