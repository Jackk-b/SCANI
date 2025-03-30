import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { classify_colour } from "@/js_scripts/classify_colour";

const modelJSON = require('../assets/model/model.json');
const modelWeights = require('../assets/model/group1-shard1of1.bin')

const RESULT_MAPPING = [
  'T-shirt/top',
  'Trouser',
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Ankle boot',
];

let model = null;

const loadModel = async () => {
  if (model) return model; //if model is already loaded return

  await tf.ready();
  model = await tf.loadGraphModel(bundleResourceIO(modelJSON, modelWeights)); //load model
  return model;
};

export const transformImage = async (uri) => {
  //read image as base 64 to convert from uri
  const img64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

  //convert to Uint8Array, raw bites for dceode jpeg
  const raw = new Uint8Array(tf.util.encodeString(img64, 'base64').buffer);

  //decode jpeg to convert to tensor, needed for model
  let imgTensor = decodeJpeg(raw);

  //resize image to 28x28 for model
  imgTensor = tf.image.resizeBilinear(imgTensor, [28, 28]);

  //classify colur before we convert to greyscale
  let articleColour = await classify_colour(
    imgTensor.slice([7, 7, 0], [14, 14, 3]));

  //convert to black and white
  imgTensor = tf.mean(imgTensor, 2).expandDims(2);

  //slide edges of image to test if backround is light or dark
  const top = imgTensor.slice([0, 0, 0], [1, 28, 1]);
  const bottom = imgTensor.slice([27, 0, 0], [1, 28, 1]);
  const left = imgTensor.slice([0, 0, 0], [28, 1, 1]);
  const right = imgTensor.slice([0, 27, 0], [28, 1, 1]);

  const border = tf.concat([
    top.flatten(),
    bottom.flatten(),
    left.flatten(),
    right.flatten()
  ]);

  const borderMean = (await border.mean().data())[0];

  //convert to float and normalise to get values of [1,0]
  imgTensor = imgTensor.toFloat().div(tf.scalar(255.0));

  //invert image to more closely match model only if light background is detected
  if (borderMean > 180) {
    imgTensor = tf.sub(1, imgTensor);
    console.log("Image is being inverted");
  }

  //add batch dimension to match model
  const img = tf.reshape(imgTensor, [1, 28, 28, 1]);

  return {colour: articleColour, tensor: img}; //return colour & image to make a prediction
}

//function makes a prediction by calling relevant functions above
export const makePrediction = async (imageUri) => {

  const model = await loadModel();

  const image = await transformImage(imageUri);

  const prediction = model.execute(image.tensor);
  const values = await prediction.data();

  // convert to array with index, label, probability, percentage
  const results = Array.from(values)
  .map((probability, index) => ({
    label: RESULT_MAPPING[index],
    confidence: probability,
  }))
  .sort((a, b) => b.confidence - a.confidence); // highest first

//include top result
const topResult = results[0];

//include results above 25%
const filteredResults = [
  topResult,
  ...results.slice(1).filter(r => r.confidence >= 0.2)
];

const finalResults = filteredResults.map(r => ({
  label: r.label,
  percentage: (r.confidence * 100).toFixed(1)
}));

return {
    colour: image.colour,
    prediction: finalResults
  };
};