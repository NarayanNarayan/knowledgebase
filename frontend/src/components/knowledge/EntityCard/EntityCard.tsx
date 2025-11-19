import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import type { Entity } from '../../../types/api.types';
import styles from './EntityCard.module.css';

export interface EntityCardProps {
  entity: Entity;
  onSelect?: (entity: Entity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onSelect }) => {
  return (
    <Card
      variant="outlined"
      padding="md"
      className={onSelect ? styles.clickable : ''}
      onClick={onSelect ? () => onSelect(entity) : undefined}
    >
      <CardHeader>
        <CardTitle>{entity.name}</CardTitle>
        <span className={styles.type}>{entity.type}</span>
      </CardHeader>
      <CardContent>
        {entity.description && (
          <p className={styles.description}>{entity.description}</p>
        )}
        {entity.properties && Object.keys(entity.properties).length > 0 && (
          <div className={styles.properties}>
            <h4>Properties</h4>
            <ul>
              {Object.entries(entity.properties).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {entity.relationships && entity.relationships.length > 0 && (
          <div className={styles.relationships}>
            <h4>Relationships ({entity.relationships.length})</h4>
            <ul>
              {entity.relationships.slice(0, 5).map((rel, index) => (
                <li key={index}>
                  <strong>{rel.type}:</strong> {rel.target.name}
                </li>
              ))}
              {entity.relationships.length > 5 && (
                <li className={styles.more}>
                  +{entity.relationships.length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

