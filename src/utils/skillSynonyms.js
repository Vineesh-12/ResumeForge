/**
 * Comprehensive Tech Skill & Synonym Mapping Dictionary for ResumeForge
 * Used for normalizing terms and detecting partial/synonym matches.
 */

export const SKILL_SYNONYMS = {
  // Programming Languages
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'vanilla js', 'modern javascript'],
  'typescript': ['ts'],
  'python': ['py', 'python3', 'python 3'],
  'golang': ['go', 'go lang', 'golang'],
  'c++': ['cpp', 'c plus plus'],
  'c#': ['c sharp', 'csharp', '.net'],
  'java': ['core java', 'java 8', 'java 11', 'java 17', 'java 21'],
  'ruby': ['ruby on rails', 'rails'],
  'rust': ['rustlang', 'rust-lang'],
  'sql': ['structured query language', 'ansi sql', 't-sql', 'pl/sql'],
  'html': ['html5', 'html 5'],
  'css': ['css3', 'css 3', 'modern css'],

  // Frameworks & Libraries
  'react': ['react.js', 'reactjs', 'react js', 'react framework'],
  'react native': ['react-native', 'rn'],
  'next.js': ['nextjs', 'next js', 'next'],
  'vue': ['vue.js', 'vuejs', 'vue 3', 'vue2'],
  'angular': ['angular.js', 'angularjs', 'angular 2+'],
  'node.js': ['nodejs', 'node js', 'node'],
  'express.js': ['express', 'expressjs'],
  'nest.js': ['nestjs', 'nest js', 'nest'],
  'django': ['django rest framework', 'drf'],
  'fastapi': ['fast-api', 'fast api'],
  'flask': ['flask framework'],
  'spring boot': ['springboot', 'spring', 'spring framework'],
  'tailwind css': ['tailwindcss', 'tailwind'],
  'bootstrap': ['bootstrap 5', 'bootstrap 4'],
  'redux': ['redux toolkit', 'rtk', 'react-redux'],

  // Databases & Caches
  'postgresql': ['postgres', 'psql', 'postgres db'],
  'mongodb': ['mongo', 'mongodb atlas', 'nosql'],
  'mysql': ['my-sql', 'mariadb'],
  'redis': ['redis cache', 'redis db'],
  'elasticsearch': ['elastic search', 'elk stack', 'opensearch'],
  'dynamodb': ['dynamo db', 'aws dynamodb'],
  'sqlite': ['sqlite3'],

  // Cloud & DevOps
  'amazon web services': ['aws', 'amazon cloud'],
  'google cloud platform': ['gcp', 'google cloud'],
  'microsoft azure': ['azure', 'azure cloud'],
  'docker': ['docker containerization', 'docker compose', 'containerization'],
  'kubernetes': ['k8s', 'kube'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'ci cd', 'github actions', 'gitlab ci', 'jenkins'],
  'terraform': ['tf', 'iac', 'infrastructure as code'],
  'linux': ['unix', 'ubuntu', 'debian', 'centos', 'bash scripting'],
  'git': ['github', 'gitlab', 'version control', 'git version control'],

  // Architectures & Methodologies
  'rest api': ['restful api', 'rest apis', 'restful apis', 'rest', 'web apis'],
  'graphql': ['gql', 'apollo graphql'],
  'microservices': ['microservice architecture', 'distributed systems'],
  'agile': ['scrum', 'kanban', 'sprint planning', 'jira'],
  'test-driven development': ['tdd', 'unit testing', 'jest', 'cypress', 'mocha', 'chai', 'automated testing'],
  'object-oriented programming': ['oop', 'oops'],
  'data structures and algorithms': ['dsa', 'data structures', 'algorithms']
}

/**
 * Normalizes a skill string (removes special characters, lowercase, trims).
 * @param {string} skill 
 * @returns {string}
 */
export function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return ''
  return skill
    .toLowerCase()
    .trim()
    .replace(/[•\-_.]/g, ' ')
    .replace(/\s+/g, ' ')
}

/**
 * Checks if two skill names are matches or synonyms.
 * @param {string} skillA 
 * @param {string} skillB 
 * @returns {{ isMatch: boolean, isSynonym: boolean, confidence: number }}
 */
export function compareSkills(skillA, skillB) {
  const normA = normalizeSkill(skillA)
  const normB = normalizeSkill(skillB)

  if (!normA || !normB) {
    return { isMatch: false, isSynonym: false, confidence: 0 }
  }

  // Exact Normalized Match
  if (normA === normB) {
    return { isMatch: true, isSynonym: false, confidence: 100 }
  }

  // Substring inclusion (e.g. "React" inside "React.js" or "PostgreSQL" inside "PostgreSQL Database")
  if (normA.includes(normB) || normB.includes(normA)) {
    return { isMatch: true, isSynonym: true, confidence: 90 }
  }

  // Check synonym dictionary
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const group = [canonical, ...synonyms].map(normalizeSkill)
    const hasA = group.some(item => item === normA || normA.includes(item))
    const hasB = group.some(item => item === normB || normB.includes(item))

    if (hasA && hasB) {
      return { isMatch: true, isSynonym: true, confidence: 85 }
    }
  }

  return { isMatch: false, isSynonym: false, confidence: 0 }
}
