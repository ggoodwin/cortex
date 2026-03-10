import type { RoutingRule } from '@cortex/shared'

interface PresetDefinition {
  name: string
  label: string
  description: string
  rules: RoutingRule[]
}

const categories: Array<{
  slug: string
  label: string
  description: string
  priority: number
}> = [
  { slug: 'ambiguous', label: 'Ambiguous / Clarification', description: 'Anything ambiguous that needs a clarifying question before proceeding, unclear requirements or vague requests', priority: 1 },
  { slug: 'multi-file-programming', label: 'Multi-file Programming', description: 'Multi-file higher impact programming and code tasks, large refactors, new features spanning multiple files, architectural code changes', priority: 2 },
  { slug: 'small-bug-fix', label: 'Small Bug Fixes / Enhancements', description: 'Smaller scope bug fixes and enhancement programming tasks, single-file patches, quick error corrections, minor improvements', priority: 3 },
  { slug: 'security-programming', label: 'OSINT/Security Programming', description: 'OSINT, pen testing, exploit development, malware analysis programming and code tasks, security-focused coding', priority: 4 },
  { slug: 'ui-design', label: 'UI Design + Changes', description: 'UI design and UI change work, visual component creation, layout adjustments, styling changes, frontend visual improvements', priority: 5 },
  { slug: 'research', label: 'Research / Web Search', description: 'Research and web search tasks, finding documentation, looking up APIs, general information gathering', priority: 6 },
  { slug: 'security-research', label: 'OSINT/Security Research', description: 'OSINT, pen testing, exploit research, malware research and web search, vulnerability research, threat intelligence', priority: 7 },
  { slug: 'simple-lookups', label: 'Simple Lookups / Calendar / Email', description: 'Simple lookups, calendar checks, email tasks, quick information retrieval, scheduling, basic communications', priority: 8 },
  { slug: 'complex-architecture', label: 'Complex Architecture / Reasoning', description: 'Complex architecture decisions, multi-step reasoning, system design, deep problem solving requiring careful thought', priority: 9 },
  { slug: 'translation', label: 'Language Translation', description: 'Language translation tasks, converting text between languages, localization work', priority: 10 },
  { slug: 'legal', label: 'Legal Tasks', description: 'Legal related tasks, contract review, compliance checks, legal research, terms of service analysis', priority: 11 },
  { slug: 'seo', label: 'SEO Tasks', description: 'SEO related tasks, search engine optimization, keyword research, meta tag optimization, content optimization for search', priority: 12 },
  { slug: 'writing', label: 'Writing + Content Creation', description: 'Writing and content creation, blog posts, documentation, copywriting, creative writing, technical writing', priority: 13 },
  { slug: 'ux-critique', label: 'UX Critique / Copy Review', description: 'UX critique, positioning review, copy review, content quality assessment, brand voice checking, humanization of content', priority: 14 },
  { slug: 'data-analysis', label: 'Data Analysis / Spreadsheets', description: 'Data analysis, CSV processing, spreadsheet work, data visualization, statistical analysis, data cleaning', priority: 15 },
  { slug: 'image-generation', label: 'Image Generation', description: 'Image generation and editing work, creating visual assets, photo manipulation, graphic design tasks', priority: 16 },
  { slug: 'summarization', label: 'Summarization', description: 'Summarization tasks, condensing long content, creating abstracts, TL;DR generation, meeting notes', priority: 17 },
  { slug: 'devops', label: 'DevOps / Infrastructure', description: 'DevOps and infrastructure tasks, CI/CD pipelines, server configuration, deployment automation, cloud infrastructure', priority: 18 },
  { slug: 'database', label: 'Database / SQL Work', description: 'Database and SQL work, schema design, query optimization, migrations, database architecture, indexing', priority: 19 },
  { slug: 'debugging', label: 'Debugging / Error Triage', description: 'Debugging and error triage, diagnosing errors, analyzing stack traces, identifying root causes, fixing runtime issues', priority: 20 },
  { slug: 'skill-creation', label: 'Skill Creation', description: 'Creating new skills, automation workflows, reusable task modules, plugin development', priority: 21 },
  { slug: 'git-review', label: 'Git / PR / Code Review', description: 'Git operations, pull request reviews, code review, merge conflict resolution, branch management', priority: 22 },
  { slug: 'security-audit', label: 'Security Audit', description: 'Security audit, hardening, exposure review, vulnerability scanning, security assessment, compliance checking', priority: 23 },
  { slug: 'local-commands', label: 'Local Commands', description: 'Tasks requiring local commands like git, pnpm, file edits, shell operations, system administration tasks', priority: 24 },
]

function makeRules(modelMap: Record<string, string>): RoutingRule[] {
  return categories.map((cat) => ({
    category_slug: cat.slug,
    category_label: cat.label,
    category_description: cat.description,
    model: modelMap[cat.slug] ?? 'openrouter/google/gemini-2.5-flash',
    is_skill: modelMap[cat.slug]?.startsWith('skill:'),
    priority: cat.priority,
  }))
}

export const IDEAL_MODELS: Record<string, string> = {
  'ambiguous': 'minimax/minimax-m2.5',
  'multi-file-programming': 'minimax/minimax-m2.5',
  'small-bug-fix': 'openrouter/x-ai/grok-code-fast-1',
  'security-programming': 'openrouter/deepseek/deepseek-v3.2',
  'ui-design': 'openrouter/google/gemini-3-pro-preview',
  'research': 'openrouter/google/gemini-3-flash-preview',
  'security-research': 'openrouter/deepseek/deepseek-chat-v3.1',
  'simple-lookups': 'openrouter/google/gemini-2.5-flash-lite',
  'complex-architecture': 'minimax/minimax-m2.5',
  'translation': 'openrouter/google/gemini-2.5-flash-lite',
  'legal': 'openrouter/google/gemini-2.5-flash',
  'seo': 'openrouter/x-ai/grok-4.1-fast',
  'writing': 'minimax/minimax-m2.5',
  'ux-critique': 'openai-codex/gpt-5.2',
  'data-analysis': 'openrouter/google/gemini-2.5-flash',
  'image-generation': 'skill:nano-banana-pro',
  'summarization': 'openrouter/google/gemini-2.5-flash-lite',
  'devops': 'minimax/minimax-m2.5',
  'database': 'minimax/minimax-m2.5',
  'debugging': 'minimax/minimax-m2.5',
  'skill-creation': 'minimax/minimax-m2.5',
  'git-review': 'minimax/minimax-m2.5',
  'security-audit': 'skill:healthcheck',
  'local-commands': 'minimax/minimax-m2.5',
}

export const CHEAP_MODELS: Record<string, string> = {
  'ambiguous': 'openrouter/google/gemini-2.5-flash',
  'multi-file-programming': 'openrouter/deepseek/deepseek-v3.2',
  'small-bug-fix': 'openrouter/deepseek/deepseek-v3.2',
  'security-programming': 'openrouter/deepseek/deepseek-v3.2',
  'ui-design': 'openrouter/google/gemini-2.5-flash',
  'research': 'openrouter/google/gemini-2.5-flash-lite',
  'security-research': 'openrouter/deepseek/deepseek-chat-v3.1',
  'simple-lookups': 'openrouter/google/gemini-2.5-flash-lite',
  'complex-architecture': 'openrouter/deepseek/deepseek-v3.2',
  'translation': 'openrouter/google/gemini-2.5-flash-lite',
  'legal': 'openrouter/google/gemini-2.5-flash-lite',
  'seo': 'openrouter/google/gemini-2.5-flash-lite',
  'writing': 'openrouter/deepseek/deepseek-v3.2',
  'ux-critique': 'openrouter/google/gemini-2.5-flash',
  'data-analysis': 'openrouter/google/gemini-2.5-flash-lite',
  'image-generation': 'skill:nano-banana-pro',
  'summarization': 'openrouter/google/gemini-2.5-flash-lite',
  'devops': 'openrouter/deepseek/deepseek-v3.2',
  'database': 'openrouter/deepseek/deepseek-v3.2',
  'debugging': 'openrouter/deepseek/deepseek-v3.2',
  'skill-creation': 'openrouter/deepseek/deepseek-v3.2',
  'git-review': 'openrouter/google/gemini-2.5-flash',
  'security-audit': 'skill:healthcheck',
  'local-commands': 'openrouter/deepseek/deepseek-v3.2',
}

export const WORKHORSE_MODELS: Record<string, string> = {
  'ambiguous': 'anthropic/claude-opus-4-6',
  'multi-file-programming': 'anthropic/claude-opus-4-6',
  'small-bug-fix': 'anthropic/claude-sonnet-4-6',
  'security-programming': 'anthropic/claude-opus-4-6',
  'ui-design': 'openrouter/google/gemini-3-pro-preview',
  'research': 'openrouter/google/gemini-3-pro-preview',
  'security-research': 'anthropic/claude-opus-4-6',
  'simple-lookups': 'anthropic/claude-sonnet-4-6',
  'complex-architecture': 'anthropic/claude-opus-4-6',
  'translation': 'anthropic/claude-sonnet-4-6',
  'legal': 'anthropic/claude-opus-4-6',
  'seo': 'anthropic/claude-opus-4-6',
  'writing': 'anthropic/claude-opus-4-6',
  'ux-critique': 'openai-codex/gpt-5.2',
  'data-analysis': 'anthropic/claude-sonnet-4-6',
  'image-generation': 'skill:nano-banana-pro',
  'summarization': 'anthropic/claude-sonnet-4-6',
  'devops': 'anthropic/claude-opus-4-6',
  'database': 'anthropic/claude-opus-4-6',
  'debugging': 'anthropic/claude-opus-4-6',
  'skill-creation': 'anthropic/claude-opus-4-6',
  'git-review': 'anthropic/claude-opus-4-6',
  'security-audit': 'skill:healthcheck',
  'local-commands': 'anthropic/claude-opus-4-6',
}

export const BUILTIN_PRESETS: PresetDefinition[] = [
  {
    name: 'cheap',
    label: 'Cheap',
    description: 'Most affordable options that are still competent. Uses DeepSeek V3.2 for coding/reasoning and Gemini Flash Lite for simple tasks.',
    rules: makeRules(CHEAP_MODELS),
  },
  {
    name: 'ideal',
    label: 'Ideal',
    description: 'Best middle-of-the-road option for each category. More than capable with cost still in mind.',
    rules: makeRules(IDEAL_MODELS),
  },
  {
    name: 'workhorse',
    label: 'Workhorse',
    description: 'Best possible option in each category, ignoring cost. Claude Opus 4.6 for heavy lifting, Sonnet 4.6 for lighter tasks.',
    rules: makeRules(WORKHORSE_MODELS),
  },
]

export { categories as TASK_CATEGORIES }
