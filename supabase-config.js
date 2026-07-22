// Use the Supabase JS library from CDN
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error('Supabase initialization failed. Check your URL and Key.', e);
  alert('Error: Supabase is not initialized. Please enter your valid SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js.');
}
// Helper function to check auth session
async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = 'admin-login.html';
  }
  return session;
}

// Helper to logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'admin-login.html';
}
