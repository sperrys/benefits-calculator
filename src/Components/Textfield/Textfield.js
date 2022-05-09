import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)({
  marginBottom: 20
});

const Textfield = ({ componentDetails, formData, handleChange }) => {
  const { inputType, inputName, inputLabel, inputError, inputHelperText } = componentDetails;

  return (
    <>
      <StyledTextField 
        type={inputType}
        name={inputName}
        value={formData[inputName]}
        label={inputLabel}
        onChange={(event) => {handleChange(event)}}
        variant='outlined'
        required
        error={inputError}
        helperText={inputHelperText} />
    </>
  );
}

export default Textfield;