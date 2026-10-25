const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const supabaseKeyMatch = envFile.match(/SUPABASE_SECRET_KEY=([^\r\n]+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrlMatch[1].trim(), supabaseKeyMatch[1].trim());

async function syncComponent() {
  const reactCode = fs.readFileSync('src/components/motion-components/AiSearchToggle.tsx', 'utf8');

  const { data: existing } = await supabase
    .from('components')
    .select('id')
    .eq('registry_id', 'ai-search-toggle')
    .maybeSingle();

  const payload = {
    registry_id: 'ai-search-toggle',
    title: 'AI Search Toggle',
    description: 'Interactive AI search toggle component with smooth gradient animations and expandable tool menu.',
    status: 'published',
    type: 'component',
    tags: ['Inputs', 'AI', 'Search'],
    source_type: 'react',
    access_tier: 'free',
    order: 25,
    snippets: {
      html: `<div class="ai-search-toggle">
  <div class="search-card">
    <div class="search-top-row">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Search components" />
      <div class="mode-toggle">
        <button class="active">Search</button>
        <button>Ask AI</button>
      </div>
    </div>
  </div>
</div>`,
      css: `.ai-search-toggle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.search-card {
  position: relative;
  border-radius: 9999px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  padding: 8px 16px;
  transition: all 0.3s ease;
}`,
      react: reactCode
    }
  };

  if (existing) {
    console.log('Component exists, updating id:', existing.id);
    const { error } = await supabase.from('components').update(payload).eq('id', existing.id);
    if (error) console.error('Error updating:', error);
    else console.log('Successfully updated AI Search Toggle in DB!');
  } else {
    console.log('Component does not exist, inserting...');
    const { error } = await supabase.from('components').insert([payload]);
    if (error) console.error('Error creating:', error);
    else console.log('Successfully created AI Search Toggle in DB!');
  }
}

syncComponent();
