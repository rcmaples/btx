import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutClient } from './CheckoutClient';

export default async function CheckoutPage() {
  // Get user and profile from Supabase (if authenticated)
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return <CheckoutClient initialUser={user} initialProfile={profile} />;
}
