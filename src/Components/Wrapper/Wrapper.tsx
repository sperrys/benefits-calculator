import React, { useEffect, useState, PropsWithChildren } from 'react';
import useStyle from '../../Assets/styleController';
import { IntlProvider } from 'react-intl';
import Spanish from '../../Assets/Languages/Spanish.json';
import English from '../../Assets/Languages/English.json';
import Vietnamese from '../../Assets/Languages/Vietnamese.json';
import { WrapperContext } from '../../Types/WrapperContext';
import { Language } from '../../Types/Language';
import { FormData } from '../../Types/FormData';
import { getTranslations } from '../../apiCalls';

const initialFormData: FormData = {
  isTest: undefined,
  externalID: undefined,
  agreeToTermsOfService: false,
  is13OrOlder: false,
  zipcode: '',
  county: '',
  startTime: new Date().toJSON(),
  hasExpenses: false,
  expenses: [],
  householdSize: '',
  householdData: [],
  householdAssets: 0,
  hasBenefits: 'preferNotToAnswer',
  benefits: {
    acp: false,
    andcs: false,
    cccap: false,
    coctc: false,
    coeitc: false,
    coheadstart: false,
    coPropTaxRentHeatCreditRebate: false,
    ctc: false,
    dentallowincseniors: false,
    denverpresc: false,
    ede: false,
    eitc: false,
    erc: false,
    lifeline: false,
    leap: false,
    mydenver: false,
    nslp: false,
    oap: false,
    rtdlive: false,
    snap: false,
    ssi: false,
    tanf: false,
    upk: false,
    wic: false,
  },
  healthInsurance: {
    employer: false,
    private: false,
    medicaid: false,
    medicare: false,
    chp: false,
    none: false,
  },
  referralSource: undefined,
  immutableReferrer: undefined,
  otherSource: undefined,
  signUpInfo: {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    hasUser: false,
    sendOffers: false,
    sendUpdates: false,
    commConsent: false,
  },
  urlSearchParams: '',
  acuteHHConditions: {
    food: false,
    babySupplies: false,
    housing: false,
    support: false,
    childDevelopment: false,
    familyPlanning: false,
    jobResources: false,
    dentalCare: false,
    legalServices: false,
  },
};

export const Context = React.createContext<WrapperContext>({} as WrapperContext);

const Wrapper = (props: PropsWithChildren<{}>) => {
  let [translations, setTranslations] = useState<{ [key: string]: Language }>({});
  useEffect(() => {
    getTranslations().then((value) => {
      setTranslations(value);
    });
  }, []);
  let defaultLanguage = localStorage.getItem('language') ?? 'en-US';
  const pathname = window.location.pathname;

  const [theme, setTheme, styleOverride] = useStyle('default');

  if (pathname.includes('/es')) {
    defaultLanguage = 'es';
  } else if (pathname.includes('/vi')) {
    defaultLanguage = 'vi';
  }

  const [locale, setLocale] = useState(defaultLanguage);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    localStorage.setItem('language', locale);
    for (const lang of Object.keys(translations)) {
      if (locale.toLocaleLowerCase() === lang) {
        setMessages(translations[lang]);
        return;
      }
    }
    setMessages(translations['en-us'] ?? {});
  }, [locale, translations]);

  const selectLanguage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newLocale = target.value;
    setLocale(newLocale);
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  return (
    <Context.Provider
      value={{ locale, setLocale, selectLanguage, formData, setFormData, theme, setTheme, styleOverride }}
    >
      <IntlProvider locale={locale} messages={messages} defaultLocale={locale}>
        {props.children}
      </IntlProvider>
    </Context.Provider>
  );
};

export default Wrapper;
