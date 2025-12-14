import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, PanResponder, Text, Dimensions } from 'react-native';

interface SimpleSignatureCaptureProps {
  style?: any;
  onSaveEvent?: (result: any) => void;
}

interface Point {
  x: number;
  y: number;
}

export const SimpleSignatureCapture = forwardRef<any, SimpleSignatureCaptureProps>(
  ({ style, onSaveEvent }, ref) => {
    const [paths, setPaths] = useState<Point[][]>([]);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const viewRef = useRef<View>(null);

    useImperativeHandle(ref, () => ({
      saveImage: () => {
        if (paths.length === 0 && currentPath.length === 0) {
          // No signature drawn
          const emptyResult = {
            encoded: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            pathName: 'empty_signature.png',
          };
          if (onSaveEvent) {
            onSaveEvent(emptyResult);
          }
          return;
        }

        // Generate simple signature data
        const allPaths = [...paths, currentPath].filter(path => path.length > 0);
        const pathData = allPaths.map(path => 
          path.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
        ).join('|');
        
        const result = {
          encoded: `data:image/png;base64,${btoa(pathData)}`,
          pathName: 'simple_signature.png',
          paths: allPaths,
        };
        
        console.log('Simple signature saved with', allPaths.length, 'paths');
        if (onSaveEvent) {
          onSaveEvent(result);
        }
      },
      
      resetImage: () => {
        setPaths([]);
        setCurrentPath([]);
        setIsDrawing(false);
        console.log('Simple signature reset');
      },
    }));

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
        
        // Only add point if it's far enough from the last point for smoother drawing
        setCurrentPath(prevPath => {
          if (prevPath.length === 0) return [newPoint];
          
          const lastPoint = prevPath[prevPath.length - 1];
          const dx = newPoint.x - lastPoint.x;
          const dy = newPoint.y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only add if moved at least 2 pixels for smoother path
          if (distance >= 2) {
            return [...prevPath, newPoint];
          }
          
          return prevPath;
        });
      },

      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths(prevPaths => [...prevPaths, currentPath]);
          setCurrentPath([]);
        }
        setIsDrawing(false);
      },
    });

    return (
      <View 
        ref={viewRef}
        style={[
          style, 
          { 
            backgroundColor: 'white', 
            position: 'relative',
            borderWidth: 1,
            borderColor: '#e0e0e0',
            borderRadius: 8,
          }
        ]} 
        {...panResponder.panHandlers}
      >
        {/* Instruction text */}
        <View style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          alignItems: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <Text style={{ 
            color: '#999', 
            fontSize: 14,
            backgroundColor: 'rgba(255,255,255,0.9)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
            fontWeight: '500',
          }}>
            Vẽ chữ ký của bạn ở đây
          </Text>
        </View>
        
        {/* Path visualization for completed paths */}
        {paths.map((path, pathIndex) => (
          <View key={pathIndex}>
            {path.map((point, pointIndex) => {
              if (pointIndex === 0) return null; // Skip first point
              const prevPoint = path[pointIndex - 1];
              const dx = point.x - prevPoint.x;
              const dy = point.y - prevPoint.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 0.5) return null; // Skip very small segments
              
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              
              return (
                <View key={`${pathIndex}-${pointIndex}`}>
                  {/* Main stroke */}
                  <View
                    style={{
                      position: 'absolute',
                      left: prevPoint.x,
                      top: prevPoint.y - 1.5,
                      width: distance,
                      height: 3,
                      backgroundColor: '#000000',
                      transform: [{ rotate: `${angle}deg` }],
                      transformOrigin: '0 50%',
                      borderRadius: 1.5,
                    }}
                  />
                  {/* Add dot at start for smoother connection */}
                  <View
                    style={{
                      position: 'absolute',
                      left: prevPoint.x - 1.5,
                      top: prevPoint.y - 1.5,
                      width: 3,
                      height: 3,
                      backgroundColor: '#000000',
                      borderRadius: 1.5,
                    }}
                  />
                </View>
              );
            })}
          </View>
        ))}
        
        {/* Current drawing path */}
        {currentPath.map((point, pointIndex) => {
          if (pointIndex === 0) return null;
          const prevPoint = currentPath[pointIndex - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 0.5) return null;
          
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          return (
            <View key={`current-${pointIndex}`}>
              {/* Main current stroke */}
              <View
                style={{
                  position: 'absolute',
                  left: prevPoint.x,
                  top: prevPoint.y - 1.5,
                  width: distance,
                  height: 3,
                  backgroundColor: '#000000',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0 50%',
                  borderRadius: 1.5,
                }}
              />
              {/* Add dot at start for smoother connection */}
              <View
                style={{
                  position: 'absolute',
                  left: prevPoint.x - 1.5,
                  top: prevPoint.y - 1.5,
                  width: 3,
                  height: 3,
                  backgroundColor: '#000000',
                  borderRadius: 1.5,
                }}
              />
            </View>
          );
        })}
      </View>
    );
  }
);

SimpleSignatureCapture.displayName = 'SimpleSignatureCapture';