import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';

export const SimpleDialog = ({ open, close, resetStates }) => {
  
    // const handleClose = () => {
    //   onClose();
    // };
  
    // const handleListItemClick = (value) => {
    //   onClose(value);
    // };
  
    return (
      <Dialog open={open} fullWidth={true} sx={{ userSelect: 'none', textAlign: 'center'}}>
        <DialogTitle sx={{ fontSize: "60px", color: '#645858'}}>Are you sure?
          <Box sx={{ fontSize: "20px", color: "crimson"}}>
            THE TIMER WILL BE RESET
          </Box>
        </DialogTitle>
        <Box sx={{ display: 'flex' }}>
          <Button onClick={() => {
            close()
            resetStates()}} sx={{ flex: 1, fontSize: '40px', color: 'limegreen'}}>Yes</Button>
          <Button onClick={() => close()} sx={{ flex: 1, fontSize: '40px', color: 'crimson'}}>No</Button>
        </Box>
      </Dialog>
    );
  }
  