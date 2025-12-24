package com.unitree

import android.content.Context
import android.net.wifi.WifiManager
import com.facebook.react.bridge.*

class WifiModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WifiModule"

    @ReactMethod
    fun getWifiInfo(promise: Promise) {
        try {
            val wifiManager = reactApplicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val info = wifiManager.connectionInfo

            val map = Arguments.createMap()

            // Xử lý SSID
            var ssid = info.ssid
            if (ssid.startsWith("\"") && ssid.endsWith("\"")) {
                ssid = ssid.substring(1, ssid.length - 1)
            }

            map.putString("ssid", ssid)
            map.putString("bssid", info.bssid)
            map.putInt("rssi", info.rssi)

            // Tính toán level sóng (0-4)
            val level = WifiManager.calculateSignalLevel(info.rssi, 5)
            map.putInt("level", level)

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR_WIFI", e.message)
        }
    }
}