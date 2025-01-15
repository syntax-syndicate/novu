import { DashboardLayout } from '@/components/dashboard-layout';
import { PageMeta } from '@/components/page-meta';
import { Badge } from '@/components/primitives/badge';
import { SubscriberList } from '@/components/subscribers/subscriber-list';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { useEffect } from 'react';

export const SubscribersPage = () => {
  const track = useTelemetry();

  useEffect(() => {
    track(TelemetryEvent.SUBSCRIBERS_PAGE_VISIT);
  }, [track]);

  return (
    <>
      <PageMeta title="Subscribers" />
      <DashboardLayout
        headerStartItems={
          <h1 className="text-foreground-950 flex items-center gap-1">
            Subscribers <Badge variant="lighter">BETA</Badge>
          </h1>
        }
      >
        <SubscriberList className="px-2.5" />
      </DashboardLayout>
    </>
  );
};
