export type CareerRole = 'frontend' | 'backend' | 'data' | 'devops' | 'ai';
export type SkillStatus = 'completed' | 'available' | 'locked';

export interface RoadmapSkill {
  id: string;
  label: string;
  icon: string;
  xp: number;
  status: SkillStatus;
  resources: { label: string; url: string }[];
  description: string;
}

export interface RoadmapPhase {
  id: string;
  label: string;
  skills: RoadmapSkill[];
}

export const ROLE_ROADMAPS: Record<CareerRole, RoadmapPhase[]> = {
  frontend: [
    {
      id: 'foundation', label: 'Foundation',
      skills: [
        { id: 'html', label: 'HTML & CSS', icon: '🌐', xp: 50, status: 'completed', description: 'Build semantic HTML pages and style with CSS.', resources: [{ label: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' }] },
        { id: 'git', label: 'Git & CLI', icon: '📦', xp: 50, status: 'completed', description: 'Version control your projects with Git.', resources: [{ label: 'Git Handbook', url: 'https://guides.github.com/introduction/git-handbook/' }] },
        { id: 'js', label: 'JavaScript', icon: '⚡', xp: 80, status: 'available', description: 'Core programming concepts in JS.', resources: [{ label: 'JavaScript.info', url: 'https://javascript.info' }] },
        { id: 'responsive', label: 'Responsive Design', icon: '📱', xp: 50, status: 'locked', description: 'Make layouts work on any screen size.', resources: [{ label: 'freeCodeCamp Responsive', url: 'https://www.freecodecamp.org/learn/responsive-web-design/' }] },
      ],
    },
    {
      id: 'core', label: 'Core Dev',
      skills: [
        { id: 'react', label: 'React', icon: '⚛️', xp: 100, status: 'locked', description: 'Build UIs with React components and hooks.', resources: [{ label: 'React Docs', url: 'https://react.dev' }] },
        { id: 'typescript', label: 'TypeScript', icon: '🔷', xp: 80, status: 'locked', description: 'Add type safety to your JS code.', resources: [{ label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' }] },
        { id: 'nextjs', label: 'Next.js', icon: '▲', xp: 90, status: 'locked', description: 'Full-stack React framework for production apps.', resources: [{ label: 'Next.js Docs', url: 'https://nextjs.org/docs' }] },
        { id: 'state', label: 'State Management', icon: '🔄', xp: 70, status: 'locked', description: 'Manage global state with Zustand or Redux.', resources: [{ label: 'Zustand Docs', url: 'https://zustand-demo.pmnd.rs/' }] },
      ],
    },
    {
      id: 'advanced', label: 'Advanced',
      skills: [
        { id: 'testing', label: 'Testing', icon: '✅', xp: 80, status: 'locked', description: 'Write unit and integration tests.', resources: [{ label: 'Vitest Docs', url: 'https://vitest.dev' }] },
        { id: 'perf', label: 'Performance', icon: '🚀', xp: 90, status: 'locked', description: 'Optimize Core Web Vitals and bundle size.', resources: [{ label: 'web.dev Performance', url: 'https://web.dev/performance/' }] },
        { id: 'a11y', label: 'Accessibility', icon: '♿', xp: 70, status: 'locked', description: 'Build inclusive interfaces for all users.', resources: [{ label: 'a11y Project', url: 'https://www.a11yproject.com/' }] },
        { id: 'api', label: 'REST & GraphQL', icon: '🔌', xp: 80, status: 'locked', description: 'Consume and build APIs effectively.', resources: [{ label: 'REST API Tutorial', url: 'https://restfulapi.net/' }] },
      ],
    },
    {
      id: 'jobready', label: 'Job Ready',
      skills: [
        { id: 'portfolio', label: 'Portfolio Site', icon: '🎨', xp: 100, status: 'locked', description: 'Build and deploy your personal portfolio.', resources: [{ label: 'Vercel Deploy', url: 'https://vercel.com' }] },
        { id: 'oss', label: 'Open Source', icon: '🌱', xp: 80, status: 'locked', description: 'Contribute to open source projects.', resources: [{ label: 'First Contributions', url: 'https://firstcontributions.github.io/' }] },
        { id: 'system', label: 'System Design', icon: '🏗️', xp: 120, status: 'locked', description: 'Design scalable frontend architectures.', resources: [{ label: 'Frontend System Design', url: 'https://www.frontendinterviewhandbook.com/front-end-system-design' }] },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', xp: 100, status: 'locked', description: 'Ace technical and behavioral interviews.', resources: [{ label: 'Blind 75 LeetCode', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions' }] },
      ],
    },
  ],
  backend: [
    {
      id: 'foundation', label: 'Foundation',
      skills: [
        { id: 'python', label: 'Python / Node.js', icon: '🐍', xp: 80, status: 'completed', description: 'Pick a backend language and learn the basics.', resources: [{ label: 'Python Docs', url: 'https://docs.python.org/3/' }] },
        { id: 'git', label: 'Git & CLI', icon: '📦', xp: 50, status: 'completed', description: 'Version control and terminal fluency.', resources: [{ label: 'Git Handbook', url: 'https://guides.github.com/introduction/git-handbook/' }] },
        { id: 'sql', label: 'SQL', icon: '🗄️', xp: 80, status: 'available', description: 'Query relational databases with SQL.', resources: [{ label: 'SQLZoo', url: 'https://sqlzoo.net/' }] },
        { id: 'http', label: 'HTTP & APIs', icon: '🌐', xp: 60, status: 'locked', description: 'Understand request/response, REST principles.', resources: [{ label: 'HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' }] },
      ],
    },
    {
      id: 'core', label: 'Core Dev',
      skills: [
        { id: 'express', label: 'Express / FastAPI', icon: '⚡', xp: 90, status: 'locked', description: 'Build REST APIs with a framework.', resources: [{ label: 'Express Docs', url: 'https://expressjs.com/' }] },
        { id: 'postgres', label: 'PostgreSQL', icon: '🐘', xp: 80, status: 'locked', description: 'Advanced relational database usage.', resources: [{ label: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/' }] },
        { id: 'auth', label: 'Auth & Security', icon: '🔐', xp: 100, status: 'locked', description: 'JWT, OAuth2, and security best practices.', resources: [{ label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }] },
        { id: 'docker', label: 'Docker', icon: '🐳', xp: 90, status: 'locked', description: 'Containerize your applications.', resources: [{ label: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' }] },
      ],
    },
    {
      id: 'advanced', label: 'Advanced',
      skills: [
        { id: 'microservices', label: 'Microservices', icon: '🏗️', xp: 120, status: 'locked', description: 'Break monoliths into scalable services.', resources: [{ label: 'Microservices.io', url: 'https://microservices.io/' }] },
        { id: 'redis', label: 'Redis & Caching', icon: '⚡', xp: 80, status: 'locked', description: 'Speed up apps with in-memory caching.', resources: [{ label: 'Redis Docs', url: 'https://redis.io/docs/' }] },
        { id: 'testing', label: 'Testing', icon: '✅', xp: 80, status: 'locked', description: 'Unit, integration, and load testing.', resources: [{ label: 'Jest Docs', url: 'https://jestjs.io/' }] },
        { id: 'cicd', label: 'CI/CD', icon: '🔄', xp: 90, status: 'locked', description: 'Automate builds and deployments.', resources: [{ label: 'GitHub Actions', url: 'https://docs.github.com/en/actions' }] },
      ],
    },
    {
      id: 'jobready', label: 'Job Ready',
      skills: [
        { id: 'cloud', label: 'Cloud (AWS/GCP)', icon: '☁️', xp: 120, status: 'locked', description: 'Deploy apps to cloud platforms.', resources: [{ label: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' }] },
        { id: 'system', label: 'System Design', icon: '📐', xp: 130, status: 'locked', description: 'Design scalable distributed systems.', resources: [{ label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }] },
        { id: 'oss', label: 'Open Source', icon: '🌱', xp: 80, status: 'locked', description: 'Contribute to backend open source projects.', resources: [{ label: 'First Contributions', url: 'https://firstcontributions.github.io/' }] },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', xp: 100, status: 'locked', description: 'System design and coding interviews.', resources: [{ label: 'Neetcode.io', url: 'https://neetcode.io/' }] },
      ],
    },
  ],
  data: [
    {
      id: 'foundation', label: 'Foundation',
      skills: [
        { id: 'python', label: 'Python', icon: '🐍', xp: 80, status: 'completed', description: 'Python for data science: pandas, numpy.', resources: [{ label: 'Kaggle Python Course', url: 'https://www.kaggle.com/learn/python' }] },
        { id: 'sql', label: 'SQL', icon: '🗄️', xp: 80, status: 'available', description: 'Query and manipulate relational data.', resources: [{ label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' }] },
        { id: 'stats', label: 'Statistics', icon: '📊', xp: 90, status: 'locked', description: 'Probability, hypothesis testing, distributions.', resources: [{ label: 'Khan Academy Stats', url: 'https://www.khanacademy.org/math/statistics-probability' }] },
        { id: 'excel', label: 'Excel / Sheets', icon: '📋', xp: 50, status: 'locked', description: 'Data manipulation in spreadsheets.', resources: [{ label: 'Excel for Data Analysis', url: 'https://www.coursera.org/learn/excel-data-analysis' }] },
      ],
    },
    {
      id: 'core', label: 'Core Data',
      skills: [
        { id: 'pandas', label: 'Pandas & NumPy', icon: '🐼', xp: 90, status: 'locked', description: 'Data wrangling and analysis in Python.', resources: [{ label: 'Pandas Docs', url: 'https://pandas.pydata.org/docs/' }] },
        { id: 'viz', label: 'Data Visualization', icon: '📈', xp: 80, status: 'locked', description: 'Matplotlib, Seaborn, Tableau.', resources: [{ label: 'Matplotlib Tutorials', url: 'https://matplotlib.org/stable/tutorials/' }] },
        { id: 'ml', label: 'Machine Learning', icon: '🤖', xp: 120, status: 'locked', description: 'Scikit-learn, supervised/unsupervised learning.', resources: [{ label: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/' }] },
        { id: 'bigdata', label: 'Big Data Tools', icon: '💾', xp: 100, status: 'locked', description: 'Spark, Hadoop, data pipelines.', resources: [{ label: 'Apache Spark Docs', url: 'https://spark.apache.org/docs/latest/' }] },
      ],
    },
    {
      id: 'advanced', label: 'Advanced',
      skills: [
        { id: 'dl', label: 'Deep Learning', icon: '🧠', xp: 130, status: 'locked', description: 'Neural networks with PyTorch or TensorFlow.', resources: [{ label: 'Fast.ai', url: 'https://www.fast.ai/' }] },
        { id: 'cloud', label: 'Cloud Data (AWS)', icon: '☁️', xp: 110, status: 'locked', description: 'S3, Redshift, Glue, Athena.', resources: [{ label: 'AWS Data Analytics', url: 'https://aws.amazon.com/big-data/datalakes-and-analytics/' }] },
        { id: 'etl', label: 'ETL Pipelines', icon: '🔄', xp: 100, status: 'locked', description: 'Build data pipelines with Airflow or dbt.', resources: [{ label: 'dbt Docs', url: 'https://docs.getdbt.com/' }] },
        { id: 'ab', label: 'A/B Testing', icon: '⚗️', xp: 80, status: 'locked', description: 'Design and analyse experiments.', resources: [{ label: 'A/B Testing Guide', url: 'https://www.optimizely.com/optimization-glossary/ab-testing/' }] },
      ],
    },
    {
      id: 'jobready', label: 'Job Ready',
      skills: [
        { id: 'portfolio', label: 'Data Portfolio', icon: '🎨', xp: 100, status: 'locked', description: 'Publish notebooks and projects on GitHub/Kaggle.', resources: [{ label: 'Kaggle', url: 'https://www.kaggle.com/' }] },
        { id: 'sql_adv', label: 'Advanced SQL', icon: '🔍', xp: 80, status: 'locked', description: 'Window functions, CTEs, query optimization.', resources: [{ label: 'Advanced SQL', url: 'https://mode.com/sql-tutorial/sql-window-functions/' }] },
        { id: 'comm', label: 'Data Storytelling', icon: '📣', xp: 80, status: 'locked', description: 'Present insights to non-technical stakeholders.', resources: [{ label: 'Storytelling with Data', url: 'https://www.storytellingwithdata.com/' }] },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', xp: 100, status: 'locked', description: 'SQL case studies and statistics questions.', resources: [{ label: 'StrataScratch', url: 'https://www.stratascratch.com/' }] },
      ],
    },
  ],
  devops: [
    {
      id: 'foundation', label: 'Foundation',
      skills: [
        { id: 'linux', label: 'Linux & CLI', icon: '🐧', xp: 70, status: 'completed', description: 'Shell scripting and Linux administration.', resources: [{ label: 'Linux Journey', url: 'https://linuxjourney.com/' }] },
        { id: 'git', label: 'Git & Version Control', icon: '📦', xp: 50, status: 'completed', description: 'Branching strategies, Git workflows.', resources: [{ label: 'Atlassian Git', url: 'https://www.atlassian.com/git' }] },
        { id: 'networking', label: 'Networking', icon: '🌐', xp: 80, status: 'available', description: 'DNS, TCP/IP, HTTP, load balancing.', resources: [{ label: 'Computer Networking Course', url: 'https://www.coursera.org/learn/computer-networking' }] },
        { id: 'scripting', label: 'Bash / Python', icon: '📜', xp: 70, status: 'locked', description: 'Automate tasks with scripting.', resources: [{ label: 'Bash Scripting Guide', url: 'https://tldp.org/LDP/Bash-Beginners-Guide/html/' }] },
      ],
    },
    {
      id: 'core', label: 'Core DevOps',
      skills: [
        { id: 'docker', label: 'Docker', icon: '🐳', xp: 90, status: 'locked', description: 'Containerize applications with Docker.', resources: [{ label: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' }] },
        { id: 'k8s', label: 'Kubernetes', icon: '☸️', xp: 130, status: 'locked', description: 'Orchestrate containers at scale.', resources: [{ label: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/home/' }] },
        { id: 'cicd', label: 'CI/CD Pipelines', icon: '🔄', xp: 100, status: 'locked', description: 'GitHub Actions, Jenkins, GitLab CI.', resources: [{ label: 'GitHub Actions', url: 'https://docs.github.com/en/actions' }] },
        { id: 'iac', label: 'Terraform / IaC', icon: '🏗️', xp: 110, status: 'locked', description: 'Infrastructure as Code with Terraform.', resources: [{ label: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' }] },
      ],
    },
    {
      id: 'advanced', label: 'Advanced',
      skills: [
        { id: 'cloud', label: 'Cloud (AWS/GCP/Azure)', icon: '☁️', xp: 130, status: 'locked', description: 'Cloud infrastructure and managed services.', resources: [{ label: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' }] },
        { id: 'monitoring', label: 'Monitoring', icon: '📊', xp: 90, status: 'locked', description: 'Prometheus, Grafana, logging pipelines.', resources: [{ label: 'Prometheus Docs', url: 'https://prometheus.io/docs/introduction/overview/' }] },
        { id: 'security', label: 'DevSecOps', icon: '🔐', xp: 110, status: 'locked', description: 'Security scanning, SAST, DAST integration.', resources: [{ label: 'OWASP DevSecOps', url: 'https://owasp.org/www-project-devsecops-guideline/' }] },
        { id: 'sre', label: 'SRE Practices', icon: '⚡', xp: 100, status: 'locked', description: 'SLOs, SLAs, incident management.', resources: [{ label: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/' }] },
      ],
    },
    {
      id: 'jobready', label: 'Job Ready',
      skills: [
        { id: 'certs', label: 'Cloud Certifications', icon: '🏅', xp: 150, status: 'locked', description: 'AWS Solutions Architect or CKA cert.', resources: [{ label: 'AWS Certification', url: 'https://aws.amazon.com/certification/' }] },
        { id: 'portfolio', label: 'Infrastructure Portfolio', icon: '🎨', xp: 100, status: 'locked', description: 'Build and document live infrastructure projects.', resources: [{ label: 'GitHub', url: 'https://github.com' }] },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', xp: 100, status: 'locked', description: 'DevOps system design and scenario questions.', resources: [{ label: 'DevOps Interview Qs', url: 'https://github.com/bregman-arie/devops-exercises' }] },
        { id: 'open', label: 'Open Source Ops', icon: '🌱', xp: 80, status: 'locked', description: 'Contribute to CNCF or Kubernetes ecosystem.', resources: [{ label: 'CNCF Projects', url: 'https://www.cncf.io/projects/' }] },
      ],
    },
  ],
  ai: [
    {
      id: 'foundation', label: 'Foundation',
      skills: [
        { id: 'python', label: 'Python', icon: '🐍', xp: 80, status: 'completed', description: 'Python fundamentals for AI/ML work.', resources: [{ label: 'Python for Everybody', url: 'https://www.py4e.com/' }] },
        { id: 'math', label: 'Math for ML', icon: '📐', xp: 90, status: 'completed', description: 'Linear algebra, calculus, probability.', resources: [{ label: 'Mathematics for ML', url: 'https://mml-book.github.io/' }] },
        { id: 'ml_basics', label: 'ML Fundamentals', icon: '🤖', xp: 100, status: 'available', description: 'Supervised, unsupervised, and reinforcement learning.', resources: [{ label: 'fast.ai Intro', url: 'https://course.fast.ai/' }] },
        { id: 'data', label: 'Data Wrangling', icon: '🐼', xp: 70, status: 'locked', description: 'Pandas, cleaning, feature engineering.', resources: [{ label: 'Kaggle Data Cleaning', url: 'https://www.kaggle.com/learn/data-cleaning' }] },
      ],
    },
    {
      id: 'core', label: 'Core AI',
      skills: [
        { id: 'dl', label: 'Deep Learning', icon: '🧠', xp: 130, status: 'locked', description: 'Neural networks, CNNs, RNNs.', resources: [{ label: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning' }] },
        { id: 'nlp', label: 'NLP', icon: '💬', xp: 120, status: 'locked', description: 'Text processing, transformers, BERT.', resources: [{ label: 'Hugging Face Course', url: 'https://huggingface.co/learn/nlp-course' }] },
        { id: 'llm', label: 'LLMs & Prompting', icon: '✨', xp: 110, status: 'locked', description: 'Prompt engineering, RAG, fine-tuning.', resources: [{ label: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/' }] },
        { id: 'mlops', label: 'MLOps', icon: '🔄', xp: 100, status: 'locked', description: 'Model deployment, monitoring, versioning.', resources: [{ label: 'MLflow Docs', url: 'https://mlflow.org/docs/latest/index.html' }] },
      ],
    },
    {
      id: 'advanced', label: 'Advanced',
      skills: [
        { id: 'agents', label: 'AI Agents', icon: '🤖', xp: 140, status: 'locked', description: 'Build autonomous agents with tool use.', resources: [{ label: 'LangChain Docs', url: 'https://docs.langchain.com/' }] },
        { id: 'cv', label: 'Computer Vision', icon: '👁️', xp: 120, status: 'locked', description: 'Image classification, object detection.', resources: [{ label: 'OpenCV Docs', url: 'https://docs.opencv.org/' }] },
        { id: 'cloud_ai', label: 'Cloud AI APIs', icon: '☁️', xp: 90, status: 'locked', description: 'OpenAI, Anthropic, Google Gemini APIs.', resources: [{ label: 'OpenAI Docs', url: 'https://platform.openai.com/docs/' }] },
        { id: 'ethics', label: 'AI Ethics', icon: '⚖️', xp: 80, status: 'locked', description: 'Bias, fairness, responsible AI development.', resources: [{ label: 'AI Ethics Course', url: 'https://www.elementsofai.com/' }] },
      ],
    },
    {
      id: 'jobready', label: 'Job Ready',
      skills: [
        { id: 'portfolio', label: 'AI Portfolio', icon: '🎨', xp: 120, status: 'locked', description: 'Build and publish AI projects and demos.', resources: [{ label: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces' }] },
        { id: 'research', label: 'Research Reading', icon: '📄', xp: 100, status: 'locked', description: 'Read and implement papers from ArXiv.', resources: [{ label: 'Papers With Code', url: 'https://paperswithcode.com/' }] },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', xp: 110, status: 'locked', description: 'ML system design and coding interviews.', resources: [{ label: 'ML Interview Guide', url: 'https://github.com/khangich/machine-learning-interview' }] },
        { id: 'kaggle', label: 'Kaggle Competitions', icon: '🏆', xp: 100, status: 'locked', description: 'Compete and build a public ML track record.', resources: [{ label: 'Kaggle Competitions', url: 'https://www.kaggle.com/competitions' }] },
      ],
    },
  ],
};
