import { ImageManipulator } from "expo-image-manipulator";

//function squares image taken by camera and returns uri
export const squareImage = async (photo) => {
  const { width, height } = photo;
  const size = Math.min(width, height);
  const originX = (width - size) / 2;
  const originY = (height - size) / 2;

  const context = ImageManipulator.manipulate(photo.uri);
  context.crop({ originX: originX, originY: originY, width: size, height: size });

  const result = await context.renderAsync();
  const saved = await result.saveAsync();

  return saved.uri;
};