//
//  EkycBridgeModule.m
//  SampleEkycIntergrated
//
//  Created by Longcon99 on 30/05/2023.
//

#import <Foundation/Foundation.h>
#import "EkycBridgeModule.h"
#import "ICSdkEKYC/ICSdkEKYC.h"


@implementation EkycBridgeModule {
  BOOL _isPresenting;
}

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE(EkycBridge);

RCT_EXPORT_METHOD(startEkycFull:(NSString *)authorization resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"🔍 [EKYC-BRIDGE] startEkycFull called");

  // Check if already presenting
  if (_isPresenting) {
    NSLog(@"🔍 [EKYC-BRIDGE] SDK already presenting, rejecting...");
    reject(@"ALREADY_PRESENTING", @"SDK is already being presented", nil);
    return;
  }

  // Reset SDK state before starting new session
  NSLog(@"🔍 [EKYC-BRIDGE] Resetting SDK state...");
  [ICEKYCSavedData.shared resetOrInitAllData];
  NSLog(@"🔍 [EKYC-BRIDGE] SDK state reset complete");

  // Initialize SDK parameters before starting
  NSLog(@"🔍 [EKYC-BRIDGE] Initializing SDK parameters...");
  [self initParamSdk:authorization];
  NSLog(@"🔍 [EKYC-BRIDGE] SDK parameters initialized");

  self._resolve = resolve;
  self._reject = reject;

  NSLog(@"🔍 [EKYC-BRIDGE] Creating camera module...");
  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  NSLog(@"🔍 [EKYC-BRIDGE] Camera module created");

  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;

  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = full;

  camera.isEnableCompare = YES;

  /// xác định xác thực khuôn mặt bằng oval xa gần
  camera.versionSdk = ProOval;

  /// Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
  camera.isCompareFaces = YES;

  /// Bật/Tắt chức năng kiểm tra che mặt
  camera.isCheckMaskedFace = YES;

  /// Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
  camera.isCheckLivenessCard = YES;

  /// Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
  /// - None: Không thực hiện kiểm tra ảnh khi chụp ảnh giấy tờ
  /// - Basic: Kiểm tra sau khi chụp ảnh
  /// - MediumFlip: Kiểm tra ảnh hợp lệ trước khi chụp (lật giấy tờ thành công → hiển thị nút chụp)
  /// - Advance: Kiểm tra ảnh hợp lệ trước khi chụp (hiển thị nút chụp)
  camera.validateDocumentType = Basic;

  /// Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường tương ứng hay không.
  camera.isValidatePostcode = YES;

  /// Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
  /// - NoneCheckFace: Không thực hiện kiểm tra ảnh chân dung chụp trực tiếp hay không
  /// - iBETA: Kiểm tra ảnh chân dung chụp trực tiếp hay không iBeta (phiên bản hiện tại)
  /// - Standard: Kiểm tra ảnh chân dung chụp trực tiếp hay không Standard (phiên bản mới)
  camera.checkLivenessFace = IBeta;

  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";

  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";

  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;

  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;

  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;

  NSLog(@"🔍 [EKYC-BRIDGE] Presenting camera view controller...");
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;

    // Dismiss any existing presented view controllers first
    if (root.presentedViewController) {
      NSLog(@"🔍 [EKYC-BRIDGE] Dismissing existing view controller...");
      [root.presentedViewController dismissViewControllerAnimated:NO completion:^{
        NSLog(@"🔍 [EKYC-BRIDGE] Existing view controller dismissed");
        [self presentCamera:camera fromRoot:root];
      }];
    } else {
      [self presentCamera:camera fromRoot:root];
    }
  });
};

- (void)presentCamera:(ICEkycCameraViewController *)camera fromRoot:(UIViewController *)root {
  NSLog(@"🔍 [EKYC-BRIDGE] Setting up camera presentation...");
  _isPresenting = YES;

  [camera setModalPresentationStyle:UIModalPresentationFullScreen];
  [root presentViewController:camera animated:YES completion:^{
    NSLog(@"🔍 [EKYC-BRIDGE] Camera view controller presented successfully");
  }];
}

RCT_EXPORT_METHOD(startEkycOcr:(NSString *)authorization resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Hello world");

  // Initialize SDK parameters before starting
  [self initParamSdk:authorization];

  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;

  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;

  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = ocr;

  /// Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
  camera.isCheckLivenessCard = YES;

  /// Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
  /// - None: Không thực hiện kiểm tra ảnh khi chụp ảnh giấy tờ
  /// - Basic: Kiểm tra sau khi chụp ảnh
  /// - MediumFlip: Kiểm tra ảnh hợp lệ trước khi chụp (lật giấy tờ thành công → hiển thị nút chụp)
  /// - Advance: Kiểm tra ảnh hợp lệ trước khi chụp (hiển thị nút chụp)
  camera.validateDocumentType = Basic;

  /// Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường tương ứng hay không.
  camera.isValidatePostcode = YES;

  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";

  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";

  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;

  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;

  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);

    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];

    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }

  });

};


RCT_EXPORT_METHOD(startEkycFace:(NSString *)authorization resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Hello world");

  // Initialize SDK parameters before starting
  [self initParamSdk:authorization];

  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;

  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;

  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = face;

  /// xác định xác thực khuôn mặt bằng oval xa gần
  camera.versionSdk = ProOval;

  /// Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
  camera.isCompareFaces = YES;

  /// Bật/Tắt chức năng kiểm tra che mặt
  camera.isCheckMaskedFace = YES;

  /// Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
  /// - NoneCheckFace: Không thực hiện kiểm tra ảnh chân dung chụp trực tiếp hay không
  /// - iBETA: Kiểm tra ảnh chân dung chụp trực tiếp hay không iBeta (phiên bản hiện tại)
  /// - Standard: Kiểm tra ảnh chân dung chụp trực tiếp hay không Standard (phiên bản mới)
  camera.checkLivenessFace = IBeta;

  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";

  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";

  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;

  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;

  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;


  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);

    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];

    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }

  });

};


-(void) initParamSdk:(NSString *)authorization {
  ICEKYCSavedData.shared.tokenKey = @"MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI1IXCzLwnW+4Om8LPv9GUUAzZpthtS7ECAHTiE0zYunR3yd/PN3MCgBYrfbw4jJDeUaJXJeJUe6BKMbgGJ2lMcCAwEAAQ==";
  ICEKYCSavedData.shared.tokenId = @"33e85608-bd3d-5efe-e063-63199f0a70db";
  ICEKYCSavedData.shared.authorization = authorization;
}


#pragma mark - Delegate
- (void)icEkycGetResult {
  _isPresenting = NO;

  NSString* dataInfoResult = ICEKYCSavedData.shared.ocrResult;
  NSString* dataLivenessCardFrontResult = ICEKYCSavedData.shared.livenessCardFrontResult;
  NSString* dataLivenessCardRearResult = ICEKYCSavedData.shared.livenessCardBackResult;
  NSString* dataCompareResult = ICEKYCSavedData.shared.compareFaceResult;
  NSString* dataLivenessFaceResult = ICEKYCSavedData.shared.livenessFaceResult;
  NSString* dataMaskedFaceResult = ICEKYCSavedData.shared.maskedFaceResult;

  // Lấy các đường dẫn ảnh từ SDK giống như Android
  NSURL* pathImageFront = [ICEKYCSavedData shared].pathImageFront;
  NSURL* pathImageCropedFront = [ICEKYCSavedData shared].pathImageCropedFront;
  NSURL* pathImageBack = [ICEKYCSavedData shared].pathImageBack;
  NSURL* pathImageCropedBack = [ICEKYCSavedData shared].pathImageCropedBack;

  // Convert NSURL to NSString paths, ưu tiên ảnh đã cắt (cropped) nếu có
  NSString* imageFrontPath = nil;
  NSString* imageBackPath = nil;

  if (pathImageCropedFront && pathImageCropedFront.path) {
    imageFrontPath = pathImageCropedFront.path;
  } else if (pathImageFront && pathImageFront.path) {
    imageFrontPath = pathImageFront.path;
  }

  if (pathImageCropedBack && pathImageCropedBack.path) {
    imageBackPath = pathImageCropedBack.path;
  } else if (pathImageBack && pathImageBack.path) {
    imageBackPath = pathImageBack.path;
  }

  // Thử lấy đường dẫn ảnh face nếu SDK cung cấp
  NSString* imageFaceNearPath = nil;
  NSString* imageFaceFarPath = nil;

  // Kiểm tra xem SDK có cung cấp đường dẫn ảnh face không
  if ([ICEKYCSavedData.shared respondsToSelector:@selector(pathImageFaceNear)]) {
    NSURL* pathImageFaceNear = [ICEKYCSavedData.shared performSelector:@selector(pathImageFaceNear)];
    if (pathImageFaceNear && pathImageFaceNear.path) {
      imageFaceNearPath = pathImageFaceNear.path;
    }
  }

  if ([ICEKYCSavedData.shared respondsToSelector:@selector(pathImageFaceFar)]) {
    NSURL* pathImageFaceFar = [ICEKYCSavedData.shared performSelector:@selector(pathImageFaceFar)];
    if (pathImageFaceFar && pathImageFaceFar.path) {
      imageFaceFarPath = pathImageFaceFar.path;
    }
  }

  NSLog(@"🔍 [EKYC-BRIDGE] Image paths extracted:");
  NSLog(@"🔍 [EKYC-BRIDGE] Front image path: %@", imageFrontPath ?: @"(null)");
  NSLog(@"🔍 [EKYC-BRIDGE] Back image path: %@", imageBackPath ?: @"(null)");
  NSLog(@"🔍 [EKYC-BRIDGE] Face near image path: %@", imageFaceNearPath ?: @"(null)");
  NSLog(@"🔍 [EKYC-BRIDGE] Face far image path: %@", imageFaceFarPath ?: @"(null)");

  // Tạo dictionary với cả dữ liệu gốc và đường dẫn ảnh
  NSMutableDictionary* dict = [@{
    @"LOG_OCR": dataInfoResult ?: @"",
    @"LOG_LIVENESS_CARD_FRONT": dataLivenessCardFrontResult ?: @"",
    @"LOG_LIVENESS_CARD_REAR": dataLivenessCardRearResult ?: @"",
    @"LOG_COMPARE": dataCompareResult ?: @"",
    @"LOG_LIVENESS_FACE": dataLivenessFaceResult ?: @"",
    @"LOG_MASK_FACE": dataMaskedFaceResult ?: @""
  } mutableCopy];

  // Thêm các đường dẫn ảnh nếu có (giống như Android)
  if (imageFrontPath) {
    [dict setObject:imageFrontPath forKey:@"IMAGE_FRONT_PATH"];
  }
  if (imageBackPath) {
    [dict setObject:imageBackPath forKey:@"IMAGE_BACK_PATH"];
  }
  if (imageFaceNearPath) {
    [dict setObject:imageFaceNearPath forKey:@"IMAGE_FACE_NEAR_PATH"];
  }
  if (imageFaceFarPath) {
    [dict setObject:imageFaceFarPath forKey:@"IMAGE_FACE_FAR_PATH"];
  }

  NSError* error;
  NSData* data = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&error];

  if (error) {
    NSLog(@"🔍 [EKYC-BRIDGE] Failed to serialize results: %@", error);
    self._reject(@"SERIALIZE_ERROR", @"Failed to serialize eKYC results", error);
    return;
  }

  NSString* resultJson = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  NSLog(@"🔍 [EKYC-BRIDGE] Sending results to React Native");
  self._resolve(resultJson);
}

- (void)icEkycCameraClosedWithType:(ScreenType)type {
  NSLog(@"🔍 [EKYC-BRIDGE] Camera closed with type: %ld", (long)type);
  _isPresenting = NO;

  // If we have a reject callback and no result was sent, send a cancellation
  if (self._reject) {
    NSLog(@"🔍 [EKYC-BRIDGE] No result received - treating as cancellation");
    self._reject(@"USER_CANCELLED", @"User cancelled the eKYC process", nil);
  }
}

@end
