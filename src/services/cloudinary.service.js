const cloudinary = require("../config/cloudinary.config");

const bufferToDataURL = (buffer) => {
  let base64 = buffer.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
};

// Files related to user
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

async function deleteUserImageFromCloudinary(email) {
  try {
    if (!email) {
      throw new Error("Email is required");
    }
    await cloudinary.uploader.destroy("greenwich-magazine/users/" + email);
  } catch (error) {
    throw error;
  }
}

async function getContributionImageInCloudinary(imageURL) {
  try {
    if (!imageURL) {
      throw new Error("Image URL is required");
    }

    const urlParts = imageURL.split("/");
    const publicId = decodeURIComponent(
      urlParts
        .slice(urlParts.indexOf("greenwich-magazine"))
        .join("/")
        .split(".")[0]
    );

    const imageResult = await cloudinary.api.resource(publicId);
    console.log("Successfully got contribution image: " + imageResult.url);
    return imageResult.url;
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

    // Remove file extension from title
    const titleWithoutExtension = title.replace(/\.[^/.]+$/, "");

    const uploadOptions = {
      folder: "greenwich-magazine/contributions/images",
      public_id: titleWithoutExtension,
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

const deleteContributionImageFromCloudinary = async (imageURL) => {
  try {
    if (!imageURL) {
      throw new Error("Image URL is required");
    }

    const urlParts = imageURL.split("/");
    const publicId = decodeURIComponent(
      urlParts
        .slice(urlParts.indexOf("greenwich-magazine"))
        .join("/")
        .split(".")[0]
    );

    console.log("Deleting contribution image: " + publicId);

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

async function removeContributionImageFromCloudinaryByTitle(title) {
  try {
    if (!title) {
      throw new Error("Title is required");
    }

    const publicId = title.split(".")[0];
    console.log("Deleting contribution image: " + publicId);

    await cloudinary.uploader.destroy(
      "greenwich-magazine/contributions/images/" + publicId
    );
  } catch (error) {
    throw error;
  }
}

// Files related to faculties
async function uploadFacultyImageToCloudinary(buffer, name) {
  try {
    if (!name) {
      throw new Error("Name is required");
    }

    if (!buffer) {
      throw new Error("Buffer is required");
    }

    let dataURL = bufferToDataURL(buffer);

    const uploadOptions = {
      folder: "greenwich-magazine/faculties",
      public_id: name,
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

const deleteFacultyImageFromCloudinary = async (name) => {
  try {
    if (!name) {
      throw new Error("Name is required");
    }

    const formatNameToPublicId = name.split(" ").join("").toLowerCase();

    console.log("Deleting faculty image: " + formatNameToPublicId);

    await cloudinary.uploader
      .destroy("greenwich-magazine/faculties/" + formatNameToPublicId)
      .then((result) => {
        console.log(result);
      });
  } catch (error) {
    throw error;
  }
};

const checkIfContributionImageExists = async (title) => {
  try {
    if (!title) {
      throw new Error("Title is required");
    }

    const folderPath = "greenwich-magazine/contributions/images";
    const result = await cloudinary.search
      .expression(`public_id:${folderPath}/${title}`)
      .execute();

    return result.total_count > 0;
  } catch (error) {
    throw error;
  }
};

const cloudinaryService = {
  getContributionImageInCloudinary,
  uploadUserAvatarToCloudinary,
  uploadContributionImageToCloudinary,
  uploadFacultyImageToCloudinary,
  deleteUserImageFromCloudinary,
  deleteContributionImageFromCloudinary,
  deleteFacultyImageFromCloudinary,
  removeContributionImageFromCloudinaryByTitle,
  checkIfContributionImageExists,
};

module.exports = cloudinaryService;
