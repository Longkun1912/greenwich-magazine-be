const cloudinary = require("../config/cloudinary.config");

const bufferToDataURL = (buffer) => {
  let base64 = buffer.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
};

async function uploadUserAvatarToCloudinary(buffer, email) {
  try {
    if (!email) {
      throw new Error("Avatar name is required");
    }

    if (!buffer) {
      throw new Error("Buffer is required");
    }

    let dataURL = bufferToDataURL(buffer);

    const uploadOptions = {
      folder: "greenwich-magazine/users",
      public_id: email,
      resource_type: "auto",
    };

    const uploadResult = await cloudinary.uploader.upload(
      dataURL,
      uploadOptions
    );
    return uploadResult.url;
  } catch (error) {
    throw error;
  }
}
async function uploadContributionImageToCloudinary(buffer, title) {
  try {
    if (!title) {
      throw new Error("Title is required");
    }

    if (!buffer) {
      throw new Error("Buffer is required");
    }

    let dataURL = bufferToDataURL(buffer);

    const uploadOptions = {
      folder: "greenwich-magazine/contributions",
      public_id: title,
      resource_type: "auto",
    };

    const uploadResult = await cloudinary.uploader.upload(
      dataURL,
      uploadOptions
    );
    return uploadResult.url;
  } catch (error) {
    throw error;
  }
}

const cloudinaryService = {
  uploadUserAvatarToCloudinary,
  uploadContributionImageToCloudinary,
};

module.exports = cloudinaryService;
