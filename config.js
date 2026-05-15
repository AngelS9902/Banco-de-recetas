// ═══════════════════════════════════════════════════════════════════════════
// CONFIG — Credenciales públicas de Supabase
// La anon key está diseñada para ser pública (RLS protege los datos).
// ═══════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://hssvypyjodjnmpybqowb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc3Z5cHlqb2Rqbm1weWJxb3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTc4NTUsImV4cCI6MjA5NDM3Mzg1NX0.dY_eUNDVbJzxgf0KygTypS7fZiQSXBI8B2mrBVx41mM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
