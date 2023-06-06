import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import CitizenshipPopover from './CitizenshipPopover';
import OtherPopover from './OtherPopover';
import Popover from '@mui/material/Popover';
import { Button } from '@mui/material';
import './FilterSection.css';

const FilterSection = () => {
  const [citizenshipPopover, setCitizenshipPopover] = useState({
    anchorEl: null,
    child: <CitizenshipPopover/>
  });

  const [otherPopover, setOtherPopover] = useState({
    anchorEl: null,
    child: <OtherPopover />
  });

  const handleButtonClick = (event) => {
    if (event.target.id === 'citizenship') {
      setCitizenshipPopover({ ...citizenshipPopover, anchorEl: event.currentTarget });
    } else if (event.target.id === 'other') {
      setOtherPopover({ ...otherPopover, anchorEl: event.currentTarget });
    } else if (event.target.id === 'reset') {
      console.log('add reset functionality here');
    }
  }

  const handleCitizenshipPopoverClose = () => {
    setCitizenshipPopover({ ...citizenshipPopover, anchorEl: null });
  }

  return (
    <div className='filter-button-container'>
      <FilterListIcon sx={{ mr: '.5rem', color: '#037A93' }} />
      <Button
        id='citizenship'
        variant='contained'
        className='filter-button citizen'
        onClick={(event) => handleButtonClick(event)}
      >
        Citizenship
      </Button>
      <Popover
        id='citizenshipPopover'
        open={Boolean(citizenshipPopover.anchorEl)}
        onClose={handleCitizenshipPopoverClose}
        anchorEl={citizenshipPopover.anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {citizenshipPopover.child}
      </Popover>
      <Button
        id='other'
        variant='contained'
        className='filter-button other'
        onClick={(event) => handleButtonClick(event)}
      >
        Other
      </Button>
      <Button
        id='reset'
        variant='contained'
        className='filter-button'
        onClick={(event) => handleButtonClick(event)}
      >
        Reset
      </Button>
    </div>
  );
}

export default FilterSection;