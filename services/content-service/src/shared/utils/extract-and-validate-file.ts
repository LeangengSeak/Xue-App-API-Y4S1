import { UploadedFile } from "express-fileupload";
import { BadRequestException } from "./catch-errors";

export const extractAndValidateFile = (
  fileField: string,
  files: any,
  allowedTypes: string[]
): UploadedFile => {
  if (!files || !files[fileField]) {
    throw new BadRequestException(`${fileField} file is required`);
  }

  let file: UploadedFile;

  Array.isArray(files[fileField])
    ? (file = files[fileField][0])
    : (file = files[fileField]);

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type for ${fileField}. Allowed types are: ${allowedTypes.join(
        ", "
      )}`
    );
  }

  return file;
};

export default extractAndValidateFile;
