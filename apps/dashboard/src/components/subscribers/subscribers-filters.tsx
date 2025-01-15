import { cn } from '@/utils/ui';
import { HTMLAttributes, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../primitives/button';
import { FacetedFormFilter } from '../primitives/form/faceted-filter/facated-form-filter';
import { Form, FormField, FormItem } from '../primitives/form/form';

export type SubscribersFiltersProps = HTMLAttributes<HTMLFormElement> & {
  onFiltersChange: (filters: SubscribersFiltersData) => void;
  initialValues: SubscribersFiltersData;
  onReset?: () => void;
};

export type SubscribersFiltersData = {
  email: string;
  phone: string;
  name: string;
  subscriberId: string;
};

export const defaultSubscribersFilters: SubscribersFiltersData = {
  email: '',
  phone: '',
  name: '',
  subscriberId: '',
} as const;

export function SubscribersFilters(props: SubscribersFiltersProps) {
  const { onFiltersChange, initialValues, onReset, className, ...rest } = props;

  const form = useForm<SubscribersFiltersData>({
    defaultValues: initialValues || defaultSubscribersFilters,
  });

  useEffect(() => {
    const subscription = form.watch((data) => {
      onFiltersChange(data as SubscribersFiltersData);
    });

    return () => subscription.unsubscribe();
  }, [form, onFiltersChange]);

  const watchedValues = form.watch();

  const hasChanges = useMemo(() => {
    return (
      watchedValues.email !== defaultSubscribersFilters.email ||
      watchedValues.phone !== defaultSubscribersFilters.phone ||
      watchedValues.name !== defaultSubscribersFilters.name ||
      watchedValues.subscriberId !== defaultSubscribersFilters.subscriberId
    );
  }, [watchedValues]);

  const handleReset = () => {
    form.reset(defaultSubscribersFilters);
    onFiltersChange(defaultSubscribersFilters);
    onReset?.();
  };

  return (
    <Form {...form}>
      <form className={cn('flex items-center gap-2', className)} {...rest}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Email"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Email"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Phone"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Phone"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Name"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Name"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscriberId"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Subscriber ID"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Subscriber ID"
              />
            </FormItem>
          )}
        />

        {hasChanges && (
          <Button variant="secondary" mode="ghost" size="2xs" onClick={handleReset}>
            Reset
          </Button>
        )}
      </form>
    </Form>
  );
}
