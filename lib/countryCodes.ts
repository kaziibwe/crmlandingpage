export interface Country {
  name: string;
  iso: string;
  flag: string; // regional-indicator emoji
  code: string; // dial code with "+"
}

/** Common countries first for quick picking, then the full ITU list. */
const COMMON = ["UG", "KE", "TZ", "RW", "NG", "ZA", "GB", "US", "AE", "IN", "CN", "DE"];

const RAW: Array<[string, string, string]> = [
  ["Afghanistan", "AF", "93"], ["Albania", "AL", "355"], ["Algeria", "DZ", "213"],
  ["Andorra", "AD", "376"], ["Angola", "AO", "244"], ["Argentina", "AR", "54"],
  ["Armenia", "AM", "374"], ["Australia", "AU", "61"], ["Austria", "AT", "43"],
  ["Azerbaijan", "AZ", "994"], ["Bahrain", "BH", "973"], ["Bangladesh", "BD", "880"],
  ["Belarus", "BY", "375"], ["Belgium", "BE", "32"], ["Benin", "BJ", "229"],
  ["Bhutan", "BT", "975"], ["Bolivia", "BO", "591"], ["Bosnia & Herzegovina", "BA", "387"],
  ["Botswana", "BW", "267"], ["Brazil", "BR", "55"], ["Brunei", "BN", "673"],
  ["Bulgaria", "BG", "359"], ["Burkina Faso", "BF", "226"], ["Burundi", "BI", "257"],
  ["Cambodia", "KH", "855"], ["Cameroon", "CM", "237"], ["Canada", "CA", "1"],
  ["Chad", "TD", "235"], ["Chile", "CL", "56"], ["China", "CN", "86"],
  ["Colombia", "CO", "57"], ["Congo (DRC)", "CD", "243"], ["Congo (Republic)", "CG", "242"],
  ["Costa Rica", "CR", "506"], ["Côte d'Ivoire", "CI", "225"], ["Croatia", "HR", "385"],
  ["Cuba", "CU", "53"], ["Cyprus", "CY", "357"], ["Czechia", "CZ", "420"],
  ["Denmark", "DK", "45"], ["Djibouti", "DJ", "253"], ["Ecuador", "EC", "593"],
  ["Egypt", "EG", "20"], ["El Salvador", "SV", "503"], ["Eritrea", "ER", "291"],
  ["Estonia", "EE", "372"], ["Ethiopia", "ET", "251"], ["Fiji", "FJ", "679"],
  ["Finland", "FI", "358"], ["France", "FR", "33"], ["Gabon", "GA", "241"],
  ["Gambia", "GM", "220"], ["Georgia", "GE", "995"], ["Germany", "DE", "49"],
  ["Ghana", "GH", "233"], ["Greece", "GR", "30"], ["Guatemala", "GT", "502"],
  ["Guinea", "GN", "224"], ["Guyana", "GY", "592"], ["Haiti", "HT", "509"],
  ["Honduras", "HN", "504"], ["Hong Kong", "HK", "852"], ["Hungary", "HU", "36"],
  ["Iceland", "IS", "354"], ["India", "IN", "91"], ["Indonesia", "ID", "62"],
  ["Iran", "IR", "98"], ["Iraq", "IQ", "964"], ["Ireland", "IE", "353"],
  ["Israel", "IL", "972"], ["Italy", "IT", "39"], ["Jamaica", "JM", "1"],
  ["Japan", "JP", "81"], ["Jordan", "JO", "962"], ["Kazakhstan", "KZ", "7"],
  ["Kenya", "KE", "254"], ["Kuwait", "KW", "965"], ["Kyrgyzstan", "KG", "996"],
  ["Laos", "LA", "856"], ["Latvia", "LV", "371"], ["Lebanon", "LB", "961"],
  ["Lesotho", "LS", "266"], ["Liberia", "LR", "231"], ["Libya", "LY", "218"],
  ["Liechtenstein", "LI", "423"], ["Lithuania", "LT", "370"], ["Luxembourg", "LU", "352"],
  ["Madagascar", "MG", "261"], ["Malawi", "MW", "265"], ["Malaysia", "MY", "60"],
  ["Maldives", "MV", "960"], ["Mali", "ML", "223"], ["Malta", "MLT", "356"],
  ["Mauritania", "MR", "222"], ["Mauritius", "MU", "230"], ["Mexico", "MX", "52"],
  ["Moldova", "MD", "373"], ["Monaco", "MC", "377"], ["Mongolia", "MN", "976"],
  ["Montenegro", "ME", "382"], ["Morocco", "MA", "212"], ["Mozambique", "MZ", "258"],
  ["Myanmar", "MM", "95"], ["Namibia", "NA", "264"], ["Nepal", "NP", "977"],
  ["Netherlands", "NL", "31"], ["New Zealand", "NZ", "64"], ["Nicaragua", "NI", "505"],
  ["Niger", "NE", "223"], ["Nigeria", "NG", "234"], ["North Macedonia", "MK", "389"],
  ["Norway", "NO", "47"], ["Oman", "OM", "968"], ["Pakistan", "PK", "92"],
  ["Palestine", "PS", "970"], ["Panama", "PA", "507"], ["Paraguay", "PY", "595"],
  ["Peru", "PE", "51"], ["Philippines", "PH", "63"], ["Poland", "PL", "48"],
  ["Portugal", "PT", "351"], ["Qatar", "QA", "974"], ["Romania", "RO", "40"],
  ["Russia", "RU", "7"], ["Rwanda", "RW", "250"], ["Saudi Arabia", "SA", "966"],
  ["Senegal", "SN", "221"], ["Serbia", "RS", "381"], ["Seychelles", "SC", "248"],
  ["Sierra Leone", "SL", "232"], ["Singapore", "SG", "65"], ["Slovakia", "SK", "421"],
  ["Slovenia", "SI", "386"], ["Somalia", "SO", "252"], ["South Africa", "ZA", "27"],
  ["South Korea", "KR", "82"], ["South Sudan", "SS", "211"], ["Spain", "ES", "34"],
  ["Sri Lanka", "LK", "94"], ["Sudan", "SD", "249"], ["Sweden", "SE", "46"],
  ["Switzerland", "CH", "41"], ["Taiwan", "TW", "886"], ["Tajikistan", "TJ", "992"],
  ["Tanzania", "TZ", "255"], ["Thailand", "TH", "66"], ["Togo", "TG", "228"],
  ["Trinidad & Tobago", "TT", "1"], ["Tunisia", "TN", "216"], ["Turkey", "TR", "90"],
  ["Turkmenistan", "TM", "993"], ["Uganda", "UG", "256"], ["Ukraine", "UA", "380"],
  ["United Arab Emirates", "AE", "971"], ["United Kingdom", "GB", "44"],
  ["United States", "US", "1"], ["Uruguay", "UY", "598"], ["Uzbekistan", "UZ", "998"],
  ["Venezuela", "VE", "58"], ["Vietnam", "VN", "84"], ["Yemen", "YE", "967"],
  ["Zambia", "ZM", "260"], ["Zimbabwe", "ZW", "263"],
];

function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

const ALL: Country[] = RAW.map(([name, iso, code]) => ({
  name,
  iso,
  flag: flagEmoji(iso),
  code: `+${code}`,
}));

/** Prioritized list: common countries first, then alphabetical. */
export const COUNTRIES: Country[] = [
  ...COMMON.map((iso) => ALL.find((c) => c.iso === iso)).filter((c): c is Country => !!c),
  ...ALL.filter((c) => !COMMON.includes(c.iso)).sort((a, b) => a.name.localeCompare(b.name)),
];

export const DEFAULT_COUNTRY: Country =
  COUNTRIES.find((c) => c.iso === "UG") ?? COUNTRIES[0];
