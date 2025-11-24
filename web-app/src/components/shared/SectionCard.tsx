import React from 'react';
import { Box, Typography, Paper, SxProps, Theme } from '@mui/material';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  elevation?: number;
}

/**
 * Reusable section card with optional title, subtitle, and action button
 * Used throughout nurse interface for consistent styling
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  children,
  action,
  sx,
  elevation = 1,
}) => {
  return (
    <Paper elevation={elevation} sx={{ p: 3, ...sx }}>
      {(title || action) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {children}
    </Paper>
  );
};
