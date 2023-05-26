import { useContext } from 'react';
import { Context } from '../Wrapper/Wrapper';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import Radiofield from '../Radiofield/Radiofield';
import Textfield from '../Textfield/Textfield';
import PreviousButton from '../PreviousButton/PreviousButton';
import ContinueButton from '../ContinueButton/ContinueButton';
import IncomeBlock from '../IncomeBlock/IncomeBlock';
import ExpenseBlock from '../ExpenseBlock/ExpenseBlock';
import HouseholdDataBlock from '../HouseholdDataBlock/HouseholdDataBlock';
import BasicSelect from '../DropdownMenu/BasicSelect';
import BasicCheckboxGroup from '../CheckboxGroup/BasicCheckboxGroup';
import SignUp from '../SignUp/SignUp';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import AccordionsContainer from '../../Components/AccordionsContainer/AccordionsContainer';
import OptionCardGroup from '../OptionCardGroup/OptionCardGroup';
import questions from '../../Assets/questions';
import { zipcodeHasError } from '../../Assets/validationFunctions';
import './QuestionComponentContainer.css';

const QuestionComponentContainer = ({
  handleTextfieldChange,
  handleContinueSubmit,
  handleRadioButtonChange,
  handleNoAnswerChange,
  handleIncomeStreamsSubmit,
  handleExpenseSourcesSubmit,
  handleHouseholdDataSubmit,
  handleCheckboxChange,
}) => {
  const { formData, setFormData } = useContext(Context);
  let { id } = useParams();
  let numberId = Number(id);
  const matchingQuestion = questions[numberId];

  const createHouseholdDataBlock = () => {
    return (
      <div className="question-container" id={id}>
        <HouseholdDataBlock handleHouseholdDataSubmit={handleHouseholdDataSubmit} />
      </div>
    );
  };

  const renderTextfieldComponent = (question) => {
    return (
      <Textfield
        componentDetails={question.componentDetails}
        data={formData}
        handleTextfieldChange={handleTextfieldChange}
      />
    );
  };

  const renderRadiofieldComponent = (question) => {
    return (
      <Radiofield componentDetails={question.componentDetails} handleRadioButtonChange={handleRadioButtonChange} />
    );
  };

  const renderNoAnswerComponent = (question) => {
    return (
      <Radiofield
        componentDetails={question.componentDetails}
        handleRadioButtonChange={handleNoAnswerChange}
        preferNotToAnswer={true}
      />
    );
  };

  const renderBasicCheckboxGroup = (question) => {
    return (
      <BasicCheckboxGroup
        stateVariable={question.componentDetails.inputName}
        options={question.componentDetails.options}
      />
    );
  };

  const renderOptionCardGroup = (question) => {
    return (
      <OptionCardGroup
        stateVariable={question.componentDetails.inputName}
        options={question.componentDetails.options}
      />
    );
  };

  const renderBasicSelectComponent = (question) => {
    const finalOptions =
      question.componentDetails.inputName === 'county'
        ? question.componentDetails.options[formData.zipcode]
        : question.componentDetails.options;

    return (
      <BasicSelect
        componentProperties={question.componentDetails.componentProperties}
        options={finalOptions}
        formDataProperty={question.componentDetails.inputName}
      />
    );
  };

  const createComponent = (component) => {
    const inputName = matchingQuestion.componentDetails.inputName;
    const { followUpQuestions } = matchingQuestion;
    const hasFollowUpQuestions = followUpQuestions && followUpQuestions.length > 0;
    // this is specifically for step 5 error handling
    const isHealthInsuranceQ = matchingQuestion.name === 'healthInsurance';
    const helperText =
      isHealthInsuranceQ && matchingQuestion.componentDetails.inputHelperText(formData[matchingQuestion.name]);
    const hasError =
      isHealthInsuranceQ && matchingQuestion.componentDetails.inputError(formData[matchingQuestion.name]);

    return (
      <div className="question-container" id={id}>
        {matchingQuestion.name !== 'referralSource' && <h2 className="question-label">{matchingQuestion.question}</h2>}
        {matchingQuestion.questionDescription && (
          <p className="question-description">{matchingQuestion.questionDescription}</p>
        )}
        {component}
        {shouldRenderFollowUpQuestions(hasFollowUpQuestions, inputName) && renderFollowUpQuestions()}
        {isHealthInsuranceQ && hasError && <ErrorMessage error={helperText} />}
        {createPreviousAndContinueButtons(matchingQuestion)}
      </div>
    );
  };

  const shouldRenderFollowUpQuestions = (hasFollowUpQuestions, inputName) => {
    if (!hasFollowUpQuestions) {
      return false;
    }
    if (inputName === 'zipcode') {
      return !zipcodeHasError(formData.zipcode);
    }
    if (formData[inputName] === true) {
      // this case is for a radio button question where the user selected "yes"
      return true;
    }
    if (formData[inputName] === 'true') {
      // this case is for a radio button with prefer not to answer where the use selected "yes"
      return true;
    }
    if (formData[inputName] === 'other') {
      // this case is for the referral source question where the user selected "other"
      return true;
    }
    if (
      inputName === 'signUpInfo' &&
      (formData.signUpInfo.sendUpdates || formData.signUpInfo.sendOffers) &&
      !formData.signUpInfo.hasUser
    ) {
      return true;
    }

    return false;
  };

  const renderFollowUpQuestions = () => {
    const { followUpQuestions } = matchingQuestion;
    return followUpQuestions.map((followUp, index) => {
      if (followUp.componentDetails.componentType === 'Radiofield') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            {renderRadiofieldComponent(followUp)}
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'IncomeBlock') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            <IncomeBlock handleIncomeStreamsSubmit={handleIncomeStreamsSubmit} />
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'ExpenseBlock') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            <ExpenseBlock handleExpenseSourcesSubmit={handleExpenseSourcesSubmit} />
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'Textfield') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            <Textfield
              componentDetails={matchingQuestion.followUpQuestions[0].componentDetails}
              data={formData}
              handleTextfieldChange={handleTextfieldChange}
              index="0"
            />
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'BasicSelect') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            {renderBasicSelectComponent(followUp)}
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'SignUp') {
        return (
          <div className="question-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            <SignUp handleTextfieldChange={handleTextfieldChange} handleCheckboxChange={handleCheckboxChange} />
          </div>
        );
      } else if (followUp.componentDetails.componentType === 'AccordionContainer') {
        const hasError = matchingQuestion.componentDetails.inputError(formData.hasBenefits, formData);
        const errorText = matchingQuestion.componentDetails.inputHelperText(formData.hasBenefits, formData);

        return (
          <div className="question-container accordions-container" key={index}>
            <h2 className="question-label">{followUp.question}</h2>
            <p className="question-description">{matchingQuestion.followUpQuestions[0].questionDescription}</p>
            <AccordionsContainer />
            {hasError && <ErrorMessage error={errorText} />}
          </div>
        );
      }
    });
  };

  const createPreviousAndContinueButtons = (question) => {
    //render normal button block if the question isn't the income or expense question OR
    //if the user doesn't have an income/expenses at all,
    //otherwise these buttons will be created in the IncomeBlock/ExpenseBlock components
    const isNotIncomeAndNotExpenseQ = question.name !== 'hasIncome' && question.name !== 'hasExpenses';
    const hasFalsyIncome = question.name === 'hasIncome' && formData[question.componentDetails.inputName] === false;
    const hasFalsyExpense = question.name === 'hasExpenses' && formData[question.componentDetails.inputName] === false;

    if (isNotIncomeAndNotExpenseQ || hasFalsyIncome || hasFalsyExpense) {
      return (
        <div className="question-buttons">
          <PreviousButton questionName={question.name} />
          <ContinueButton
            handleContinueSubmit={handleContinueSubmit}
            inputError={matchingQuestion.componentDetails.inputError}
            inputName={matchingQuestion.componentDetails.inputName}
            questionName={matchingQuestion.name}
          />
        </div>
      );
    }
  };

  const renderHeaderAndSubheader = () => {
    if (matchingQuestion.headerType === 'signUpInfo') {
      return (
        <h1 className="sub-header">
          <FormattedMessage
            id="qcc.optional-sign-up-text"
            defaultMessage="Optional: Sign up for benefits updates and/or paid feedback opportunities"
          />
        </h1>
      );
    } else if (matchingQuestion.headerType === 'aboutHousehold') {
      if (matchingQuestion.name === 'hasBenefits' || matchingQuestion.name === 'acuteHHConditions') {
        return (
          <h1 className="sub-header">
            <FormattedMessage
              id="qcc.tell-us-final-text"
              defaultMessage="Tell us some final information about your household."
            />
          </h1>
        );
      } else if (matchingQuestion.name === 'referralSource') {
        return (
          <h1 className="sub-header">
            <FormattedMessage id="questions.referralSource" defaultMessage="How did you hear about this screener?" />
          </h1>
        );
      } else {
        return (
          <h1 className="sub-header">
            <FormattedMessage id="qcc.tell-us-text" defaultMessage="Tell us about your household." />
          </h1>
        );
      }
    }
  };

  return (
    <main className="benefits-form">
      {renderHeaderAndSubheader()}
      {(matchingQuestion.componentDetails.componentType === 'Textfield' &&
        createComponent(renderTextfieldComponent(matchingQuestion))) ||
        (matchingQuestion.componentDetails.componentType === 'Radiofield' &&
          createComponent(renderRadiofieldComponent(matchingQuestion))) ||
        (matchingQuestion.componentDetails.componentType === 'PreferNotToAnswer' &&
          createComponent(renderNoAnswerComponent(matchingQuestion))) ||
        (matchingQuestion.componentDetails.componentType === 'HouseholdDataBlock' && createHouseholdDataBlock()) ||
        (matchingQuestion.componentDetails.componentType === 'BasicCheckboxGroup' &&
          createComponent(renderBasicCheckboxGroup(matchingQuestion))) ||
        (matchingQuestion.componentDetails.componentType === 'OptionCardGroup' &&
          createComponent(renderOptionCardGroup(matchingQuestion))) ||
        (matchingQuestion.componentDetails.componentType === 'BasicSelect' &&
          createComponent(renderBasicSelectComponent(matchingQuestion)))}
    </main>
  );
};

export default QuestionComponentContainer;
