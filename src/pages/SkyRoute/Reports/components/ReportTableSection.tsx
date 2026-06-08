import type { ReactNode } from 'react';
import { Card, Table } from '../../../../components/ui';

interface ReportTableColumn<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

interface ReportTableSectionProps<T extends Record<string, unknown>> {
  title: string;
  columns: ReportTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage: string;
  keyExtractor?: (row: T, index: number) => string | number;
}

export function ReportTableSection<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  loading = false,
  emptyMessage,
  keyExtractor,
}: ReportTableSectionProps<T>) {
  return (
    <Card title={title}>
      {!loading && data.length === 0 ? (
        <div className="rounded-lg border border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <Table
          columns={columns}
          data={data}
          loading={loading}
          keyExtractor={keyExtractor}
        />
      )}
    </Card>
  );
}

export default ReportTableSection;
