import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import Features from './Features';
import HowToUse from './HowToUse';
import UploadSection from './UploadSection';
import SummaryDisplay from './SummaryDisplay';
import { useClerk, useUser } from '@clerk/clerk-react';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [summaries, setSummaries] = useState([]);
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  // Load saved summaries from localStorage on component mount
  useEffect(() => {
    const savedSummaries = localStorage.getItem('medbrief_summaries');
    if (savedSummaries) {
      try {
        const parsed = JSON.parse(savedSummaries);
        setSummaries(parsed);
      } catch (error) {
        console.error('Error parsing saved summaries:', error);
        localStorage.removeItem('medbrief_summaries');
      }
    }
  }, []);

  // Clear any summaries when the user signs out
  useEffect(() => {
    if (!isSignedIn) {
      try {
        localStorage.removeItem('medbrief_summaries');
      } catch (e) {
        console.warn('Could not clear stored summaries on sign out:', e);
      }
      setSummaries([]);
    }
  }, [isSignedIn]);

  // Save user profile in Supabase after login
  useEffect(() => {
    async function saveProfile() {
      if (isSignedIn && user) {
        console.log('Attempting to save user profile:', {
          clerk_user_id: user.id,
          full_name: user.fullName,
          username: user.username,
          phone: user.primaryPhoneNumber?.phoneNumber,
          email: user.primaryEmailAddress?.emailAddress
        });
        
        try {
          const userData = {
            clerk_user_id: user.id,
            full_name: user.fullName || '',
            username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user_' + Math.random().toString(36).substr(2, 9),
            phone: user.primaryPhoneNumber?.phoneNumber || '',
            email: user.primaryEmailAddress?.emailAddress || ''
          };
          
          console.log('Sending data to Supabase:', userData);
          
          const { data, error } = await supabase.from('User_profile_table').upsert(userData);
          
          if (error) {
            console.error('Error saving user profile to Supabase:', error);
            console.error('Error details:', error.message, error.details, error.hint);
          } else {
            console.log('User profile saved successfully:', data);
          }
        } catch (err) {
          console.error('Exception while saving user profile:', err);
        }
      } else {
        console.log('User not signed in or user object not available');
      }
    }
    saveProfile();
  }, [isSignedIn, user]);

  const handleSummaryGenerated = (newSummaries) => {
    // Replace previous summaries with new ones instead of merging
    // This ensures only the latest uploaded report summary is displayed
    setSummaries(newSummaries);
    
    // Save to localStorage (replacing previous summaries)
    localStorage.setItem('medbrief_summaries', JSON.stringify(newSummaries));
    
    // Scroll to summary section
    setTimeout(() => {
      const summarySection = document.querySelector('.summary-section');
      if (summarySection) {
        summarySection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Gate actions that require authentication
  const ensureAuthenticated = () => {
    if (!isSignedIn) {
      openSignIn({});
      return false;
    }
    return true;
  };

  return (
    <div>
      <Hero />
      <Features />
      <HowToUse />

      {/* Always visible upload + summary sections; actions are auth-gated */}
      <UploadSection onSummaryGenerated={handleSummaryGenerated} onRequireAuth={ensureAuthenticated} />
      <SummaryDisplay summaries={summaries} isSignedIn={isSignedIn} />

      {/* Auth required modal */}
      {/* Clerk sign-in modal will open directly when needed via ensureAuthenticated */}
    </div>
  );
};

export default Home;
