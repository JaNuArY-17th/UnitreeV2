// Utility functions for eKYC

/**
 * Tạo đối tượng file từ đường dẫn ảnh từ SDK
 * @param imagePath Đường dẫn ảnh từ SDK
 * @param fileName Tên file
 * @returns Đối tượng file để upload
 */
export const createFileFromPath = (imagePath: string, fileName: string) => {
  if (!imagePath) {
    return null;
  }

  return {
    uri: imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`,
    type: 'image/jpeg',
    name: fileName,
  };
};

/**
 * Tạo đối tượng file từ các đường dẫn ảnh từ SDK eKYC
 * @param imagePaths Đối tượng chứa các đường dẫn ảnh từ SDK
 * @returns Đối tượng chứa các file objects để upload
 */
export const createFilesFromImagePaths = (imagePaths: {
  frontPath?: string;
  backPath?: string;
  facePath?: string;
  faceNearPath?: string;
  faceFarPath?: string;
}) => {
  const files: { [key: string]: any } = {};

  if (imagePaths.frontPath) {
    files.frontCard = createFileFromPath(imagePaths.frontPath, 'front_card.jpg');
  }

  if (imagePaths.backPath) {
    files.backCard = createFileFromPath(imagePaths.backPath, 'back_card.jpg');
  }

  if (imagePaths.faceNearPath) {
    files.nearFace = createFileFromPath(imagePaths.faceNearPath, 'face_near.jpg');
  }

  if (imagePaths.faceFarPath) {
    files.farFace = createFileFromPath(imagePaths.faceFarPath, 'face_far.jpg');
  }

  // Fallback cho facePath nếu không có faceNearPath
  if (!files.nearFace && imagePaths.facePath) {
    files.nearFace = createFileFromPath(imagePaths.facePath, 'face_near.jpg');
  }

  return files;
};

/**
 * Định dạng chuỗi ngày tháng thành định dạng DD/MM/YYYY
 * @param dateString Chuỗi ngày tháng cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng DD/MM/YYYY
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) { return ''; }

  // Check if already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  try {
    // Try different formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // YYYY-MM-DD format
      const [year, month, day] = dateString.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate;
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      // DD-MM-YYYY format
      const formattedDate = dateString.replace(/-/g, '/');
      return formattedDate;
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      // Possibly a format with single-digit day or month (e.g., 1/8/2002)
      const parts = dateString.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate;
    } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      // Possibly a format with single-digit day or month with hyphens (e.g., 1-8-2002)
      const parts = dateString.split('-');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate;
    } else {
      // Try to parse as Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate;
    }
  } catch (error) {
    return '';
  }
};

/**
 * Định dạng chuỗi ngày tháng thành định dạng YYYY-MM-DD
 * @param dateString Chuỗi ngày tháng cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) { return ''; }

  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  try {
    // Try different formats
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      // DD/MM/YYYY format
      const [day, month, year] = dateString.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      // DD-MM-YYYY format
      const [day, month, year] = dateString.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      // Possibly a format with single-digit day or month (e.g., 1/8/2002)
      const parts = dateString.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      // Possibly a format with single-digit day or month with hyphens (e.g., 1-8-2002)
      const parts = dateString.split('-');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else {
      // Try to parse as Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    }
  } catch (error) {
    return '';
  }
};

/**
 * Kiểm tra dữ liệu OCR và trả về lỗi nếu có
 * @param verifiedData Dữ liệu đã xác thực
 * @returns true nếu có lỗi, false nếu không
 */
export const checkInvalidOcrData = (verifiedData: {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
}): boolean => {
  return !verifiedData.fullName ||
    !verifiedData.dateOfBirth ||
    !verifiedData.idNumber ||
    !verifiedData.address;
};

/**
 * Ghi log debug cho eKYC với định dạng nhất quán
 * @param component Tên component/module đang log
 * @param message Thông điệp cần log
 * @param data Dữ liệu liên quan (nếu có)
 * @param isError Xác định có phải là lỗi không
 */
export const ekycDebugLog = (
  _component: string,
  _message: string,
  _data?: any,
  _isError: boolean = false
): void => {
  // Debug logging disabled in production
};

/**
 * Ghi log thông tin thiết bị và môi trường
 * Hữu ích khi debug các vấn đề tương thích
 */
export const logDeviceInfo = async (): Promise<any> => {
  try {
    const { Platform, Dimensions, NativeModules } = require('react-native');
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      apiLevel: Platform.OS === 'android' ? Platform.constants.Release : null,
      model: Platform.OS === 'ios' ? Platform.constants.model : null,
      brand: Platform.OS === 'android' ? Platform.constants.Brand : null,
      screenDimensions: Dimensions.get('window'),
      isAvailable: Platform.OS === 'ios' ||
        (Platform.OS === 'android' && !!NativeModules.EkycBridge),
    };
    return deviceInfo;
  } catch (error) {
    return { error: 'Failed to get device info' };
  }
};

/**
 * Tạo ngày cấp mặc định (5 năm trước từ ngày hiện tại)
 * @returns Chuỗi ngày ở định dạng YYYY-MM-DD
 */
export const getDefaultIssueDateString = (): string => {
  const today = new Date();
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);

  const year = fiveYearsAgo.getFullYear();
  const month = String(fiveYearsAgo.getMonth() + 1).padStart(2, '0');
  const day = String(fiveYearsAgo.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
