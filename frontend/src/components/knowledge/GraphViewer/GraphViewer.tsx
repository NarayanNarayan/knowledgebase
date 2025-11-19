import * as React from 'react';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import { Loading } from '../../common/Loading';
import { EntityCard } from '../EntityCard';
import { knowledgeService } from '../../../api/services/KnowledgeService';
import type { Entity, GraphStats } from '../../../types/api.types';
import styles from './GraphViewer.module.css';

export interface GraphViewerProps {
  onEntitySelect?: (entity: Entity) => void;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ onEntitySelect }) => {
  const [searchId, setSearchId] = React.useState('');
  const [entity, setEntity] = React.useState<Entity | null>(null);
  const [stats, setStats] = React.useState<GraphStats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const graphStats = await knowledgeService.getGraphStats();
      setStats(graphStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load graph statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const foundEntity = await knowledgeService.getEntity(searchId.trim());
      setEntity(foundEntity);
    } catch (err: any) {
      setError(err.message || 'Entity not found');
      setEntity(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle>Search Entity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.search}>
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter entity ID"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                fullWidth
              />
              <Button onClick={handleSearch} loading={loading}>
                Search
              </Button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </CardContent>
        </Card>
      </div>

      <div className={styles.statsSection}>
        <Card variant="outlined" padding="md">
          <CardHeader>
            <CardTitle>Graph Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <Loading text="Loading statistics..." />
            ) : stats ? (
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <strong>Nodes:</strong> {(stats.nodeCount ?? 0).toLocaleString()}
                </div>
                <div className={styles.stat}>
                  <strong>Relationships:</strong> {(stats.relationshipCount ?? 0).toLocaleString()}
                </div>
                {stats.nodeTypes && Object.keys(stats.nodeTypes).length > 0 && (
                  <div className={styles.stat}>
                    <strong>Node Types:</strong>
                    <ul>
                      {Object.entries(stats.nodeTypes).map(([type, count]) => (
                        <li key={type}>
                          {type}: {count}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stats.relationshipTypes && Object.keys(stats.relationshipTypes).length > 0 && (
                  <div className={styles.stat}>
                    <strong>Relationship Types:</strong>
                    <ul>
                      {Object.entries(stats.relationshipTypes).map(([type, count]) => (
                        <li key={type}>
                          {type}: {count}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.empty}>No statistics available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {entity && (
        <div className={styles.entitySection}>
          <EntityCard entity={entity} onSelect={onEntitySelect} />
        </div>
      )}
    </div>
  );
};

