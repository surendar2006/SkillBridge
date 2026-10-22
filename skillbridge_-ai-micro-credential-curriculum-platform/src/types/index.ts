export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  targetJobRole?: string;
  education?: string;
  bio?: string;
  confirmedSkills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeRecord {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  summary?: string;
}

export interface ExtractedSkill {
  name: string;
  category: 'Languages' | 'Frameworks' | 'Cloud & DevOps' | 'Databases' | 'AI & ML' | 'Tools & Protocols' | 'Soft Skills' | 'General';
  confidence: number;
  context?: string;
}

export interface ResumeAnalysis {
  id?: string;
  userId: string;
  resumeFileName?: string;
  extractedSkills: string[];
  categorizedSkills: Record<string, string[]>;
  experienceYears: number;
  educationLevel: string;
  projectsIdentified: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  aiGenerated: boolean;
  rawTextExcerpt?: string;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  requiredSkills: string[];
  preferredSkills?: string[];
  description: string;
  dataSource: string;
  sourceUrl?: string;
  isDemonstration: boolean;
  postedDate?: string;
  updatedAt: string;
}

export interface SkillTrendRecord {
  id?: string;
  skillName: string;
  category: string;
  demandFrequency: number; // percentage or occurrence count in dataset
  growthTag: 'Surging' | 'High Demand' | 'Stable' | 'Emerging';
  topRoles: string[];
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: 'NPTEL' | 'Coursera' | 'edX' | 'Udemy' | 'Official Documentation' | 'Stanford Online' | 'MIT OpenCourseWare';
  skillsCovered: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  officialUrl: string;
  isVerified: boolean;
  type: 'micro_credential' | 'course' | 'certification' | 'project';
  rating?: number;
  updatedAt: string;
}

export interface SkillGapReport {
  id?: string;
  userId: string;
  targetRole: string;
  matchScore: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMatchedSkills?: string[];
  prioritizedGaps: Array<{
    skill: string;
    marketImportance: 'Critical' | 'High' | 'Medium';
    reason: string;
  }>;
  explanation: string;
  createdAt: string;
}

export interface RoadmapModule {
  id: string;
  order: number;
  title: string;
  estimatedHours: number;
  objective: string;
  prerequisites: string[];
  keyTopics: string[];
  recommendedResources: Array<{
    title: string;
    provider: string;
    url: string;
    type: string;
  }>;
  practicalTask: {
    title: string;
    description: string;
    deliverable: string;
  };
  completed?: boolean;
}

export interface LearningRoadmap {
  id?: string;
  userId: string;
  targetRole: string;
  microCredentialTitle: string;
  summary: string;
  estimatedWeeks: number;
  totalModules: number;
  modules: RoadmapModule[];
  capstoneProject: {
    title: string;
    objective: string;
    architectureDescription: string;
    keyDeliverables: string[];
  };
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  id?: string;
  userId: string;
  roadmapId: string;
  completedModuleIds: string[];
  percentComplete: number;
  notes: string;
  lastUpdated: string;
}

export interface SavedItem {
  id?: string;
  userId: string;
  itemId: string;
  itemType: 'job' | 'course';
  itemData: Partial<JobPosting> | Partial<LearningResource>;
  savedAt: string;
}
