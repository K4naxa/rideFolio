export async function uploadImageToBucket(file: File): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error('Invalid file type');
  }
  // upload image to bucket

  // Receive image url

  // return image url

  return await Promise.resolve('');
}
