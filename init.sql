-- ==============================================================
-- Student Registration Management System - Database Schema
-- Compatible with MySQL / MariaDB / PostgreSQL
-- ==============================================================

CREATE DATABASE IF NOT EXISTS student_management_db;
USE student_management_db;

-- -------------------------------------------------------------
-- 1. Table structure for table `admins`
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default admin account
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@gmail.com', 'admin123', 'admin');

-- -------------------------------------------------------------
-- 2. Table structure for table `students`
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `qualification` VARCHAR(100) NOT NULL,
  `interests` TEXT DEFAULT NULL, -- Comma-separated or JSON list of interests
  `class` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `marks` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `aadhaar_filename` VARCHAR(255) NOT NULL, -- Stored with unique randomized timestamp name
  `role` VARCHAR(20) DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_email (`email`),
  INDEX idx_student_class (`class`),
  INDEX idx_student_name (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;

-- Seed initial test students
INSERT INTO `students` (`id`, `name`, `email`, `password`, `dob`, `gender`, `qualification`, `interests`, `class`, `subject`, `marks`, `aadhaar_filename`, `role`) VALUES
(101, 'Aarav Sharma', 'aarav.sharma@example.com', 'password123', '2004-05-14', 'Male', 'Bachelor\'s', 'Web Development, Artificial Intelligence', 'B.Tech CS 3rd Year', 'Computer Science', 92.00, 'sample-aarav.pdf', 'student'),
(102, 'Priya Patel', 'priya.patel@example.com', 'password123', '2006-08-22', 'Female', 'Intermediate / 12th', 'Data Science, UI/UX Design', 'Grade 12 Science', 'Mathematics', 88.50, 'sample-priya.pdf', 'student'),
(103, 'Rohan Verma', 'rohan.verma@example.com', 'password123', '2001-11-03', 'Male', 'Master\'s', 'Cyber Security, Cloud Computing', 'M.Tech CSE 1st Year', 'Information Security', 95.00, 'sample-rohan.pdf', 'student');
