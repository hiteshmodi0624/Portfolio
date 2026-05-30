export interface StackItem { name: string }
export interface StackCategory { label: string; items: StackItem[] }

const stackData: StackCategory[] = [
  { label: 'Languages', items: [{ name: 'TypeScript' }, { name: 'Python' }, { name: 'JavaScript' }, { name: 'C++' }] },
  { label: 'Frontend', items: [{ name: 'React' }, { name: 'React Native' }, { name: 'Next.js' }, { name: 'Tailwind CSS' }] },
  { label: 'Backend', items: [{ name: 'Node.js' }, { name: 'FastAPI' }, { name: 'Express' }] },
  { label: 'Cloud & Infra', items: [{ name: 'AWS Lambda' }, { name: 'S3' }, { name: 'Glue' }, { name: 'EC2' }, { name: 'DynamoDB' }, { name: 'CDK' }] },
  { label: 'AI & LLM', items: [{ name: 'OpenAI API' }, { name: 'LangChain' }, { name: 'Claude API' }, { name: 'MCP' }, { name: 'Agentic Patterns' }] },
  { label: 'AI Tools', items: [{ name: 'Claude Code' }, { name: 'Cursor' }, { name: 'GitHub Copilot' }, { name: 'Prompt Engineering' }] },
  { label: 'Databases', items: [{ name: 'PostgreSQL' }, { name: 'MongoDB' }, { name: 'DynamoDB' }, { name: 'Prisma' }] },
  { label: 'Geospatial', items: [{ name: 'Mapbox GL' }, { name: 'Vector Tiles' }, { name: 'Offline Packs' }] },
];

export default stackData;
