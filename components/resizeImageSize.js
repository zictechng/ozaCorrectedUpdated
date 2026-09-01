
import * as ImageManipulator from 'expo-image-manipulator';
const MAX_FILE_SIZE_MB = 5 * 1024 * 1024; // 5MB in bytes

const ResizeImageSize = async (uri) => {
    if (!uri) {
        //console.error('No URI provided for image resize check.');
        return 'unknown';
      }

    try {
      let resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }], // Adjust the width to your requirement (aspect ratio is maintained)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Adjust compression level
      );

      const resizedFileInfo = await FileSystem.getInfoAsync(resizedImage.uri);

      // Continue resizing if it's still larger than 5MB
      while (resizedFileInfo.size > MAX_FILE_SIZE_MB) {
        resizedImage = await ImageManipulator.manipulateAsync(
          resizedImage.uri,
          [{ resize: { width: resizedImage.width * 0.8 } }], // Gradually reduce size
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Lower compression
        );
      }

      return resizedImage.uri; // Return resized image URI
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri; // Return original URI if resizing fails
    }
  };

  export default ResizeImageSize;