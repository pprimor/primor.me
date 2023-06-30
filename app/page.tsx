"use client"

import { useTranslation } from "react-i18next"

export default function Home() {
  const { t } = useTranslation()

  return (
    <section>
      <h1 className="text-2xl">
        {t('hello')}
      </h1>
    </section>
  )
}
