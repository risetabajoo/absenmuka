const video = document.getElementById('videoElement');
const viewDataBtn = document.getElementById('viewDataBtn');
const savedDataContainer = document.getElementById('savedDataContainer');

// Fungsi untuk memulai kamera dan memuat model FaceAPI
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

  // Muat FaceAPI model
  await faceapi.nets.tinyFaceDetector.loadFromUri('models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('models');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
  
  console.log('Camera started and models loaded');

  // Tampilkan tombol Lihat Data setelah kamera dimulai
  viewDataBtn.style.display = 'inline-block';
};

// Fungsi untuk mendeteksi wajah dan mengambil descriptor wajah
const getFaceData = async () => {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections;
};

// Fungsi untuk menyimpan data wajah ke localStorage
const saveFaceData = async () => {
  const detections = await getFaceData();
  if (detections.length > 0) {
    const faceDescriptor = detections[0].descriptor;
    localStorage.setItem('savedFace', JSON.stringify(faceDescriptor));
    alert('Face data saved successfully!');
    console.log('Face data saved:', faceDescriptor);
  } else {
    alert('No face detected. Please try again.');
    console.log('No face detected');
  }
};

// Fungsi untuk mengenali wajah dan mencocokkannya dengan data yang tersimpan
const recognizeFace = async () => {
  const detections = await getFaceData();
  if (detections.length > 0) {
    const faceDescriptor = detections[0].descriptor;
    const savedFaceDescriptor = JSON.parse(localStorage.getItem('savedFace'));
    
    if (savedFaceDescriptor) {
      const distance = faceapi.euclideanDistance(faceDescriptor, savedFaceDescriptor);
      if (distance < 0.6) {
        alert('Ya, sama!');
        console.log('Matched face with distance:', distance);
      } else {
        alert('Tidak, wajah berbeda.');
        console.log('Face not matched. Distance:', distance);
      }
    } else {
      alert('No saved face data found.');
      console.log('No saved face data in localStorage');
    }
  } else {
    alert('No face detected. Please try again.');
    console.log('No face detected during recognition');
  }
};

// Fungsi untuk menampilkan data wajah yang sudah tersimpan di localStorage
const viewSavedFaceData = () => {
  const savedFaceDescriptor = localStorage.getItem('savedFace');
  if (savedFaceDescriptor) {
    savedDataContainer.innerHTML = `
      <div class="alert alert-info">
        <strong>Saved Face Data:</strong> ${savedFaceDescriptor}
      </div>
    `;
    console.log('Saved face data:', savedFaceDescriptor);
  } else {
    savedDataContainer.innerHTML = `
      <div class="alert alert-danger">
        No face data found.
      </div>
    `;
    console.log('No saved face data in localStorage');
  }
};

// Event listener untuk memulai kamera
document.getElementById('startCameraBtn').addEventListener('click', async () => {
  await startCamera();
  console.log('Camera started');
});

// Event listener untuk menyimpan data wajah
document.getElementById('saveFaceBtn').addEventListener('click', async () => {
  await saveFaceData();
  console.log('Save face button clicked');
});

// Event listener untuk mengenali wajah
document.getElementById('recognizeBtn').addEventListener('click', async () => {
  await recognizeFace();
  console.log('Recognize face button clicked');
});

// Event listener untuk melihat data wajah yang tersimpan
document.getElementById('viewDataBtn').addEventListener('click', () => {
  viewSavedFaceData();
  console.log('View data button clicked');
});
