import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Credentials 
const supabaseUrl = 'https://zmwiyvaxmllhrxuhljlx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptd2l5dmF4bWxsaHJ4dWhsamx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTI1ODIsImV4cCI6MjA3NjI4ODU4Mn0.x6kqZqGLLb-lUmnNF4pXyFfiuAxd1oSmzZTikuJRqWs';

const isWeb = Platform.OS === 'web';

const getRedirectUrl = () => {
  if (isWeb) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return 'https://chemlab-kelompok14.vercel.app/auth/callback';
  }
  return AuthSession.makeRedirectUri({
    scheme: 'chemlab',
    path: 'auth/callback',
  });
};

const redirectUrl = getRedirectUrl();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

// Google OAuth Sign In
export const signInWithGoogle = async () => {
  try {
    if (isWeb) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
      
      return { data, error: null };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          return { data: sessionData, error: null };
        }
      }
    }

    return { data: null, error: new Error('Google sign in was cancelled') };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
};

// Helper function 
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    return false;
  }
  return true;
};
