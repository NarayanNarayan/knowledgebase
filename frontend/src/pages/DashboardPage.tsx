import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { useApi } from '../hooks/useApi';
import { useAppStore } from '../stores/appStore';
import { knowledgeService } from '../api/services/KnowledgeService';
import type { GraphStats } from '../types/api.types';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { health, models, loading } = useAppStore();
  const { checkHealth, loadModels } = useApi();
  const [graphStats, setGraphStats] = React.useState<GraphStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(false);

  React.useEffect(() => {
    checkHealth();
    loadModels();
    loadGraphStats();
  }, [checkHealth, loadModels]);

  const loadGraphStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await knowledgeService.getGraphStats();
      setGraphStats(stats);
    } catch (err) {
      console.error('Failed to load graph stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading && !health) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>System overview and statistics</p>
      </div>
      <div className={styles.grid}>
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.health}>
              <div className={styles.status}>
                <span className={`${styles.indicator} ${health?.status === 'ok' ? styles['indicator--ok'] : ''}`} />
                <strong>Status:</strong> {health?.status || 'Unknown'}
              </div>
              <div className={styles.info}>
                <div><strong>Service:</strong> {health?.service || 'N/A'}</div>
                <div><strong>Version:</strong> {health?.version || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.models}>
              <div className={styles.count}>Total: {models.length}</div>
              <div className={styles.modelList}>
                {models.slice(0, 8).map((model) => (
                  <div key={model.id} className={styles.modelItem}>
                    <span className={styles.modelName}>{model.name}</span>
                    <span className={`${styles.badge} ${model.available ? styles['badge--available'] : styles['badge--unavailable']}`}>
                      {model.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))}
                {models.length > 8 && (
                  <div className={styles.more}>+{models.length - 8} more models</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Knowledge Graph Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loading text="Loading statistics..." />
            ) : graphStats ? (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <strong>Nodes:</strong> {(graphStats.nodeCount ?? 0).toLocaleString()}
                </div>
                <div className={styles.statItem}>
                  <strong>Relationships:</strong> {(graphStats.relationshipCount ?? 0).toLocaleString()}
                </div>
                {graphStats.nodeTypes && Object.keys(graphStats.nodeTypes).length > 0 && (
                  <div className={styles.statItem}>
                    <strong>Node Types:</strong> {Object.keys(graphStats.nodeTypes).length}
                  </div>
                )}
                {graphStats.relationshipTypes && Object.keys(graphStats.relationshipTypes).length > 0 && (
                  <div className={styles.statItem}>
                    <strong>Relationship Types:</strong> {Object.keys(graphStats.relationshipTypes).length}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.empty}>No statistics available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
