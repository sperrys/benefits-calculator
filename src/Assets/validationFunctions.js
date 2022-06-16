const ageHasError = (applicantAge) => {
  // handleTextfieldChange prevents setting anything to formData that does not pass a number regex test
  // so applicantAge will always be initiated as a string and converted to a number once it passes the regex test
  const numberApplicantAge = Number(applicantAge);
  //the numbers that we type in have to be 0-8 digits long but we want them to be within this min/max range
  const minimumAge = 13; 
  const maximumAge = 130;
  return numberApplicantAge < minimumAge || numberApplicantAge > maximumAge;
}

const displayAgeHelperText = (applicantAge) => {
  const numberApplicantAge = Number(applicantAge);
  const minimumAge = 13;
  const maximumAge = 130;
  if (numberApplicantAge < minimumAge || numberApplicantAge > maximumAge) {
    return 'Please enter a valid age (13-130).';
  };
}

const zipcodeHasError = (zipcode) => {
  const numZipcode = Number(zipcode);
  return zipcode.length !== 5 || Number.isInteger(numZipcode) === false;
} 

const displayZipcodeHelperText = (zipcode) => {
  const numZipcode = Number(zipcode);
  return (zipcode.length !== 5 || Number.isInteger(numZipcode) === false) ? 'This entry is required to continue.' : '' ;
} 

const radiofieldHasError = (radiofield) => {
  return typeof radiofield !== 'boolean';
}

const incomeStreamValueHasError = (valueInput) => {
  const numValueInput = Number(valueInput);
  return numValueInput <= 0;
}

const displayIncomeStreamValueHelperText = (valueInput) => {
  const numValueInput = Number(valueInput);
  return numValueInput <= 0 && 'This entry is required to continue.';
}

const incomeStreamsAreValid = (incomeStreams) => {
  const allIncomeStreamsAreValid = incomeStreams.every(incomeSourceData => {
    const { incomeStreamName, incomeAmount, incomeFrequency } = incomeSourceData;
    return incomeStreamName.length > 0 && incomeAmount > 0 && incomeFrequency.length > 0;
  });
  
  return allIncomeStreamsAreValid;
}

const expenseSourceValueHasError = (valueInput) => {
  const numValueInput = Number(valueInput);
  return numValueInput <= 0;
}

const displayExpenseSourceValueHelperText = (valueInput) => {
  const numValueInput = Number(valueInput);
  return numValueInput <= 0 && 'This entry is required to continue.';
}

const expenseSourcesAreValid = (expenses) => {
  const allExpensesAreValid = expenses.every(expenseSourceData => {
    const { expenseSourceName, expenseAmount, expenseFrequency } = expenseSourceData;
    return expenseSourceName.length > 0 && expenseAmount > 0 && expenseFrequency.length > 0;
  });
  
  return allExpensesAreValid;
}

const householdSizeHasError = (sizeOfHousehold) => {
  const numValueInput = Number(sizeOfHousehold);
  return numValueInput <= 0 || numValueInput > 8;
}

const displayHouseholdSizeHelperText = (sizeOfHousehold) => {
  const numValueInput = Number(sizeOfHousehold);
  return (numValueInput <= 0 || numValueInput > 8) && 'Number of People (max. 8)';
}

const householdAssetsHasError = (householdAssets) => {
  const numValueInput = Number(householdAssets);
  return numValueInput < 0;
}

const displayHouseholdAssetsHelperText = (householdAssets) => {
  const numValueInput = Number(householdAssets);
  return numValueInput < 0 && 'This entry is required to continue.';
}

const housingSourcesAreValid = (selectedHousing) => {
  const housingKeys = Object.keys(selectedHousing);
  const preferNotToSay = selectedHousing.preferNotToSay === true;
  const atLeastOneOptionWasSelected = housingKeys.some(housingKey => selectedHousing[housingKey] === true);
  if (preferNotToSay) {
    const numberOfTrues = Object.values(selectedHousing)
      .filter(value => value === true)
      .length;
    return numberOfTrues === 1;
  } else if (atLeastOneOptionWasSelected) {
    // preferNotToSay = false && at least one other option was selected
    return true;
  }
}

module.exports = {
  ageHasError,
  displayAgeHelperText,
  zipcodeHasError,
  displayZipcodeHelperText,
  radiofieldHasError,
  incomeStreamValueHasError,
  displayIncomeStreamValueHelperText,
  incomeStreamsAreValid,
  expenseSourceValueHasError,
  displayExpenseSourceValueHelperText,
  expenseSourcesAreValid,
  householdSizeHasError,
  displayHouseholdSizeHelperText,
  householdAssetsHasError,
  displayHouseholdAssetsHelperText,
  housingSourcesAreValid
}