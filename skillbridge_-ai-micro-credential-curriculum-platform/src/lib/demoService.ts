import {
  saveResumeAnalysis,
  saveSkillGapReport,
  saveLearningRoadmap,
  saveLearningProgress,
  getLatestResumeAnalysis
} from './dataService';
import { UserProfile, ResumeAnalysis, SkillGapReport, LearningRoadmap, LearningProgress } from '../types';

/**
 * Creates default demonstration profile and seeds sample data for an anonymous/evaluator user
 */
export async function seedDemoUserData(userId: string): Promise<void> {
  try {
    // Check if demo user already has an analysis to avoid duplicate writes
    const existing = await getLatestResumeAnalysis(userId);
    if (existing) {
      return;
    }

    // 1. Seed Demo Resume Analysis
    const demoAnalysis: ResumeAnalysis = {
      userId,
      resumeFileName: 'sample_cs_student_resume.pdf (Demonstration)',
      extractedSkills: ['React', 'JavaScript', 'Python', 'HTML5', 'CSS3', 'Git', 'SQL', 'REST APIs'],
      categorizedSkills: {
        'Languages': ['JavaScript', 'Python', 'SQL'],
        'Frameworks': ['React'],
        'Tools & Protocols': ['Git', 'HTML5', 'CSS3', 'REST APIs']
      },
      experienceYears: 1,
      educationLevel: 'Bachelor of Technology in Computer Science (Demo Record)',
      projectsIdentified: [
        {
          title: 'Interactive Cloud Web Portal',
          description: 'Built a responsive single-page application with modern component state management and REST API integration.',
          technologies: ['React', 'JavaScript', 'Tailwind CSS']
        }
      ],
      aiGenerated: true,
      updatedAt: new Date().toISOString()
    };
    await saveResumeAnalysis(demoAnalysis);

    // 2. Seed Demo Skill-Gap Report
    const demoGapReport: SkillGapReport = {
      userId,
      targetRole: 'Full Stack Cloud Engineer',
      matchScore: 50,
      matchedSkills: ['React', 'JavaScript', 'Python', 'Git', 'REST APIs'],
      missingSkills: ['Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'TypeScript'],
      prioritizedGaps: [
        {
          skill: 'AWS',
          marketImportance: 'Critical',
          reason: 'Primary cloud platform required for scalable distributed system deployment.'
        },
        {
          skill: 'Docker',
          marketImportance: 'Critical',
          reason: 'Containerization is essential for reproducible microservices packaging.'
        },
        {
          skill: 'PostgreSQL',
          marketImportance: 'High',
          reason: 'Relational data modeling and transactional integrity in production.'
        },
        {
          skill: 'TypeScript',
          marketImportance: 'High',
          reason: 'Type safety standard for enterprise front-end and back-end codebases.'
        }
      ],
      explanation: 'Demonstration Analysis: Your profile demonstrates solid frontend fundamentals in React and Python. Bridging missing competencies in Docker, AWS, and PostgreSQL will qualify you for the Full Stack Cloud Engineer profile.',
      createdAt: new Date().toISOString()
    };
    await saveSkillGapReport(demoGapReport);

    // 3. Seed Demo Personalized Learning Roadmap
    const demoRoadmap: LearningRoadmap = {
      userId,
      targetRole: 'Full Stack Cloud Engineer',
      microCredentialTitle: 'Cloud-Native Full Stack Engineering Micro-Credential (Demo)',
      summary: 'Demonstration competency-based curriculum bridging frontend web development to cloud-native microservices, containerization, and AWS infrastructure.',
      estimatedWeeks: 8,
      totalModules: 3,
      modules: [
        {
          id: 'mod-demo-1',
          order: 1,
          title: 'Type-Safe Application Architecture with TypeScript',
          estimatedHours: 15,
          objective: 'Transition JavaScript applications to strictly typed TypeScript architectures with robust interfaces.',
          prerequisites: ['JavaScript', 'React'],
          keyTopics: ['Static Typing', 'Interfaces & Generics', 'Strict Compiler Rules', 'State Typing'],
          recommendedResources: [
            {
              title: 'TypeScript Official Handbook',
              provider: 'Official Documentation',
              url: 'https://www.typescriptlang.org/docs/',
              type: 'Documentation'
            }
          ],
          practicalTask: {
            title: 'React Codebase Type Migration',
            description: 'Refactor a multi-component React codebase into strict TypeScript with zero any definitions.',
            deliverable: 'TypeScript GitHub repository passing compiler verification.'
          }
        },
        {
          id: 'mod-demo-2',
          order: 2,
          title: 'Containerization & Microservices with Docker',
          estimatedHours: 20,
          objective: 'Build multi-stage containerized services with automated health checks and compose files.',
          prerequisites: ['Node.js', 'Linux Basics'],
          keyTopics: ['Dockerfiles', 'Multi-Stage Builds', 'Compose Topologies', 'Container Networking'],
          recommendedResources: [
            {
              title: 'Docker Getting Started Guide',
              provider: 'Official Documentation',
              url: 'https://docs.docker.com/get-started/',
              type: 'Documentation'
            }
          ],
          practicalTask: {
            title: 'Multi-Container Service Topology',
            description: 'Orchestrate a Node.js API with PostgreSQL and Redis using Docker Compose.',
            deliverable: 'Docker Compose manifest and build scripts.'
          }
        },
        {
          id: 'mod-demo-3',
          order: 3,
          title: 'Cloud Deployment & CI/CD Pipelines on AWS',
          estimatedHours: 25,
          objective: 'Deploy scalable containerized applications to AWS with automated GitHub Actions.',
          prerequisites: ['Docker Containerization'],
          keyTopics: ['AWS ECS Fargate', 'Application Load Balancers', 'CI/CD Automation', 'Cloud Security'],
          recommendedResources: [
            {
              title: 'AWS Skill Builder Cloud Architecture',
              provider: 'Official Documentation',
              url: 'https://explore.skillbuilder.aws/',
              type: 'Course'
            }
          ],
          practicalTask: {
            title: 'Automated Cloud CI/CD Pipeline',
            description: 'Configure automated testing and container deployment pipeline to cloud runtime.',
            deliverable: 'GitHub Actions workflow and cloud infrastructure templates.'
          }
        }
      ],
      capstoneProject: {
        title: 'Distributed Cloud-Native Microservices Architecture',
        objective: 'Build, containerize, and deploy an end-to-end full stack application to the cloud.',
        architectureDescription: 'Multi-tier cloud deployment with persistent PostgreSQL storage, Redis cache, and automated testing.',
        keyDeliverables: [
          'Deployed full stack web application',
          'Tested GitHub repository with CI/CD automation',
          'Architecture design specification document'
        ]
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const roadmapId = await saveLearningRoadmap(demoRoadmap);

    // 4. Seed Demo Learning Progress
    const demoProgress: LearningProgress = {
      userId,
      roadmapId,
      completedModuleIds: ['mod-demo-1'],
      percentComplete: 33,
      notes: '[Demonstration Study Log] Completed Module 1 type migration lab with full unit test coverage.',
      lastUpdated: new Date().toISOString()
    };
    await saveLearningProgress(demoProgress);
  } catch (err) {
    console.warn('[Demo Service] Notice during demo data initialization:', err);
  }
}
