//
//  WifiManager.m
//  Unitree
//
//  Created by Long Nguyễn on 24/12/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WifiManager, NSObject)

RCT_EXTERN_METHOD(getWifiInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
