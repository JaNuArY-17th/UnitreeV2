package com.ensogo_espay_app

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {
  private val TAG = "MainActivity"
  private var firstFocusEvent = true
  private var hasCalledSuper = false
  private val EKYC_REQUEST_CODE = 100

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ENSOGO_ESPay_App"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Fix for react-native-screens fragment restoration issue
   * See: https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    Log.d(TAG, "onCreate: Called, savedInstanceState=${savedInstanceState != null}")
    SplashScreen.show(this)  // here
    super.onCreate(null)
  }

  /**
   * Complete fix for Unhandled SoftException related to React context not being ready
   * This implementation completely avoids calling super on the very first focus gain event
   * which is when the error occurs
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    Log.d(TAG, "onWindowFocusChanged: hasFocus=$hasFocus, firstFocus=$firstFocusEvent")

    if (firstFocusEvent && hasFocus) {
      firstFocusEvent = false
      Log.d(TAG, "onWindowFocusChanged: Skipping super call on first focus")
      return
    }

    Log.d(TAG, "onWindowFocusChanged: Calling super")
    super.onWindowFocusChanged(hasFocus)
    hasCalledSuper = true
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    Log.d(TAG, "onActivityResult: requestCode=$requestCode, resultCode=$resultCode, firstFocus=$firstFocusEvent")

    if (requestCode == EKYC_REQUEST_CODE && firstFocusEvent) {
      Log.d(TAG, "onActivityResult: EKYC result received but context not ready, returning without calling super")
      return
    }

    Log.d(TAG, "onActivityResult: Calling super")
    super.onActivityResult(requestCode, resultCode, data)
  }
}
