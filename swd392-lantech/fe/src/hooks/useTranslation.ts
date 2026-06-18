import { useAppStore } from '../store/appStore';
import { getTranslation } from '../utils/translations';

export function useTranslation() {
  const language = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);

  const t = (key: string, params?: Record<string, string>) => {
    return getTranslation(language, key, params);
  };

  return { t, language, setLanguage };
}
