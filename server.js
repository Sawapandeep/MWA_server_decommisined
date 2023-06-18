const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const admin = require('firebase-admin');
const serviceAccount = require('./test-36b79- firebase-adminsdk-487iv-5db9fde848.json'); // Replace with your own service account key file

const upload = multer({ dest: 'uploads/', limits: {
  fileSize: 1000000 // set the maximum file size (in bytes)
} }); // assuming an `uploads` directory exists in the project directory

// Initialize Firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-36b79-default-rtdb.firebaseio.com'
});

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

app.post('/scan', upload.single('file'), async (req, res) => {
  console.log(req.file);
  const { path: filePath, originalname: fileName } = req.file;
  
  try {
    exec(`cd C:\\Program Files\\ClamAV && clamdscan -v C:\\Users\\ultro\\OneDrive\\Documents\\projkt\\IP-Project\\clamav-backend\\${filePath}`, (error, stdout, stderr) => {
      if (stderr) {
        console.error(`exec error: ${error}`);
        res.status(500).json({ error: 'Internal server error inside' });
        return;
      }
      if (stdout.includes('OK')) {
        const message = `Clean`;
        const timestamp = Date.now();
        saveDataToFirebase(fileName,message, timestamp); // Save data to Firebase
        res.status(200).json({ message });
      } else {
        const parts = stdout.split(':');
        const virusName = parts[2];
        const virusName2 = virusName.split("FOUND");
        const Lname = virusName2[0];
        const message = `Infected with ${Lname}`;
        const timestamp = Date.now();
        saveDataToFirebase(fileName,message, timestamp); // Save data to Firebase
        res.status(200).json({ message });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to save data to Firebase Realtime Database
function saveDataToFirebase(fileName,message, timestamp) {
  const db = admin.database();
  const ref = db.ref('Scan_Results');
  const newMessageRef = ref.push();
  newMessageRef.set({
    file_name:fileName,
    message: message,
    timestamp: timestamp
  });
}

// Retrieve data from Firebase Realtime Database
app.get('/data', (req, res) => {
  const db = admin.database();
  const ref = db.ref('Scan_Results');
  
  ref.once('value', (snapshot) => {
    const messages = snapshot.val();
    res.status(200).json({ messages });
  }, (error) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//! versuon 10
