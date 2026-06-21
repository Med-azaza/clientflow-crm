import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: Array<Column<T>>;
  data: T[];
  footer?: ReactNode;
  emptyState?: ReactNode;
  minWidth?: string;
  roundedTop?: boolean;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  footer,
  emptyState,
  minWidth = "min-w-[760px]",
  roundedTop = true,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-slate-200 bg-white shadow-sm",
        roundedTop ? "rounded-[20px]" : "rounded-b-[20px]",
      )}
    >
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-left", minWidth)}>
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    "whitespace-nowrap border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500",
                    column.className,
                  )}
                  key={column.key}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                  key={item.id}
                >
                  {columns.map((column) => (
                    <td
                      className={cn(
                        "px-6 py-5 text-sm text-slate-700",
                        column.className,
                      )}
                      key={column.key}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer ? (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
