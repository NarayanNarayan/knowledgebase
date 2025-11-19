import * as React from 'react';
import { IngestionForm } from '../components/ingestion/IngestionForm';
import { ingestionService } from '../api/services/IngestionService';
import type { IngestionRequest } from '../api/services/IngestionService';

// Simple toast implementation
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.error('Error:', msg),
};

export const IngestionPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: IngestionRequest) => {
    try {
      setLoading(true);
      await ingestionService.ingestDocument(data);
      toast.success('Document ingested successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to ingest document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Document Ingestion</h1>
        <p>Add documents to the knowledge base for retrieval and querying</p>
      </div>
      <IngestionForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};
