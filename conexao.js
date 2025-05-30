import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.5';

const SUPABASE_URL = 'https://iibgbagqnyyjheoiubic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmdiYWdxbnl5amhlb2l1YmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzMzNTgsImV4cCI6MjA2MjIwOTM1OH0.alcpHiae4lLsQg_Tb7N-XQtzNhQspcOz5umorD5eZJg';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;