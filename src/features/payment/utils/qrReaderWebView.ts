/**
 * QR Reader using WebView and jsQR library
 * This approach loads an image into a WebView, draws it on canvas, and uses jsQR to decode
 */

export const QR_READER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
</head>
<body>
  <canvas id="canvas" style="display:none;"></canvas>
  <script>
    function decodeQR(base64Image) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
          const canvas = document.getElementById('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            resolve(code.data);
          } else {
            resolve(null);
          }
        };
        
        img.onerror = function() {
          reject(new Error('Failed to load image'));
        };
        
        img.src = base64Image;
      });
    }
    
    // Listen for messages from React Native
    window.addEventListener('message', async function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'DECODE_QR' && data.imageData) {
          const result = await decodeQR(data.imageData);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'QR_RESULT',
            data: result
          }));
        }
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'QR_ERROR',
          error: error.message
        }));
      }
    });
    
    // Notify React Native that WebView is ready
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
  </script>
</body>
</html>
`;
