import { base64ToFile } from '../ekycUtils';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  exists: jest.fn(),
  DocumentDirectoryPath: '/mock/documents',
  TemporaryDirectoryPath: '/mock/temp',
  CachesDirectoryPath: '/mock/cache',
  readdir: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

describe('ekycUtils - base64ToFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Android file path handling', () => {
    beforeAll(() => {
      (Platform as any).OS = 'android';
    });

    it('should handle existing file path successfully', async () => {
      const mockPath = '/data/user/0/com.otcstockapp/app_imageDir/front_full.jpg';
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      const result = await base64ToFile(mockPath, 'front_card.jpg');

      expect(result).toEqual({
        uri: `file://${mockPath}`,
        type: 'image/jpeg',
        name: 'front_card.jpg',
      });
    });

    it('should retry when file is not immediately available', async () => {
      const mockPath = '/data/user/0/com.otcstockapp/app_imageDir/front_full.jpg';
      (RNFS.exists as jest.Mock)
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(false) // Second attempt fails
        .mockResolvedValueOnce(true);  // Third attempt succeeds

      const result = await base64ToFile(mockPath, 'front_card.jpg');

      expect(RNFS.exists).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        uri: `file://${mockPath}`,
        type: 'image/jpeg',
        name: 'front_card.jpg',
      });
    });

    it('should return direct path when file is not accessible via RNFS', async () => {
      const mockPath = '/data/user/0/com.otcstockapp/app_imageDir/front_full.jpg';
      (RNFS.exists as jest.Mock).mockResolvedValue(false);

      const result = await base64ToFile(mockPath, 'front_card.jpg');

      expect(result).toEqual({
        uri: `file://${mockPath}`,
        type: 'image/jpeg',
        name: 'front_card.jpg',
      });
    });

    it('should handle RNFS.exists throwing error', async () => {
      const mockPath = '/data/user/0/com.otcstockapp/app_imageDir/front_full.jpg';
      (RNFS.exists as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const result = await base64ToFile(mockPath, 'front_card.jpg');

      expect(result).toEqual({
        uri: `file://${mockPath}`,
        type: 'image/jpeg',
        name: 'front_card.jpg',
      });
    });
  });

  describe('Base64 handling', () => {
    it('should handle base64 data URLs', async () => {
      const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';
      
      const result = await base64ToFile(base64Data, 'image.jpg');

      expect(result).toBe(base64Data);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid input', async () => {
      await expect(base64ToFile('invalid-data', 'test.jpg'))
        .rejects
        .toThrow('Không thể xử lý hình ảnh cho test.jpg');
    });
  });
});
