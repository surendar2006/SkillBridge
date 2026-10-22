/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { SkillTrendsPage } from './pages/SkillTrendsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { CurriculumRoadmapPage } from './pages/CurriculumRoadmapPage';
import { CourseRecommendationsPage } from './pages/CourseRecommendationsPage';
import { JobRecommendationsPage } from './pages/JobRecommendationsPage';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminDatasetsPage } from './pages/AdminDatasetsPage';
import { AdminResourcesPage } from './pages/AdminResourcesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Application Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumeAnalysisPage />} />
              <Route path="/trends" element={<SkillTrendsPage />} />
              <Route path="/gap-analysis" element={<SkillGapPage />} />
              <Route path="/roadmaps" element={<CurriculumRoadmapPage />} />
              <Route path="/courses" element={<CourseRecommendationsPage />} />
              <Route path="/jobs" element={<JobRecommendationsPage />} />
              <Route path="/progress" element={<ProgressTrackerPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Administrator Governance Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/datasets" element={<AdminDatasetsPage />} />
              <Route path="/admin/resources" element={<AdminResourcesPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
