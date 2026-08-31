/**
 * Backend i18n for livestock guidance content (nutrition/housing/breeding/health/recommendations)
 * Targeted for Rwanda (Kinyarwanda, English, French)
 */

export type GuidanceLang = "en" | "rw" | "fr";

export function normalizeGuidanceLang(value: unknown): GuidanceLang {
  return value === "rw" || value === "fr" ? value : "en";
}

type LangMap = Record<GuidanceLang, string>;

const nutritionByType: Record<string, LangMap> = {
  cow: {
    en: "Provide balanced diet with roughage, concentrates, minerals, and vitamins. Lactating cows need additional protein and calcium.",
    rw: "Tanga indyo yuzuye ikubiyemo ibyatsi, ibiryo byiyongera intungamubiri, imyunyu ngugu, na vitamini. Inka zonsa zikeneye poroteyine n'amakalisiyumu byinshi.",
    fr: "Fournissez une alimentation équilibrée avec fourrage, aliments concentrés, minéraux et vitamines. Les vaches allaitantes ont besoin de protéines et de calcium supplémentaires.",
  },
  goat: {
    en: "High-quality hay, fresh water, and mineral supplements. Pregnant/lactating does need extra nutrition.",
    rw: "Tanga ubwatsi bwiza, amazi meza, n'imyunyu ngugu. Ihene zitwite cyangwa zonsa zikeneye intungamubiri nyinshi.",
    fr: "Foin de haute qualité, eau fraîche et suppléments minéraux. Les chèvres gestantes ou allaitantes ont besoin d'une nutrition supplémentaire.",
  },
  sheep: {
    en: "Good quality pasture, hay, and supplements. Avoid overfeeding grains to prevent digestive issues.",
    rw: "Tanga ubwatsi bwiza bwo mu ishyamba n'ibindi biryo byiyongera. Wirinde guha intama ibinyampeke byinshi kugira ngo hirindwe ibibazo by'urwungano ngogozi.",
    fr: "Pâturage de bonne qualité, foin et suppléments. Évitez de suralimenter en céréales pour prévenir les problèmes digestifs.",
  },
  chicken: {
    en: "Commercial feed appropriate for age and purpose (layers/broilers), fresh water, grit, and oyster shell for layers.",
    rw: "Tanga ibiryo by'inganda bikwiranye n'ikigero cy'imyaka n'intego (izumva amagi cyangwa izahingurwa), amazi meza, n'amabuye mato, n'amagufwa y'inkongoro ku nkoko zumva amagi.",
    fr: "Aliments commerciaux adaptés à l'âge et à l'usage (pondeuses/poulets de chair), eau fraîche, gravier et coquilles d'huîtres pour les pondeuses.",
  },
  pig: {
    en: "Balanced commercial diet with adequate protein, energy, vitamins, and minerals. Clean water always available.",
    rw: "Tanga indyo y'inganda yuzuye ifite poroteyine, imbaraga, vitamini, n'imyunyu ngugu bihagije. Amazi meza agomba kuboneka igihe cyose.",
    fr: "Alimentation commerciale équilibrée avec suffisamment de protéines, d'énergie, de vitamines et de minéraux. Eau propre toujours disponible.",
  },
  rabbit: {
    en: "Unlimited hay, fresh vegetables, limited pellets, and fresh water. Avoid sudden diet changes.",
    rw: "Tanga ubwatsi ntangarugero, imboga nshya, udufunguzo dukeya, n'amazi meza. Wirinde guhindura indyo mu buryo butunguranye.",
    fr: "Foin à volonté, légumes frais, granulés limités et eau fraîche. Évitez les changements brusques de régime alimentaire.",
  },
};

const nutritionFallback: LangMap = {
  en: "Consult with a veterinarian for species-specific nutrition advice.",
  rw: "Sabana n'umuganga w'amatungo kugira ngo ubone inama zihariye ku ndyo y'ubwoko bw'itungo ryawe.",
  fr: "Consultez un vétérinaire pour des conseils nutritionnels spécifiques à l'espèce.",
};

const housingByType: Record<string, LangMap> = {
  cow: {
    en: "Clean, dry, well-ventilated housing with adequate space (minimum 3.5 sqm per cow). Provide comfortable bedding.",
    rw: "Tanga icyumba gisukuye, cyumye, gifite umwuka mwiza n'ubuso buhagije (byibura metero kare 3.5 kuri buri nka). Tanga aho kuryama heza.",
    fr: "Logement propre, sec et bien ventilé avec un espace adéquat (minimum 3,5 m² par vache). Prévoyez une litière confortable.",
  },
  goat: {
    en: "Well-ventilated shelter with dry bedding. Protect from extreme weather and predators. Minimum 1.5 sqm per goat.",
    rw: "Tanga aho kuba hafite umwuka mwiza n'ubwatsi bwumye bwo kuryamaho. Rinda ihene ku bihe bikabije by'ikirere no ku nyamaswa zizirikana. Byibura metero kare 1.5 kuri buri hene.",
    fr: "Abri bien ventilé avec litière sèche. Protégez des conditions météorologiques extrêmes et des prédateurs. Minimum 1,5 m² par chèvre.",
  },
  sheep: {
    en: "Draft-free, dry housing with good ventilation. Clean bedding and adequate space (1.4 sqm per sheep).",
    rw: "Tanga icyumba kidafite umuyaga ukabije, cyumye, gifite umwuka mwiza. Ubwatsi busukuye bwo kuryamaho n'ubuso buhagije (metero kare 1.4 kuri buri ntama).",
    fr: "Logement sec, sans courants d'air, bien ventilé. Litière propre et espace adéquat (1,4 m² par mouton).",
  },
  chicken: {
    en: "Secure coop with nesting boxes, perches, and run. Provide 0.37 sqm per bird inside coop, 0.93 sqm in run.",
    rw: "Tanga akazu gafunzwe neza gafite aho gutera amagi, aho guhagarara, n'ahantu ho kwidagadura. Tanga metero kare 0.37 kuri buri nkoko mu kazu, na metero kare 0.93 ahantu ho kwidagadura.",
    fr: "Poulailler sécurisé avec nichoirs, perchoirs et enclos. Prévoyez 0,37 m² par oiseau à l'intérieur du poulailler et 0,93 m² dans l'enclos.",
  },
  pig: {
    en: "Clean, dry pen with proper drainage. Temperature control important. Minimum 0.6 sqm per pig for growing animals.",
    rw: "Tanga icyumba gisukuye, cyumye gifite uburyo bwo gukuramo amazi. Kugenzura ubushyuhe ni ngombwa. Byibura metero kare 0.6 kuri buri ngurube ikura.",
    fr: "Enclos propre et sec avec un bon drainage. Le contrôle de la température est important. Minimum 0,6 m² par porc en croissance.",
  },
  rabbit: {
    en: "Weather-protected hutch with solid floor, adequate ventilation, and protection from predators. Minimum 0.56 sqm per rabbit.",
    rw: "Tanga akazu karinzwe ku kirere gifite hasi ikomeye, umwuka mwiza, no kurindwa inyamaswa zizirikana. Byibura metero kare 0.56 kuri buri urukwavu.",
    fr: "Clapier protégé des intempéries avec sol solide, ventilation adéquate et protection contre les prédateurs. Minimum 0,56 m² par lapin.",
  },
};

const housingFallback: LangMap = {
  en: "Provide clean, dry, predator-proof shelter appropriate for the species.",
  rw: "Tanga aho kuba hasukuye, humye, harinzwe inyamaswa zizirikana, hakwiranye n'ubwoko bw'itungo ryawe.",
  fr: "Fournissez un abri propre, sec et protégé des prédateurs, adapté à l'espèce.",
};

const breedingByType: Record<string, LangMap> = {
  cow: {
    en: "Breed heifers at 15-18 months or when they reach 60% of mature weight. Observe for signs of heat every 21 days.",
    rw: "Tera inka nto ku myaka 15-18 cyangwa igihe zigeze kuri 60% by'uburemere bwuzuye. Genzura ibimenyetso by'igihembwe buri minsi 21.",
    fr: "Faites reproduire les génisses à 15-18 mois ou lorsqu'elles atteignent 60% du poids adulte. Observez les signes de chaleur tous les 21 jours.",
  },
  goat: {
    en: "Does can breed at 7-10 months. Estrus cycle is 17-25 days. Buck-to-do ratio should be 1:25-30.",
    rw: "Ihene z'igitsina gore zishobora gutera ku mezi 7-10. Igihembwe kibaho buri minsi 17-25. Umugabo umwe akwiye kuba afite ihene 25-30 z'igitsina gore.",
    fr: "Les chèvres femelles peuvent se reproduire à 7-10 mois. Le cycle œstral est de 17-25 jours. Le ratio bouc/chèvres devrait être de 1:25-30.",
  },
  sheep: {
    en: "Ewes bred at 7-8 months or 45kg weight. Estrus cycle 14-19 days. Ram-to-ewe ratio 1:25-50 for mature rams.",
    rw: "Intama z'igitsina gore zitera ku mezi 7-8 cyangwa igihe zigeze kuri kg 45. Igihembwe kibaho buri minsi 14-19. Impfizi imwe ikwiye kuba ifite intama 25-50 z'igitsina gore.",
    fr: "Les brebis se reproduisent à 7-8 mois ou 45 kg. Cycle œstral de 14-19 jours. Ratio bélier/brebis de 1:25-50 pour les béliers matures.",
  },
  chicken: {
    en: "Roosters mature at 4-5 months. Hens start laying at 5-6 months. Provide nesting boxes and collect eggs daily.",
    rw: "Amagana agera mu bukure ku mezi 4-5. Inkoko zitangira kubyara amagi ku mezi 5-6. Tanga aho gutera amagi kandi ukusanye amagi buri munsi.",
    fr: "Les coqs atteignent la maturité à 4-5 mois. Les poules commencent à pondre à 5-6 mois. Prévoyez des nichoirs et ramassez les œufs quotidiennement.",
  },
  pig: {
    en: "Gilts bred at 7-8 months or 100-120kg. Estrus cycle 21 days. Boar-to-sow ratio 1:10-20 for natural mating.",
    rw: "Ingurube nto zitera ku mezi 7-8 cyangwa igihe zigeze kuri kg 100-120. Igihembwe kibaho buri minsi 21. Ingurube y'igitsina gabo imwe ikwiye kuba ifite ingurube 10-20 z'igitsina gore mu gutera busanzwe.",
    fr: "Les cochettes se reproduisent à 7-8 mois ou 100-120 kg. Cycle œstral de 21 jours. Ratio verrat/truies de 1:10-20 pour la monte naturelle.",
  },
  rabbit: {
    en: "Does bred at 5-6 months. Estrus cycle every 4 days. Buck-to-do ratio 1:10 for optimal breeding.",
    rw: "Uduhinja tw'igitsina gore dutera ku mezi 5-6. Igihembwe kibaho buri minsi 4. Agahinja k'igitsina gabo kamwe kagomba kuba gafite uduhinja 10 tw'igitsina gore kugira ngo gutera bigende neza.",
    fr: "Les lapines se reproduisent à 5-6 mois. Cycle œstral tous les 4 jours. Ratio mâle/femelles de 1:10 pour une reproduction optimale.",
  },
};

const breedingFallback: LangMap = {
  en: "Consult with a veterinarian or extension officer for breeding guidance.",
  rw: "Sabana n'umuganga w'amatungo cyangwa umujyanama w'ubuhinzi kugira ngo ubone inama ku bijyanye no gutera itungo ryawe.",
  fr: "Consultez un vétérinaire ou un agent de vulgarisation pour des conseils sur la reproduction.",
};

const healthByStatus: Record<string, LangMap> = {
  healthy: {
    en: "Maintain regular check-ups, vaccinations, and parasite control. Monitor for any changes in behavior or appetite.",
    rw: "Komeza gusuzumisha itungo ryawe kenshi, gutanga ingaba, no kurwanya udukoko dutera indwara. Genzura impinduka mu myitwarire cyangwa mu kwifuza kurya.",
    fr: "Maintenez des contrôles réguliers, des vaccinations et un contrôle des parasites. Surveillez tout changement de comportement ou d'appétit.",
  },
  sick: {
    en: "Isolate the animal, contact veterinarian immediately, and provide supportive care as advised.",
    rw: "Tandukanya itungo n'andi, hamagara umuganga w'amatungo byihuse, kandi utange ubuvuzi nk'uko wagenwe.",
    fr: "Isolez l'animal, contactez immédiatement un vétérinaire et fournissez les soins de soutien recommandés.",
  },
  recovering: {
    en: "Follow veterinary instructions closely, provide easy access to food/water, and monitor progress regularly.",
    rw: "Kurikiza neza amabwiriza y'umuganga w'amatungo, tanga ibiryo n'amazi byoroshye kubona, kandi ugenzure iterambere ry'ubuzima kenshi.",
    fr: "Suivez attentivement les instructions vétérinaires, facilitez l'accès à la nourriture/l'eau et surveillez régulièrement les progrès.",
  },
  pregnant: {
    en: "Increase nutrition gradually, provide clean dry housing, and prepare for birthing process.",
    rw: "Ongera intungamubiri buhoro buhoro, tanga aho kuba hasukuye kandi humye, kandi witegure igihe cyo kubyara.",
    fr: "Augmentez progressivement la nutrition, offrez un logement propre et sec, et préparez-vous au processus de mise bas.",
  },
  lactating: {
    en: "High-quality nutrition and plenty of water. Monitor for mastitis and ensure proper milk let-down.",
    rw: "Tanga intungamubiri nziza n'amazi ahagije. Genzura indwara ya mastite kandi wemeze ko amata asohoka neza.",
    fr: "Nutrition de haute qualité et beaucoup d'eau. Surveillez la mammite et assurez une bonne descente de lait.",
  },
};

const healthFallback: LangMap = {
  en: "Consult with a veterinarian for health-specific guidance.",
  rw: "Sabana n'umuganga w'amatungo kugira ngo ubone inama zihariye ku buzima bw'itungo ryawe.",
  fr: "Consultez un vétérinaire pour des conseils spécifiques sur la santé.",
};

export function getNutritionGuidance(animalType: string, lang: GuidanceLang): string {
  return nutritionByType[animalType.toLowerCase()]?.[lang] ?? nutritionFallback[lang];
}

export function getHousingGuidance(animalType: string, lang: GuidanceLang): string {
  return housingByType[animalType.toLowerCase()]?.[lang] ?? housingFallback[lang];
}

export function getBreedingGuidance(animalType: string, lang: GuidanceLang): string {
  return breedingByType[animalType.toLowerCase()]?.[lang] ?? breedingFallback[lang];
}

export function getHealthGuidance(healthStatus: string, lang: GuidanceLang): string {
  return healthByStatus[healthStatus.toLowerCase()]?.[lang] ?? healthFallback[lang];
}

const recommendationText = {
  cowUnderweight: {
    en: "Consider supplemental feeding to reach optimal weight for breeding age",
    rw: "Tekereza kongera ibiryo kugira ngo inka igere ku buremere bukwiye bwo gutera",
    fr: "Envisagez une alimentation supplémentaire pour atteindre le poids optimal pour la reproduction",
  },
  goatUnderweight: {
    en: "Monitor growth and consider creep feeding if young animal",
    rw: "Kurikirana iterambere kandi utekereze kuyiha ibiryo byihariye niba ari akana",
    fr: "Surveillez la croissance et envisagez une alimentation complémentaire si l'animal est jeune",
  },
  consultVet: {
    en: "Consult veterinarian for health assessment and treatment plan",
    rw: "Sabana n'umuganga w'amatungo kugira ngo asuzume ubuzima bw'itungo maze agene gahunda yo kuvura",
    fr: "Consultez un vétérinaire pour une évaluation de la santé et un plan de traitement",
  },
  vaccinationMayBeDue: {
    en: "Vaccination may be due - consult with veterinarian",
    rw: "Ingaba zishobora kuba zikeneye gutangwa - sabana n'umuganga w'amatungo",
    fr: "La vaccination pourrait être due - consultez un vétérinaire",
  },
  vaccinationOverdue: {
    en: "Vaccination is overdue - schedule with veterinarian immediately",
    rw: "Igihe cyo gutera ingaba cyarengeje - hamagara umuganga w'amatungo byihuse",
    fr: "La vaccination est en retard - planifiez immédiatement avec un vétérinaire",
  },
  vaccinationDueInDays: {
    en: "Vaccination due in {days} days - plan accordingly",
    rw: "Ingaba zigomba gutangwa mu minsi {days} - tegura uko bikwiye",
    fr: "Vaccination prévue dans {days} jours - planifiez en conséquence",
  },
  defaultHealth: {
    en: "Maintain regular health checks and vaccinations",
    rw: "Komeza gusuzumisha ubuzima kenshi no gutanga ingaba",
    fr: "Maintenez des contrôles de santé réguliers et les vaccinations",
  },
  defaultNutrition: {
    en: "Provide clean water and appropriate nutrition daily",
    rw: "Tanga amazi meza n'intungamubiri zikwiye buri munsi",
    fr: "Fournissez de l'eau propre et une nutrition appropriée quotidiennement",
  },
  defaultMonitor: {
    en: "Monitor for changes in behavior, appetite, or appearance",
    rw: "Genzura impinduka mu myitwarire, mu kwifuza kurya, cyangwa mu isura ry'itungo",
    fr: "Surveillez les changements de comportement, d'appétit ou d'apparence",
  },
} satisfies Record<string, LangMap>;

type RecommendationKey = keyof typeof recommendationText;

function tRecommendation(
  key: RecommendationKey,
  lang: GuidanceLang,
  params?: { days?: number },
): string {
  const template = recommendationText[key][lang];
  if (params?.days === undefined) return template;
  return template.replace("{days}", String(params.days));
}

export function getAnimalSpecificRecommendations(
  animal: {
    animalType: string;
    weightKg?: unknown;
    healthStatus: string;
    lastVaccinationDate?: Date | string | null;
    nextVaccinationDue?: Date | string | null;
  },
  lang: GuidanceLang,
): string[] {
  const recommendations: string[] = [];

  if (animal.weightKg) {
    const weight = Number(animal.weightKg);
    if (animal.animalType.toLowerCase() === "cow" && weight < 250) {
      recommendations.push(tRecommendation("cowUnderweight", lang));
    }
    if (animal.animalType.toLowerCase() === "goat" && weight < 20) {
      recommendations.push(tRecommendation("goatUnderweight", lang));
    }
  }

  if (animal.healthStatus !== "healthy") {
    recommendations.push(tRecommendation("consultVet", lang));
  }

  const today = new Date();
  if (animal.lastVaccinationDate) {
    const lastVacc = new Date(animal.lastVaccinationDate);
    const monthsSince = (today.getTime() - lastVacc.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSince > 6) {
      recommendations.push(tRecommendation("vaccinationMayBeDue", lang));
    }
  }

  if (animal.nextVaccinationDue) {
    const nextVacc = new Date(animal.nextVaccinationDue);
    if (nextVacc <= today) {
      recommendations.push(tRecommendation("vaccinationOverdue", lang));
    } else {
      const daysUntil = (nextVacc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntil <= 7) {
        recommendations.push(
          tRecommendation("vaccinationDueInDays", lang, { days: Math.ceil(daysUntil) }),
        );
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(tRecommendation("defaultHealth", lang));
    recommendations.push(tRecommendation("defaultNutrition", lang));
    recommendations.push(tRecommendation("defaultMonitor", lang));
  }

  return recommendations;
}
