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
  const reactCode = fs.readFileSync('src/components/motion-components/LiveSessionInvite.tsx', 'utf8');

  const { data: existing } = await supabase
    .from('components')
    .select('id')
    .eq('registry_id', 'live-session-invite')
    .maybeSingle();

  const payload = {
    registry_id: 'live-session-invite',
    title: 'Live Session Invite',
    description: 'An interactive invite widget featuring progressive blur contract transitions, email-to-avatar image detection, and dynamic fallback initials generation.',
    status: 'published',
    type: 'component',
    tags: ['Invite', 'Interactive', 'Avatars', 'Progressive Blur', 'Figma'],
    source_type: 'react',
    order: 0,
    snippets: {
      react: reactCode,
      html: `<div class="live-session-invite"><div class="avatars"></div><button class="invite-btn">+ Invite</button></div>`,
      css: `.live-session-invite { display: flex; align-items: center; height: 52px; background: #fff; border-radius: 9999px; }`
    }
  };

  if (existing) {
    console.log('Component exists, updating id:', existing.id);
    const { error } = await supabase.from('components').update(payload).eq('id', existing.id);
    if (error) console.error('Error updating:', error);
    else console.log('Successfully updated LiveSessionInvite in DB!');
  } else {
    console.log('Component does not exist, inserting...');
    const { error } = await supabase.from('components').insert([payload]);
    if (error) console.error('Error creating:', error);
    else console.log('Successfully created LiveSessionInvite in DB!');
  }
}

syncComponent();

