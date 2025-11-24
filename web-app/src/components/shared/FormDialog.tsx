import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitDisabled?: boolean;
}

/**
 * Reusable form dialog with consistent layout
 * Handles submit/cancel actions and provides close button
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  onSubmit,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  maxWidth = 'sm',
  submitDisabled = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitDisabled}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
