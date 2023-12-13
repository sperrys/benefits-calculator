import { FormattedMessage } from 'react-intl';

const referralOptions = {
  '211co': '2-1-1 Colorado',
  cedp: 'Community Economic Defense Project (CEDP)',
  cch: 'Colorado Coalition for the Homeless',
  jeffcoHS: 'Jeffco Human Services',
  jeffcoPP: 'Jeffco Prosperity Partners',
  bia: 'Benefits in Action',
  mcoa: 'MCOA at Anschutz',
  villageExchange: 'Village Exchange',
  frca: 'Family Resource Center Association',
  lgs: "Let's Get Set",
  testOrProspect: <FormattedMessage id="referralOptions.testOrProspect" defaultMessage="Test / Prospective Partner" />,
  searchEngine: <FormattedMessage id="referralOptions.searchEngine" defaultMessage="Google or other search engine" />,
  other: <FormattedMessage id="referralOptions.other" defaultMessage="Other" />,
};

export default referralOptions;
