const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static frontend files and uploaded files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration - Automatically rename uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique randomized filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `aadhaar-${uniqueSuffix}${safeExt}`);
  }
});

// File filter: Must strictly be PDF
const fileFilter = (req, file, cb) => {
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf';
  if (isPdfExt && isPdfMime) {
    cb(null, true);
  } else {
    cb(new Error('File validation failed: Only PDF documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Persistent JSON Database Helper
const dbPath = path.join(__dirname, 'db.json');

function initDb() {
  if (!fs.existsSync(dbPath)) {
    const defaultData = {
      admins: [
        {
          id: 1,
          name: 'System Admin',
          email: 'admin@gmail.com',
          password: 'admin123',
          role: 'admin'
        }
      ],
      students: [
        {
          id: 101,
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          password: 'password123',
          dob: '2004-05-14',
          gender: 'Male',
          qualification: "Bachelor's",
          interests: ['Web Development', 'Artificial Intelligence'],
          class: 'B.Tech CS 3rd Year',
          subject: 'Computer Science',
          marks: 92,
          aadhaarPath: 'sample-aarav.pdf',
          role: 'student',
          createdAt: new Date().toISOString()
        },
        {
          id: 102,
          name: 'Priya Patel',
          email: 'priya.patel@example.com',
          password: 'password123',
          dob: '2006-08-22',
          gender: 'Female',
          qualification: 'Intermediate / 12th',
          interests: ['Data Science', 'UI/UX Design'],
          class: 'Grade 12 Science',
          subject: 'Mathematics',
          marks: 88,
          aadhaarPath: 'sample-priya.pdf',
          role: 'student',
          createdAt: new Date().toISOString()
        },
        {
          id: 103,
          name: 'Rohan Verma',
          email: 'rohan.verma@example.com',
          password: 'password123',
          dob: '2001-11-03',
          gender: 'Male',
          qualification: "Master's",
          interests: ['Cyber Security', 'Cloud Computing'],
          class: 'M.Tech CSE 1st Year',
          subject: 'Information Security',
          marks: 95,
          aadhaarPath: 'sample-rohan.pdf',
          role: 'student',
          createdAt: new Date().toISOString()
        }
      ],
      nextStudentId: 104
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));

    // Create placeholder sample PDF files in uploads if they don't exist
    ['sample-aarav.pdf', 'sample-priya.pdf', 'sample-rohan.pdf'].forEach(name => {
      const filePath = path.join(uploadsDir, name);
      if (!fs.existsSync(filePath)) {
        // Minimal valid PDF binary header
        const minimalPdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 24 Tf 100 700 Td (Sample Student Aadhaar PDF Document) ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF`;
        fs.writeFileSync(filePath, minimalPdf);
      }
    });
  }
}

initDb();

function getDb() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ----------------- API ENDPOINTS ----------------- //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Single Unified Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();

  // Check Admin
  const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);
  if (admin) {
    return res.json({
      success: true,
      role: 'admin',
      redirect: '/admin-dashboard.html',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  }

  // Check Student
  const student = db.students.find(s => s.email.toLowerCase() === cleanEmail && s.password === password);
  if (student) {
    return res.json({
      success: true,
      role: 'student',
      redirect: '/student-dashboard.html',
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid email or password.' });
});

// Forgot Password Flow
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();

  // Check student
  const student = db.students.find(s => s.email.toLowerCase() === cleanEmail);
  if (student) {
    student.password = newPassword;
    saveDb(db);
    return res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  }

  // Check admin
  const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
  if (admin) {
    admin.password = newPassword;
    saveDb(db);
    return res.json({ success: true, message: 'Admin password updated successfully.' });
  }

  return res.status(404).json({ error: 'No account found with this email address.' });
});

// Student Signup Endpoint (with Multer upload & PDF validation)
app.post('/api/auth/register', (req, res) => {
  upload.single('aadhaar')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, email, password, dob, gender, qualification, interests, class: studentClass, subject, marks } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Aadhaar document upload is required and must be a PDF.' });
      }

      const db = getDb();
      const cleanEmail = email.trim().toLowerCase();

      // Check duplicate email across both students and admins
      const studentExists = db.students.some(s => s.email.toLowerCase() === cleanEmail);
      const adminExists = db.admins.some(a => a.email.toLowerCase() === cleanEmail);

      if (studentExists || adminExists) {
        // Remove uploaded file since registration failed
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        // EXACT required validation message
        return res.status(409).json({ error: 'This email is already registered.' });
      }

      // Parse interests if array or string
      let parsedInterests = [];
      if (Array.isArray(interests)) {
        parsedInterests = interests;
      } else if (typeof interests === 'string') {
        try {
          parsedInterests = JSON.parse(interests);
        } catch {
          parsedInterests = interests.split(',').map(i => i.trim()).filter(Boolean);
        }
      }

      const newStudent = {
        id: db.nextStudentId++,
        name: name.trim(),
        email: cleanEmail,
        password: password,
        dob: dob || '',
        gender: gender || 'Other',
        qualification: qualification || '',
        interests: parsedInterests,
        class: studentClass || '',
        subject: subject || '',
        marks: Number(marks) || 0,
        aadhaarPath: req.file.filename,
        role: 'student',
        createdAt: new Date().toISOString()
      };

      db.students.push(newStudent);
      saveDb(db);

      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        user: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          role: 'student'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  });
});

// Admin API: List All Students
app.get('/api/students', (req, res) => {
  const db = getDb();
  // Return students without sensitive password
  const sanitized = db.students.map(s => {
    const { password, ...rest } = s;
    return rest;
  });
  res.json({ success: true, students: sanitized });
});

// Get Single Student by ID
app.get('/api/students/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id, 10);
  const student = db.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }
  const { password, ...rest } = student;
  res.json({ success: true, student: rest });
});

// Update Student Profile (CRUD - Update)
// Rules:
// If updated by Admin: Name and Email MUST STAY LOCKED/UNEDITABLE
// If updated by Student: Email MUST STAY LOCKED/UNEDITABLE, Aadhaar can be replaced
app.put('/api/students/:id', (req, res) => {
  upload.single('aadhaar')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const db = getDb();
      const studentIndex = db.students.findIndex(s => s.id === id);

      if (studentIndex === -1) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const existing = db.students[studentIndex];
      const updatedBy = req.body.updatedBy || 'student'; // 'admin' or 'student'

      // Parse interests
      let parsedInterests = existing.interests;
      if (req.body.interests !== undefined) {
        if (Array.isArray(req.body.interests)) {
          parsedInterests = req.body.interests;
        } else if (typeof req.body.interests === 'string') {
          try {
            parsedInterests = JSON.parse(req.body.interests);
          } catch {
            parsedInterests = req.body.interests.split(',').map(i => i.trim()).filter(Boolean);
          }
        }
      }

      // Fields to update based on user role
      let updatedName = existing.name;
      if (updatedBy === 'student' && req.body.name) {
        updatedName = req.body.name.trim();
      }
      // Note: If updatedBy === 'admin', Name remains existing.name (LOCKED)

      // Aadhaar Replacement
      let updatedAadhaar = existing.aadhaarPath;
      if (req.file) {
        // Delete old uploaded file if not a sample
        if (existing.aadhaarPath && !existing.aadhaarPath.startsWith('sample-')) {
          const oldFilePath = path.join(uploadsDir, existing.aadhaarPath);
          if (fs.existsSync(oldFilePath)) {
            try { fs.unlinkSync(oldFilePath); } catch (e) { /* ignore */ }
          }
        }
        updatedAadhaar = req.file.filename;
      }

      // Update student object while strictly locking email (and name for admin)
      db.students[studentIndex] = {
        ...existing,
        name: updatedName, // Name locked for admin
        email: existing.email, // Email strictly locked for all
        dob: req.body.dob !== undefined ? req.body.dob : existing.dob,
        gender: req.body.gender !== undefined ? req.body.gender : existing.gender,
        qualification: req.body.qualification !== undefined ? req.body.qualification : existing.qualification,
        interests: parsedInterests,
        class: req.body.class !== undefined ? req.body.class : existing.class,
        subject: req.body.subject !== undefined ? req.body.subject : existing.subject,
        marks: req.body.marks !== undefined ? Number(req.body.marks) : existing.marks,
        aadhaarPath: updatedAadhaar,
        updatedAt: new Date().toISOString()
      };

      saveDb(db);

      const { password, ...sanitized } = db.students[studentIndex];
      res.json({
        success: true,
        message: 'Student record updated successfully.',
        student: sanitized
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Internal server error during update.' });
    }
  });
});

// Delete Student Record (CRUD - Delete)
app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = getDb();
  const student = db.students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Remove uploaded Aadhaar file if not sample
  if (student.aadhaarPath && !student.aadhaarPath.startsWith('sample-')) {
    const filePath = path.join(uploadsDir, student.aadhaarPath);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }

  db.students = db.students.filter(s => s.id !== id);
  saveDb(db);

  res.json({ success: true, message: `Student #${id} deleted successfully.` });
});

// Fallback Route: Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Admin credentials: admin@gmail.com / admin123`);
});
