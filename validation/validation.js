import path from 'path';

export const imageValidator = (value, { req }) => {
  if (req.body.imageUrl) {
    return true;
  } else {
    if (!req.file) {
      throw new Error('Nie wybrano pliku zdjęciowego.');
    }
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    const extension = path.extname(req.file.originalname);
    if (!allowedExtensions.test(extension)) {
      throw new Error('Dozwolone rozszerzenia plików to .jpg, .jpeg, .png');
    }
    return true;
  }
};
