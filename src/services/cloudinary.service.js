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

async function deleteUserImageFromCloudinary(title) {
  try {
    if (!title) {
      throw new Error("Title is required");
    }
    await cloudinary.uploader.destroy("greenwich-magazine/users/" + title);
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
      folder: "greenwich-magazine/contributions/images",
      public_id: title,
      resource_type: "auto",
    };

    const uploadResult = await cloudinary.uploader.upload(
      dataURL,
      uploadOptions
    );

    console.log("New updated image URL: " + uploadResult.url);

    return uploadResult.url;
  } catch (error) {
    throw error;
  }
}

async function uploadContributionDocumentToCloudinary(buffer, title) {
  try {
    if (!title) {
      throw new Error("Title is required");
    }

    if (!buffer) {
      throw new Error("Buffer is required");
    }

    const uploadOptions = {
      folder: "greenwich-magazine/contributions/documents",
      public_id: title,
      resource_type: "raw",
    };

    let uploadResult = null;

    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(
              new Error(error.message || "Failed to upload to Cloudinary")
            );
            return;
          }
          uploadResult = result;
          resolve();
        })
        .end(buffer);
    });

    if (!uploadResult || !uploadResult.url) {
      throw new Error("Failed to get the URL from upload result");
    }

    console.log("New updated document URL: " + uploadResult.url);

    return uploadResult.url;
  } catch (error) {
    console.log("Error uploading document: ", error);
    throw error;
  }
}

const deleteContributionImageFromCloudinary = async (title) => {
  try {
    if (!title) {
      throw new Error("Title is required");
    }
    console.log("Deleting image: " + title);

    await cloudinary.uploader.destroy(
      "greenwich-magazine/contributions/images/" + title
    );
  } catch (error) {
    throw error;
  }
};

async function deleteContributionDocumentFromCloudinary(title) {
  try {
    if (!title) {
      throw new Error("Title is required");
    }
    console.log("Deleting document: " + title);

    await await cloudinary.uploader.destroy(
      "greenwich-magazine/contributions/documents/" + title,
      { resource_type: "raw" }
    );
  } catch (error) {
    throw error;
  }
}

const cloudinaryService = {
  uploadUserAvatarToCloudinary,
  uploadContributionImageToCloudinary,
  uploadContributionDocumentToCloudinary,
  deleteUserImageFromCloudinary,
  deleteContributionImageFromCloudinary,
  deleteContributionDocumentFromCloudinary,
};

module.exports = cloudinaryService;
