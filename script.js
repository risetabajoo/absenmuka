const video = document.getElementById('videoElement');

const startCamera = async () => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("Something went wrong with camera access.");
      });
  }
  
  // Load FaceAPI models from models directory on GitHub Pages
  await faceapi.nets.tinyFaceDetector.loadFromUri('models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('models');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
};

const getFaceData = async () => {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections;
};

const saveFaceData = async () => {
  const detections = await getFaceData();
  if (detections.length > 0) {
    const faceDescriptor = detections[0].descriptor;
    localStorage.setItem('savedFace', JSON.stringify(faceDescriptor));
    alert('Face data saved successfully!');
  } else {
    alert('No face detected. Please try again.');
  }
};

const recognizeFace = async () => {
  const detections = await getFaceData();
  if (detections.length > 0) {
    const faceDescriptor = detections[0].descriptor;
    const savedFaceDescriptor = JSON.parse(localStorage.getItem('savedFace'));
    if (savedFaceDescriptor) {
      const distance = faceapi.euclideanDistance(faceDescriptor, savedFaceDescriptor);
      if (distance < 0.6) {
        alert('Ya, sama!');
      } else {
        alert('Tidak, wajah berbeda.');
      }
    } else {
      alert('No saved face data found.');
    }
  } else {
    alert('No face detected. Please try again.');
  }
};

document.getElementById('startCameraBtn').addEventListener('click', startCamera);
document.getElementById('saveFaceBtn').addEventListener('click', saveFaceData);
document.getElementById('recognizeBtn').addEventListener('click', recognizeFace);
