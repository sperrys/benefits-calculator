const ageHasError = (applicantAge) => {
  return applicantAge < 18 || applicantAge > 130;
}

const displayAgeHelperText = (applicantAge) => {
  return (applicantAge < 18 || applicantAge > 130) ? 'This entry is required to continue.' : '';
}

const zipcodeHasError = (zipcode) => {
  const numZipcode = Number(zipcode);
  return zipcode.length !== 5 || Number.isInteger(numZipcode) === false;
} 

const displayZipcodeHelperText = (zipcode) => {
  const numZipcode = Number(zipcode);
  return (zipcode.length !== 5 || Number.isInteger(numZipcode) === false) ? 'This entry is required to continue.' : '' ;
} 

module.exports = {
  ageHasError,
  displayAgeHelperText,
  zipcodeHasError,
  displayZipcodeHelperText
}