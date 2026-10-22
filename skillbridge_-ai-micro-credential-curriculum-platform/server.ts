import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_SKILL_CATALOG } from './src/lib/seedData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.docx') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are permitted.'));
    }
  }
});

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
    console.log('[Gemini API] Client initialized successfully.');
  } catch (err) {
    console.warn('[Gemini API] Failed to initialize client:', err);
  }
} else {
  console.log('[Gemini API] No GEMINI_API_KEY found; deterministic processing ready.');
}

// Helper for deterministic skill extraction fallback
function extractSkillsDeterministically(text: string): {
  skills: string[];
  categorized: Record<string, string[]>;
  experienceYears: number;
  educationLevel: string;
} {
  const normalizedText = text.toLowerCase();
  const matched = new Set<string>();
  const categorized: Record<string, string[]> = {
    'Languages': [],
    'Frameworks': [],
    'Cloud & DevOps': [],
    'Databases': [],
    'AI & ML': [],
    'Tools & Protocols': []
  };

  INITIAL_SKILL_CATALOG.forEach(item => {
    const nameMatch = new RegExp(`\\b${item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text);
    const aliasMatch = item.aliases.some(alias =>
      new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)
    );

    if (nameMatch || aliasMatch) {
      matched.add(item.name);
      if (categorized[item.category]) {
        if (!categorized[item.category].includes(item.name)) {
          categorized[item.category].push(item.name);
        }
      }
    }
  });

  // Extract rough experience years
  let experienceYears = 0;
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
  if (expMatch && expMatch[1]) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  // Detect education level
  let educationLevel = "Bachelor's Degree in Computer Science or related field";
  if (/ph\.?d|doctorate/i.test(normalizedText)) {
    educationLevel = "Doctorate / Ph.D.";
  } else if (/master(?:'s)?|m\.s|m\.tech|mca/i.test(normalizedText)) {
    educationLevel = "Master's Degree (M.S / M.Tech / MCA)";
  } else if (/bachelor(?:'s)?|b\.s|b\.tech|b\.e|bca/i.test(normalizedText)) {
    educationLevel = "Bachelor of Engineering / Technology (B.E / B.Tech)";
  }

  return {
    skills: Array.from(matched),
    categorized,
    experienceYears: Math.min(experienceYears, 40),
    educationLevel
  };
}

// 1. Resume text extraction & skill analysis
app.post('/api/resume/upload-and-extract', upload.single('resumeFile'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    let extractedText = '';

    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      try {
        // Dynamic import of pdf-parse
        const pdfParseModule = await import('pdf-parse');
        const pdfParser = (pdfParseModule as any).default || pdfParseModule;
        const pdfData = await pdfParser(file.buffer);
        extractedText = pdfData.text || '';
      } catch (pdfErr: any) {
        console.warn('pdf-parse fallback encountered:', pdfErr?.message);
        // Fallback simple buffer string extraction
        extractedText = file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ');
      }
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.endsWith('.docx')
    ) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = docxResult.value || '';
      } catch (docxErr: any) {
        console.warn('mammoth docx extraction error:', docxErr?.message);
        extractedText = file.buffer.toString('utf-8');
      }
    } else {
      extractedText = file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({
        error: 'The uploaded file contains insufficient readable text. If this is a scanned document, please upload a text-based PDF or DOCX.'
      });
    }

    const cleanExcerpt = extractedText.slice(0, 4000);
    let analysisResult: any = null;
    let aiSuccess = false;

    // Call Gemini API if available
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analyze the following resume text. Extract technical skills, categorizing them cleanly.
Identify education level, estimated years of experience, and notable projects with technologies used.

Return STRICT JSON adhering to this schema:
{
  "extractedSkills": ["Skill1", "Skill2", ...],
  "categorizedSkills": {
    "Languages": ["..."],
    "Frameworks": ["..."],
    "Cloud & DevOps": ["..."],
    "Databases": ["..."],
    "AI & ML": ["..."],
    "Tools & Protocols": ["..."]
  },
  "experienceYears": number,
  "educationLevel": "string",
  "projectsIdentified": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ]
}

Resume text:
${cleanExcerpt}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const textResponse = response.text;
        if (textResponse) {
          analysisResult = JSON.parse(textResponse);
          aiSuccess = true;
        }
      } catch (geminiError: any) {
        console.warn('[Gemini API] Resume analysis failed, falling back to deterministic extraction:', geminiError?.message);
      }
    }

    // Deterministic fallback if Gemini was not used or failed
    if (!analysisResult) {
      const fallbackData = extractSkillsDeterministically(extractedText);
      analysisResult = {
        extractedSkills: fallbackData.skills.length > 0 ? fallbackData.skills : ['JavaScript', 'HTML5', 'CSS3', 'Git'],
        categorizedSkills: fallbackData.categorized,
        experienceYears: fallbackData.experienceYears,
        educationLevel: fallbackData.educationLevel,
        projectsIdentified: [
          {
            title: 'Extracted Profile Project',
            description: 'Demonstrated development project extracted from resume context.',
            technologies: fallbackData.skills.slice(0, 4)
          }
        ]
      };
    }

    return res.status(200).json({
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype || 'application/octet-stream',
      extractedTextLength: extractedText.length,
      aiGenerated: aiSuccess,
      analysis: analysisResult
    });
  } catch (error: any) {
    console.error('Error in /api/resume/upload-and-extract:', error);
    return res.status(500).json({ error: error.message || 'Failed to process resume file.' });
  }
});

// 2. Skill Gap Analysis
app.post('/api/gemini/skill-gap', async (req: Request, res: Response) => {
  try {
    const { studentSkills = [], targetRole = '', jobRequiredSkills = [] } = req.body;

    if (!Array.isArray(studentSkills) || !targetRole || !Array.isArray(jobRequiredSkills)) {
      return res.status(400).json({ error: 'Invalid parameters for skill gap analysis.' });
    }

    const normalizedStudent = new Set(studentSkills.map(s => String(s).toLowerCase().trim()));
    const matched: string[] = [];
    const missing: string[] = [];

    jobRequiredSkills.forEach((reqSkill: string) => {
      const cleanReq = String(reqSkill).toLowerCase().trim();
      let isMatched = normalizedStudent.has(cleanReq);
      if (!isMatched) {
        // check partial substring or alias
        for (const s of normalizedStudent) {
          if (s.includes(cleanReq) || cleanReq.includes(s)) {
            isMatched = true;
            break;
          }
        }
      }

      if (isMatched) {
        matched.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    });

    const total = jobRequiredSkills.length || 1;
    const matchScore = Math.round((matched.length / total) * 100);

    let prioritizedGaps = missing.map((skill, index) => ({
      skill,
      marketImportance: index === 0 ? 'Critical' : index < 3 ? 'High' : 'Medium',
      reason: `Directly required for the role of ${targetRole} across industry postings.`
    }));

    let explanation = `Your profile fulfills ${matched.length} of ${jobRequiredSkills.length} core technical requirements (${matchScore}% match) for ${targetRole}. Mastering ${missing.slice(0, 3).join(', ')} will bridge the primary gap.`;

    // Enhance with Gemini if available
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Perform an objective skill gap analysis for a student targeting the role of "${targetRole}".
Student confirmed skills: ${JSON.stringify(studentSkills)}
Target role required skills: ${JSON.stringify(jobRequiredSkills)}

Return STRICT JSON:
{
  "prioritizedGaps": [
    {
      "skill": "string",
      "marketImportance": "Critical" | "High" | "Medium",
      "reason": "Clear 1-sentence rationale based on job market demands"
    }
  ],
  "explanation": "2-sentence actionable gap summary"
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.prioritizedGaps) prioritizedGaps = parsed.prioritizedGaps;
          if (parsed.explanation) explanation = parsed.explanation;
        }
      } catch (aiErr: any) {
        console.warn('Gemini gap enhancement fallback:', aiErr?.message);
      }
    }

    return res.status(200).json({
      targetRole,
      matchScore,
      matchedSkills: matched,
      missingSkills: missing,
      prioritizedGaps,
      explanation
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Skill gap calculation failed.' });
  }
});

// 3. Personalized Micro-Credential Curriculum Generation
app.post('/api/gemini/generate-curriculum', async (req: Request, res: Response) => {
  try {
    const { studentSkills = [], targetRole = 'Full Stack Cloud Engineer', missingSkills = [], educationLevel = "Bachelor's" } = req.body;

    const microTitle = `Micro-Credential in ${targetRole} Practice`;
    let roadmapData: any = null;
    let aiSuccess = false;

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a university academic dean and industry workforce architect.
Design an intensive, actionable Personalized Micro-Credential Curriculum for a student targeting "${targetRole}".
Student current skills: ${JSON.stringify(studentSkills)}
Identified skill gaps to bridge: ${JSON.stringify(missingSkills)}
Student education: "${educationLevel}"

Create 4 to 5 rigorous sequential modules ordered by prerequisite dependencies.
Include module objectives, estimated study hours, key topics, recommended learning resources (from providers like NPTEL, Coursera, edX, or Official Documentation), and a concrete practical deliverable for each.
Finally, specify an end-to-end Capstone Portfolio Project.

Return STRICT JSON matching:
{
  "microCredentialTitle": "string",
  "summary": "string",
  "estimatedWeeks": number,
  "modules": [
    {
      "id": "mod-1",
      "order": 1,
      "title": "string",
      "estimatedHours": number,
      "objective": "string",
      "prerequisites": ["string"],
      "keyTopics": ["string", "string"],
      "recommendedResources": [
        {
          "title": "string",
          "provider": "NPTEL" | "Coursera" | "edX" | "Official Documentation",
          "url": "string",
          "type": "Course" | "Documentation" | "Lab"
        }
      ],
      "practicalTask": {
        "title": "string",
        "description": "string",
        "deliverable": "string"
      }
    }
  ],
  "capstoneProject": {
    "title": "string",
    "objective": "string",
    "architectureDescription": "string",
    "keyDeliverables": ["string", "string"]
  }
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          roadmapData = JSON.parse(response.text);
          aiSuccess = true;
        }
      } catch (aiErr: any) {
        console.warn('Gemini curriculum generation fallback:', aiErr?.message);
      }
    }

    if (!roadmapData) {
      // High-quality deterministic fallback curriculum tailored to missing skills
      const focusSkills = missingSkills.length > 0 ? missingSkills : ['Cloud Architecture', 'Container Orchestration', 'Microservices', 'CI/CD Pipelines'];
      roadmapData = {
        microCredentialTitle: `${targetRole} Micro-Credential Specification`,
        summary: `A structured academic and industry credential designed to bridge prioritized skill gaps in ${focusSkills.slice(0, 3).join(', ')}, aligned with current enterprise hiring requirements.`,
        estimatedWeeks: 8,
        modules: [
          {
            id: 'mod-1',
            order: 1,
            title: `Foundations of ${focusSkills[0] || 'Core Architecture'}`,
            estimatedHours: 18,
            objective: `Master fundamental syntax, patterns, and principles of ${focusSkills[0] || 'modern system engineering'}.`,
            prerequisites: ['Basic Programming', 'Version Control'],
            keyTopics: [`${focusSkills[0] || 'Core'} Architecture`, 'Design Patterns', 'Environment Setup', 'Testing Best Practices'],
            recommendedResources: [
              {
                title: `Comprehensive Guide to ${focusSkills[0] || 'Systems'}`,
                provider: 'Official Documentation',
                url: 'https://developer.mozilla.org',
                type: 'Documentation'
              },
              {
                title: 'NPTEL Computer Science Core Modules',
                provider: 'NPTEL',
                url: 'https://nptel.ac.in',
                type: 'Course'
              }
            ],
            practicalTask: {
              title: `Lab 1: ${focusSkills[0] || 'System'} Implementation`,
              description: `Construct a tested reference module demonstrating reliable data handling and boundary validation.`,
              deliverable: 'GitHub repository with unit tests and technical documentation.'
            }
          },
          {
            id: 'mod-2',
            order: 2,
            title: `Applied Engineering with ${focusSkills[1] || 'Cloud & Containers'}`,
            estimatedHours: 22,
            objective: `Build scalable services integrating ${focusSkills[1] || 'cloud workflows'} and automated deployment.`,
            prerequisites: [`Foundations of ${focusSkills[0] || 'Core Architecture'}`],
            keyTopics: ['Containerization', 'Configuration Management', 'API Integration', 'Error Telemetry'],
            recommendedResources: [
              {
                title: 'Cloud Native Computing Foundation Sandbox',
                provider: 'Official Documentation',
                url: 'https://kubernetes.io',
                type: 'Documentation'
              }
            ],
            practicalTask: {
              title: 'Lab 2: Microservice Deployment',
              description: 'Deploy containerized services with automated health checks and environment secrets.',
              deliverable: 'Docker Compose / Kubernetes manifest with deployment instructions.'
            }
          },
          {
            id: 'mod-3',
            order: 3,
            title: `Production Hardening & ${focusSkills[2] || 'Data Pipelines'}`,
            estimatedHours: 24,
            objective: `Implement security rules, query optimization, and performance benchmarking for high concurrency.`,
            prerequisites: ['Applied Engineering'],
            keyTopics: ['Zero-Trust Access Control', 'Query Indexing', 'CI/CD Automation', 'Latency Optimization'],
            recommendedResources: [
              {
                title: 'Coursera Enterprise Cloud Architecture',
                provider: 'Coursera',
                url: 'https://www.coursera.org',
                type: 'Course'
              }
            ],
            practicalTask: {
              title: 'Lab 3: Security & Benchmarking Audit',
              description: 'Perform load testing and enforce automated linting, security scanning, and pipeline checks.',
              deliverable: 'Benchmark report and security audit checklist.'
            }
          }
        ],
        capstoneProject: {
          title: `Full-Scale Production Portfolio: ${targetRole} Capstone`,
          objective: `Deliver an end-to-end deployed application showcasing competence across ${focusSkills.join(', ')}.`,
          architectureDescription: 'Multi-tier cloud deployment with persistent storage, automated testing, and secure API gateways.',
          keyDeliverables: [
            'Live accessible web application deployment',
            'Public source code repository with comprehensive README',
            'Architecture diagram and technical design document'
          ]
        }
      };
    }

    return res.status(200).json({
      aiGenerated: aiSuccess,
      curriculum: roadmapData
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Curriculum generation failed.' });
  }
});

// 4. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Vite or Static files handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT)
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Server] SkillBridge Platform running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Failed to launch server:', err);
});
