const express = require('express');
const multer = require('multer');
const { createScanner } = require('clamav.js');
const scanner = createScanner('127.0.0.1', 3310); // assuming ClamAV is running on the same machine as the backend
const upload = multer({ dest: 'uploads/' }); // assuming an `uploads` directory exists in the project directory
const PORT = process.env.PORT || 3000;
const app = express();

app.post('/scan', upload.single('file'), async (req, res) => {
  const { path: filePath, originalname: fileName } = req.file;
  try {
    const result = await scanner.scanFile(filePath);
    if (result.isInfected) {
      res.status(400).json({ error: `File ${fileName} is infected with ${result.virusName}` });
    } else {
      res.status(200).json({ message: `File ${fileName} is clean` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/status/:fileName', async (req, res) => {
  const { fileName } = req.params;
  const filePath = `uploads/${fileName}`;
  try {
    const result = await scanner.scanFile(filePath);
    if (result.isInfected) {
      res.status(400).json({ error: `File ${fileName} is infected with ${result.virusName}` });
    } else {
      res.status(200).json({ message: `File ${fileName} is clean` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
