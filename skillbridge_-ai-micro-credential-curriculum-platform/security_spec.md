# Security Specification: AI Micro-Credential Curriculum Platform

## 1. Data Invariants

1. **Identity & Ownership Integrity**: A student can only create, read, update, or delete their own user profile, resume record, resume analysis, skill gap report, learning roadmap, progress record, and saved items (`userId == request.auth.uid`).
2. **Role Elevation Guard**: Regular students cannot set their own role to `"admin"`, nor write to the `/admins/{adminId}` collection, nor modify administrative job dataset postings, skill trends, or global learning resources.
3. **Admin Exclusivity**: Admin endpoints and collections (`admins`, `jobPostings`, `skillTrends`, `learningResources` mutations) can only be modified by verified administrators present in `/admins/{uid}` or matching the configured administrator email (`surendarr.cd23@bitsathy.ac.in`).
4. **Market & Resource Public Read**: Approved `jobPostings`, `skillTrends`, and `learningResources` are readable by authenticated users so students can analyze gaps and discover recommendations.
5. **No Client-Side Delegation**: List queries for student records must strictly validate that `resource.data.userId == request.auth.uid`.
6. **Immutable Provenance**: Document ownership (`userId`, `uid`) cannot be altered on update.
7. **Size & Input Boundaries**: String lengths, collection sizes, and required keys are strictly bounded to prevent resource exhaustion attacks.

## 2. The "Dirty Dozen" Payloads (Vulnerability Test Scenarios)

1. **Payload 1 (Identity Hijack in Profile)**: Non-admin user `uid_alice` attempts to update profile at `/users/uid_bob` with `{ uid: "uid_bob", displayName: "Attacker" }`. -> *PERMISSION_DENIED*
2. **Payload 2 (Role Escalation on Signup)**: User `uid_alice` attempts to write `{ uid: "uid_alice", role: "admin", email: "alice@test.com" }` to self-assign the admin role. -> *PERMISSION_DENIED*
3. **Payload 3 (Direct Admin Collection Injection)**: User `uid_alice` writes to `/admins/uid_alice` with `{ uid: "uid_alice", email: "alice@test.com" }`. -> *PERMISSION_DENIED*
4. **Payload 4 (Resume Record Spoofing)**: User `uid_alice` creates a resume at `/resumes/res_123` with `{ userId: "uid_bob", fileName: "resume.pdf" }`. -> *PERMISSION_DENIED*
5. **Payload 5 (Cross-Student Resume Analysis Read)**: User `uid_alice` tries to get `/resumeAnalyses/analysis_bob` where `resource.data.userId == "uid_bob"`. -> *PERMISSION_DENIED*
6. **Payload 6 (Unauthorized Job Posting Injection)**: Student `uid_alice` writes to `/jobPostings/job_malicious` with phishing content. -> *PERMISSION_DENIED*
7. **Payload 7 (Skill Trend Tampering)**: Student `uid_alice` attempts to delete or update `/skillTrends/trend_react`. -> *PERMISSION_DENIED*
8. **Payload 8 (Roadmap Theft / Overwrite)**: User `uid_alice` attempts to update `/learningRoadmaps/roadmap_bob` to alter completion status. -> *PERMISSION_DENIED*
9. **Payload 9 (Oversized Payload / Denial of Wallet)**: User `uid_alice` writes a resume note with a 50MB string to `/users/uid_alice`. -> *PERMISSION_DENIED*
10. **Payload 10 (Immutability Bypass)**: User `uid_alice` updates `/learningRoadmaps/roadmap_alice` modifying `userId: "uid_bob"`. -> *PERMISSION_DENIED*
11. **Payload 11 (Unauthenticated Probe)**: Anonymous/unauthenticated user attempts to list `/learningRoadmaps`. -> *PERMISSION_DENIED*
12. **Payload 12 (Course Resource Defacement)**: Regular user attempts to modify official URL in `/learningResources/course_nptel_1`. -> *PERMISSION_DENIED*
