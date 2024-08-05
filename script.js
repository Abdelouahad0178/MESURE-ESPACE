const video = document.getElementById('video');
const flashButton = document.getElementById('flashButton');
const measureButton = document.getElementById('measureButton');
const distanceDisplay = document.getElementById('distance');

// Access the device camera and stream to video element
navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: { exact: 'environment' } } 
})
.then(stream => {
    video.srcObject = stream;
})
.catch(error => {
    console.error('Error accessing the camera', error);
});

// Toggle flash (using the torch mode of the camera)
flashButton.addEventListener('click', () => {
    const track = video.srcObject.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
        const currentSettings = track.getSettings();
        track.applyConstraints({
            advanced: [{ torch: !currentSettings.torch }]
        });
    }).catch(error => console.error('Error toggling flash', error));
});

// Function called when OpenCV.js is ready
function onOpenCvReady() {
    console.log('OpenCV.js is ready');

    // Measure distance using OpenCV.js
    measureButton.addEventListener('click', () => {
        const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
        const cap = new cv.VideoCapture(video);
        cap.read(src);

        // Process the image using OpenCV.js
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Detect edges (e.g., using Canny)
        let edges = new cv.Mat();
        cv.Canny(gray, edges, 50, 100);

        // Assuming the object to measure is rectangular, find contours
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        // Assuming the largest contour is the object to measure
        let cnt = contours.get(0);
        let rect = cv.boundingRect(cnt);

        // Calculate the distance (this is a simplified example)
        const focalLength = 700; // This value depends on the camera characteristics
        const realWidth = 10; // Real width of the object in cm
        const pixelWidth = rect.width;
        const distance = (realWidth * focalLength) / pixelWidth;

        distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} cm`;

        // Clean up
        src.delete();
        gray.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
    });
}
