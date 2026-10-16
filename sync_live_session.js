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
  const reactCode = fs.readFileSync('src/components/motion-components/LiveSession.tsx', 'utf8');

  const { data: existing } = await supabase
    .from('components')
    .select('id')
    .eq('registry_id', 'live-session')
    .maybeSingle();

  const payload = {
    registry_id: 'live-session',
    title: 'Live Session',
    description: 'A live session widget featuring audio waveform animation, overlapping participant avatars with active status rings, and gentle center expansion into full 8-participant room.',
    status: 'published',
    type: 'component',
    tags: ['Audio', 'Interactive', 'Avatars', 'Figma', 'Spring Animation'],
    source_type: 'react',
    order: 0,
    snippets: {
      react: reactCode,
      html: `<div class="live-session-pill"><div class="sound-icon"></div><div class="avatars"></div></div>`,
      css: `.live-session-pill { display: flex; align-items: center; justify-content: space-between; width: 292px; height: 52px; background: #fff; border-radius: 9999px; }`
    }
  };

  if (existing) {
    console.log('Component exists, updating id:', existing.id);
    const { error } = await supabase.from('components').update(payload).eq('id', existing.id);
    if (error) console.error('Error updating:', error);
    else console.log('Successfully updated LiveSession in DB!');
  } else {
    console.log('Component does not exist, inserting...');
    const { error } = await supabase.from('components').insert([payload]);
    if (error) console.error('Error creating:', error);
    else console.log('Successfully created LiveSession in DB!');
  }
}

syncComponent();
