import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ingestionSchema } from '../../../utils/validators';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import type { IngestionRequest } from '../../../api/services/IngestionService';
import styles from './IngestionForm.module.css';

export interface IngestionFormProps {
  onSubmit: (data: IngestionRequest) => Promise<void>;
  loading?: boolean;
}

export const IngestionForm: React.FC<IngestionFormProps> = ({ onSubmit, loading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IngestionRequest>({
    resolver: zodResolver(ingestionSchema),
    defaultValues: {
      content: '',
      metadata: {
        title: '',
        source: '',
        author: '',
      },
    },
  });

  const [fileContent, setFileContent] = React.useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        // Auto-fill content field
        const contentField = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (contentField) {
          contentField.value = content;
        }
      };
      reader.readAsText(file);
    }
  };

  const onFormSubmit = async (data: IngestionRequest) => {
    try {
      await onSubmit({
        ...data,
        content: fileContent || data.content,
      });
      reset();
      setFileContent('');
    } catch (err) {
      console.error('Ingestion failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Document Ingestion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.section}>
            <label className={styles.label}>
              Upload File (optional)
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.md,.json"
                className={styles.fileInput}
              />
            </label>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Content *</label>
            <textarea
              {...register('content')}
              className={styles.textarea}
              rows={10}
              placeholder="Enter document content or upload a file..."
              defaultValue={fileContent}
            />
            {errors.content && (
              <span className={styles.error}>{errors.content.message}</span>
            )}
          </div>

          <div className={styles.grid}>
            <Input
              label="Title"
              {...register('metadata.title')}
              error={errors.metadata?.title?.message}
              fullWidth
            />
            <Input
              label="Source"
              {...register('metadata.source')}
              error={errors.metadata?.source?.message}
              fullWidth
            />
            <Input
              label="Author"
              {...register('metadata.author')}
              error={errors.metadata?.author?.message}
              fullWidth
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" loading={loading} variant="primary">
              Ingest Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

