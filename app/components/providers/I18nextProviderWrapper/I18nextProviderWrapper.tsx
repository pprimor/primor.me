"use client"

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/config/i18n';


export default function I18nextProviderWrapper({ children }: {children: React.ReactNode}) {
    return /*#__PURE__*/React.createElement(I18nextProvider, {
        i18n: i18n
    }, children);
}