import React from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface QuickNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export const QuickNumberInput: React.FC<QuickNumberInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 999,
  step = 1,
  unit,
  disabled = false,
}) => {
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {label && (
        <Typography variant="body2" sx={{ minWidth: 80 }}>
          {label}
        </Typography>
      )}
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        sx={{ border: '1px solid #ddd' }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        value={value}
        onChange={handleChange}
        type="number"
        size="small"
        disabled={disabled}
        inputProps={{ min, max, step }}
        sx={{ width: 80, '& input': { textAlign: 'center' } }}
      />
      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        sx={{ border: '1px solid #ddd' }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
      {unit && (
        <Typography variant="body2" color="text.secondary">
          {unit}
        </Typography>
      )}
    </Box>
  );
};
