import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, PanResponder, Dimensions, Text } from 'react-native';
import { styles } from '../styles';

// Import SVG components with fallback
let Svg: any = null;
let Path: any = null;
let hasSVG = false;

try {
  const { Svg: SvgComponent, Path: PathComponent } = require('react-native-svg');
  Svg = SvgComponent;
  Path = PathComponent;
  hasSVG = true;
} catch (error) {
  console.warn('react-native-svg not available, will use fallback:', error.message);
  hasSVG = false;
}

interface SVGSignatureCaptureProps {
  style?: any;
  onSaveEvent?: (result: any) => void;
}

interface Point {
  x: number;
  y: number;
}

export const SVGSignatureCapture = forwardRef<any, SVGSignatureCaptureProps>(
  ({ style, onSaveEvent }, ref) => {
    const [paths, setPaths] = useState<Point[][]>([]);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const viewRef = useRef<View>(null);

    useImperativeHandle(ref, () => ({
      saveImage: () => {
        if (paths.length === 0 && currentPath.length === 0) {
          // No signature drawn, return empty signature
          const emptyResult = {
            encoded: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            pathName: 'empty_signature.png',
          };
          if (onSaveEvent) {
            onSaveEvent(emptyResult);
          }
          return;
        }

        // Convert paths to SVG string
        const svgPaths = [...paths, currentPath].filter(path => path.length > 0);
        const svgResult = {
          encoded: generateSignatureBase64(svgPaths),
          pathName: 'svg_signature.png',
          paths: svgPaths,
        };
        
        console.log('SVG Signature saved with', svgPaths.length, 'paths');
        if (onSaveEvent) {
          onSaveEvent(svgResult);
        }
      },
      
      resetImage: () => {
        setPaths([]);
        setCurrentPath([]);
        setIsDrawing(false);
        console.log('SVG Signature reset');
      },
    }));

    const generateSignatureBase64 = (pathList: Point[][]): string => {
      // Generate a simple base64 representation of the signature
      // In a real implementation, you'd convert SVG to image
      const pathData = pathList.map(path => 
        path.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
      ).join('|');
      
      // Create a mock base64 that includes path data
      const mockImageData = btoa(pathData);
      return `data:image/png;base64,${mockImageData}`;
    };

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint: Point = { x: locationX, y: locationY };
        setCurrentPath([newPoint]);
        setIsDrawing(true);
      },

      onPanResponderMove: (evt) => {
        if (!isDrawing) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint: Point = { x: locationX, y: locationY };
        setCurrentPath(prevPath => [...prevPath, newPoint]);
      },

      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths(prevPaths => [...prevPaths, currentPath]);
          setCurrentPath([]);
        }
        setIsDrawing(false);
      },
    });

    const renderPath = (path: Point[], index: number, isActive: boolean = false, PathComponent: any) => {
      if (path.length < 2) return null;

      let pathData = `M ${path[0].x} ${path[0].y}`;
      for (let i = 1; i < path.length; i++) {
        pathData += ` L ${path[i].x} ${path[i].y}`;
      }

      return (
        <PathComponent
          key={index}
          d={pathData}
          stroke={isActive ? "#007AFF" : "#000000"}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    };

    // SVG components are imported at the top of the file

    // Force fallback for now to avoid SVG rendering issues
    if (true || !hasSVG || !Svg || !Path) {
      // Fallback to a simple canvas-like view
      return (
        <View 
          ref={viewRef}
          style={[style, { backgroundColor: 'white', position: 'relative' }]} 
          {...panResponder.panHandlers}
        >
          <View style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            alignItems: 'center',
            zIndex: 1,
          }}>
            <Text style={{ 
              color: '#999', 
              fontSize: 14,
              backgroundColor: 'rgba(255,255,255,0.8)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}>
              Vẽ chữ ký của bạn ở đây
            </Text>
          </View>
          
          {/* Enhanced visualization of paths */}
          {paths.map((path, index) => (
            <View key={index}>
              {path.map((point, pointIndex) => {
                if (pointIndex === 0) return null; // Skip first point to avoid isolated dots
                const prevPoint = path[pointIndex - 1];
                const dx = point.x - prevPoint.x;
                const dy = point.y - prevPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                return (
                  <View
                    key={pointIndex}
                    style={{
                      position: 'absolute',
                      left: prevPoint.x,
                      top: prevPoint.y - 1,
                      width: distance,
                      height: 2,
                      backgroundColor: '#000000',
                      transform: [{ rotate: `${angle}deg` }],
                      transformOrigin: 'left center',
                    }}
                  />
                );
              })}
            </View>
          ))}
          
          {/* Current drawing path with enhanced rendering */}
          {currentPath.map((point, pointIndex) => {
            if (pointIndex === 0) return null;
            const prevPoint = currentPath[pointIndex - 1];
            const dx = point.x - prevPoint.x;
            const dy = point.y - prevPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            return (
              <View
                key={`current-${pointIndex}`}
                style={{
                  position: 'absolute',
                  left: prevPoint.x,
                  top: prevPoint.y - 1,
                  width: distance,
                  height: 2,
                  backgroundColor: '#007AFF',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                }}
              />
            );
          })}
        </View>
      );
    }

    return (
      <View ref={viewRef} style={[style, { backgroundColor: 'white' }]} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          {paths.map((path, index) => renderPath(path, index, false, Path))}
          {currentPath.length > 0 && renderPath(currentPath, -1, true, Path)}
        </Svg>
        
        <View style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <Text style={{ 
            color: '#999', 
            fontSize: 14,
            backgroundColor: 'rgba(255,255,255,0.8)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}>
            Vẽ chữ ký của bạn ở đây
          </Text>
        </View>
      </View>
    );
  }
);

SVGSignatureCapture.displayName = 'SVGSignatureCapture';