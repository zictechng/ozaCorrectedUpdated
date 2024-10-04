
const CheckPhotoType = async(data) => {
  if (!data) {
    //console.error('No URI provided for MIME type check.');
    return 'unknown';
  }
    const fileUri = data.toLowerCase();
    if (fileUri.endsWith('.jpg') || fileUri.endsWith('.jpeg')) {
      //return 'image/jpeg';
      return 'image';
    } else if (fileUri.endsWith('.png')) {
      //return 'image/png';
      return 'image';
    } else {
      // If no common extension, return unknown or further inspect the file type
      return 'unknown';
    }
}


export default CheckPhotoType