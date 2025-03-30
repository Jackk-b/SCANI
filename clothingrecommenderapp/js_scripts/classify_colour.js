import convert from 'color-convert';
import * as tf from '@tensorflow/tfjs';

export const classify_colour = async (imageCenter) => {
  const [r, g, b] = await(tf.mean(imageCenter, [0, 1])).data();
  const [h, s, v] = convert.rgb.hsv(r, g, b);

  if (v < 30) return "Black";
  if (v > 85 && s < 15) return "White";
  if (s < 20) return "Grey";

  switch (true) {

    case (h >= 0 && h < 15):
      return "Red";

    case (h >= 15 && h < 45):
      return "Orange";

    case (h >= 45 && h < 65):
      return "Yellow";

    case (h >= 65 && h < 150):
      return "Green";

    case (h >= 150 && h < 210):
      return "Turquoise";

    case (h >= 210 && h < 270):
      return "Blue";

    case (h >= 270 && h < 300):
      return "Purple";

    case (h >= 300 && h < 345):
      return "Pink";

    case (h >= 345 && h <= 360):
      return "Red";

    default:
      return "Unknown colour";
  };
};