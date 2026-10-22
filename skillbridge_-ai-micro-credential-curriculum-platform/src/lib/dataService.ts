import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import {
  JobPosting,
  LearningResource,
  SkillTrendRecord,
  ResumeAnalysis,
  ResumeRecord,
  SkillGapReport,
  LearningRoadmap,
  LearningProgress,
  SavedItem
} from '../types';
import { SEED_JOB_POSTINGS, SEED_LEARNING_RESOURCES } from './seedData';

// --- JOB POSTINGS ---
export async function getJobPostings(): Promise<JobPosting[]> {
  const path = 'jobPostings';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default demonstration jobs if collection is completely fresh
      await seedJobsIfEmpty();
      return SEED_JOB_POSTINGS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as JobPosting));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return SEED_JOB_POSTINGS;
  }
}

export async function addJobPosting(job: Omit<JobPosting, 'id'>): Promise<string> {
  const path = 'jobPostings';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...job,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateJobPosting(id: string, data: Partial<JobPosting>): Promise<void> {
  const path = `jobPostings/${id}`;
  try {
    await updateDoc(doc(db, 'jobPostings', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteJobPosting(id: string): Promise<void> {
  const path = `jobPostings/${id}`;
  try {
    await deleteDoc(doc(db, 'jobPostings', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedJobsIfEmpty(): Promise<void> {
  try {
    for (const job of SEED_JOB_POSTINGS) {
      const { id, ...data } = job;
      await setDoc(doc(db, 'jobPostings', id), data);
    }
  } catch (err) {
    console.warn('Auto seed notice for jobPostings:', err);
  }
}

// --- LEARNING RESOURCES ---
export async function getLearningResources(): Promise<LearningResource[]> {
  const path = 'learningResources';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      await seedResourcesIfEmpty();
      return SEED_LEARNING_RESOURCES;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LearningResource));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return SEED_LEARNING_RESOURCES;
  }
}

export async function addLearningResource(res: Omit<LearningResource, 'id'>): Promise<string> {
  const path = 'learningResources';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...res,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateLearningResource(id: string, data: Partial<LearningResource>): Promise<void> {
  const path = `learningResources/${id}`;
  try {
    await updateDoc(doc(db, 'learningResources', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteLearningResource(id: string): Promise<void> {
  const path = `learningResources/${id}`;
  try {
    await deleteDoc(doc(db, 'learningResources', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedResourcesIfEmpty(): Promise<void> {
  try {
    for (const res of SEED_LEARNING_RESOURCES) {
      const { id, ...data } = res;
      await setDoc(doc(db, 'learningResources', id), data);
    }
  } catch (err) {
    console.warn('Auto seed notice for learningResources:', err);
  }
}

// --- SKILL TRENDS COMPUTATION ---
export async function calculateAndGetSkillTrends(jobs: JobPosting[]): Promise<SkillTrendRecord[]> {
  const skillCountMap: Record<string, { count: number; roles: Set<string> }> = {};
  const totalJobs = jobs.length || 1;

  jobs.forEach(job => {
    job.requiredSkills.forEach(skill => {
      const trimmed = skill.trim();
      if (!skillCountMap[trimmed]) {
        skillCountMap[trimmed] = { count: 0, roles: new Set<string>() };
      }
      skillCountMap[trimmed].count += 1;
      skillCountMap[trimmed].roles.add(job.title);
    });
  });

  const categoryLookup: Record<string, string> = {
    'React': 'Frameworks',
    'TypeScript': 'Languages',
    'Node.js': 'Frameworks',
    'Python': 'Languages',
    'Docker': 'Cloud & DevOps',
    'Kubernetes': 'Cloud & DevOps',
    'AWS': 'Cloud & DevOps',
    'PostgreSQL': 'Databases',
    'SQL': 'Languages',
    'FastAPI': 'Frameworks',
    'Tailwind CSS': 'Frameworks',
    'PyTorch': 'AI & ML',
    'Gemini API': 'AI & ML',
    'Vector Databases': 'Databases',
    'Go': 'Languages',
    'Linux': 'Cloud & DevOps',
    'CI/CD Pipelines': 'Cloud & DevOps',
    'REST APIs': 'Tools & Protocols',
    'Network Security': 'Tools & Protocols'
  };

  const trends: SkillTrendRecord[] = Object.entries(skillCountMap).map(([name, data]) => {
    const demandPct = Math.round((data.count / totalJobs) * 100);
    let growthTag: SkillTrendRecord['growthTag'] = 'Stable';
    if (demandPct >= 50) growthTag = 'Surging';
    else if (demandPct >= 30) growthTag = 'High Demand';
    else if (demandPct >= 15) growthTag = 'Emerging';

    return {
      skillName: name,
      category: categoryLookup[name] || 'General Tech',
      demandFrequency: demandPct,
      growthTag,
      topRoles: Array.from(data.roles).slice(0, 3),
      updatedAt: new Date().toISOString()
    };
  });

  return trends.sort((a, b) => b.demandFrequency - a.demandFrequency);
}

// --- RESUMES & ANALYSES ---
export async function saveResumeAnalysis(analysis: ResumeAnalysis): Promise<string> {
  const path = 'resumeAnalyses';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...analysis,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getLatestResumeAnalysis(userId: string): Promise<ResumeAnalysis | null> {
  const path = 'resumeAnalyses';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ResumeAnalysis;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return null;
  }
}

export async function saveResumeRecord(record: ResumeRecord): Promise<string> {
  const path = 'resumes';
  try {
    const docRef = await addDoc(collection(db, path), record);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// --- SKILL GAP REPORTS ---
export async function saveSkillGapReport(report: SkillGapReport): Promise<string> {
  const path = 'skillGapReports';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...report,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getUserSkillGapReports(userId: string): Promise<SkillGapReport[]> {
  const path = 'skillGapReports';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SkillGapReport));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// --- LEARNING ROADMAPS ---
export async function saveLearningRoadmap(roadmap: LearningRoadmap): Promise<string> {
  const path = 'learningRoadmaps';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...roadmap,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getUserRoadmaps(userId: string): Promise<LearningRoadmap[]> {
  const path = 'learningRoadmaps';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LearningRoadmap));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function updateRoadmapStatus(roadmapId: string, status: 'active' | 'completed' | 'archived'): Promise<void> {
  const path = `learningRoadmaps/${roadmapId}`;
  try {
    await updateDoc(doc(db, 'learningRoadmaps', roadmapId), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- LEARNING PROGRESS ---
export async function saveLearningProgress(progress: LearningProgress): Promise<void> {
  const path = 'learningProgress';
  try {
    const docId = `${progress.userId}_${progress.roadmapId}`;
    await setDoc(doc(db, path, docId), {
      ...progress,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getLearningProgress(userId: string, roadmapId: string): Promise<LearningProgress | null> {
  const path = `learningProgress/${userId}_${roadmapId}`;
  try {
    const snap = await getDoc(doc(db, 'learningProgress', `${userId}_${roadmapId}`));
    if (!snap.exists()) return null;
    return snap.data() as LearningProgress;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// --- SAVED ITEMS (JOBS / COURSES) ---
export async function toggleSavedItem(userId: string, itemId: string, itemType: 'job' | 'course', itemData: any): Promise<boolean> {
  const docId = `${userId}_${itemId}`;
  const path = `savedItems/${docId}`;
  try {
    const ref = doc(db, 'savedItems', docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      return false; // un-saved
    } else {
      await setDoc(ref, {
        userId,
        itemId,
        itemType,
        itemData,
        savedAt: new Date().toISOString()
      });
      return true; // saved
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function getUserSavedItems(userId: string): Promise<SavedItem[]> {
  const path = 'savedItems';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}
