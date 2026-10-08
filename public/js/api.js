/**
 * Unified API Client with Seamless Backend & Client-Side LocalStorage Fallback
 * Complies with both Live Server and Fallback Implementation requirements.
 */

const API = (function () {
  let backendAvailable = null;

  // Initialize LocalStorage Mock Database for Fallback
  function initLocalStorageDb() {
    if (!localStorage.getItem('std_app_db_initialized')) {
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
            aadhaarDataUrl: null,
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
            aadhaarDataUrl: null,
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
            aadhaarDataUrl: null,
            role: 'student',
            createdAt: new Date().toISOString()
          }
        ],
        nextStudentId: 104
      };
      localStorage.setItem('std_app_data', JSON.stringify(defaultData));
      localStorage.setItem('std_app_db_initialized', 'true');
    }
  }

  initLocalStorageDb();

  function getLocalData() {
    const raw = localStorage.getItem('std_app_data');
    return raw ? JSON.parse(raw) : { admins: [], students: [], nextStudentId: 101 };
  }

  function saveLocalData(data) {
    localStorage.setItem('std_app_data', JSON.stringify(data));
  }

  // Check if live backend server is reachable
  async function checkBackend() {
    if (backendAvailable !== null) return backendAvailable;
    try {
      const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        backendAvailable = true;
        return true;
      }
    } catch (e) {
      // Backend not running (e.g. running from file:// or static server)
    }
    backendAvailable = false;
    return false;
  }

  // Helper to convert File to Data URL for localStorage simulation
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Public Session Helpers
  function setSession(user) {
    sessionStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  function getSession() {
    const user = sessionStorage.getItem('current_user') || localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  function clearSession() {
    sessionStorage.removeItem('current_user');
    localStorage.removeItem('current_user');
  }

  function requireAuth(allowedRole) {
    const user = getSession();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    if (allowedRole && user.role !== allowedRole) {
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'student-dashboard.html';
      }
      return null;
    }
    return user;
  }

  // ----------------- API Methods ----------------- //

  async function login(email, password) {
    const isLive = await checkBackend();
    if (isLive) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        setSession(data.user);
        return data;
      } catch (err) {
        throw err;
      }
    }

    // Fallback: LocalStorage simulation
    const db = getLocalData();
    const cleanEmail = email.trim().toLowerCase();

    // Admin match
    const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);
    if (admin) {
      const user = { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
      setSession(user);
      return { success: true, role: 'admin', redirect: 'admin-dashboard.html', user };
    }

    // Student match
    const student = db.students.find(s => s.email.toLowerCase() === cleanEmail && s.password === password);
    if (student) {
      const user = { id: student.id, name: student.name, email: student.email, role: 'student' };
      setSession(user);
      return { success: true, role: 'student', redirect: 'student-dashboard.html', user };
    }

    throw new Error('Invalid email or password.');
  }

  async function forgotPassword(email, newPassword) {
    const isLive = await checkBackend();
    if (isLive) {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');
      return data;
    }

    // Fallback
    const db = getLocalData();
    const cleanEmail = email.trim().toLowerCase();
    const student = db.students.find(s => s.email.toLowerCase() === cleanEmail);
    if (student) {
      student.password = newPassword;
      saveLocalData(db);
      return { success: true, message: 'Password updated successfully. You can now login.' };
    }
    const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (admin) {
      admin.password = newPassword;
      saveLocalData(db);
      return { success: true, message: 'Admin password updated successfully.' };
    }
    throw new Error('No account found with this email address.');
  }

  async function register(formData, fileObj) {
    const isLive = await checkBackend();
    if (isLive) {
      const data = new FormData();
      for (const key in formData) {
        if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      }
      if (fileObj) {
        data.append('aadhaar', fileObj);
      }
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: data
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      return result;
    }

    // Fallback: LocalStorage simulation
    const db = getLocalData();
    const cleanEmail = formData.email.trim().toLowerCase();

    // Check duplicate email
    const existsStudent = db.students.some(s => s.email.toLowerCase() === cleanEmail);
    const existsAdmin = db.admins.some(a => a.email.toLowerCase() === cleanEmail);
    if (existsStudent || existsAdmin) {
      // EXACT REQUIRED ERROR STRING
      throw new Error('This email is already registered.');
    }

    // Generate unique randomized filename to prevent overwriting
    const randomHex = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `aadhaar-${Date.now()}-${randomHex}.pdf`;
    let dataUrl = null;
    if (fileObj) {
      dataUrl = await fileToDataUrl(fileObj);
    }

    const newStudent = {
      id: db.nextStudentId++,
      name: formData.name.trim(),
      email: cleanEmail,
      password: formData.password,
      dob: formData.dob || '',
      gender: formData.gender || 'Other',
      qualification: formData.qualification || '',
      interests: Array.isArray(formData.interests) ? formData.interests : [],
      class: formData.class || '',
      subject: formData.subject || '',
      marks: Number(formData.marks) || 0,
      aadhaarPath: uniqueFileName,
      aadhaarDataUrl: dataUrl,
      role: 'student',
      createdAt: new Date().toISOString()
    };

    db.students.push(newStudent);
    saveLocalData(db);
    return {
      success: true,
      message: 'Registration successful!',
      user: { id: newStudent.id, name: newStudent.name, email: newStudent.email, role: 'student' }
    };
  }

  async function getStudents() {
    const isLive = await checkBackend();
    if (isLive) {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch students');
      return data.students;
    }

    // Fallback
    const db = getLocalData();
    return db.students.map(({ password, ...rest }) => rest);
  }

  async function getStudentById(id) {
    const isLive = await checkBackend();
    if (isLive) {
      const response = await fetch(`/api/students/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Student not found');
      return data.student;
    }

    // Fallback
    const db = getLocalData();
    const student = db.students.find(s => s.id === Number(id));
    if (!student) throw new Error('Student not found');
    const { password, ...rest } = student;
    return rest;
  }

  async function updateStudent(id, updateData, fileObj, updatedBy = 'student') {
    const isLive = await checkBackend();
    if (isLive) {
      const data = new FormData();
      data.append('updatedBy', updatedBy);
      for (const key in updateData) {
        if (Array.isArray(updateData[key])) {
          data.append(key, JSON.stringify(updateData[key]));
        } else {
          data.append(key, updateData[key]);
        }
      }
      if (fileObj) {
        data.append('aadhaar', fileObj);
      }
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        body: data
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Update failed');
      return result;
    }

    // Fallback
    const db = getLocalData();
    const index = db.students.findIndex(s => s.id === Number(id));
    if (index === -1) throw new Error('Student not found');

    const existing = db.students[index];
    let updatedName = existing.name;
    if (updatedBy === 'student' && updateData.name) {
      updatedName = updateData.name.trim();
    }
    // Name is locked for admin updates

    let aadhaarPath = existing.aadhaarPath;
    let aadhaarDataUrl = existing.aadhaarDataUrl;
    if (fileObj) {
      const randomHex = Math.random().toString(36).substring(2, 8);
      aadhaarPath = `aadhaar-${Date.now()}-${randomHex}.pdf`;
      aadhaarDataUrl = await fileToDataUrl(fileObj);
    }

    db.students[index] = {
      ...existing,
      name: updatedName,
      email: existing.email, // Email strictly locked
      dob: updateData.dob !== undefined ? updateData.dob : existing.dob,
      gender: updateData.gender !== undefined ? updateData.gender : existing.gender,
      qualification: updateData.qualification !== undefined ? updateData.qualification : existing.qualification,
      interests: Array.isArray(updateData.interests) ? updateData.interests : existing.interests,
      class: updateData.class !== undefined ? updateData.class : existing.class,
      subject: updateData.subject !== undefined ? updateData.subject : existing.subject,
      marks: updateData.marks !== undefined ? Number(updateData.marks) : existing.marks,
      aadhaarPath: aadhaarPath,
      aadhaarDataUrl: aadhaarDataUrl,
      updatedAt: new Date().toISOString()
    };

    saveLocalData(db);
    const { password, ...sanitized } = db.students[index];
    return { success: true, message: 'Student updated successfully', student: sanitized };
  }

  async function deleteStudent(id) {
    const isLive = await checkBackend();
    if (isLive) {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      return data;
    }

    // Fallback
    const db = getLocalData();
    db.students = db.students.filter(s => s.id !== Number(id));
    saveLocalData(db);
    return { success: true, message: `Student #${id} deleted successfully.` };
  }

  // Calculate age from date of birth (YYYY-MM-DD)
  function calculateAge(dobString) {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  return {
    login,
    forgotPassword,
    register,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    calculateAge,
    setSession,
    getSession,
    clearSession,
    requireAuth,
    checkBackend
  };
})();
