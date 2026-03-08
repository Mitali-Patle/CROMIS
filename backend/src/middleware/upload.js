import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
<<<<<<< HEAD
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
=======
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
<<<<<<< HEAD
  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
=======
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
