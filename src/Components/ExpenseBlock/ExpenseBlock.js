import { FormControl, Select, MenuItem, InputLabel, TextField, Button } from "@mui/material";
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { expenseSourceValueHasError, displayExpenseSourceValueHelperText } from '../../Assets/validationFunctions';
const StyledSelectfield = styled(Select)({
  marginBottom: 20,
  minWidth: 200
});

const StyledTextField = styled(TextField)({
  marginBottom: 20
});

const StyledDeleteButton = styled(Button)({
  minWidth: 32
});
