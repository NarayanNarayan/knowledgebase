import * as React from 'react';
import { GraphViewer } from '../components/knowledge/GraphViewer';
import type { Entity } from '../types/api.types';

export const KnowledgePage: React.FC = () => {
  const handleEntitySelect = (entity: Entity) => {
    console.log('Selected entity:', entity);
    // Could open a modal or navigate to entity details
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Knowledge Graph</h1>
        <p>Explore entities and relationships in the knowledge graph</p>
      </div>
      <GraphViewer onEntitySelect={handleEntitySelect} />
    </div>
  );
};
