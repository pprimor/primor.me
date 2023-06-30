import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/public/locales/en.json';
import pt_PT from '@/public/locales/pt-PT.json';

const i18nConfig: InitOptions = {
    resources: {
        en: {
            translation: en
        },
        pt_PT: {
            translation: pt_PT
        }
    },
    lng: 'en',
    fallbackLng: 'en',
};

i18n.use(initReactI18next).init(i18nConfig);

export default i18n;