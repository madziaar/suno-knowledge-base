
import { useState, useCallback } from 'react';
// FIX: Import types from central location after moving them.
import { HistoryItem, SyncStatus, CloudConfig } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useCloudSync = () => {
  const [config, setConfig] = useLocalStorage<CloudConfig>('pyrite_cloud_config', {
    url: '',
    key: '',
    syncId: crypto.randomUUID()
  });
  
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  /**
   * Pushes local history to the cloud (Supabase REST).
   * Upsert operation.
   */
  const syncToCloud = useCallback(async (history: HistoryItem[]): Promise<boolean> => {
    if (!config.url || !config.key) {
        setStatus('error');
        return false;
    }

    setStatus('syncing');
    try {
      // Remove trailing slash if present
      const baseUrl = config.url.replace(/\/$/, '');
      const endpoint = `${baseUrl}/rest/v1/user_data`;
      
      const payload = {
          id: config.syncId,
          content: history,
          updated_at: new Date().toISOString()
      };

      const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(response.statusText);
      
      setLastSyncTime(Date.now());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      return true;
    } catch (e) {
      console.error('[CloudSync] Push failed', e);
      setStatus('error');
      return false;
    }
  }, [config]);

  /**
   * Pulls data from the cloud.
   */
  const pullFromCloud = useCallback(async (): Promise<HistoryItem[] | null> => {
    if (!config.url || !config.key) {
        setStatus('error');
        return null;
    }

    setStatus('syncing');
    try {
      // Remove trailing slash if present
      const baseUrl = config.url.replace(/\/$/, '');
      const endpoint = `${baseUrl}/rest/v1/user_data?id=eq.${config.syncId}&select=content`;
      
      const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) throw new Error(response.statusText);
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].content) {
          setLastSyncTime(Date.now());
          setStatus('success');
          setTimeout(() => setStatus('idle'), 2000);
          return data[0].content as HistoryItem[];
      }
      
      // If no data found for this ID, it's technically a success but empty
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      return [];
    } catch (e) {
      console.error('[CloudSync] Pull failed', e);
      setStatus('error');
      return null;
    }
  }, [config]);

  return {
    status,
    lastSyncTime,
    syncToCloud,
    pullFromCloud,
    config,
    setConfig
  };
};
