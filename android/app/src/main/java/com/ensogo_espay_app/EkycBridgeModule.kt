package com.ensogo_espay_app // Make sure this matches your project package

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.annotation.NonNull
import com.facebook.react.bridge.*
import com.google.gson.JsonObject
import com.vnptit.idg.sdk.activity.VnptIdentityActivity
import com.vnptit.idg.sdk.activity.VnptOcrActivity
import com.vnptit.idg.sdk.activity.VnptPortraitActivity
import com.vnptit.idg.sdk.utils.KeyIntentConstants
import com.vnptit.idg.sdk.utils.KeyResultConstants
import com.vnptit.idg.sdk.utils.SDKEnum

class EkycBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val TAG = "EkycBridgeModule"
    private val ekycRequestCode = 100
    private val logOcr = "LOG_OCR"
    private val logLivenessCardFront = "LOG_LIVENESS_CARD_FRONT"
    private val logLivenessCardRear = "LOG_LIVENESS_CARD_REAR"
    private val logCompare = "LOG_COMPARE"
    private val logLivenessFace = "LOG_LIVENESS_FACE"
    private val logMaskFace = "LOG_MASK_FACE"
    // Thêm các hằng số cho các khóa JSON mới để lưu đường dẫn ảnh
    private val logImageFrontPath = "IMAGE_FRONT_PATH"
    private val logImageBackPath = "IMAGE_BACK_PATH"
    private val logImageFacePath = "IMAGE_FACE_PATH"
    private val logImageFaceFarPath = "IMAGE_FACE_FAR_PATH"
    private val logImageFaceNearPath = "IMAGE_FACE_NEAR_PATH"

    private var mEkycPromise: Promise? = null

    init {
        Log.i(TAG, "Module initialized")
        // Add this module as an activity event listener
        reactApplicationContext.addActivityEventListener(this)
    }

    @NonNull
    override fun getName(): String {
        return "EkycBridge"
    }

    // Implement ActivityEventListener interface methods
    override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
    ) {
        Log.d(
                TAG,
                "onActivityResult: requestCode=$requestCode, resultCode=$resultCode, data=${data != null}"
        )

        if (requestCode == ekycRequestCode && resultCode == Activity.RESULT_OK) {
            if (data != null && mEkycPromise != null) {
                Log.d(TAG, "Processing successful eKYC result")

                val dataInfoResult =
                        data.getStringExtra(KeyResultConstants.OCR_RESULT)
                val dataLivenessCardFrontResult =
                        data.getStringExtra(
                                KeyResultConstants.LIVENESS_CARD_FRONT_RESULT
                        )
                val dataLivenessCardRearResult =
                        data.getStringExtra(
                                KeyResultConstants.LIVENESS_CARD_BACK_RESULT
                        )
                val dataCompareResult =
                        data.getStringExtra(KeyResultConstants.COMPARE_FACE_RESULT)
                val dataLivenessFaceResult =
                        data.getStringExtra(KeyResultConstants.LIVENESS_FACE_RESULT)
                val dataMaskedFaceResult =
                        data.getStringExtra(KeyResultConstants.MASKED_FACE_RESULT)

                // Trích xuất các đường dẫn ảnh
                val imageFrontPath =
                        data.getStringExtra(
                                KeyResultConstants.PATH_IMAGE_FRONT_FULL
                        )
                val imageBackPath =
                        data.getStringExtra(KeyResultConstants.PATH_IMAGE_BACK_FULL)
                val imageFacePath =
                        data.getStringExtra(KeyResultConstants.PATH_IMAGE_FACE_FULL)
                val imageFaceFarPath =
                        data.getStringExtra(
                                KeyResultConstants.PATH_IMAGE_FACE_FAR_FULL
                        )
                val imageFaceNearPath =
                        data.getStringExtra(
                                KeyResultConstants.PATH_IMAGE_FACE_NEAR_FULL
                        )

                Log.d(TAG, "OCR data received: ${dataInfoResult?.take(100)}...")
                Log.d(
                        TAG,
                        "Card front liveness check: ${dataLivenessCardFrontResult != null}"
                )
                Log.d(
                        TAG,
                        "Card rear liveness check: ${dataLivenessCardRearResult != null}"
                )
                Log.d(TAG, "Face comparison result: ${dataCompareResult != null}")
                Log.d(TAG, "Face liveness check: ${dataLivenessFaceResult != null}")
                Log.d(TAG, "Masked face check: ${dataMaskedFaceResult != null}")
                Log.d(TAG, "Front image path: $imageFrontPath")
                Log.d(TAG, "Back image path: $imageBackPath")
                Log.d(TAG, "Face image path: $imageFacePath")
                Log.d(TAG, "Face far image path: $imageFaceFarPath")
                Log.d(TAG, "Face near image path: $imageFaceNearPath")

                val json = JsonObject()
                json.addProperty(logOcr, dataInfoResult)
                json.addProperty(logLivenessCardFront, dataLivenessCardFrontResult)
                json.addProperty(logLivenessCardRear, dataLivenessCardRearResult)
                json.addProperty(logCompare, dataCompareResult)
                json.addProperty(logLivenessFace, dataLivenessFaceResult)
                json.addProperty(logMaskFace, dataMaskedFaceResult)
                // Thêm các đường dẫn ảnh vào đối tượng JSON
                json.addProperty(logImageFrontPath, imageFrontPath)
                json.addProperty(logImageBackPath, imageBackPath)
                json.addProperty(logImageFacePath, imageFacePath)
                json.addProperty(logImageFaceFarPath, imageFaceFarPath)
                json.addProperty(logImageFaceNearPath, imageFaceNearPath)

                Log.i(TAG, "Resolving promise with eKYC data")
                mEkycPromise?.resolve(json.toString())
            } else if (mEkycPromise != null) {
                Log.e(TAG, "Activity result OK but data is null")
                mEkycPromise?.reject("EKYC_ERROR", "No data returned from eKYC")
            } else {
                Log.w(TAG, "Activity result OK but promise is null")
            }
            mEkycPromise = null
        } else if (requestCode == ekycRequestCode) {
            Log.e(
                    TAG,
                    "eKYC failed or was cancelled by user, resultCode=$resultCode"
            )
            mEkycPromise?.reject(
                    "EKYC_CANCELLED",
                    "eKYC process cancelled or failed (code: $resultCode)"
            )
            mEkycPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Handle new intent if needed
        Log.d(TAG, "onNewIntent called")
    }

    // Helper method to safely get current activity
    private fun getCurrentActivitySafely(): Activity? {
        return reactApplicationContext.currentActivity
    }

    // Phương thức thực hiện eKYC luồng chỉ chụp ảnh chân dung
    // Bước 1 - chụp ảnh chân dung xa gần
    // Bước 2 - hiển thị kết quả
    @ReactMethod
    fun startEkycFace(authorization: String, promise: Promise) {
        Log.i(TAG, "startEkycFace called with token: ${authorization.take(10)}...")

        val currentActivity = getCurrentActivitySafely()
        if (currentActivity == null) {
            Log.e(TAG, "Current activity is null - waiting for activity to be ready")
            // Try to get activity again after a short delay
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val retryActivity = getCurrentActivitySafely()
                if (retryActivity == null) {
                    Log.e(TAG, "Current activity is still null after retry")
                    promise.reject("ACTIVITY_NULL", "Current activity is null. Please ensure the app is in the foreground and try again.")
                } else {
                    startEkycFaceInternal(authorization, promise, retryActivity)
                }
            }, 300)
            return
        }

        startEkycFaceInternal(authorization, promise, currentActivity)
    }

    private fun startEkycFaceInternal(authorization: String, promise: Promise, currentActivity: Activity) {
        try {
            mEkycPromise = promise
            Log.d(TAG, "Creating intent for VnptPortraitActivity")

            val intent =
                    getBaseIntent(currentActivity, VnptPortraitActivity::class.java, authorization)

            intent.putExtra(
                    KeyIntentConstants.VERSION_SDK,
                    SDKEnum.VersionSDKEnum.ADVANCED.getValue()
            )
            intent.putExtra(KeyIntentConstants.IS_ENABLE_COMPARE, false)
            intent.putExtra(KeyIntentConstants.IS_CHECK_MASKED_FACE, true)
            intent.putExtra(
                    KeyIntentConstants.CHECK_LIVENESS_FACE,
                    SDKEnum.ModeCheckLiveNessFace.iBETA.getValue()
            )

            Log.d(TAG, "Starting VnptPortraitActivity with requestCode=$ekycRequestCode")
            currentActivity.startActivityForResult(intent, ekycRequestCode)
            Log.i(TAG, "VnptPortraitActivity started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting eKYC face verification: ${e.message}", e)
            e.printStackTrace()
            promise.reject("EKYC_ERROR", "Error starting eKYC face verification: ${e.message}", e)
        }
    }

    // Phương thức thực hiện eKYC luồng "Chụp ảnh giấy tờ"
    // Bước 1 - chụp ảnh giấy tờ
    // Bước 2 - hiển thị kết quả
    @ReactMethod
    fun startEkycOcr(authorization: String, promise: Promise) {
        Log.i(TAG, "startEkycOcr called with token: ${authorization.take(10)}...")

        val currentActivity = getCurrentActivitySafely()
        if (currentActivity == null) {
            Log.e(TAG, "Current activity is null - waiting for activity to be ready")
            // Try to get activity again after a short delay
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val retryActivity = getCurrentActivitySafely()
                if (retryActivity == null) {
                    Log.e(TAG, "Current activity is still null after retry")
                    promise.reject("ACTIVITY_NULL", "Current activity is null. Please ensure the app is in the foreground and try again.")
                } else {
                    startEkycOcrInternal(authorization, promise, retryActivity)
                }
            }, 300)
            return
        }

        startEkycOcrInternal(authorization, promise, currentActivity)
    }

    private fun startEkycOcrInternal(authorization: String, promise: Promise, currentActivity: Activity) {
        try {
            mEkycPromise = promise
            Log.d(TAG, "Creating intent for VnptOcrActivity")

            val intent = getBaseIntent(currentActivity, VnptOcrActivity::class.java, authorization)

            intent.putExtra(
                    KeyIntentConstants.DOCUMENT_TYPE,
                    SDKEnum.DocumentTypeEnum.IDENTITY_CARD.getValue()
            )
            intent.putExtra(KeyIntentConstants.IS_CHECK_LIVENESS_CARD, true)
            intent.putExtra(
                    KeyIntentConstants.VALIDATE_DOCUMENT_TYPE,
                    SDKEnum.ValidateDocumentType.Basic.getValue()
            )

            Log.d(TAG, "Starting VnptOcrActivity with requestCode=$ekycRequestCode")
            currentActivity.startActivityForResult(intent, ekycRequestCode)
            Log.i(TAG, "VnptOcrActivity started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting eKYC OCR: ${e.message}", e)
            e.printStackTrace()
            promise.reject("EKYC_ERROR", "Error starting eKYC OCR: ${e.message}", e)
        }
    }

    // Phương thức thực hiện eKYC luồng đầy đủ bao gồm: Chụp ảnh giấy tờ và chụp ảnh chân dung
    // Bước 1 - chụp ảnh giấy tờ
    // Bước 2 - chụp ảnh chân dung xa gần
    // Bước 3 - hiển thị kết quả
    @ReactMethod
    fun startEkycFull(authorization: String, promise: Promise) {
        Log.i(TAG, "startEkycFull called with token: ${authorization.take(10)}...")

        val currentActivity = getCurrentActivitySafely()
        if (currentActivity == null) {
            Log.e(TAG, "Current activity is null - waiting for activity to be ready")
            // Try to get activity again after a short delay
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val retryActivity = getCurrentActivitySafely()
                if (retryActivity == null) {
                    Log.e(TAG, "Current activity is still null after retry")
                    promise.reject("ACTIVITY_NULL", "Current activity is null. Please ensure the app is in the foreground and try again.")
                } else {
                    startEkycFullInternal(authorization, promise, retryActivity)
                }
            }, 300)
            return
        }

        startEkycFullInternal(authorization, promise, currentActivity)
    }

    private fun startEkycFullInternal(authorization: String, promise: Promise, currentActivity: Activity) {
        try {
            mEkycPromise = promise
            Log.d(TAG, "Creating intent for VnptIdentityActivity")

            val intent =
                    getBaseIntent(currentActivity, VnptIdentityActivity::class.java, authorization)

            // Giá trị này xác định kiểu giấy tờ để sử dụng:
            // - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
            // - IDCardChipBased: Căn cước công dân gắn Chip
            // - Passport: Hộ chiếu
            // - DriverLicense: Bằng lái xe
            // - MilitaryIdCard: Chứng minh thư quân đội
            Log.d(TAG, "Setting document type: IDENTITY_CARD")
            intent.putExtra(
                    KeyIntentConstants.DOCUMENT_TYPE,
                    SDKEnum.DocumentTypeEnum.IDENTITY_CARD.getValue()
            )

            // Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
            Log.d(TAG, "Enabling face comparison")
            intent.putExtra(KeyIntentConstants.IS_ENABLE_COMPARE, true)

            // Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
            Log.d(TAG, "Enabling card liveness check")
            intent.putExtra(KeyIntentConstants.IS_CHECK_LIVENESS_CARD, true)

            // Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
            // - NoneCheckFace: Không thực hiện kiểm tra ảnh chân dung chụp trực tiếp hay không
            // - iBETA: Kiểm tra ảnh chân dung chụp trực tiếp hay không iBeta (phiên bản hiện tại)
            // - Standard: Kiểm tra ảnh chân dung chụp trực tiếp hay không Standard (phiên bản mới)
            Log.d(TAG, "Setting face liveness check mode: iBETA")
            intent.putExtra(
                    KeyIntentConstants.CHECK_LIVENESS_FACE,
                    SDKEnum.ModeCheckLiveNessFace.iBETA.getValue()
            )

            // Bật/Tắt chức năng kiểm tra che mặt
            Log.d(TAG, "Enabling masked face detection")
            intent.putExtra(KeyIntentConstants.IS_CHECK_MASKED_FACE, true)

            // Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
            // - None: Không thực hiện kiểm tra ảnh khi chụp ảnh giấy tờ
            // - Basic: Kiểm tra sau khi chụp ảnh
            // - MediumFlip: Kiểm tra ảnh hợp lệ trước khi chụp (lật giấy tờ thành công → hiển thị
            // nút chụp)
            // - Advance: Kiểm tra ảnh hợp lệ trước khi chụp (hiển thị nút chụp)
            Log.d(TAG, "Setting document validation type: Basic")
            intent.putExtra(
                    KeyIntentConstants.VALIDATE_DOCUMENT_TYPE,
                    SDKEnum.ValidateDocumentType.Basic.getValue()
            )

            // Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường
            // tương ứng hay không.
            Log.d(TAG, "Enabling postcode validation")
            intent.putExtra(KeyIntentConstants.IS_VALIDATE_POSTCODE, true)

            // Giá trị này xác định phiên bản khi sử dụng Máy ảnh tại bước chụp ảnh chân dung luồng
            // full. Mặc định là Normal ✓
            // - Normal: chụp ảnh chân dung 1 hướng
            // - ProOval: chụp ảnh chân dung xa gần
            Log.d(TAG, "Setting SDK version: ADVANCED")
            intent.putExtra(
                    KeyIntentConstants.VERSION_SDK,
                    SDKEnum.VersionSDKEnum.ADVANCED.getValue()
            )

            Log.d(TAG, "Starting VnptIdentityActivity with requestCode=$ekycRequestCode")
            currentActivity.startActivityForResult(intent, ekycRequestCode)
            Log.i(TAG, "VnptIdentityActivity started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting eKYC: ${e.message}", e)
            e.printStackTrace()
            promise.reject("EKYC_ERROR", "Error starting eKYC: ${e.message}", e)
        }
    }

    private fun <T> getBaseIntent(
            activity: Activity,
            activityClass: Class<T>,
            authorization: String
    ): Intent {
        try {
            Log.d(TAG, "Creating base intent for ${activityClass.simpleName}")
            val intent = Intent(activity, activityClass)

            // Debug the received token
            Log.d(TAG, "EKYC authorization token: ${authorization.take(20)}...")

            // Nhập thông tin bộ mã truy cập. Lấy tại mục Quản lý Token
            // https://ekyc.vnpt.vn/admin-dashboard/console/project-manager
            intent.putExtra(KeyIntentConstants.ACCESS_TOKEN, authorization)
            intent.putExtra(KeyIntentConstants.TOKEN_ID, "33e85608-bd3d-5efe-e063-63199f0a70db")
            intent.putExtra(
                    KeyIntentConstants.TOKEN_KEY,
                    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI1IXCzLwnW+4Om8LPv9GUUAzZpthtS7ECAHTiE0zYunR3yd/PN3MCgBYrfbw4jJDeUaJXJeJUe6BKMbgGJ2lMcCAwEAAQ=="
            )
            Log.d(TAG, "Setting token ID and key")

            // Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay
            // đổi.
            intent.putExtra(KeyIntentConstants.CHALLENGE_CODE, "INNOVATIONCENTER")
            Log.d(TAG, "Setting challenge code: INNOVATIONCENTER")

            // Ngôn ngữ sử dụng trong SDK
            // - VIETNAMESE: Tiếng Việt
            // - ENGLISH: Tiếng Anh
            intent.putExtra(
                    KeyIntentConstants.LANGUAGE_SDK,
                    SDKEnum.LanguageEnum.VIETNAMESE.getValue()
            )
            Log.d(TAG, "Setting language: VIETNAMESE")

            // Bật/Tắt Hiển thị màn hình hướng dẫn
            intent.putExtra(KeyIntentConstants.IS_SHOW_TUTORIAL, true)
            Log.d(TAG, "Enabling tutorial screens")

            // Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng
            // video
            intent.putExtra(KeyIntentConstants.IS_ENABLE_GOT_IT, true)
            Log.d(TAG, "Enabling 'Got it' button")

            // Sử dụng máy ảnh mặt trước
            // - FRONT: Camera trước
            // - BACK: Camera sau
            intent.putExtra(
                    KeyIntentConstants.CAMERA_POSITION_FOR_PORTRAIT,
                    SDKEnum.CameraTypeEnum.FRONT.getValue()
            )
            Log.d(TAG, "Setting camera position: FRONT")

            return intent
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create eKYC intent: ${e.message}", e)
            e.printStackTrace()
            throw Exception("Failed to create eKYC intent: ${e.message}")
        }
    }
}
