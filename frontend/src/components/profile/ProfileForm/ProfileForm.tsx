import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../../utils/validators';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Card';
import type { ProfileFormData } from '../../../types/profile.types';
import styles from './ProfileForm.module.css';

export interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      userId: '',
      username: '',
      email: '',
      phone: '',
      address: '',
      preferences: {},
      customFields: {},
    },
  });

  const [customFields, setCustomFields] = React.useState<Array<{ key: string; value: string }>>(
    initialData?.customFields
      ? Object.entries(initialData.customFields).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []
  );

  const preferencesJson = watch('preferences');
  const [preferencesText, setPreferencesText] = React.useState(
    JSON.stringify(preferencesJson || {}, null, 2)
  );

  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (key !== 'customFields' && key !== 'preferences') {
          setValue(key as keyof ProfileFormData, value);
        }
      });
    }
  }, [initialData, setValue]);

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    try {
      // Parse preferences JSON
      let preferences = {};
      if (preferencesText.trim()) {
        preferences = JSON.parse(preferencesText);
      }

      // Build custom fields object
      const customFieldsObj: Record<string, any> = {};
      customFields.forEach((field) => {
        if (field.key.trim()) {
          customFieldsObj[field.key] = field.value;
        }
      });

      await onSubmit({
        ...data,
        preferences,
        customFields: customFieldsObj,
      });
    } catch (err: any) {
      console.error('Failed to parse preferences JSON:', err);
      alert('Invalid JSON in preferences field');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.grid}>
            <Input
              label="User ID *"
              {...register('userId')}
              error={errors.userId?.message}
              fullWidth
            />
            <Input
              label="Username"
              {...register('username')}
              error={errors.username?.message}
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              fullWidth
            />
            <Input
              label="Phone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              fullWidth
            />
            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
              fullWidth
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Preferences (JSON)</h3>
            <textarea
              className={styles.jsonInput}
              value={preferencesText}
              onChange={(e) => setPreferencesText(e.target.value)}
              rows={6}
              placeholder='{"theme": "dark", "notifications": true}'
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Custom Fields</h3>
              <Button type="button" size="sm" variant="outline" onClick={addCustomField}>
                Add Field
              </Button>
            </div>
            <div className={styles.customFields}>
              {customFields.map((field, index) => (
                <div key={index} className={styles.customField}>
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                    size="sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeCustomField(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {customFields.length === 0 && (
                <p className={styles.empty}>No custom fields. Click "Add Field" to add one.</p>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" loading={loading} disabled={!isDirty && !initialData}>
              {initialData ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

