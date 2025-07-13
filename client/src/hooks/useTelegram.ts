import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat_instance?: string;
    chat_type?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    hint_color?: string;
    bg_color?: string;
    text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setParams: (params: any) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  const authMutation = useMutation({
    mutationFn: async ({ telegramId, username }: { telegramId: string; username: string }) => {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, username }),
      });
      if (!response.ok) throw new Error('Authentication failed');
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/users', user.id], user);
    },
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users', authMutation.data?.id],
    enabled: !!authMutation.data?.id,
    queryFn: async () => {
      const response = await fetch(`/api/users/${authMutation.data.id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  useEffect(() => {
    // Check if we're in Telegram WebApp environment
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      setWebApp(webapp);
      
      // Initialize Telegram WebApp
      webapp.ready();
      webapp.expand();
      
      // Set theme
      if (webapp.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      
      // Get user data
      const tgUser = webapp.initDataUnsafe.user;
      if (tgUser) {
        setTelegramUser(tgUser);
        
        // Authenticate with backend
        authMutation.mutate({
          telegramId: tgUser.id.toString(),
          username: tgUser.username || tgUser.first_name || `user_${tgUser.id}`,
        });
      }
      
      setIsReady(true);
    } else {
      // For development/testing outside Telegram
      console.log('Not in Telegram environment - using mock data');
      
      // Mock user for development
      const mockUser = {
        id: 1,
        first_name: 'Test',
        username: 'testuser',
      };
      
      setTelegramUser(mockUser);
      authMutation.mutate({
        telegramId: mockUser.id.toString(),
        username: mockUser.username,
      });
      
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (webApp?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        webApp.HapticFeedback.notificationOccurred(type);
      } else {
        webApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  };

  const close = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    isReady,
    telegramUser,
    webApp,
    user: user || authMutation.data,
    isAuthenticated: !!user || !!authMutation.data,
    isLoading: authMutation.isPending,
    hapticFeedback,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    close,
  };
}
