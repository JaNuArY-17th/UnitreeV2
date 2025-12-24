//
//  WifiManger.swift
//  Unitree
//
//  Created by Long Nguyễn on 24/12/25.
//

import <React/RCTBridgeModule.h>
import Foundation
import NetworkExtension
import CoreLocation

@objc(WifiManager)
class WifiManager: NSObject {

  @objc
  func getWifiInfo(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    // fetchCurrent chạy bất đồng bộ
    NEHotspotNetwork.fetchCurrent { network in
      if let network = network {
        let result: [String: Any] = [
          "ssid": network.ssid,
          "bssid": network.bssid
        ]
        resolve(result)
      } else {
        // Trả về null hoặc lỗi nếu không lấy được (có thể do chưa bật Wifi hoặc chưa cấp quyền)
        resolve(nil)
      }
    }
  }

  // Bắt buộc phải có để chạy trên thread chính hoặc nền
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
