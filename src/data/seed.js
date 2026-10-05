import { db } from '../services/db'

const daysFromNow = (n) => new Date(Date.now() + n * 86_400_000).toISOString()

const companies = [
  {
    id: 'c-agro', name: 'Planet Agro Ltd', industry: 'Agriculture & Food',
    location: 'Gazipur, Dhaka', size: '1,200+ employees', founded: '2004',
    website: 'https://example.com/agro', color: '#3f7d4e',
    about: 'Runs climate-resilient farms and a cold-chain network that moves fresh produce from 40,000 contract farmers to city markets.',
  },
  {
    id: 'c-energy', name: 'Planet Green Energy', industry: 'Renewable Energy',
    location: 'Chattogram', size: '450 employees', founded: '2012',
    website: 'https://example.com/energy', color: '#d99a1e',
    about: 'Builds and operates rooftop and grid-scale solar plants, and designs battery storage for industrial parks.',
  },
  {
    id: 'c-tech', name: 'Planet Tech Solutions', industry: 'Software',
    location: 'Banani, Dhaka', size: '180 employees', founded: '2018',
    website: 'https://example.com/tech', color: '#2f7ea8',
    about: 'The group’s software arm. Builds the farm-management platform, logistics tracking and internal tools used across every Planet company.',
  },
  {
    id: 'c-logistics', name: 'Planet Logistics', industry: 'Transport & Supply Chain',
    location: 'Narayanganj', size: '900 employees', founded: '2009',
    website: 'https://example.com/logistics', color: '#8a5a44',
    about: 'Operates a fleet of 600 vehicles and five regional warehouses serving the group and outside clients.',
  },
]

const jobs = [
  {
    id: 'j-1', companyId: 'c-tech', title: 'Junior Frontend Developer (React)',
    category: 'Software & IT', type: 'Full-time', workplace: 'Hybrid', location: 'Banani, Dhaka',
    experienceMin: 1, salaryMin: 40000, salaryMax: 60000, vacancies: 2, deadline: daysFromNow(21),
    skills: ['JavaScript', 'React', 'Tailwind CSS', 'Git', 'REST APIs'],
    description: 'Join the team building the farm-management dashboard used by 3,000 field officers. You will turn designs into accessible, responsive React screens and work closely with backend developers on API contracts.',
    responsibilities: ['Build and maintain React components and pages', 'Integrate REST APIs and handle loading and error states', 'Write readable code and review teammates’ pull requests'],
    requirements: ['1+ year building websites or web apps', 'Solid HTML, CSS and modern JavaScript', 'Comfortable with Git branches and pull requests'],
    benefits: ['Festival bonus x2', 'Health insurance', 'Learning budget'],
    status: 'open', createdAt: daysFromNow(-2),
  },
  {
    id: 'j-2', companyId: 'c-tech', title: 'Backend Developer (Node.js)',
    category: 'Software & IT', type: 'Full-time', workplace: 'On-site', location: 'Banani, Dhaka',
    experienceMin: 2, salaryMin: 70000, salaryMax: 100000, vacancies: 1, deadline: daysFromNow(14),
    skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST APIs', 'Docker'],
    description: 'Design and build the APIs behind our logistics tracking platform, which processes 50,000 shipment events a day.',
    responsibilities: ['Design REST endpoints and database schemas', 'Write automated tests', 'Monitor and improve API performance'],
    requirements: ['2+ years with Node.js in production', 'Experience with MongoDB or PostgreSQL', 'Understanding of authentication and authorization'],
    benefits: ['Health insurance', 'Lunch provided', 'Yearly increment'],
    status: 'open', createdAt: daysFromNow(-5),
  },
  {
    id: 'j-3', companyId: 'c-energy', title: 'Solar Site Engineer',
    category: 'Engineering', type: 'Full-time', workplace: 'On-site', location: 'Chattogram',
    experienceMin: 3, salaryMin: 60000, salaryMax: 85000, vacancies: 3, deadline: daysFromNow(10),
    skills: ['Electrical Engineering', 'AutoCAD', 'Project Management', 'Solar PV'],
    description: 'Lead installation and commissioning of 1–5 MW solar projects across industrial clients in the south-east.',
    responsibilities: ['Supervise contractors on site', 'Check installations against single-line diagrams', 'Prepare commissioning reports'],
    requirements: ['B.Sc. in EEE', '3+ years in solar or power projects', 'Willing to travel 60% of the time'],
    benefits: ['Field allowance', 'Company transport', 'Provident fund'],
    status: 'open', createdAt: daysFromNow(-1),
  },
  {
    id: 'j-4', companyId: 'c-agro', title: 'Agronomist — Climate Smart Farming',
    category: 'Agriculture', type: 'Full-time', workplace: 'On-site', location: 'Rangpur',
    experienceMin: 2, salaryMin: 45000, salaryMax: 65000, vacancies: 4, deadline: daysFromNow(25),
    skills: ['Agronomy', 'Soil Science', 'Data Collection', 'Farmer Training'],
    description: 'Work with contract farmers to introduce drought-tolerant varieties and measure the effect on yield.',
    responsibilities: ['Run field trials', 'Train farmer groups', 'Report yield and soil-health data monthly'],
    requirements: ['B.Sc. in Agriculture', 'Fluent Bangla, working English', 'Motorbike licence preferred'],
    benefits: ['Motorbike allowance', 'Health insurance'],
    status: 'open', createdAt: daysFromNow(-8),
  },
  {
    id: 'j-5', companyId: 'c-tech', title: 'Software Engineering Intern',
    category: 'Software & IT', type: 'Internship', workplace: 'Hybrid', location: 'Banani, Dhaka',
    experienceMin: 0, salaryMin: 15000, salaryMax: 20000, vacancies: 5, deadline: daysFromNow(30),
    skills: ['JavaScript', 'HTML', 'CSS', 'Git'],
    description: 'A six-month internship for final-year students and fresh graduates. You will ship real features with a mentor.',
    responsibilities: ['Fix bugs and build small features', 'Pair with a senior engineer weekly', 'Present your work at demo day'],
    requirements: ['Final-year student or recent graduate', 'Built at least one project you can show', 'Curious and willing to ask questions'],
    benefits: ['Mentorship', 'Possible full-time offer'],
    status: 'open', createdAt: daysFromNow(0),
  },
  {
    id: 'j-6', companyId: 'c-logistics', title: 'Fleet Operations Executive',
    category: 'Operations', type: 'Full-time', workplace: 'On-site', location: 'Narayanganj',
    experienceMin: 1, salaryMin: 35000, salaryMax: 45000, vacancies: 2, deadline: daysFromNow(7),
    skills: ['Excel', 'Route Planning', 'Communication', 'Fleet Management'],
    description: 'Plan daily routes for 120 vehicles and keep delivery on-time rate above 95%.',
    responsibilities: ['Assign vehicles and drivers', 'Track deliveries and resolve delays', 'Prepare weekly performance reports'],
    requirements: ['Bachelor’s degree', 'Strong Excel skills', 'Calm under pressure'],
    benefits: ['Overtime pay', 'Festival bonus x2'],
    status: 'open', createdAt: daysFromNow(-3),
  },
  {
    id: 'j-7', companyId: 'c-energy', title: 'Sustainability Analyst',
    category: 'Sustainability', type: 'Contract', workplace: 'Remote', location: 'Anywhere in Bangladesh',
    experienceMin: 1, salaryMin: 50000, salaryMax: 70000, vacancies: 1, deadline: daysFromNow(18),
    skills: ['Data Analysis', 'Excel', 'Carbon Accounting', 'Report Writing'],
    description: 'Measure the group’s carbon footprint and prepare our first public sustainability report.',
    responsibilities: ['Collect energy and fuel data from each company', 'Calculate emissions', 'Draft the annual report'],
    requirements: ['Degree in environmental science, engineering or economics', 'Strong spreadsheet skills'],
    benefits: ['Fully remote', '12-month contract'],
    status: 'open', createdAt: daysFromNow(-12),
  },
  {
    id: 'j-8', companyId: 'c-agro', title: 'Accounts Officer',
    category: 'Finance & Accounts', type: 'Full-time', workplace: 'On-site', location: 'Gazipur, Dhaka',
    experienceMin: 2, salaryMin: 40000, salaryMax: 55000, vacancies: 1, deadline: daysFromNow(12),
    skills: ['Accounting', 'Excel', 'Tally', 'VAT & Tax'],
    description: 'Manage payables to 2,000 suppliers and support month-end closing.',
    responsibilities: ['Process supplier invoices', 'Reconcile bank statements', 'Support audits'],
    requirements: ['M.Com or BBA in Accounting', '2+ years in a similar role'],
    benefits: ['Provident fund', 'Health insurance'],
    status: 'open', createdAt: daysFromNow(-6),
  },
]

/** Fill the fake database with sample companies and jobs the first time the app runs. */
export function seedIfEmpty() {
  if (db.getRaw('seeded')) return
  const now = new Date().toISOString()
  db.replaceCollection('companies', companies.map((c) => ({ ...c, createdAt: now, updatedAt: now })))
  db.replaceCollection('jobs', jobs.map((j) => ({ ...j, updatedAt: j.createdAt })))
  db.setRaw('seeded', '1')
}
