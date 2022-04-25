import { useState } from 'react';
import Other from '../Other/Other';
import PersonalInfo from '../PersonalInfo/PersonalInfo';
import SignUpInfo from '../SignUpInfo/SignUpInfo';
import { Button } from '@mui/material';
import './Form.css';

const Form = () => {
  const [page, setPage] = useState(0);
  const pages = ['Sign Up', 'Personal Info', 'Other'];
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    numberOfChildren: 0,
    numberOfAdults: 0
  });

  const displayPage = (pageIndex) => {
    switch(pageIndex) {
      case 0:
      return <SignUpInfo formData={formData} setFormData={setFormData} />
      case 1: 
      return <PersonalInfo formData={formData} setFormData={setFormData}/>
      case 2:
      return <Other formData={formData} setFormData={setFormData}/>
    }
  }

  return (
    <div className='benefits-form'>
      <div className='progress-bar'></div>
      <div className='form-container'>
        <div className='body'>
          {pageDisplay()}
        </div>
        <div className='footer'></div>
          <Button
            disabled={page === 0}
            onClick={() => {
              setPage((currentPage) => currentPage - 1);
            }}
            variant='contained'
          >
            Prev
          </Button>
          <Button 
            onClick={() => {
              if (page === pages.length - 1) {
                alert('Form has been submitted');
                console.log({ formData });
              } else {
                setPage((currentPage) => currentPage + 1);
              }
            }}
            variant='contained'
          >
           {page === pages.length - 1 ? 'Submit' : 'Next'}
          </Button>
      </div>
    </div>
  );
}

export default Form;