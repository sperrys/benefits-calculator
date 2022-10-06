const apiKey = "Token " + process.env.REACT_APP_API_KEY;

const screensEndpoint = 'https://cobenefits-api.herokuapp.com/api/screens/';
const householdsEndpoint = 'https://cobenefits-api.herokuapp.com/api/householdmembers/';
const incomeStreamsEndpoint = 'https://cobenefits-api.herokuapp.com/api/incomestreams/';
const expensesEndpoint = 'https://cobenefits-api.herokuapp.com/api/expenses/';
const userEndpoint = 'https://cobenefits-api.herokuapp.com/api/users/';
const messageEndpoint = 'https://cobenefits-api.herokuapp.com/api/messages/';
let eligibilityEndpoint = 'https://cobenefits-api.herokuapp.com/api/eligibility/';
let screensUpdateEndpoint = 'https://cobenefits-api.herokuapp.com/api/screens/';

// const screensEndpoint = 'http://127.0.0.1:8000/api/screens/';
// const householdsEndpoint = 'http://127.0.0.1:8000/api/householdmembers/';
// const incomeStreamsEndpoint = 'http://127.0.0.1:8000/api/incomestreams/';
// const expensesEndpoint = 'http://127.0.0.1:8000/api/expenses/';
// const userEndpoint = 'http://127.0.0.1:8000/api/users/';
// const messageEndpoint = 'http://127.0.0.1:8000/api/messages/';
// let eligibilityEndpoint = 'http://127.0.0.1:8000/api/eligibility/';
// let screensUpdateEndpoint = 'http://127.0.0.1:8000/api/screens/';

const header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': apiKey
};

const postUser = (userData) => {
  let savedResponse;
  return fetch(userEndpoint, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: header
  })
    .then(response => {
      savedResponse = response;
      return response.json();
    })
    .then(data => {
      if (data.cell && data.email) {
        throw new Error(data.cell + ' ' + data.email)
      } else if (data.cell) {
        throw new Error(data.cell)
      } else if (data.email) {
        throw new Error(data.email)
      }
    });
}

const postMessage = (messageData) => {
  return fetch(messageEndpoint, {
    method: 'POST',
    body: JSON.stringify(messageData),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const postPartialParentScreen = (partialFormData) => {
  return fetch(screensEndpoint, {
    method: 'POST',
    body: JSON.stringify(partialFormData),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const updateScreen = (screenerId, partialFormData) => {
  return fetch(screensUpdateEndpoint + screenerId + '/', {
    method: 'PATCH',
    body: JSON.stringify(partialFormData),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const postHouseholdMemberData = (householdMemberData) => {
  return fetch(householdsEndpoint, {
    method: 'POST',
    body: JSON.stringify(householdMemberData),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const postHouseholdMemberIncomeStream = (singleIncomeStream) => {
  return fetch(incomeStreamsEndpoint, {
    method: 'POST',
    body: JSON.stringify(singleIncomeStream),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const postHouseholdMemberExpense = (singleExpense) => {
  return fetch(expensesEndpoint, {
    method: 'POST',
    body: JSON.stringify(singleExpense),
    headers: header
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

const getEligibility = (screenerId, locale) => {
  const headerWithLocale = {
    ...header,
    'Accept-Language': locale === 'es' ? 'es,en-us' : 'en-us'
  };

  return fetch(eligibilityEndpoint + screenerId, {
    method: "GET",
    headers: headerWithLocale
  })
    .then(response => {
      if(!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
}

export {
  postPartialParentScreen,
  updateScreen,
  postUser,
  postMessage,
  postHouseholdMemberData,
  postHouseholdMemberIncomeStream,
  postHouseholdMemberExpense,
  getEligibility,
}
