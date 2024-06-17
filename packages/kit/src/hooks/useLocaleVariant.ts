import { useEffect, useState } from 'react';

import { useSettingsPersistAtom } from '@onekeyhq/kit-bg/src/states/jotai/atoms';
import { LOCALES } from '@onekeyhq/shared/src/locale';

import { useSystemLocale } from './useSystemLocale';

export function useLocaleVariant() {
  const [{ locale }] = useSettingsPersistAtom();
  const systemLocale = useSystemLocale();
  const currentVariant = locale === 'system' ? systemLocale : locale;
  const [localeVariant, setLocaleVariant] = useState(() => {
    const data = LOCALES[currentVariant];
    if (typeof data === 'object') {
      return currentVariant;
    }
    return 'en-US';
  });
  useEffect(() => {
    const data = LOCALES[currentVariant];
    if (typeof data === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      void data().then((module) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        LOCALES[currentVariant] = module;
        setLocaleVariant(currentVariant);
      });
    } else {
      setLocaleVariant(currentVariant);
    }
  }, [currentVariant]);
  return localeVariant;
}
