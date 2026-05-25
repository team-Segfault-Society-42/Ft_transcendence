import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./en.json"
import fr from "./fr.json"
import es from "./es.json"

/**
 * Initializes the application's internationalization system.
 *
 * Configures:
 * - available languages
 * - translation resources
 * - default language
 * - fallback language
 * - React i18n integration
 *
 * Supported languages:
 * - English
 * - French
 * - Spanish
 */
i18n.use(initReactI18next).init({

  /* TRANSLATION RESOURCES */
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
  },

  /* CURRENT LANGUAGE */
  lng: localStorage.getItem("lang") || "en",

  /* FALLBACK LANGUAGE */
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n