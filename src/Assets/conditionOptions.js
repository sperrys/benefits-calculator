import { FormattedMessage } from 'react-intl';

const conditionOptions = {
  student: (
    <FormattedMessage
      id="conditionOptions.student"
      defaultMessage="Student or prospective student at a college, university, or other post-secondary institution"
    />
  ),
  pregnant: <FormattedMessage id="conditionOptions.pregnant" defaultMessage="Pregnant" />,
  unemployed: <FormattedMessage id="conditionOptions.unemployed" defaultMessage="Unemployed" />,
  blindOrVisuallyImpaired: (
    <FormattedMessage id="conditionOptions.blindOrVisuallyImpaired" defaultMessage="Blind or visually impaired" />
  ),
  disabled: (
    <FormattedMessage
      id="conditionOptions.disabled"
      defaultMessage="Have any disabilities that make you unable to work now or in the future"
    />
  ),
  veteran: (
    <FormattedMessage
      id="conditionOptions.veteran"
      defaultMessage="Are serving or have served in the U.S. Armed Forces, National Guard or Reserves"
    />
  ),
};

export default conditionOptions;
