// hhhhmm
const facultyService = require("../services/faculty.service");

// Tiếp theo là các hàm điều khiển, ví dụ:
exports.createFaculty = async (req, res) => {
  try {
    const result = await facultyService.createFaculty(req.body, req.file);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// API xem tất cả faculty
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await facultyService.getAllFaculties();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// API update faculty
exports.updateFaculty = async (req, res) => {
  try {
    const result = await facultyService.updateFaculty(
      req.params.id,
      req.body,
      req.file
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// API delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const result = await facultyService.deleteFaculty(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
