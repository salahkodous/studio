export interface Asset {
  ticker: string
  name: string
  name_ar: string
  price: number
  change: string
  changePercent: string
  trend: 'up' | 'down' | 'stable'
  currency: 'SAR' | 'QAR' | 'AED' | 'USD'
  category: 'Stocks' | 'Gold' | 'Oil' | 'Bonds' | 'Savings Certificates' | 'Other'
  country: 'SA' | 'QA' | 'AE' | 'Global'
  annualYield?: number
}

export interface RealEstateCity {
    cityKey: string;
    name: string;
    name_ar: string;
    country: 'SA' | 'AE' | 'QA';
    pricePerSqM: number;
    currency: 'SAR' | 'AED' | 'QAR';
}

export const realEstateData: RealEstateCity[] = [
    { cityKey: 'RIYADH', name: 'Riyadh', name_ar: 'الرياض', country: 'SA', pricePerSqM: 4500, currency: 'SAR'},
    { cityKey: 'JEDDAH', name: 'Jeddah', name_ar: 'جدة', country: 'SA', pricePerSqM: 3800, currency: 'SAR'},
    { cityKey: 'DUBAI', name: 'Dubai', name_ar: 'دبي', country: 'AE', pricePerSqM: 12000, currency: 'AED'},
    { cityKey: 'ABUDHABI', name: 'Abu Dhabi', name_ar: 'أبو ظبي', country: 'AE', pricePerSqM: 10500, currency: 'AED'},
    { cityKey: 'DOHA', name: 'Doha', name_ar: 'الدوحة', country: 'QA', pricePerSqM: 15000, currency: 'QAR'},
];

const getCountryCode = (market: string): 'SA' | 'AE' | 'QA' => {
  switch (market) {
    case 'Saudi Arabia':
      return 'SA';
    case 'UAE':
      return 'AE';
    case 'Qatar':
      return 'QA';
    default:
      return 'SA';
  }
}

const getCurrency = (country: 'SA' | 'AE' | 'QA'): 'SAR' | 'AED' | 'QAR' => {
    switch (country) {
        case 'SA': return 'SAR';
        case 'AE': return 'AED';
        case 'QA': return 'QAR';
        default: return 'SAR';
    }
}

// Raw data from user CSV
const rawAssets = [
  { Symbol: '2222', 'English Name': 'Saudi Arabian Oil Company', 'Arabic Name': 'شركة الزيت العربية السعودية (أرامكو)', Market: 'Saudi Arabia' },
  { Symbol: '1120', 'English Name': 'Al Rajhi Banking and Investment Corporation', 'Arabic Name': 'مصرف الراجحي', Market: 'Saudi Arabia' },
  { Symbol: '1180', 'English Name': 'The Saudi National Bank', 'Arabic Name': 'البنك الأهلي السعودي (SNB)', Market: 'Saudi Arabia' },
  { Symbol: '1211', 'English Name': 'Saudi Arabian Mining Company (Ma\'aden)', 'Arabic Name': 'شركة التعدين العربية السعودية (معادن)', Market: 'Saudi Arabia' },
  { Symbol: '7010', 'English Name': 'Saudi Telecom Company', 'Arabic Name': 'شركة الاتصالات السعودية (STC)', Market: 'Saudi Arabia' },
  { Symbol: '2082', 'English Name': 'ACWA Power Company', 'Arabic Name': 'شركة أكوا باور', Market: 'Saudi Arabia' },
  { Symbol: '2010', 'English Name': 'Saudi Basic Industries Corporation', 'Arabic Name': 'الشركة السعودية للصناعات الأساسية (سابك)', Market: 'Saudi Arabia' },
  { Symbol: '4013', 'English Name': 'Dr. Sulaiman Al Habib Medical Services Group Company', 'Arabic Name': 'الدكتور سليمان الحبيب للخدمات الطبية', Market: 'Saudi Arabia' },
  { Symbol: '1010', 'English Name': 'Riyad Bank', 'Arabic Name': 'بنك الرياض', Market: 'Saudi Arabia' },
  { Symbol: '7203', 'English Name': 'Elm Company', 'Arabic Name': 'علم', Market: 'Saudi Arabia' },
  { Symbol: '1060', 'English Name': 'Saudi Kayan Petrochemical Company', 'Arabic Name': 'كيان السعودية للبتروكيماويات', Market: 'Saudi Arabia' },
  { Symbol: '1150', 'English Name': 'Saudi Awwal Bank', 'Arabic Name': 'البنك السعودي الأول', Market: 'Saudi Arabia' },
  { Symbol: '5110', 'English Name': 'Saudi Electricity Company', 'Arabic Name': 'الشركة السعودية للكهرباء', Market: 'Saudi Arabia' },
  { Symbol: '2020', 'English Name': 'Yanbu National Petrochemical Company (Yansab)', 'Arabic Name': 'ينبع الوطنية للبتروكيماويات (ينساب)', Market: 'Saudi Arabia' },
  { Symbol: '2280', 'English Name': 'Saudi Arabian Fertilizer Company (SAFCO)', 'Arabic Name': 'الشركة السعودية للأسمدة (سافكو)', Market: 'Saudi Arabia' },
  { Symbol: '7020', 'English Name': 'Mobily', 'Arabic Name': 'اتحاد اتصالات (موبايلي)', Market: 'Saudi Arabia' },
  { Symbol: '1050', 'English Name': 'Banque Saudi Fransi', 'Arabic Name': 'البنك السعودي الفرنسي', Market: 'Saudi Arabia' },
  { Symbol: '1080', 'English Name': 'Arab National Bank', 'Arabic Name': 'البنك العربي الوطني', Market: 'Saudi Arabia' },
  { Symbol: '1140', 'English Name': 'Bank Aljazira', 'Arabic Name': 'بنك الجزيرة', Market: 'Saudi Arabia' },
  { Symbol: '4325', 'English Name': 'Alinma Bank', 'Arabic Name': 'مصرف الإنماء', Market: 'Saudi Arabia' },
  { Symbol: '4280', 'English Name': 'Saudi Arabian Refineries Company', 'Arabic Name': 'شركة المصافي العربية السعودية', Market: 'Saudi Arabia' },
  { Symbol: '7202', 'English Name': 'Solutions by STC', 'Arabic Name': 'حلول إس تي سي', Market: 'Saudi Arabia' },
  { Symbol: '8210', 'English Name': 'Saudi Ceramic Company', 'Arabic Name': 'الخزف السعودي', Market: 'Saudi Arabia' },
  { Symbol: '4250', 'English Name': 'Saudi Industrial Investment Group', 'Arabic Name': 'المجموعة السعودية للاستثمار الصناعي', Market: 'Saudi Arabia' },
  { Symbol: '8010', 'English Name': 'Saudi Arabian Airlines Catering Company', 'Arabic Name': 'شركة الخطوط السعودية للتموين', Market: 'Saudi Arabia' },
  { Symbol: '4030', 'English Name': 'Saudi Arabian Glass Company', 'Arabic Name': 'الشركة السعودية للزجاج', Market: 'Saudi Arabia' },
  { Symbol: '4300', 'English Name': 'Saudi Paper Manufacturing Company', 'Arabic Name': 'الشركة السعودية لصناعة الورق', Market: 'Saudi Arabia' },
  { Symbol: '1111', 'English Name': 'Saudi British Bank (SABB)', 'Arabic Name': 'البنك السعودي البريطاني (ساب)', Market: 'Saudi Arabia' },
  { Symbol: '4142', 'English Name': 'Saudi Industrial Development Company (SIDC)', 'Arabic Name': 'الشركة السعودية للتنمية الصناعية (سيدكو)', Market: 'Saudi Arabia' },
  { Symbol: '6015', 'English Name': 'Saudi Research and Marketing Group', 'Arabic Name': 'المجموعة السعودية للأبحاث والتسويق', Market: 'Saudi Arabia' },
  { Symbol: '4100', 'English Name': 'Saudi Chemical Company', 'Arabic Name': 'الشركة السعودية للكيماويات', Market: 'Saudi Arabia' },
  { Symbol: '1030', 'English Name': 'Bank Albilad', 'Arabic Name': 'بنك البلاد', Market: 'Saudi Arabia' },
  { Symbol: '2223', 'English Name': 'Saudi Aramco Base Oil Company (Luberef)', 'Arabic Name': 'شركة أرامكو السعودية لزيوت الأساس (لوبريف)', Market: 'Saudi Arabia' },
  { Symbol: '2290', 'English Name': 'Saudi International Petrochemical Company (Sipchem)', 'Arabic Name': 'سبكيم العالمية للبتروكيماويات (سبكيم)', Market: 'Saudi Arabia' },
  { Symbol: '4164', 'English Name': 'Saudi Arabian Amiantit Company', 'Arabic Name': 'أميانتيت العربية السعودية', Market: 'Saudi Arabia' },
  { Symbol: '1020', 'English Name': 'Alinma Tokio Marine Company', 'Arabic Name': 'الإنماء طوكيو مارين', Market: 'Saudi Arabia' },
  { Symbol: '4002', 'English Name': 'Saudi Basic Industries Corporation (SABIC) Agri-Nutrients', 'Arabic Name': 'سابك للمغذيات الزراعية', Market: 'Saudi Arabia' },
  { Symbol: '4210', 'English Name': 'Saudi Arabian Packaging Industry Company (SAPIN)', 'Arabic Name': 'الشركة السعودية لصناعة التعبئة والتغليف (سابين)', Market: 'Saudi Arabia' },
  { Symbol: '4190', 'English Name': 'Saudi Arabian Fertilizers Marketing Company (MA\'ADEN)', 'Arabic Name': 'الشركة السعودية لتسويق الأسمدة (معادن)', Market: 'Saudi Arabia' },
  { Symbol: '4263', 'English Name': 'Saudi Arabian Cooperative Insurance Company (SAICO)', 'Arabic Name': 'الشركة السعودية للتأمين التعاوني (سايكو)', Market: 'Saudi Arabia' },
  { Symbol: '2382', 'English Name': 'Ades Holding Company', 'Arabic Name': 'أديس القابضة', Market: 'Saudi Arabia' },
  { Symbol: '2310', 'English Name': 'Saudi Arabian Mining Company (Ma\'aden)', 'Arabic Name': 'شركة التعدين العربية السعودية (معادن)', Market: 'Saudi Arabia' },
  { Symbol: '2380', 'English Name': 'Rabigh Refining and Petrochemical Company (Petro Rabigh)', 'Arabic Name': 'رابغ للتكرير والبتروكيماويات (بترو رابغ)', Market: 'Saudi Arabia' },
  { Symbol: '2083', 'English Name': 'Arabian Drilling Company', 'Arabic Name': 'الحفر العربية', Market: 'Saudi Arabia' },
  { Symbol: '6004', 'English Name': 'Jarir Marketing Company', 'Arabic Name': 'جرير للتسويق', Market: 'Saudi Arabia' },
  { Symbol: '2330', 'English Name': 'Advanced Petrochemical Company', 'Arabic Name': 'الشركة المتقدمة للبتروكيماويات', Market: 'Saudi Arabia' },
  { Symbol: '3020', 'English Name': 'Arabian Cement Company', 'Arabic Name': 'الأسمنت العربية', Market: 'Saudi Arabia' },
  { Symbol: '4001', 'English Name': 'Abdullah Al Othaim Markets Company', 'Arabic Name': 'أسواق عبدالله العثيم', Market: 'Saudi Arabia' },
  { Symbol: '4084', 'English Name': 'Fawaz Abdulaziz Alhokair Co.', 'Arabic Name': 'فواز عبدالعزيز الحكير', Market: 'Saudi Arabia' },
  { Symbol: '4007', 'English Name': 'Al Hammadi Company for Development and Investment', 'Arabic Name': 'الحمادي القابضة', Market: 'Saudi Arabia' },
  { Symbol: '2080', 'English Name': 'Middle East Paper Co. (MEPCO)', 'Arabic Name': 'الشرق الأوسط للورق (مبكو)', Market: 'Saudi Arabia' },
  { Symbol: '4162', 'English Name': 'Malath Cooperative Insurance Co.', 'Arabic Name': 'ملاذ للتأمين التعاوني', Market: 'Saudi Arabia' },
  { Symbol: '2084', 'English Name': 'United Electronics Company (eXtra)', 'Arabic Name': 'إكسترا', Market: 'Saudi Arabia' },
  { Symbol: '1321', 'English Name': 'National Gas and Industrialization Co. (GASCO)', 'Arabic Name': 'الغاز والتصنيع الأهلية (غازكو)', Market: 'Saudi Arabia' },
  { Symbol: '2190', 'English Name': 'National Industrialization Company (Tasnee)', 'Arabic Name': 'التصنيع الوطنية (التصنيع)', Market: 'Saudi Arabia' },
  { Symbol: '4261', 'English Name': 'National Medical Care Co.', 'Arabic Name': 'رعاية الوطنية للخدمات الطبية', Market: 'Saudi Arabia' },
  { Symbol: '2240', 'English Name': 'The National Shipping Company of Saudi Arabia (Bahri)', 'Arabic Name': 'الشركة الوطنية السعودية للنقل البحري (البحري)', Market: 'Saudi Arabia' },
  { Symbol: '3091', 'English Name': 'Al Jouf Cement Company', 'Arabic Name': 'أسمنت الجوف', Market: 'Saudi Arabia' },
  { Symbol: '4292', 'English Name': 'Red Sea International Company', 'Arabic Name': 'البحر الأحمر العالمية', Market: 'Saudi Arabia' },
  { Symbol: '2170', 'English Name': 'SABIC Agri-Nutrients Company', 'Arabic Name': 'سابك للمغذيات الزراعية', Market: 'Saudi Arabia' },
  { Symbol: '1202', 'English Name': 'Salama Cooperative Insurance Co.', 'Arabic Name': 'سلامة للتأمين التعاوني', Market: 'Saudi Arabia' },
  { Symbol: '1304', 'English Name': 'United Wire Factories Company', 'Arabic Name': 'الشركة المتحدة لصناعة الأسلاك', Market: 'Saudi Arabia' },
  { Symbol: '1214', 'English Name': 'Hassan Ghazi Ibrahim Shaker Co.', 'Arabic Name': 'الحسن غازي إبراهيم شاكر', Market: 'Saudi Arabia' },
  { Symbol: '4191', 'English Name': 'Abdullah Saad Mohammed Abo Moati for Bookstores Co.', 'Arabic Name': 'عبدالله سعد محمد أبو معطي للمكتبات', Market: 'Saudi Arabia' },
  { Symbol: 'IHC', 'English Name': 'International Holding Company PJSC', 'Arabic Name': 'الشركة العالمية القابضة ش.م.ع', Market: 'UAE' },
  { Symbol: 'TAQA', 'English Name': 'Abu Dhabi National Energy Company PJSC', 'Arabic Name': 'شركة أبوظبي الوطنية للطاقة (طاقة) ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADNOCGAS', 'English Name': 'ADNOC Gas PLC', 'Arabic Name': 'أدنوك للغاز', Market: 'UAE' },
  { Symbol: 'FAB', 'English Name': 'First Abu Dhabi Bank P.J.S.C.', 'Arabic Name': 'بنك أبوظبي الأول ش.م.ع', Market: 'UAE' },
  { Symbol: 'EAND', 'English Name': 'Emirates Telecommunications Group Company PJSC', 'Arabic Name': 'إي آند', Market: 'UAE' },
  { Symbol: 'ALPHADHABI', 'English Name': 'Alpha Dhabi Holding PJSC', 'Arabic Name': 'ألفا ظبي القابضة ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADCB', 'English Name': 'Abu Dhabi Commercial Bank PJSC', 'Arabic Name': 'بنك أبوظبي التجاري', Market: 'UAE' },
  { Symbol: 'ADNOCDRILL', 'English Name': 'ADNOC Drilling Company P.J.S.C.', 'Arabic Name': 'أدنوك للحفر', Market: 'UAE' },
  { Symbol: 'ADIB', 'English Name': 'Abu Dhabi Islamic Bank PJSC', 'Arabic Name': 'مصرف أبوظبي الإسلامي', Market: 'UAE' },
  { Symbol: 'BOROUGE', 'English Name': 'Borouge plc', 'Arabic Name': 'بروج بي ال سي', Market: 'UAE' },
  { Symbol: 'ALDAR', 'English Name': 'Aldar Properties PJSC', 'Arabic Name': 'الدار العقارية ش.م.ع', Market: 'UAE' },
  { Symbol: 'MODON', 'English Name': 'Modon Holding PSC', 'Arabic Name': 'مدن العقارية ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADNOCDIST', 'English Name': 'Abu Dhabi National Oil Company for Distribution PJSC', 'Arabic Name': 'أدنوك للتوزيع', Market: 'UAE' },
  { Symbol: 'ADNOCLS', 'English Name': 'ADNOC Logistics & Services plc', 'Arabic Name': 'أدنوك للخدمات اللوجستية', Market: 'UAE' },
  { Symbol: 'PUREHEALTH', 'English Name': 'Pure Health Holding PJSC', 'Arabic Name': 'بيور هيلث القابضة ش.م.ع', Market: 'UAE' },
  { Symbol: 'MULTIPLY', 'English Name': 'Multiply Group PJSC', 'Arabic Name': 'مجموعة ملتيبلاي ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADPORTS', 'English Name': 'Abu Dhabi Ports Company PJSC', 'Arabic Name': 'مجموعة موانئ أبوظبي', Market: 'UAE' },
  { Symbol: 'RAKBANK', 'English Name': 'National Bank of Ras Al-Khaimah (RAKBANK)', 'Arabic Name': 'بنك رأس الخيمة الوطني (راك بنك) ش.م.ع', Market: 'UAE' },
  { Symbol: 'DANA', 'English Name': 'Dana Gas PJSC', 'Arabic Name': 'دانة غاز ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADNH', 'English Name': 'Abu Dhabi National Hotels PJSC', 'Arabic Name': 'فنادق أبوظبي الوطنية', Market: 'UAE' },
  { Symbol: 'AGTHIA', 'English Name': 'Agthia Group PJSC', 'Arabic Name': 'مجموعة أغذية ش.م.ع', Market: 'UAE' },
  { Symbol: 'RAKPROP', 'English Name': 'Ras Al Khaimah Properties PJSC', 'Arabic Name': 'رأس الخيمة العقارية ش.م.ع', Market: 'UAE' },
  { Symbol: 'ADNIC', 'English Name': 'Abu Dhabi National Insurance Company PJSC', 'Arabic Name': 'شركة أبوظبي الوطنية للتأمين', Market: 'UAE' },
  { Symbol: 'EMAAR', 'English Name': 'Emaar Properties PJSC', 'Arabic Name': 'إعمار العقارية', Market: 'UAE' },
  { Symbol: 'GFH', 'English Name': 'GFH Financial Group BSC', 'Arabic Name': 'مجموعة جي إف إتش المالية ش.م.ب', Market: 'UAE' },
  { Symbol: 'NBQ', 'English Name': 'National Bank of Umm Al Qaiwain PSC', 'Arabic Name': 'بنك أم القيوين الوطني ش.م.ع', Market: 'UAE' },
  { Symbol: 'QNBK', 'English Name': 'Qatar National Bank (Q.P.S.C.)', 'Arabic Name': 'بنك قطر الوطني', Market: 'Qatar' },
  { Symbol: 'IQCD', 'English Name': 'Industries Qatar Q.P.S.C.', 'Arabic Name': 'صناعات قطر', Market: 'Qatar' },
  { Symbol: 'QIBK', 'English Name': 'Qatar Islamic Bank (Q.P.S.C.)', 'Arabic Name': 'مصرف قطر الإسلامي', Market: 'Qatar' },
  { Symbol: 'ORDS', 'English Name': 'Ooredoo Q.P.S.C.', 'Arabic Name': 'Ooredoo', Market: 'Qatar' },
  { Symbol: 'ERES', 'English Name': 'Ezdan Holding Group Q.P.S.C.', 'Arabic Name': 'إزدان القابضة', Market: 'Qatar' },
  { Symbol: 'QGTS', 'English Name': 'Qatar Gas Transport Company Limited (Nakilat) (QPSC)', 'Arabic Name': 'شركة قطر لنقل الغاز المحدودة (ناقلات)', Market: 'Qatar' },
  { Symbol: 'MARK', 'English Name': 'Masraf Al Rayan Q.P.S.C.', 'Arabic Name': 'مصرف الريان', Market: 'Qatar' },
  { Symbol: 'DUBK', 'English Name': 'Dukhan Bank Q.P.S.C.', 'Arabic Name': 'بنك دخان', Market: 'Qatar' },
  { Symbol: 'CBQK', 'English Name': 'The Commercial Bank (P.S.Q.C.)', 'Arabic Name': 'البنك التجاري القطري', Market: 'Qatar' },
  { Symbol: 'QEWS', 'English Name': 'Qatar Electricity & Water Company Q.P.S.C.', 'Arabic Name': 'شركة الكهرباء والماء القطرية', Market: 'Qatar' },
  { Symbol: 'MPHC', 'English Name': 'Mesaieed Petrochemical Holding Company Q.P.S.C.', 'Arabic Name': 'مسيعيد للبتروكيماويات القابضة', Market: 'Qatar' },
  { Symbol: 'QIIK', 'English Name': 'Qatar International Islamic Bank (Q.P.S.C)', 'Arabic Name': 'بنك قطر الدولي الإسلامي', Market: 'Qatar' },
  { Symbol: 'QFLS', 'English Name': 'Qatar Fuel Company Q.P.S.C. ("WOQOD")', 'Arabic Name': 'قطر للوقود (وقود)', Market: 'Qatar' },
  { Symbol: 'QNNS', 'English Name': 'Qatar Navigation Q.P.S.C.', 'Arabic Name': 'الملاحة القطرية (ملاحة)', Market: 'Qatar' },
  { Symbol: 'IGRD', 'English Name': 'Estithmar Holding Q.P.S.C.', 'Arabic Name': 'استثمار القابضة', Market: 'Qatar' },
  { Symbol: 'BRES', 'English Name': 'Barwa Real Estate Company Q.P.S.C.', 'Arabic Name': 'شركة بروة العقارية', Market: 'Qatar' },
  { Symbol: 'VFQS', 'English Name': 'Vodafone Qatar P.Q.S.C.', 'Arabic Name': 'فودافون قطر', Market: 'Qatar' },
  { Symbol: 'ABQK', 'English Name': 'Ahli Bank Q.P.S.C.', 'Arabic Name': 'البنك الأهلي', Market: 'Qatar' },
  { Symbol: 'DHBK', 'English Name': 'Doha Bank Q.P.S.C.', 'Arabic Name': 'بنك الدوحة', Market: 'Qatar' },
  { Symbol: 'QAMC', 'English Name': 'Qatar Aluminium Manufacturing Company Q.P.S.C.', 'Arabic Name': 'شركة قطر لصناعة الألومنيوم (قامكو)', Market: 'Qatar' },
  { Symbol: 'QATI', 'English Name': 'Qatar Insurance Company Q.S.P.C.', 'Arabic Name': 'شركة قطر للتأمين', Market: 'Qatar' },
  { Symbol: 'GISS', 'English Name': 'Gulf International Services Q.P.S.C.', 'Arabic Name': 'الخليج الدولية للخدمات', Market: 'Qatar' },
  { Symbol: 'AHCS', 'English Name': 'Aamal Company Q.P.S.C.', 'Arabic Name': 'أعمال', Market: 'Qatar' },
  { Symbol: 'ZHCD', 'English Name': 'Zad Holding Company Q.P.S.C.', 'Arabic Name': 'زاد القابضة', Market: 'Qatar' },
  { Symbol: 'UDCD', 'English Name': 'United Development Company Q.P.S.C.', 'Arabic Name': 'الشركة المتحدة للتنمية', Market: 'Qatar' },
  { Symbol: 'MERS', 'English Name': 'Al Meera Consumer Goods Company Q.P.S.C.', 'Arabic Name': 'شركة الميرة للمواد الاستهلاكية', Market: 'Qatar' },
  { Symbol: 'MCCS', 'English Name': 'Mannai Corporation Q.P.S.C.', 'Arabic Name': 'مجموعة المناعي', Market: 'Qatar' },
  { Symbol: 'BLDN', 'English Name': 'Baladna Q.P.S.C.', 'Arabic Name': 'بلدنا', Market: 'Qatar' },
  { Symbol: 'QNCD', 'English Name': 'Qatar National Cement Company (Q.P.S.C.)', 'Arabic Name': 'شركة أسمنت قطر الوطنية', Market: 'Qatar' },
  { Symbol: 'QFBQ', 'English Name': 'Lesha Bank LLC', 'Arabic Name': 'بنك لشا (مركز قطر للمال)', Market: 'Qatar' },
  { Symbol: 'MEZA', 'English Name': 'MEEZA QSTP LLC (Public)', 'Arabic Name': 'ميزة', Market: 'Qatar' },
  { Symbol: 'QIGD', 'English Name': 'Qatari Investors Group Q.P.S.C.', 'Arabic Name': 'مجموعة المستثمرين القطريين', Market: 'Qatar' },
  { Symbol: 'GWCS', 'English Name': 'Gulf Warehousing Company Q.P.S.C.', 'Arabic Name': 'شركة الخليج للمخازن', Market: 'Qatar' },
  { Symbol: 'MCGS', 'English Name': 'Medicare Group Q.P.S.C.', 'Arabic Name': 'مجموعة الرعاية الطبية', Market: 'Qatar' },
  { Symbol: 'QISI', 'English Name': 'Qatar Islamic Insurance Group Q.P.S.C.', 'Arabic Name': 'الشركة القطرية للتأمين الإسلامي', Market: 'Qatar' },
  { Symbol: 'DOHI', 'English Name': 'Doha Insurance Group Q.P.S.C.', 'Arabic Name': 'مجموعة الدوحة للتأمين', Market: 'Qatar' },
  { Symbol: 'QIMD', 'English Name': 'Qatar Industrial Manufacturing Company Q.P.S.C.', 'Arabic Name': 'الشركة القطرية للصناعات التحويلية', Market: 'Qatar' },
  { Symbol: 'QGRI', 'English Name': 'Qatar General Insurance & Reinsurance Company Q.P.S.C.', 'Arabic Name': 'الشركة القطرية العامة للتأمين وإعادة التأمين', Market: 'Qatar' },
  { Symbol: 'SIIS', 'English Name': 'Salam International Investment Limited Q.P.S.C.', 'Arabic Name': 'السلام العالمية للاستثمار المحدودة', Market: 'Qatar' },
  { Symbol: 'BEMA', 'English Name': 'Damaan Islamic Insurance Company "Beema" (Q.P.S.C.)', 'Arabic Name': 'شركة ضمان للتأمين الإسلامي (بيمة)', Market: 'Qatar' },
  { Symbol: 'QLMI', 'English Name': 'QLM Life & Medical Insurance Company Q.P.S.C.', 'Arabic Name': 'شركة كيو إل إم لتأمينات الحياة والتأمين الصحي', Market: 'Qatar' },
  { Symbol: 'MRDS', 'English Name': 'Mazaya Real Estate Development Q.P.S.C.', 'Arabic Name': 'مزايا للتطوير العقاري', Market: 'Qatar' },
  { Symbol: 'AKHI', 'English Name': 'Al Khaleej Takaful Insurance Company Q.P.S.C.', 'Arabic Name': 'شركة الخليج للتأمين التكافلي', Market: 'Qatar' },
  { Symbol: 'MHAR', 'English Name': 'Al Mahhar Holding Company Q.P.S.C.', 'Arabic Name': 'المحار القابضة', Market: 'Qatar' },
  { Symbol: 'MKDM', 'English Name': 'Mekdam Holding Group - Q.P.S.C.', 'Arabic Name': 'مجموعة مقدام القابضة', Market: 'Qatar' },
  { Symbol: 'WDAM', 'English Name': 'Widam Food Company Q.P.S.C.', 'Arabic Name': 'ودام الغذائية', Market: 'Qatar' },
  { Symbol: 'NLCS', 'English Name': 'Alijarah Holding (Q.P.S.C.)', 'Arabic Name': 'الإجارة القابضة', Market: 'Qatar' },
  { Symbol: 'TQES', 'English Name': 'Qatar Electronic Systems Company (Techno Q) Q.P.S.C.', 'Arabic Name': 'شركة قطر للأنظمة الإلكترونية (تكنو كيو)', Market: 'Qatar' },
  { Symbol: 'QOIS', 'English Name': 'Qatar Oman Investment Company Q.S.C.', 'Arabic Name': 'شركة قطر وعمان للاستثمار', Market: 'Qatar' },
  { Symbol: 'DBIS', 'English Name': 'Dlala Brokerage and Investment Holding Company Q.P.S.C.', 'Arabic Name': 'دلالة للوساطة والاستثمار القابضة', Market: 'Qatar' },
  { Symbol: 'IHGS', 'English Name': 'INMA Holding Company Q.P.S.C.', 'Arabic Name': 'إنماء القابضة', Market: 'Qatar' },
  { Symbol: 'FALH', 'English Name': 'Al Faleh Educational Holding Company Q.P.S.C.', 'Arabic Name': 'الفالح التعليمية القابضة', Market: 'Qatar' },
  { Symbol: 'QGMD', 'English Name': 'Qatari German Company for Medical Devices (Q.P.S.C.)', 'Arabic Name': 'الشركة القطرية الألمانية للمستلزمات الطبية', Market: 'Qatar' },
  { Symbol: 'QCFS', 'English Name': 'Qatar Cinema and Film Distribution Co. (Q.P.S.C)', 'Arabic Name': 'شركة قطر للسينما وتوزيع الأفلام', Market: 'Qatar' },
];

const uniqueAssets = new Map<string, typeof rawAssets[0]>();
rawAssets.forEach(asset => {
    // Prioritize entries with an Arabic name if duplicates exist
    if (!uniqueAssets.has(asset.Symbol) || (asset['Arabic Name'] && !uniqueAssets.get(asset.Symbol)?.['Arabic Name'])) {
        uniqueAssets.set(asset.Symbol, asset);
    }
});


export const assets: Asset[] = Array.from(uniqueAssets.values()).map(asset => {
    const country = getCountryCode(asset.Market);
    const currency = getCurrency(country);
    return {
        ticker: asset.Symbol,
        name: asset['English Name'],
        name_ar: asset['Arabic Name'] || asset['English Name'], // Fallback to English name if Arabic is missing
        country: country,
        currency: currency,
        price: Math.random() * 200 + 10, // Placeholder static price
        change: `${(Math.random() * 10 - 5).toFixed(2)}`,
        changePercent: `${(Math.random() * 2 - 1).toFixed(2)}%`,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        category: 'Stocks',
    }
}).concat([
  // Gold Assets
  {
    ticker: 'GOLD', name: 'Gold', name_ar: 'الذهب', price: 2330, change: '+1.25', changePercent: '+0.70%', trend: 'up', currency: 'USD', category: 'Gold', country: 'Global',
  },
  // Oil Assets
  {
    ticker: 'BRENT', name: 'Brent Crude Oil', name_ar: 'نفط برنت الخام', price: 85.3, change: '-0.50', changePercent: '-0.58%', trend: 'down', currency: 'USD', category: 'Oil', country: 'Global',
  },
  // Bonds & Savings
  {
    ticker: 'SA-BOND-2030', name: 'Saudi Arabia Govt. Bond 2030', name_ar: 'سندات حكومة السعودية 2030', price: 102.5, change: '+0.05', changePercent: '+0.05%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SUKUK-ISDB', name: 'Islamic Development Bank Sukuk', name_ar: 'صكوك بنك التنمية الإسلامي', price: 100.2, change: '+0.02', changePercent: '+0.02%', trend: 'up', currency: 'USD', category: 'Bonds', country: 'Global',
  },
  {
    ticker: 'SAVINGS-CERT-SAR', name: 'SAR Savings Certificate', name_ar: 'شهادة ادخار بالريال السعودي', price: 1, change: '+0.00', changePercent: '5.00%', trend: 'stable', currency: 'SAR', category: 'Savings Certificates', country: 'Global', annualYield: 0.05,
  },
]);

export const newsArticles: Record<string, string[]> = {
  '2222': [ // ARAMCO
    'https://www.reuters.com/business/energy/saudi-aramco-hikes-july-crude-prices-asia-2023-06-05/',
    'https://www.bloomberg.com/news/articles/2023-06-05/oil-extends-gains-after-saudi-arabia-pledges-deeper-output-cuts',
  ],
  '2010': [ // SABIC (Using the English Name for mapping)
    'https://www.arabianbusiness.com/industries/energy/sabic-launches-new-sustainable-polymers-at-leading-plastics-conference',
    'https://www.argaam.com/en/article/articledetail/id/1654321',
  ],
  'IHC': [
    'https://www.thenationalnews.com/business/markets/2023/10/26/ihc-reports-18-rise-in-q3-net-profit-on-higher-revenue/',
    'https://www.khaleejtimes.com/business/ihc-to-list-subsidiary-on-adx-second-market'
  ],
  'QNBK': [ // QNB
    'https://www.gulf-times.com/article/669821/business/qnb-groups-net-profit-up-8-to-qr11-9bn-in-9m-2023',
    'https://www.zawya.com/en/islamic-economy/islamic-finance/qatar-national-bank-qnb-unit-qnb-finansbank-mandates-banks-for-green-bonds-issuance-x2wv61a9'
  ]
}

export const getStockPriceHistory = (
  ticker: string
): { date: string; price: number }[] => {
  const data = []
  const asset = assets.find((s) => s.ticker === ticker);
  const basePrice = asset?.price || 100;
  const days = 90
  let price = basePrice > 0 ? basePrice : 100; // Use a default if base price is 0
  for (let i = days; i > 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Fluctuation relative to base price to keep it somewhat realistic
    price = price + (Math.random() - 0.49) * (price / 50)
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    })
  }
  return data
}
