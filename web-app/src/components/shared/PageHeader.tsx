import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

/**
 * Reusable page header with title, optional subtitle, breadcrumbs, and action button
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, action }) => {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
          {breadcrumbs.map((item, index) => (
            <Link
              key={index}
              underline={item.href ? 'hover' : 'none'}
              color={item.href ? 'inherit' : 'text.primary'}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
};
