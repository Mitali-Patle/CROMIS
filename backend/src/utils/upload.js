import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
        );
    },
});

// Image-only filter
const imageFilter = (req, file, cb) => {
    const filetypes = /jpe?g|png|webp|gif/i;
    const extname = filetypes.test(path.extname(file.originalname));
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Images only!"), false);
};

// Image + document filter (Story 8)
const resourceFileFilter = (req, file, cb) => {
    const imageTypes = /jpe?g|png|webp|gif/i;
    const docTypes = /pdf|docx?|xlsx?|pptx?/i;
    const ext = path.extname(file.originalname);
    if (imageTypes.test(ext) || docTypes.test(ext)) {
        return cb(null, true);
    }
    cb(new Error("Unsupported file type"), false);
};

// Original image-only upload
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: imageFilter,
});

// Story 8: Resource upload (image + documents)
export const resourceUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for docs
    fileFilter: resourceFileFilter,
});

