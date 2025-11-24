import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Reusable data table component with typed columns
 * Provides consistent styling and empty state handling
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={getRowId(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => {
                const value = (row as any)[column.id];
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format ? column.format(value, row) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
