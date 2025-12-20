import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// Define the Multer options
export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads'); // Use relative path
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    const supportedFiles = /\.(jpg|jpeg|png|pdf|docx)$/i;
    if (supportedFiles.test(extname(file.originalname))) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type'), false); // Reject the file
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB size limit
  },
};
