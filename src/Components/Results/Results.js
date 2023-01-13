import { useEffect, useState, Fragment, useContext } from 'react';
import { Context } from '../Wrapper/Wrapper';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, FormControlLabel, Link, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Grid from '@mui/material/Grid';
import { DataGridPro, GridRowsProp, DataGridProProps, useGridSelector, useGridApiContext, gridFilteredDescendantCountLookupSelector} from '@mui/x-data-grid-pro';
import Box from '@mui/material/Box';
import Loading from '../Loading/Loading';
import CustomSwitch from '../CustomSwitch/CustomSwitch';
import {
  postPartialParentScreen,
  postHouseholdMemberData,
  postHouseholdMemberIncomeStream,
  postHouseholdMemberExpense,
  getEligibility,
  postUser
} from "../../apiCalls";
import './Results.css';

export const isNavigationKey = (key) =>
  key === 'Home' ||
  key === 'End' ||
  key.indexOf('Arrow') === 0 ||
  key.indexOf('Page') === 0 ||
  key === ' ';

const Results = ({ results, setResults, formData, programSubset, passedOrFailedTests }) => {
  const navigate = useNavigate();
  const locale = useContext(Context).locale;
  const [filt, setFilt] = useState([]);

  useEffect(() => {
    if (results.screenerId === 0) {
      fetchResults();
    }
  }, []);

  const fetchResults = async () => {
    let userId = 0 ;

    if (formData.signUpInfo.sendOffers || formData.signUpInfo.sendUpdates) {
      userId = await postUserSignUpInfo();
    }

    const screensBody = getScreensBody(formData, locale.toLowerCase(), userId);
    const screensResponse = await postPartialParentScreen(screensBody);
    const householdMembersBodies = getHouseholdMembersBodies(formData, screensResponse.id);
    for (const householdMembersBody of householdMembersBodies) {
      const householdMembersResponse = await postHouseholdMemberData(householdMembersBody);

      const incomeStreamsBodies = getIncomeStreamsBodies(householdMembersBody, householdMembersResponse.id);
      for (const incomeStreamsBody of incomeStreamsBodies) {
        await postHouseholdMemberIncomeStream(incomeStreamsBody);
      }
      
      const expensesBodies = getExpensesBodies(householdMembersBody, householdMembersResponse.id);
      for (const expensesBody of expensesBodies) {
        await postHouseholdMemberExpense(expensesBody);
      }
    }

    const rawEligibilityResponse = await getEligibility(screensResponse.id, locale);
    const languageCode = locale.toLowerCase();
    const eligibilityResponse = rawEligibilityResponse.translations[languageCode];
    const qualifiedPrograms = eligibilityResponse
			.filter((program) => program.eligible === true && !formData.benefits[program.name_abbreviated])
			.sort((benefitA, benefitB) => benefitB.estimated_value - benefitA.estimated_value);
    const unqualifiedPrograms = eligibilityResponse.filter((program) => program.eligible === false);

    setResults({ 
      eligiblePrograms: qualifiedPrograms, 
      ineligiblePrograms: unqualifiedPrograms, 
      screenerId: screensResponse.id, 
      isLoading: false,
      user: userId
    });
  }

  const getScreensBody = (formData, languageCode, userId) => {
    const { agreeToTermsOfService, zipcode, county, householdSize, householdAssets, startTime, isTest, 
      externalID, lastTaxFilingYear, benefits, healthInsurance, referralSource, otherSource } = formData;
    const finalReferralSource = otherSource !== '' ? otherSource : referralSource;

    const screenBody = {
      is_test: isTest,
      external_id: externalID,
      agree_to_tos: agreeToTermsOfService,
      zipcode: zipcode,
      county: county,
      start_date: startTime,
      household_size: householdSize,
      household_assets: householdAssets,
      last_tax_filing_year: lastTaxFilingYear,
      request_language_code: languageCode,
      has_acp: benefits.acp,
      has_ccb: benefits.ccb,
      has_cccap: benefits.cccap,
      has_chp: benefits.chp,
      has_coeitc: benefits.coeitc,
      has_ctc: benefits.ctc,
      has_eitc: benefits.eitc,
      has_lifeline: benefits.lifeline,
      has_medicaid: benefits.medicaid,
      has_mydenver: benefits.mydenver,
      has_nslp: benefits.nslp,
      has_rtdlive: benefits.rtdlive,
      has_snap: benefits.snap,
      has_tanf: benefits.tanf,
      has_wic: benefits.wic,
      has_employer_hi: healthInsurance.employer,
      has_private_hi: healthInsurance.private,
      has_medicaid_hi: healthInsurance.medicaid,
      has_chp_hi: healthInsurance.chp,
      has_no_hi: healthInsurance.none,
      referral_source: finalReferralSource,
    };

    if (userId !== 0 && userId !== false) {
      screenBody.user = userId;
    }

    return screenBody;
  };

  const getHouseholdMembersBodies = (formData, screensId) => {
    const headOfHousehold = getHouseholdMemberBody(formData, 'headOfHousehold', screensId);
    const otherHouseholdMembers = formData.householdData.map(otherMember => {
      return getHouseholdMemberBody(otherMember, otherMember.relationshipToHH, screensId);
    });
    return [headOfHousehold, ...otherHouseholdMembers];
  };

  const getHouseholdMemberBody = (formData, relationshipToHH, screensId) => {
    const { age, student, studentFulltime, pregnant, unemployed,
      unemployedWorkedInLast18Mos, blindOrVisuallyImpaired, disabled, veteran, medicaid,
      disabilityRelatedMedicaid, hasIncome, hasExpenses, incomeStreams, expenses } = formData;
    
    return {
      screen: screensId,
      relationship: relationshipToHH,
      age: Number(age),
      student: student,
      student_full_time: studentFulltime,
      pregnant: pregnant,
      unemployed: unemployed,
      worked_in_last_18_mos: unemployedWorkedInLast18Mos,
      visually_impaired: blindOrVisuallyImpaired,
      disabled: disabled,
      veteran: veteran,
      medicaid: medicaid,
      disability_medicaid: disabilityRelatedMedicaid,
      has_income: hasIncome,
      has_expenses: hasExpenses ? hasExpenses : false,
      income_streams: incomeStreams,
      expenses: expenses ? expenses : []
    };
  };

  const getIncomeStreamsBodies = (householdMemberBody, householdMemberId) => {
    return householdMemberBody.income_streams.map(incomeStream => {
      return {
        type: incomeStream.incomeStreamName,
        amount: incomeStream.incomeAmount,
        frequency: incomeStream.incomeFrequency,
        screen: householdMemberBody.screen,
        household_member: householdMemberId
      };
    });
  }

  const getExpensesBodies = (householdMemberBody, householdMemberId) => {
    return householdMemberBody.expenses.map(expense => {
      return {
        type: expense.expenseSourceName,
        amount: expense.expenseAmount,
        frequency: 'monthly',
        screen: householdMemberBody.screen,
        household_member: householdMemberId
      };
    });
  }

  const postUserSignUpInfo = async () => {
    const { email, phone, firstName, lastName, 
      sendUpdates, sendOffers, commConsent } = formData.signUpInfo;
    const lowerCaseLocale = locale.toLowerCase();
    const phoneNumber = '+1' + phone;

    const user = {
      email_or_cell: email ? email : phoneNumber,
      cell: phone ? phoneNumber : '',
      email: email ? email : '',
      first_name: firstName,
      last_name: lastName,
      tcpa_consent: commConsent,
      language_code: lowerCaseLocale,
      send_offers: sendOffers,
      send_updates: sendUpdates
    };
    
    try {
      const userSignUpResponse = await postUser(user); //this should return what's on the swagger docs
      return userSignUpResponse.id;
    } catch {
      return false;
    }
  }

  const totalDollarAmount = (results) => {
    const total = results.reduce((total, program) => {
      if (filt.length > 0 && program.legal_status_required !== 'citizen') {
        total += program.estimated_value;
      } else if (filt.length === 0){
        total += program.estimated_value;
      }
      return total;
    }, 0);
    
    return total.toLocaleString();
  }

  const totalDollarAmountMonthly = (results) => {
    const total = results.reduce((total, program) => {
      if (filt.length > 0 && program.legal_status_required !== 'citizen') {
        total += Math.round(program.estimated_value / 12);
      } else if (filt.length === 0) {
        total += Math.round(program.estimated_value / 12);
      }
      return total;
    }, 0);
    
    return total.toLocaleString();
  }

  const displayTestResults = (tests) => {
    if (tests.length) {
      return ( 
        <>
          { tests.map(testResult => {
              return <li key={testResult}>{testResult}</li>
            })
          }
        </>
      );
    }
  }

  const displayNavigators = (navigators) => {
    console.log(navigators)
    if (navigators.length) {
      return (
        <>
          { navigators.map(navigator => {
            return (
							<li key={navigator.name}>
								<a href={navigator.assistance_link}>{navigator.name}</a>
							</li>
						);
          })}
        </>
      )
    }
  }

  const displaySubheader = (benefitsSubset) => {
    if (benefitsSubset === 'eligiblePrograms') {
      return (
        <>
          <Grid xs={12} item={true}>
            <Typography className='sub-header' variant="h6"> 
              {results[programSubset].length} 
              <FormattedMessage 
                id='results.return-programsUpToLabel' 
                defaultMessage=' programs, up to ' /> 
              ${totalDollarAmount(results[programSubset])} 
              <FormattedMessage 
                id='results.return-perYearOrLabel' 
                defaultMessage=' per year or ' />
              ${totalDollarAmountMonthly(results[programSubset])} 
              <FormattedMessage 
                id='results.return-perMonthLabel' 
                defaultMessage=' per month for you to consider' />
            </Typography>
          </Grid>
          <Grid container>
            <Grid sm={10} item={true}>
              <Typography variant='body1' sx={{mt: 2}} className='remember-disclaimer-label'>
                <FormattedMessage 
                  id='results.displaySubheader-emailResultsDescText' 
                  defaultMessage='To receive a copy of these results by email please click the email results button.' />
              </Typography>
            </Grid>
            <Grid xs={12} item={true} sm={2} justifyContent="end">
              <Box justifyContent='end' display='flex'>
                <Button
                  sx={{mb: 2, mt: 1}}
                  variant='contained'
                  endIcon={<SendIcon />}
                  onClick={() => {
                    navigate('/email-results');
                  }}
                  className='results-link'>
                  <FormattedMessage 
                    id='results.return-emailResultsButton' 
                    defaultMessage='Email Results' />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </>
      );
    } else if (benefitsSubset === 'ineligiblePrograms') {
      return (
        <Grid xs={12} item={true}>
          <Typography className='sub-header' variant="h6">
            <FormattedMessage 
              id='results.displaySubheader-basedOnInformationText' 
              defaultMessage='Based on the information you provided, we believe you are likely not eligible for the programs below:' />
          </Typography>
        </Grid>
      );
    }
  }

  const DataGridRows = (results) => {
    let dgr = [];
    let count = 0;
    for (let i = 0; i < results.length; i++) {
      let dataGridRow = {
        id: count,
        path: results[i].name,
        name: results[i].name,
        value: results[i].estimated_value,
        type: results[i].value_type,
        description: results[i].description,
        application_time: results[i].estimated_application_time,
        delivery_time: results[i].estimated_delivery_time,
        application_link: results[i].apply_button_link,
        passed_tests: results[i].passed_tests,
        failed_tests: results[i].failed_tests,
        navigators: results[i].navigators,
        citizenship: results[i].legal_status_required
      };
      dgr.push(dataGridRow);
      count++;
      let dataGridChild = {
        id: count,
        path: results[i].name + '/Detail',
        name: results[i].description,
        value: '',
        type: '',
        application_time: '',
        delivery_time: results[i].estimated_delivery_time,
        description: results[i].description,
        citizenship: '',
        application_link: results[i].apply_button_link,
        passed_tests: results[i].passed_tests,
        failed_tests: results[i].failed_tests,
        navigators: results[i].navigators
      }
      dgr.push(dataGridChild);
      count++;
    }
    return dgr;
  }

  const CustomGridTreeDataGroupingCell = (props: GridRenderCellParams) => {
    const { id, field, rowNode } = props;
    const apiRef = useGridApiContext();
    const filteredDescendantCountLookup = useGridSelector(
      apiRef,
      gridFilteredDescendantCountLookupSelector,
    );

    const handleKeyDown: ButtonProps['onKeyDown'] = (event) => {
      if (event.key === ' ') {
        event.stopPropagation();
      }
      if (isNavigationKey(event.key) && !event.shiftKey) {
        apiRef.current.publishEvent('cellNavigationKeyDown', props, event);
      }
    };

    const handleClick: ButtonProps['onClick'] = (event) => {
      apiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded);
      apiRef.current.setCellFocus(id, field);
      event.stopPropagation();
    };

    let row = apiRef.current.getRow(id);
    const filteredDescendantCount = filteredDescendantCountLookup[rowNode.id] ?? 0;

    const [expand_apply_assistance, set_expand_apply_assistance] = useState(false)
    return (
      <div>
        {filteredDescendantCount > 0 ? (
          <Link
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {row.name}
          </Link>
        ) : (
          <Box sx={{ padding: 1 }}>
          <Typography variant='body1' gutterBottom>
            {row.description}
          </Typography>
          <Typography variant='body1' sx={{ fontStyle: 'italic', marginBottom: 2 }}>
            <FormattedMessage
              id='results.return-estimatedDeliveryTimeA'
              defaultMessage="*On average people who are approved for this benefit start receiving it " />
            {row.delivery_time}
            <FormattedMessage
              id='results.return-estimatedDeliveryTimeB'
              defaultMessage=" after completing the application." />
          </Typography>
          <Button
            variant='contained'
            target="_blank"
            href={row.application_link}>
            <FormattedMessage 
              id='results.resultsRow-applyButton' 
              defaultMessage='Apply' />
          </Button>
          <Button
            variant='contained'
            target="_blank"
            onClick={(event)=>{
              event.preventDefault();
              set_expand_apply_assistance(!expand_apply_assistance);
            }}>
            <FormattedMessage 
              id='results.resultsRow-applyButton' 
              defaultMessage='Apply' />
          </Button>
          { (row.navigators.length > 0)  && 
            <Accordion 
              sx={{ m: 2 }}
              expanded={expand_apply_assistance}
              className={expand_apply_assistance? '': 'hide'}
              >
              <AccordionSummary
                expandIcon={<CloseIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"> 
                  <Typography variant='body2'>
                    <Link>
                      <FormattedMessage 
                        id='results.resultsRow-applyWithAssistance' 
                        defaultMessage='Navigators' />
                    </Link>
                  </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{paddingTop: 0}}>
                { displayNavigators(row.navigators) }
              </AccordionDetails>
            </Accordion> 
          }
          { (row.passed_tests.length > 0 || row.failed_tests.length > 0)  && 
            <Accordion sx={{ m: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"> 
                  <Typography variant='body2'>
                    <Link>
                      <FormattedMessage 
                        id='results.resultsRow-expandForEligibilityLink' 
                        defaultMessage='Expand for eligibility details' />
                    </Link>
                  </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{paddingTop: 0}}>
                { displayTestResults(row.passed_tests) }
                { displayTestResults(row.failed_tests) }
              </AccordionDetails>
            </Accordion> 
          }
        </Box>
        )}
      </div>
    );
  }

  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: 'Benefit',
    flex: 1,
    colSpan: ({ row }) => {
      if (row.path.indexOf('Detail') !== -1) {
        return 4;
      }
      else {
        return 1;
      }
    },
    renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} />
  };

  const DataGridTable = (results) => {
    const rows: GridRowsProp = DataGridRows(results);
    const nameHeader = <FormattedMessage 
      id='results.resultsTable-benefitLabel' 
      defaultMessage='Benefit' />
    const valueHeader = <FormattedMessage 
      id='results.resultsTable-annualValueLabel' 
      defaultMessage='Annual Value' />
    const appTimeHeader = <FormattedMessage 
      id='results.resultsTable-timeToApply' 
      defaultMessage='Time to Apply' />

    const columns: GridColDef[] = [
      { field: 'name', headerName: nameHeader, flex: 1 },  
      { field: 'value', headerName: valueHeader, flex: 1, valueFormatter: benefitValueFormatter, renderCell: benefitValueRender },
      { field: 'type', headerName: 'Type', flex: 1 },
      { field: 'application_time', headerName: appTimeHeader, flex: 1 },
      { field: 'delivery_time', headerName: 'Delivery Time', flex: 1 },
      { field: 'citizenship', headerName: 'Citizenship Requirements', flex: 1 },
      { field: 'application_link', headerName: 'Application Link', flex: 1 },
      { field: 'passed_tests', headerName: 'Passed Tests', flex: 1 },
      { field: 'failed_tests', headerName: 'Passed Tests', flex: 1 }
    ];
    return (
      <DataGridPro
        treeData
        autoHeight
        getTreeDataPath={(row) => row.path.split('/')}
        groupingColDef={groupingColDef}
        getRowHeight={() => 'auto'}
        disableChildrenFiltering
        hideFooter={true}
        rows={rows} 
        columns={columns} 
        filterModel={{ items: filt }}
        sx={{
          '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
          '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
          '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              citizenship: false,
              delivery_time: false,
              type: false,
              name: false,
              description: false,
              application_link: false,
              passed_tests: false,
              failed_tests: false,
              navigators: false
            }
          }
        }}
        />
    );
  }

  const benefitValueFormatter = (params) => {
    let formatted_value = '';
    if (params.value.toLocaleString().length > 0) {
      formatted_value = '$' + params.value.toLocaleString();
    }

    return formatted_value;
  }

  const benefitValueRender = (params) => {
    let row = params.api.getRow(params.id);
    let formatted_value = '';

    if (params.value.toLocaleString().length > 0) {
      formatted_value = '$' + params.value.toLocaleString();
    }

    return (
      <div>
        {formatted_value}
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {row.type}
        </Typography>
      </div>
    );
  }

  const handleCustomSwitchToggle = (e) => {
    if (e.target.checked) {
      setFilt([
        {
          columnField: "citizenship",
          operatorValue: "startsWith",
          value: "None"
        }
      ])
    }
    else {
      setFilt([])
    }
  }

  return (
    <main className='benefits-form'>
      <div className='results-container'>
        <Grid container spacing={2}>
          { results.isLoading ? 
            <Grid container xs={12} item={true} justifyContent="center" alignItems="center">
              <Grid xs={6} sx={{mt: 5}} item={true}>
                <Loading />
              </Grid>
            </Grid> : 
            <>
              <Grid container xs={12} item={true} sx={{mt: 2}} >
                <Grid xs={12} item={true}>
                  <Typography className='body2'>
                    <FormattedMessage 
                      id='results.return-screenerIdLabel' 
                      defaultMessage='Screener ID: ' /> 
                    {results.screenerId}
                  </Typography>
                </Grid>
                { displaySubheader(programSubset) }
              </Grid>
              <Grid xs={12} item={true}>
                <FormControlLabel
                  label={<FormattedMessage id='results.returnsignupCitizenFilter' defaultMessage="Only show benefits that do not require a citizen in the household" />}
                  control={<CustomSwitch handleCustomSwitchToggle={handleCustomSwitchToggle} /> }
                />
                { DataGridTable(results[programSubset])}
              </Grid>
              <Grid xs={12} item={true}>
                { programSubset === 'eligiblePrograms' && 
                  <Typography
                    sx={{mt: '.25rem'}}
                    onClick={() => {
                      navigate('/ineligible-results');
                      window.scrollTo(0,0);
                    }}
                    className='ineligibility-link'>
                    <FormattedMessage 
                      id='results.return-ineligibilityLinkText' 
                      defaultMessage='* For additional information on programs 
                      that you were not eligible for click here' />
                  </Typography> 
                }
                { programSubset === 'ineligiblePrograms' && 
                  <Typography
                    sx={{mt: '.25rem'}}
                    onClick={() => {
                      navigate('/results');
                      window.scrollTo(0,0);
                    }}
                    className='ineligibility-link'>
                    <FormattedMessage 
                      id='results.return-goBackToEligibleText' 
                      defaultMessage='Go back to eligible programs' />
                  </Typography> 
                }
              </Grid>
            </>
          }
        </Grid>
      </div>
    </main>
  );
}

export default Results;