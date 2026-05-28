/**
 * Backend i18n for SMS notifications
 * Targeted for Rwanda (Kinyarwanda and English)
 */

type Language = "kinyarwanda" | "english" | "french";

const translations: Record<string, Record<Language, string>> = {
  "alert.soil.moisture.critical": {
    kinyarwanda:
      "INKURU IHUTIRWA: Ubuhehere bw ubutaka buri hasi cyane ({value}%). Shira amazi mu mirima vuba!",
    english:
      "CRITICAL ALERT: Soil moisture is extremely low ({value}%). Please irrigate your crops immediately!",
    french:
      "ALERTE CRITIQUE: L humidité du sol est très basse ({value}%). Veuillez irriguer vos cultures immédiatement!",
  },
  "alert.weather.rain.heavy": {
    kinyarwanda:
      "INKURU IHUTIRWA: Hitezwe imvura nyinshi cyane. Rwanya isuri mu mirima yawe.",
    english:
      "CRITICAL ALERT: Heavy rain expected. Protect your fields against erosion.",
    french:
      "ALERTE CRITIQUE: Fortes pluies attendues. Protégez vos champs contre l érosion.",
  },
  "alert.irrigation.started": {
    kinyarwanda: "Aguka: Kuhira byatangiye mu murima wawe.",
    english: "Aguka: Irrigation started in your field.",
    french: "Aguka: L irrigation a commencé dans votre champ.",
  },
  "alert.irrigation.stopped": {
    kinyarwanda: "Aguka: Kuhira byahagaze mu murima wawe.",
    english: "Aguka: Irrigation stopped in your field.",
    french: "Aguka: L irrigation s est arrêtée dans votre champ.",
  },
  "alert.system.error": {
    kinyarwanda:
      "Aguka: Hari ikibazo cyagaragaye kuri sisitemu yawe. Reba niba ibikoresho bikora neza.",
    english:
      "Aguka: A system error was detected. Please check your IoT kit hardware.",
    french:
      "Aguka: Une erreur système a été détectée. Veuillez vérifier votre kit IoT.",
  },
  "ussd.main.menu": {
    kinyarwanda:
      "Muraho {name}!\n1. Imiterere y ubutaka\n2. Iteganyagihe\n3. Kuhira\n4. Ibiciro ku isoko\n5. Guhamagara umujyanama\n6. Ubufasha",
    english:
      "Hello {name}!\n1. Soil Status\n2. Weather Info\n3. Irrigation\n4. Market Prices\n5. Contact Agent\n6. Help",
    french:
      "Bonjour {name}!\n1. État du sol\n2. Météo\n3. Irrigation\n4. Prix du marché\n5. Contacter un agent\n6. Aide",
  },
  "ussd.help": {
    kinyarwanda:
      "Aguka Smart Farming igufasha gukurikirana ubutaka bwawe no kuhira mu buryo bugezweho. Hamagara 078XXXXXXX niba ukeneye ubufasha buhagije.",
    english:
      "Aguka Smart Farming helps you monitor your soil and irrigation with precision. Call 078XXXXXXX for technical support.",
    french:
      "Aguka Smart Farming vous aide à surveiller votre sol et votre irrigation avec précision. Appelez le 078XXXXXXX pour un support technique.",
  },
  "ussd.soil.status": {
    kinyarwanda:
      "Ubutaka bwawe bufite ubuhehere bwa {moisture}%. Imiterere: {status}.",
    english: "Your soil moisture is {moisture}%. Status: {status}.",
    french: "L humidité du sol est de {moisture}%. État: {status}.",
  },
  "ussd.weather.status": {
    kinyarwanda: "Iteganyagihe: {condition}, {temp}°C. Imvura: {rain}mm.",
    english: "Weather: {condition}, {temp}°C. Rain: {rain}mm.",
    french: "Météo: {condition}, {temp}°C. Pluie: {rain}mm.",
  },
  "ussd.irrigation.status": {
    kinyarwanda: "Kuhira: {status}. Amazi yakoreshejwe: {waterUsed}L.",
    english: "Irrigation: {status}. Water used today: {waterUsed}L.",
    french: "Irrigation: {status}. Eau utilisée: {waterUsed}L.",
  },
  "ussd.market.prices": {
    kinyarwanda:
      "Ibiciro ku isoko (RWF/kg):\nIbirayi: {potatoes}\nIbigori: {maize}\nIbishyimbo: {beans}",
    english:
      "Market Prices (RWF/kg):\nPotatoes: {potatoes}\nMaize: {maize}\nBeans: {beans}",
    french:
      "Prix du marché (RWF/kg):\nPommes de terre: {potatoes}\nMaïs: {maize}\nHaricots: {beans}",
  },
  "ussd.agent.contact": {
    kinyarwanda: "Umujyanama azaguhamagara mu kanya. Aguka iragushimiye!",
    english: "An agent will call you shortly. Thank you for using Aguka!",
    french: "Un agent vous appellera sous peu. Merci d'utiliser Aguka!",
  },
};

export const getSmsTranslation = (
  key: string,
  lang: Language,
  params: Record<string, any> = {},
): string => {
  let message =
    translations[key]?.[lang] || translations[key]?.["english"] || key;

  // Simple parameter replacement
  Object.keys(params).forEach((param) => {
    message = message.replace(`{${param}}`, params[param]);
  });

  return message;
};
