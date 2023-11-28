import { useContext } from 'react';
import { Context } from '../Wrapper/Wrapper.tsx';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import Radiofield from '../Radiofield/Radiofield';
import Textfield from '../Textfield/Textfield';
import PreviousButton from '../PreviousButton/PreviousButton';
import ContinueButton from '../ContinueButton/ContinueButton';
import BasicSelect from '../DropdownMenu/BasicSelect';
import BasicCheckboxGroup from '../CheckboxGroup/BasicCheckboxGroup';
import OptionCardGroup from '../OptionCardGroup/OptionCardGroup';
import FollowUpQuestions from '../FollowUpQuestions/FollowUpQuestions';
import { Container } from '@mui/material';
import { useErrorController, zipcodeHasError } from '../../Assets/validationFunctions.tsx';
import './QuestionComponentContainer.css';
import { getQuestion } from '../../Assets/stepDirectory.ts';

const QuestionComponentContainer = ({
  handleTextfieldChange,
  handleContinueSubmit,
  handleRadioButtonChange,
  handleNoAnswerChange,
  handleIncomeStreamsSubmit,
  handleExpenseSourcesSubmit,
  handleCheckboxChange,
}) => {
  const { formData } = useContext(Context);
  let { id } = useParams();
  let matchingQuestion = getQuestion(+id, formData.immutableReferrer);

  const errorController = useErrorController(
    matchingQuestion.componentDetails.inputError,
    matchingQuestion.componentDetails.inputHelperText,
  );

  const renderTextfieldComponent = (question) => {
    return (
      <Textfield
        componentDetails={question.componentDetails}
        data={formData}
        handleTextfieldChange={handleTextfieldChange}
        submitted={errorController.submittedCount}
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
        options={matchingQuestion.componentDetails.options}
      />
    );
  };

  const renderOptionCardGroup = (question) => {
    return (
      <OptionCardGroup
        stateVariable={question.componentDetails.inputName}
        errorController={errorController}
        options={matchingQuestion.componentDetails.options}
      />
    );
  };

  const renderBasicSelectComponent = (question) => {
    return (
      <BasicSelect
        componentDetails={question.componentDetails}
        options={question.componentDetails.options}
        formDataProperty={question.componentDetails.inputName}
        submitted={errorController.submittedCount}
      />
    );
  };

  const createComponent = (component) => {
    const inputName = matchingQuestion.componentDetails.inputName;
    const { followUpQuestions } = matchingQuestion;
    const hasFollowUpQuestions = followUpQuestions && followUpQuestions.length > 0;
    // this is specifically for health & referral q error handling
    const isHealthQuestion = inputName === 'healthInsurance';

    return (
      <div className="question-container" id={id}>
        {<h2 className="question-label">{matchingQuestion.question}</h2>}
        {matchingQuestion.questionDescription && (
          <p className="question-description">{matchingQuestion.questionDescription}</p>
        )}
        {component}
        {shouldRenderFollowUpQuestions(hasFollowUpQuestions, inputName) && (
          <FollowUpQuestions
            followUpQuestions={matchingQuestion.followUpQuestions}
            submitted={errorController.submittedCount}
            formData={formData}
            handleCheckboxChange={handleCheckboxChange}
            handleExpenseSourcesSubmit={handleExpenseSourcesSubmit}
            handleIncomeStreamsSubmit={handleIncomeStreamsSubmit}
            handleTextfieldChange={handleTextfieldChange}
          />
        )}
        {isHealthQuestion && errorController.showError && errorController.message(formData[inputName])}
        {createPreviousAndContinueButtons()}
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

  const createPreviousAndContinueButtons = () => {
    //render normal button block if the question isn't the income or expense question OR
    //if the user doesn't have an income/expenses at all,
    //otherwise these buttons will be created in the IncomeBlock/ExpenseBlock components
    const isNotIncomeAndNotExpenseQ = matchingQuestion.name !== 'hasIncome' && matchingQuestion.name !== 'hasExpenses';
    const hasFalsyIncome =
      matchingQuestion.name === 'hasIncome' && formData[matchingQuestion.componentDetails.inputName] === false;
    const hasFalsyExpense =
      matchingQuestion.name === 'hasExpenses' && formData[matchingQuestion.componentDetails.inputName] === false;

    if (isNotIncomeAndNotExpenseQ || hasFalsyIncome || hasFalsyExpense) {
      return (
        <div className="question-buttons">
          <PreviousButton questionName={matchingQuestion.name} />
          <ContinueButton
            handleContinueSubmit={handleContinueSubmit}
            errorController={errorController}
            inputName={matchingQuestion.componentDetails.inputName}
            questionName={matchingQuestion.name}
          />
        </div>
      );
    }
  };

  const renderHeaderAndSubheader = () => {
    const { headerType, name } = matchingQuestion;

    switch (headerType) {
      case 'signUpInfo':
        return (
          <h1 className="sub-header">
            <FormattedMessage
              id="qcc.optional-sign-up-text"
              defaultMessage="Optional: Sign up for benefits updates and/or paid feedback opportunities"
            />
          </h1>
        );
      case 'aboutHousehold':
        if (name === 'hasBenefits' || name === 'acuteHHConditions') {
          return (
            <h1 className="sub-header">
              <FormattedMessage
                id="qcc.tell-us-final-text"
                defaultMessage="Tell us some final information about your household."
              />
            </h1>
          );
        } else if (name === 'zipcode') {
          return (
            <>
              <h2 className="question-secondary-header">Let&#39;s Get Started!</h2>
              <h1 className="question-header">
                <FormattedMessage id="questions.referralSource" defaultMessage="Just one more question!" />
              </h1>
            </>
          );
        } else if (name === 'referralSource') {
          return (
            <h1 className="sub-header">
              <FormattedMessage id="questions.referralSource" defaultMessage="Just one more question!" />
            </h1>
          );
        }
      default:
        return (
          <h1 className="sub-header">
            <FormattedMessage id="qcc.tell-us-text" defaultMessage="Tell us about your household." />
          </h1>
        );
    }
  };

  return (
    <main className="benefits-form">
      <Container className="question-header-container">{renderHeaderAndSubheader()}</Container>
      <Container>
        {(matchingQuestion.componentDetails.componentType === 'Textfield' &&
          createComponent(renderTextfieldComponent(matchingQuestion))) ||
          (matchingQuestion.componentDetails.componentType === 'Radiofield' &&
            createComponent(renderRadiofieldComponent(matchingQuestion))) ||
          (matchingQuestion.componentDetails.componentType === 'PreferNotToAnswer' &&
            createComponent(renderNoAnswerComponent(matchingQuestion))) ||
          (matchingQuestion.componentDetails.componentType === 'BasicCheckboxGroup' &&
            createComponent(renderBasicCheckboxGroup(matchingQuestion))) ||
          (matchingQuestion.componentDetails.componentType === 'OptionCardGroup' &&
            createComponent(renderOptionCardGroup(matchingQuestion))) ||
          (matchingQuestion.componentDetails.componentType === 'BasicSelect' &&
            createComponent(renderBasicSelectComponent(matchingQuestion)))}
      </Container>
    </main>
  );
};

export default QuestionComponentContainer;
