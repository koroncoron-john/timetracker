import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type PlanType = 'free' | 'premium';

interface SubscriptionContextType {
  plan: PlanType;
  projectCount: number;
  maxProjects: number;
  canCreateProject: boolean;
  updateProjectCount: (count: number) => void;
  upgradeToPremium: () => void;
  cancelSubscription: () => void;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>('free');
  const [projectCount, setProjectCount] = useState(0);

  const maxProjects = plan === 'free' ? 3 : Infinity;
  const canCreateProject = projectCount < maxProjects;

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setPlan('free');
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_plan, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPlan(data.subscription_plan as PlanType);
      } else {
        // プロフィールが存在しない場合は作成
        await supabase.from('user_profiles').insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || '',
          subscription_plan: 'free',
          subscription_status: 'active',
        });
        setPlan('free');
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const refreshSubscription = async () => {
    await loadSubscription();
  };

  const updateProjectCount = (count: number) => {
    setProjectCount(count);
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_plan: 'premium',
          subscription_status: 'active'
        })
        .eq('id', user.id);

      if (error) throw error;
      setPlan('premium');
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_plan: 'free',
          subscription_status: 'canceled'
        })
        .eq('id', user.id);

      if (error) throw error;
      setPlan('free');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const value = {
    plan,
    projectCount,
    maxProjects,
    canCreateProject,
    updateProjectCount,
    upgradeToPremium,
    cancelSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
