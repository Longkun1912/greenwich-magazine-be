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

// Files related to contributions
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

const cloudinaryService = {
  uploadUserAvatarToCloudinary,
  uploadContributionImageToCloudinary,
  uploadFacultyImageToCloudinary,
  deleteUserImageFromCloudinary,
  deleteContributionImageFromCloudinary,
  deleteFacultyImageFromCloudinary,
};

module.exports = cloudinaryService;
