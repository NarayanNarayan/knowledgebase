import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { knowledgeService } from '../api/services/KnowledgeService';

export const useApi = () => {
  const { setHealth, setModels, setLoading, setError } = useAppStore();

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const health = await knowledgeService.getHealth();
      setHealth(health);
      return health;
    } catch (err: any) {
      setError(err.message || 'Health check failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setHealth, setLoading, setError]);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const { models, apiKeys } = await knowledgeService.getModels();
      setModels(models, apiKeys);
      return { models, apiKeys };
    } catch (err: any) {
      setError(err.message || 'Failed to load models');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setModels, setLoading, setError]);

  return {
    checkHealth,
    loadModels,
  };
};

