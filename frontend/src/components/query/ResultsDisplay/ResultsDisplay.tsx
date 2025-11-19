import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import { Loading } from '../../common/Loading';
import type { QueryResponse } from '../../../types/api.types';
import styles from './ResultsDisplay.module.css';

export interface ResultsDisplayProps {
  response: QueryResponse | null;
  loading?: boolean;
  error?: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  response,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return <Loading text="Processing query..." />;
  }

  if (error) {
    return (
      <Card variant="outlined" padding="lg">
        <CardContent>
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card variant="outlined" padding="lg">
        <CardContent>
          <div className={styles.empty}>
            <p>Submit a query to see results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.response}>{response.response}</div>
        </CardContent>
      </Card>

      {response.sources && response.sources.length > 0 && (
        <Card variant="outlined" padding="lg">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.sources}>
              {response.sources.map((source, index) => (
                <div key={index} className={styles.source}>
                  <h4>{source.title}</h4>
                  <p className={styles.sourceMeta}>
                    {source.source}
                    {source.similarity && (
                      <span className={styles.similarity}>
                        {(source.similarity * 100).toFixed(1)}% match
                      </span>
                    )}
                  </p>
                  {source.relatedEntities && (
                    <p className={styles.entities}>
                      Related: {source.relatedEntities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(response.agentsUsed || response.toolsUsed || response.ragMetadata) && (
        <Card variant="outlined" padding="lg">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.metadata}>
              {response.agentsUsed && response.agentsUsed.length > 0 && (
                <div>
                  <strong>Agents Used:</strong> {response.agentsUsed.join(', ')}
                </div>
              )}
              {response.toolsUsed && response.toolsUsed.length > 0 && (
                <div>
                  <strong>Tools Used:</strong> {response.toolsUsed.join(', ')}
                </div>
              )}
              {response.ragMetadata && (
                <div>
                  <strong>Retrieval Method:</strong> {response.ragMetadata.retrievalMethod}
                  {response.ragMetadata.iterations && (
                    <span> ({response.ragMetadata.iterations} iterations)</span>
                  )}
                  {response.ragMetadata.totalResultsRetrieved && (
                    <span> - {response.ragMetadata.totalResultsRetrieved} results</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

