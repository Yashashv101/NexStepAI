// Lightweight skills registry with common variants to reduce false negatives

const SKILL_REGISTRY = [
  { name: 'python', patterns: [/\bpython\b/i] },
  { name: 'java', patterns: [/\bjava\b/i] },
  { name: 'javascript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { name: 'typescript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { name: 'react', patterns: [/\breact(?:\.js)?\b/i, /\breact\s*native\b/i], synonyms: ['reactjs','react.js','react native'] },
  { name: 'react native', patterns: [/\breact\s*native\b/i], synonyms: ['react-native'] },
  { name: 'angular', patterns: [/\bangular(?:\.js)?\b/i] },
  { name: 'vue', patterns: [/\bvue(?:\.js)?\b/i] },
  { name: 'svelte', patterns: [/\bsvelte\b/i] },
  { name: 'node', patterns: [/\bnode(?:\.js)?\b/i], synonyms: ['nodejs','node.js'] },
  { name: 'express', patterns: [/\bexpress\b/i, /\bexpress\.js\b/i] },
  { name: 'django', patterns: [/\bdjango\b/i] },
  { name: 'flask', patterns: [/\bflask\b/i] },
  { name: 'spring', patterns: [/\bspring\b/i, /\bspring\s*boot\b/i] },
  { name: 'rails', patterns: [/\bruby\s*on\s*rails\b/i, /\brails\b/i], synonyms: ['ror'] },
  { name: 'laravel', patterns: [/\blaravel\b/i] },
  { name: 'html', patterns: [/\bhtml\b/i] },
  { name: 'css', patterns: [/\bcss\b/i] },
  { name: 'sql', patterns: [/\bsql\b/i] },
  { name: 'mysql', patterns: [/\bmysql\b/i] },
  { name: 'postgres', patterns: [/\bpostgres(?:ql)?\b/i] },
  { name: 'mongodb', patterns: [/\bmongo(?:db)?\b/i] },
  { name: 'sqlite', patterns: [/\bsqlite\b/i] },
  { name: 'redis', patterns: [/\bredis\b/i] },
  { name: 'aws', patterns: [/\baws\b/i, /\bamazon\s*web\s*services\b/i] },
  { name: 'azure', patterns: [/\bazure\b/i] },
  { name: 'gcp', patterns: [/\bgcp\b/i, /\bgoogle\s*cloud\b/i] },
  { name: 'docker', patterns: [/\bdocker\b/i] },
  { name: 'kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'git', patterns: [/\bgit\b/i] },
  { name: 'linux', patterns: [/\blinux\b/i] },
  { name: 'graphql', patterns: [/\bgraphql\b/i] },
  { name: 'rest', patterns: [/\brest\b/i, /\brestful\b/i] },
  { name: 'terraform', patterns: [/\bterraform\b/i] },
  { name: 'ci', patterns: [/\bci\b/i, /\bcontinuous\s*integration\b/i] },
  { name: 'cd', patterns: [/\bcd\b/i, /\bcontinuous\s*delivery\b/i, /\bcontinuous\s*deployment\b/i] },
  { name: 'tensorflow', patterns: [/\btensorflow\b/i] },
  { name: 'pytorch', patterns: [/\bpytorch\b/i] },
  { name: 'sklearn', patterns: [/\bscikit\s*-?learn\b/i, /\bsklearn\b/i], synonyms: ['scikit-learn'] },
  { name: 'numpy', patterns: [/\bnumpy\b/i] },
  { name: 'pandas', patterns: [/\bpandas\b/i] },
  { name: 'nlp', patterns: [/\bnlp\b/i, /\bnatural\s*language\s*processing\b/i] },
  { name: 'cv', patterns: [/\bcomputer\s*vision\b/i, /\bcv\b/i] },
  { name: 'swift', patterns: [/\bswift\b/i] },
  { name: 'kotlin', patterns: [/\bkotlin\b/i] },
  { name: 'android', patterns: [/\bandroid\b/i] },
  { name: 'ios', patterns: [/\bios\b/i] },
  { name: 'flutter', patterns: [/\bflutter\b/i] },
  { name: 'figma', patterns: [/\bfigma\b/i] },
  { name: 'photoshop', patterns: [/\bphotoshop\b/i] },
  // Additional common technologies and tools
  { name: 'c#', patterns: [/\bc#\b/i, /\bc\s*sharp\b/i], synonyms: ['c sharp'] },
  { name: 'c++', patterns: [/\bc\+\+\b/i], synonyms: ['cpp'] },
  { name: 'next.js', patterns: [/\bnext(?:\.js)?\b/i], synonyms: ['nextjs','next js'] },
  { name: 'nestjs', patterns: [/\bnest(?:\.js|js)?\b/i], synonyms: ['nest.js'] },
  { name: 'redux', patterns: [/\bredux\b/i] },
  { name: 'webpack', patterns: [/\bwebpack\b/i] },
  { name: 'babel', patterns: [/\bbabel\b/i] },
  { name: 'jest', patterns: [/\bjest\b/i] },
  { name: 'mocha', patterns: [/\bmocha\b/i] },
  { name: 'chai', patterns: [/\bchai\b/i] },
  { name: 'storybook', patterns: [/\bstorybook\b/i] },
  { name: 'tailwind', patterns: [/\btailwind(?:css)?\b/i], synonyms: ['tailwind css'] },
  { name: 'sass', patterns: [/\bsass\b/i], synonyms: ['scss'] },
  { name: 'less', patterns: [/\bless\b/i] },
  { name: 'apollo', patterns: [/\bapollo\b/i] },
  { name: 'prisma', patterns: [/\bprisma\b/i] },
  { name: 'sequelize', patterns: [/\bsequelize\b/i] },
  { name: 'typeorm', patterns: [/\btypeorm\b/i, /\btype\s*orm\b/i] },
  { name: 'grpc', patterns: [/\bgrpc\b/i] },
  { name: 'microservices', patterns: [/\bmicroservices?\b/i] },
  { name: 'elasticsearch', patterns: [/\belastic\s*search\b/i] },
  { name: 'kafka', patterns: [/\bkafka\b/i] },
  { name: 'rabbitmq', patterns: [/\brabbit\s*mq\b/i] },
  { name: 'ansible', patterns: [/\bansible\b/i] },
  { name: 'puppet', patterns: [/\bpuppet\b/i] },
  { name: 'chef', patterns: [/\bchef\b/i] },
  { name: 'bash', patterns: [/\bbash\b/i], synonyms: ['shell'] },
  { name: 'shell scripting', patterns: [/\bshell\s*scripting\b/i], synonyms: ['bash scripting'] },
  { name: 'postman', patterns: [/\bpostman\b/i] },
  { name: 'swagger', patterns: [/\bswagger\b/i] },
  { name: 'openapi', patterns: [/\bopenapi\b/i] },
  { name: 'snowflake', patterns: [/\bsnowflake\b/i] },
  { name: 'hadoop', patterns: [/\bhadoop\b/i] },
  { name: 'spark', patterns: [/\bspark\b/i] },
  { name: 'airflow', patterns: [/\bairflow\b/i] },
  { name: 'tableau', patterns: [/\btableau\b/i] },
  { name: 'power bi', patterns: [/\bpower\s*bi\b/i] },
  { name: 'gitlab', patterns: [/\bgitlab\b/i] },
  { name: 'github actions', patterns: [/\bgithub\s*actions\b/i] },
  { name: 'bitbucket', patterns: [/\bbitbucket\b/i] },
  { name: 'vite', patterns: [/\bvite\b/i] },
];

function matchSkillsInText(text = '') {
  const found = new Set();
  for (const entry of SKILL_REGISTRY) {
    for (const re of entry.patterns) {
      if (re.test(text)) {
        found.add(entry.name);
        break;
      }
    }
  }
  return Array.from(found);
}

function canonicalizeSkills(list = []) {
  const canon = new Set();
  (list || []).forEach((s) => {
    const v = String(s || '').toLowerCase().trim();
    if (!v) return;
    // Map common synonyms to canonical names
    const mapped = SKILL_REGISTRY.find((e) => e.name === v || (e.synonyms || []).includes(v));
    canon.add(mapped ? mapped.name : v);
  });
  return Array.from(canon);
}

module.exports = { matchSkillsInText, canonicalizeSkills, SKILL_REGISTRY };