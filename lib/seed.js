// SAMPLE DATA — everything here is illustrative (prices, branches, hours,
// reviews, staff, customers, bookings). Edit it from /admin after launch, or
// change this file and run `npm run reset-data`.

import crypto from 'node:crypto';
import { zonedNow, addDays, weekdayOf, toHHMM } from './time';

const L = (ar, en) => ({ ar, en });

const HOURS = {
  0: { open: '09:00', close: '23:00' },
  1: { open: '09:00', close: '23:00' },
  2: { open: '09:00', close: '23:00' },
  3: { open: '09:00', close: '23:00' },
  4: { open: '09:00', close: '23:00' },
  5: { open: '13:00', close: '23:00' },
  6: { open: '09:00', close: '23:00' },
};

const settings = {
  brand: L('موسى للعناية بالسيارات', 'Moses Detailing'),
  tagline: L('تقنية الثلج الجاف', 'Dry Ice Technology'),
  phone: '+20 100 000 0000',
  whatsapp: '+201000000000',
  email: 'hello@mosesdetailing.example',
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/',
  },
  currency: L('ج.م', 'EGP'),
  payment: {
    instapay: 'mosesdetailing@instapay',
    wallet: '010 0000 0000',
    walletName: L('فودافون كاش', 'Vodafone Cash'),
  },
  timezone: 'Africa/Cairo',
  demoNotice: true,
  booking: {
    slotStep: 30,
    leadMinutes: 30,
    maxDaysAhead: 21,
    cancelHours: 3,
    mobileFee: 150,
    quiet: { days: [0, 1, 2, 3], from: '12:00', to: '16:00', percent: 20 },
  },
  reminders: { firstHours: 24, secondHours: 1 },
  loyalty: { pointsPer100: 10, redeemPoints: 500, rewardPackageId: 'basic' },
};

const home = {
  heroTitle: L('نظافة على \u2066−78°\u2069', 'Clean at −78°C'),
  heroSub: L('احجز. استريح. واطلع بعربية بتلمع.', 'Book. Relax. Drive off shining.'),
  heroText: L(
    'تنظيف بالثلج الجاف يرفع الأوساخ والشحوم بدون ماء ولا خدوش. اختر الفرع والموعد، ونجهّز لك المكان قبل وصولك.',
    'Dry-ice detailing lifts dirt and grease without water or scratches. Pick a branch and a time, and your bay is ready when you arrive.'
  ),
  features: [
    { title: L('تقنية الثلج الجاف', 'Dry-ice technology'), text: L('بدون مية ولا خدوش', 'No water, no scratches') },
    { title: L('حجز سريع', 'Fast booking'), text: L('في أقل من دقيقة', 'In under a minute') },
    { title: L('فرعين في الشيخ زايد', 'Two branches in Sheikh Zayed'), text: L('مفتوحين 7 أيام', 'Open 7 days a week') },
  ],
  howTitle: L('كيف يعمل الثلج الجاف', 'How dry ice cleans'),
  howSteps: [
    {
      title: L('حبيبات على \u2066−78°\u2069', 'Pellets at −78°C'),
      text: L('حبيبات ثاني أكسيد الكربون المتجمد تُدفع بالهواء المضغوط على السطح.', 'Frozen CO₂ pellets are blown onto the surface with compressed air.'),
    },
    {
      title: L('صدمة حرارية', 'Thermal shock'),
      text: L('البرودة الشديدة تجعل الأوساخ هشّة فتنفصل عن الطلاء والبلاستيك.', 'The sudden cold makes grime brittle, so it lets go of paint and plastic.'),
    },
    {
      title: L('يتبخّر ولا يترك شيئًا', 'It vanishes'),
      text: L('الثلج يتحوّل إلى غاز فورًا: لا ماء، لا بقايا، لا خدوش.', 'The ice turns straight to gas: no water, no residue, no scratches.'),
    },
  ],
  servicesTitle: L('خدماتنا', 'Our services'),
  pricingTitle: L('اختر الباقة', 'Choose your package'),
  galleryTitle: L('قبل وبعد', 'Before and after'),
  reviewsTitle: L('آراء العملاء', 'What drivers say'),
  locationsTitle: L('فروعنا', 'Our branches'),
  ctaTitle: L('جاهز تشوف عربيتك بتلمع؟', 'Ready to see it shine?'),
  ctaText: L('الحجز ياخد أقل من دقيقة، والدفع إنستاباي أو في الفرع.', 'Booking takes under a minute. Pay with InstaPay or at the center.'),
};

const about = {
  storyTitle: L('قصتنا', 'Our story'),
  story: L(
    'بدأت موسى للعناية بالسيارات بورشة صغيرة وفكرة واحدة: تنظيف أعمق بدون ما نأذي الطلاء. جبنا تقنية الثلج الجاف المستخدمة في المصانع وطبّقناها على العربيات، فبقى ممكن ننظف الموتور والفرش والشاسيه بدون مية تقريبًا.\n\nالنهارده عندنا فرعين في الشيخ زايد بفرق مدرّبة، ونظام حجز يخلّيك تعرف السعر والموعد قبل ما تتحرك من البيت.',
    'Moses Detailing started as a small workshop with one idea: clean deeper without hurting the paint. We took the dry-ice blasting used in factories and brought it to cars, so engines, upholstery and underbodies can be cleaned with almost no water.\n\nToday trained teams work at two branches in Sheikh Zayed, and a booking system tells you the price and the time before you leave home.'
  ),
  ecoTitle: L('الماء والبيئة', 'Water and eco care'),
  eco: L(
    'الثلج الجاف يتبخّر بالكامل، فلا ماء ملوّث يدخل المجاري ولا مواد كيميائية قاسية. في الغسيل الخارجي نستخدم مياه معاد تدويرها ومنتجات قابلة للتحلل.',
    'Dry ice sublimates completely, so no dirty water goes down the drain and no harsh chemicals are needed. For exterior washing we use recycled water and biodegradable products.'
  ),
  guaranteeTitle: L('ضمان اللمعة', 'Shine guarantee'),
  guarantee: L(
    'لو حاجة ماعجبتكش، قول لنا خلال 24 ساعة ونعيد الجزء ده مجانًا.',
    'If something is not right, tell us within 24 hours and we redo that part for free.'
  ),
  careersTitle: L('وظائف', 'Careers'),
  careersText: L('بنكبر وبندوّر على ناس بتحب العربيات وبتهتم بالتفاصيل.', 'We are growing and looking for people who love cars and care about details.'),
};

const vehicleSizes = [
  { id: 'sedan', name: L('سيدان / هاتشباك', 'Sedan / hatchback'), hint: L('مثل كورولا، إلنترا', 'e.g. Corolla, Elantra'), icon: 'sedan' },
  { id: 'suv', name: L('SUV / كروس أوفر', 'SUV / crossover'), hint: L('مثل توسان، X5', 'e.g. Tucson, X5'), icon: 'suv' },
  { id: 'van', name: L('فان / بيك أب', 'Van / pickup'), hint: L('مثل هاي إس، هايلكس', 'e.g. HiAce, Hilux'), icon: 'van' },
  { id: 'bike', name: L('موتوسيكل', 'Motorbike'), hint: L('كل الأحجام', 'Any size'), icon: 'bike' },
];

const services = [
  {
    id: 'exterior',
    art: 'exterior',
    name: L('غسيل خارجي يدوي وتجفيف', 'Exterior hand wash & dry'),
    short: L('شامبو بالرغوة، غسيل يدوي، تجفيف بالمايكروفايبر.', 'Foam shampoo, hand wash, microfibre dry.'),
    description: L(
      'رغوة كثيفة تفكّ الأتربة، غسيل يدوي بقفازات مايكروفايبر، ثم تجفيف بدون بقع. الجنوط والإطارات والزجاج من الخارج ضمن الخدمة.',
      'Thick foam loosens the dust, then a hand wash with microfibre mitts and a spot-free dry. Wheels, tyres and outside glass are included.'
    ),
    includes: [L('رغوة ما قبل الغسيل', 'Pre-wash snow foam'), L('غسيل الجنوط والإطارات', 'Wheels and tyres'), L('زجاج من الخارج', 'Outside glass')],
    bookWith: { packageId: 'basic' },
    active: true,
  },
  {
    id: 'interior',
    art: 'interior',
    name: L('تنظيف داخلي ومسح', 'Interior vacuum & wipe-down'),
    short: L('شفط، تنظيف التابلوه والأبواب، فتحات التكييف.', 'Vacuum, dashboard and doors, air vents.'),
    description: L(
      'شفط كامل للفرش والدواسات، ثم الثلج الجاف على التابلوه والكونسول وفتحات التكييف حيث تتجمع الأتربة، وزجاج من الداخل.',
      'Full vacuum of seats and mats, then dry ice on the dashboard, console and air vents where dust hides, plus inside glass.'
    ),
    includes: [L('شفط كامل', 'Full vacuum'), L('تابلوه وأبواب بالثلج الجاف', 'Dry-ice dashboard and doors'), L('زجاج من الداخل', 'Inside glass')],
    bookWith: { packageId: 'premium' },
    active: true,
  },
  {
    id: 'detailing',
    art: 'detailing',
    name: L('تفصيل كامل من الداخل والخارج', 'Full detailing (inside + out)'),
    short: L('العربية كلها بالثلج الجاف، فرش عميق، تلميع خفيف.', 'Whole car in dry ice, deep seat clean, light polish.'),
    description: L(
      'أعمق خدمة عندنا: الثلج الجاف من الداخل والخارج، تنظيف عميق للفرش والسجاد، الموتور والشاسيه، وتلميع بخطوة واحدة مع واكس.',
      'Our deepest service: dry ice inside and out, deep seat and carpet clean, engine bay and underbody, and a one-step polish with wax.'
    ),
    includes: [L('ثلج جاف داخلي وخارجي', 'Dry ice inside and out'), L('موتور وشاسيه', 'Engine bay and underbody'), L('تلميع وواكس', 'Polish and wax')],
    bookWith: { packageId: 'ultimate' },
    active: true,
  },
  {
    id: 'polish',
    art: 'polish',
    name: L('تلميع، واكس وسيراميك', 'Polish, wax & ceramic coating'),
    short: L('إزالة الخدوش الخفيفة وحماية تدوم شهورًا.', 'Lift light swirls and protect for months.'),
    description: L(
      'تلميع ميكانيكي يزيل الخدوش الدائرية الخفيفة، ثم واكس يدوي أو طبقة سيراميك تحمي الطلاء من الشمس والأتربة حتى 12 شهرًا.',
      'Machine polishing removes light swirl marks, then hand wax or a ceramic layer protects the paint from sun and dust for up to 12 months.'
    ),
    includes: [L('تلميع ميكانيكي', 'Machine polish'), L('واكس يدوي', 'Hand wax'), L('سيراميك 12 شهر', '12-month ceramic')],
    bookWith: { addonId: 'ceramic' },
    active: true,
  },
  {
    id: 'engine',
    art: 'engine',
    name: L('غسيل الموتور والشاسيه', 'Engine bay & underbody wash'),
    short: L('ثلج جاف آمن على الكهرباء، بدون مية.', 'Dry ice, safe for electrics, no water.'),
    description: L(
      'الثلج الجاف لا يوصّل الكهرباء ولا يترك رطوبة، فهو الطريقة الأكثر أمانًا لتنظيف الموتور والشاسيه من الشحوم والطين.',
      'Dry ice does not conduct electricity or leave moisture, which makes it the safest way to clear grease and mud from the engine bay and underbody.'
    ),
    includes: [L('موتور بالثلج الجاف', 'Dry-ice engine bay'), L('شاسيه وأقواس العجل', 'Underbody and wheel arches')],
    bookWith: { addonId: 'engine' },
    active: true,
  },
];

const packages = [
  {
    id: 'basic',
    name: L('أساسي', 'Basic'),
    tagline: L('خارجي', 'Exterior'),
    includes: [L('رغوة وغسيل يدوي', 'Foam and hand wash'), L('الجنوط والإطارات', 'Wheels and tyres'), L('زجاج من الخارج', 'Outside glass'), L('تجفيف بدون بقع', 'Spot-free dry')],
    prices: { sedan: 350, suv: 450, van: 550, bike: 200 },
    durations: { sedan: 30, suv: 40, van: 45, bike: 20 },
    popular: false,
    active: true,
  },
  {
    id: 'premium',
    name: L('بريميوم', 'Premium'),
    tagline: L('خارجي + داخلي', 'Exterior + interior'),
    includes: [L('كل ما في الأساسي', 'Everything in Basic'), L('شفط كامل', 'Full vacuum'), L('تابلوه وفتحات التكييف بالثلج الجاف', 'Dry-ice dashboard and vents'), L('زجاج من الداخل', 'Inside glass')],
    prices: { sedan: 750, suv: 950, van: 1150, bike: 350 },
    durations: { sedan: 60, suv: 75, van: 90, bike: 35 },
    popular: true,
    active: true,
  },
  {
    id: 'ultimate',
    name: L('ألتيميت', 'Ultimate'),
    tagline: L('تفصيل كامل', 'Full detail'),
    includes: [L('كل ما في بريميوم', 'Everything in Premium'), L('فرش وسجاد تنظيف عميق', 'Deep seat and carpet clean'), L('موتور وشاسيه بالثلج الجاف', 'Dry-ice engine and underbody'), L('تلميع خطوة واحدة + واكس', 'One-step polish + wax')],
    prices: { sedan: 2500, suv: 3200, van: 3800, bike: 900 },
    durations: { sedan: 180, suv: 240, van: 270, bike: 90 },
    popular: false,
    active: true,
  },
];

const addons = [
  { id: 'tyre-shine', zone: 'wheels', name: L('لمعة الإطارات والجنوط', 'Tyre & rim shine'), description: L('جل يعطي لون أسود عميق ويحمي المطاط.', 'Deep black gel that also protects the rubber.'), price: 150, duration: 15, includedIn: [], active: true },
  { id: 'shampoo', zone: 'seats', name: L('شامبو فرش وسجاد', 'Seat & carpet shampoo'), description: L('غسيل بالبخار والشفط للبقع العميقة.', 'Steam extraction for deep stains.'), price: 600, duration: 60, includedIn: ['ultimate'], active: true },
  { id: 'headlights', zone: 'lights', name: L('تجديد الفوانيس', 'Headlight restoration'), description: L('صنفرة وتلميع وطبقة حماية من الاصفرار.', 'Sand, polish and a UV coat against yellowing.'), price: 400, duration: 30, includedIn: [], active: true },
  { id: 'wax', zone: 'body', name: L('واكس يدوي', 'Hand wax'), description: L('لمعة وحماية لمدة 6 أسابيع تقريبًا.', 'Gloss and protection for about six weeks.'), price: 300, duration: 20, includedIn: ['ultimate'], active: true },
  { id: 'engine', zone: 'engine', name: L('موتور بالثلج الجاف', 'Engine bay dry-ice clean'), description: L('آمن على الكهرباء، بدون مية.', 'Safe for electrics, no water.'), price: 500, duration: 30, includedIn: ['ultimate'], active: true },
  { id: 'underbody', zone: 'body', name: L('شاسيه بالثلج الجاف', 'Underbody dry-ice clean'), description: L('إزالة الطين والشحوم من أسفل العربية.', 'Mud and grease cleared from underneath.'), price: 600, duration: 40, includedIn: ['ultimate'], active: true },
  { id: 'ceramic', zone: 'body', name: L('طبقة سيراميك (12 شهر)', 'Ceramic coating (12 months)'), description: L('تلميع ثم طبقة سيراميك واحدة. تحتاج نصف يوم.', 'Polish, then one ceramic layer. Takes half a day.'), price: 6500, duration: 300, includedIn: [], active: true },
];

const facilities = [
  { id: 'lounge', icon: 'sofa', name: L('صالة انتظار', 'Waiting lounge') },
  { id: 'wifi', icon: 'wifi', name: L('واي فاي', 'Wi-Fi') },
  { id: 'cafe', icon: 'coffee', name: L('كافيه', 'Café') },
  { id: 'parking', icon: 'parking', name: L('باركينج وتسليم', 'Parking & drop-off') },
  { id: 'recycle', icon: 'recycle', name: L('مياه معاد تدويرها', 'Recycled water') },
];

// Two branches, both in Sheikh Zayed (sample names and addresses — edit in Admin).
const branches = [
  {
    id: 'zayed-13',
    name: L('الشيخ زايد — الحي 13', 'Sheikh Zayed — District 13'),
    area: L('الحي الثالث عشر', 'District 13'),
    address: L('الحي 13، مدينة الشيخ زايد', 'District 13, Sheikh Zayed City'),
    phone: '+20 100 000 0001',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=District+13+Sheikh+Zayed',
    map: { x: 34, y: 40 },
    bays: 4,
    mobileUnits: 0,
    mobileWash: false,
    hours: HOURS,
    facilities: ['lounge', 'wifi', 'cafe', 'parking', 'recycle'],
    waitOverride: null,
    blocked: [],
    active: true,
  },
  {
    id: 'zayed-16',
    name: L('الشيخ زايد — الحي 16', 'Sheikh Zayed — District 16'),
    area: L('الحي السادس عشر', 'District 16'),
    address: L('الحي 16، أمام جاليريا 40', 'District 16, opposite Galleria 40'),
    phone: '+20 100 000 0002',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Galleria+40+Sheikh+Zayed',
    map: { x: 66, y: 60 },
    bays: 3,
    mobileUnits: 0,
    mobileWash: false,
    hours: HOURS,
    facilities: ['lounge', 'wifi', 'parking', 'recycle'],
    waitOverride: null,
    blocked: [],
    active: true,
  },
];

const plans = [
  {
    id: 'monthly-basic',
    type: 'monthly',
    name: L('غير محدود شهري', 'Monthly unlimited'),
    description: L('غسلة أساسية كل يوم لو حبيت، لعربية واحدة.', 'A Basic wash every day if you like, for one car.'),
    price: 1200,
    period: 'month',
    washes: null,
    packageId: 'basic',
    perks: [L('غسلة أساسية يوميًا', 'One Basic wash per day'), L('حجز أولوية في الأوقات الهادية', 'Priority in quiet hours'), L('إلغاء في أي وقت', 'Cancel any time')],
    note: L('سعر السيدان. SUV ‏+300 ج.م.', 'Sedan price. SUV +300 EGP.'),
    featured: true,
    active: true,
  },
  {
    id: 'monthly-premium',
    type: 'monthly',
    name: L('بريميوم شهري', 'Premium monthly'),
    description: L('4 غسلات بريميوم كل شهر.', 'Four Premium washes every month.'),
    price: 2400,
    period: 'month',
    washes: 4,
    packageId: 'premium',
    perks: [L('4 غسلات بريميوم', '4 Premium washes'), L('خصم 10% على الإضافات', '10% off add-ons'), L('ضعف النقاط', 'Double loyalty points')],
    note: L('سعر السيدان.', 'Sedan price.'),
    featured: false,
    active: true,
  },
  {
    id: 'bundle-5',
    type: 'bundle',
    name: L('باقة 5 غسلات', '5-wash bundle'),
    description: L('5 غسلات أساسية تستخدمها خلال 3 شهور.', 'Five Basic washes to use within three months.'),
    price: 1500,
    period: null,
    washes: 5,
    packageId: 'basic',
    perks: [L('وفّر 250 ج.م', 'Save 250 EGP'), L('تتشارك بين عربياتك', 'Share between your cars')],
    note: L('سعر السيدان.', 'Sedan price.'),
    featured: false,
    active: true,
  },
  {
    id: 'bundle-10',
    type: 'bundle',
    name: L('باقة 10 بريميوم', '10 Premium bundle'),
    description: L('10 غسلات بريميوم تستخدمها خلال 6 شهور.', 'Ten Premium washes to use within six months.'),
    price: 6500,
    period: null,
    washes: 10,
    packageId: 'premium',
    perks: [L('وفّر 1,000 ج.م', 'Save 1,000 EGP'), L('تتشارك بين عربياتك', 'Share between your cars')],
    note: L('سعر السيدان.', 'Sedan price.'),
    featured: false,
    active: true,
  },
];

const promos = [
  { code: 'WELCOME10', type: 'percent', value: 10, description: L('خصم 10% على أول حجز', '10% off your first booking'), firstBookingOnly: true, expires: null, active: true, uses: 0 },
  { code: 'FLEET15', type: 'percent', value: 15, description: L('خصم الشركات', 'Fleet discount'), firstBookingOnly: false, expires: null, active: false, uses: 0 },
  { code: 'SHINE100', type: 'fixed', value: 100, description: L('100 ج.م خصم', '100 EGP off'), firstBookingOnly: false, expires: null, active: true, uses: 0 },
];

const faqs = [
  { id: 'f1', category: 'dryice', q: L('هل الثلج الجاف آمن على الطلاء؟', 'Is dry ice safe for paint?'), a: L('نعم. الحبيبات أنعم من الرمل وتتبخر لحظة الاصطدام، فلا تحتك بالطلاء ولا تترك خدوشًا.', 'Yes. The pellets are softer than sand and vaporise on impact, so nothing grinds against the paint.') },
  { id: 'f2', category: 'dryice', q: L('هل ينفع للموتور والكهرباء؟', 'Can it be used on the engine and electrics?'), a: L('نعم، هذه أفضل استخداماته. الثلج الجاف لا يوصّل الكهرباء ولا يترك رطوبة.', 'Yes, that is where it shines. Dry ice does not conduct electricity or leave moisture.') },
  { id: 'f3', category: 'booking', q: L('أقدر أغيّر أو ألغي الحجز؟', 'Can I change or cancel my booking?'), a: L('نعم، من الرابط في رسالة التأكيد. الإلغاء مجاني حتى 3 ساعات قبل الموعد.', 'Yes, from the link in your confirmation message. Cancelling is free up to 3 hours before.') },
  { id: 'f4', category: 'booking', q: L('الغسيل بياخد قد إيه؟', 'How long does a wash take?'), a: L('من 30 دقيقة للأساسي حتى نصف يوم للسيراميك. المدة الدقيقة تظهر قبل ما تحجز.', 'From 30 minutes for Basic up to half a day for ceramic. You see the exact time before you book.') },
  { id: 'f5', category: 'payment', q: L('إيه طرق الدفع؟', 'How can I pay?'), a: L('إنستاباي أو محفظة موبايل وقت الحجز، أو كاش وكارت في الفرع.', 'InstaPay or a mobile wallet when you book, or cash and card at the center.') },
  { id: 'f6', category: 'payment', q: L('إزاي أدفع بإنستاباي؟', 'How do I pay with InstaPay?'), a: L('اختار إنستاباي في خطوة الدفع، حوّل المبلغ على العنوان اللي هيظهر لك، واكتب رقم العملية لو حابب. بنأكد الدفع خلال دقايق.', 'Choose InstaPay at the payment step, send the amount to the address shown and add the reference if you like. We confirm within minutes.') },
  { id: 'f7', category: 'membership', q: L('إزاي أستخدم الاشتراك؟', 'How do I use a membership?'), a: L('سجّل دخول بنفس رقم الموبايل واحجز عادي، الغسلة تتخصم من اشتراكك.', 'Log in with the same phone number and book as usual; the wash comes off your plan.') },
  { id: 'f8', category: 'payment', q: L('إيه هي الأوقات الهادية؟', 'What are quiet hours?'), a: L('من الأحد للأربعاء 12–4 الضهر، كل المواعيد عليها خصم 20% تلقائيًا.', 'Sunday to Wednesday, 12–4 pm. Every slot then is 20% off automatically.') },
];

const reviews = [
  { id: 'r1', name: 'Karim A.', rating: 5, lang: 'en', text: 'Booked at 9, car was ready at 10:10. The engine bay looks new and nothing got wet.', branchId: 'zayed-13', approved: true, date: '2026-10-02' },
  { id: 'r2', name: 'منى س.', rating: 5, lang: 'ar', text: 'أول مرة أشوف فرش العربية نضيف كده من بعد الولاد. والحجز من الموبايل سهل جدًا.', branchId: 'zayed-16', approved: true, date: '2026-10-11' },
  { id: 'r3', name: 'Omar H.', rating: 4, lang: 'en', text: 'Quiet-hour discount is real. Went on a Tuesday at 1 pm and had the place to myself.', branchId: 'zayed-16', approved: true, date: '2026-10-19' },
  { id: 'r4', name: 'يوسف م.', rating: 5, lang: 'ar', text: 'رسالة التذكير قبلها بساعة فرقت معايا. وصلت لقيت المكان جاهز.', branchId: 'zayed-13', approved: true, date: '2026-10-27' },
  { id: 'r5', name: 'Nour E.', rating: 5, lang: 'en', text: 'Paid with InstaPay while I was parking, got the receipt on WhatsApp. Done in an hour.', branchId: 'zayed-16', approved: true, date: '2026-11-03' },
  { id: 'r6', name: 'أحمد ف.', rating: 5, lang: 'ar', text: 'الفوانيس رجعت شفافة. فرق كبير بالليل.', branchId: 'zayed-16', approved: true, date: '2026-11-09' },
];

const gallery = [
  { id: 'g1', vehicle: 'suv', tone: 'graphite', title: L('SUV — داخلي كامل', 'SUV — full interior'), service: 'detailing' },
  { id: 'g2', vehicle: 'sedan', tone: 'pearl', title: L('سيدان — موتور بالثلج الجاف', 'Sedan — dry-ice engine bay'), service: 'engine' },
  { id: 'g3', vehicle: 'sedan', tone: 'copper', title: L('سيدان — تلميع وسيراميك', 'Sedan — polish and ceramic'), service: 'polish' },
  { id: 'g4', vehicle: 'van', tone: 'graphite', title: L('فان — غسيل خارجي', 'Van — exterior wash'), service: 'exterior' },
];

const jobs = [
  { id: 'j1', title: L('فنّي تفصيل سيارات', 'Car detailer'), branchId: 'zayed-13', type: L('دوام كامل', 'Full time'), description: L('خبرة سنة على الأقل في التلميع أو التنظيف الداخلي. نتدرّب معك على الثلج الجاف.', 'At least one year of polishing or interior work. We train you on dry ice.'), active: true },
  { id: 'j2', title: L('استقبال وخدمة عملاء', 'Front desk & customer care'), branchId: 'zayed-16', type: L('دوام كامل', 'Full time'), description: L('تستقبل العملاء، تدير الحجوزات على النظام، وترد على الواتساب.', 'Welcome customers, run bookings in the system and answer WhatsApp.'), active: true },
  { id: 'j3', title: L('مساعد تفصيل', 'Detailing assistant'), branchId: 'zayed-16', type: L('دوام جزئي', 'Part time'), description: L('بدون خبرة؟ مفيش مشكلة. بنعلّمك كل حاجة من أول يوم.', 'No experience? No problem. We train you from day one.'), active: true },
];

const legal = [
  {
    slug: 'terms',
    title: L('الشروط والأحكام', 'Terms of service'),
    body: L(
      'باستخدامك للموقع أو الحجز من خلاله فأنت توافق على هذه الشروط.\n\nالأسعار المعروضة تشمل الضريبة وقد تتغير حسب حالة العربية الفعلية. لو العربية محتاجة شغل أكتر من الباقة، هنكلّمك قبل ما نبدأ.\n\nنحن مسؤولون عن أي ضرر ينتج عن خدمتنا ويتم إبلاغنا به خلال 24 ساعة. لسنا مسؤولين عن المتعلقات الشخصية المتروكة في العربية.',
      'By using this site or booking through it you agree to these terms.\n\nPrices shown include tax and may change if the car needs more work than the package covers. We will call you before starting any extra work.\n\nWe are responsible for damage caused by our service and reported within 24 hours. We are not responsible for personal belongings left in the car.'
    ),
  },
  {
    slug: 'privacy',
    title: L('سياسة الخصوصية', 'Privacy policy'),
    body: L(
      'نجمع اسمك ورقم موبايلك ورقم اللوحة لإدارة حجزك وإرسال التأكيد والتذكير فقط.\n\nلا نبيع بياناتك ولا نشاركها مع أي طرف ثالث إلا مزوّد الدفع عند الدفع بإنستاباي أو المحفظة.\n\nتقدر تطلب حذف حسابك وبياناتك في أي وقت من خلال صفحة التواصل.',
      'We collect your name, phone number and plate number only to manage your booking and send confirmations and reminders.\n\nWe never sell your data or share it with third parties, except the payment provider when you pay with InstaPay or a wallet.\n\nYou can ask us to delete your account and data at any time from the contact page.'
    ),
  },
  {
    slug: 'cancellation',
    title: L('سياسة الإلغاء والاسترداد', 'Cancellation & refund policy'),
    body: L(
      'الإلغاء أو تغيير الموعد مجاني حتى 3 ساعات قبل الموعد، من الرابط في رسالة التأكيد.\n\nلو دفعت بإنستاباي أو محفظة وألغيت في الوقت المسموح، بنرجّعلك المبلغ على نفس الحساب خلال يومين عمل.\n\nعدم الحضور بدون إلغاء يُسجَّل، وبعد مرتين قد نطلب دفع الحجز مقدمًا.',
      'Cancelling or rescheduling is free up to 3 hours before your slot, from the link in your confirmation message.\n\nIf you paid by InstaPay or a wallet and cancel in time, we send the money back to the same account within 2 working days.\n\nNo-shows are recorded; after two, we may ask you to pay upfront for future bookings.'
    ),
  },
];

const brief = {
  goals: [
    { title: L('تحويل الزوار لحجوزات', 'Turn visitors into bookings'), text: L('زر احجز موجود في كل صفحة بلمسة واحدة، والأسعار واضحة من البداية.', 'Book a Wash is reachable from every page in one tap, with clear prices up front.') },
    { title: L('تقليل التليفونات والواتساب', 'Cut the phone and WhatsApp back-and-forth'), text: L('العميل يشوف المواعيد الفاضية ويحجز بنفسه.', 'Customers see free slots and book themselves; staff stop managing bookings by hand.') },
    { title: L('ملء الأوقات الهادية وتكرار الزيارة', 'Fill quiet hours, keep customers coming back'), text: L('اشتراكات وعروض وتذكير يرجّعوا العملاء في الأيام الهادية.', 'Memberships, offers and reminders bring repeat visits on slow days.') },
  ],
  audiences: [
    { title: L('السائق اليومي', 'Everyday driver'), text: L('عايز السعر والمكان وأقرب ميعاد بسرعة من الموبايل.', 'Wants price, location and the next free time, fast, on a phone.') },
    { title: L('المحترف المشغول', 'Busy professional'), text: L('يحجز بدري، يدفع بإنستاباي، ومايحبش يستنى.', 'Books ahead, pays with InstaPay, wants no waiting and a reminder.') },
    { title: L('مدير أسطول / شركة', 'Fleet / company manager'), text: L('عربيات كتير، فاتورة شهرية، حجوزات متكررة.', 'Many cars, monthly invoice, bulk or recurring bookings.') },
    { title: L('فريق ومدير الفرع', 'Center staff & manager'), text: L('يشوف حجوزات اليوم، يوزّع الأماكن، يعدّل الأسعار ويقرأ التقارير.', "Sees the day's bookings, assigns bays, edits prices, reads reports.") },
  ],
  moscow: {
    must: [L('حجز أونلاين بمواعيد فاضية حقيقية', 'Online booking with live free slots'), L('أسعار حسب الباقة وحجم العربية', 'Prices by package and vehicle size'), L('زر احجز في الهيدر وثابت على الموبايل', 'Book a Wash in the header + sticky on mobile'), L('تأكيد وتذكير (SMS / واتساب / إيميل)', 'Confirmation & reminders (SMS / WhatsApp / email)'), L('الفروع والخريطة والمواعيد', 'Branches, map & opening hours'), L('لوحة تحكم: تقويم الحجوزات وتعديل الأسعار', 'Admin: booking calendar, edit prices'), L('موبايل أولًا، عربي/إنجليزي', 'Mobile-first, Arabic / English (RTL)')],
    should: [L('حساب عميل وعربيات محفوظة', 'Customer account & saved cars'), L('دفع بإنستاباي أو في الفرع', 'Pay with InstaPay or at the center'), L('تغيير أو إلغاء من الرابط', 'Reschedule / cancel by link'), L('اشتراكات وباقات', 'Memberships & bundles'), L('آراء وصور قبل/بعد', 'Reviews & before/after gallery'), L('أكواد خصم', 'Promo codes')],
    could: [L('وقت الانتظار المباشر لكل فرع', 'Live wait time per branch'), L('حالة الغسيل مباشرة', 'Live wash status (queued → ready)'), L('نقاط ولاء', 'Loyalty points'), L('كروت هدايا', 'Gift cards'), L('بوابة الشركات وفاتورة شهرية', 'Fleet portal & monthly invoice')],
    wont: [L('تطبيق iOS / Android', 'Native iOS / Android app'), L('متجر منتجات', 'Online shop for car products'), L('فحص الأضرار بالذكاء الاصطناعي', 'AI damage scan from photos')],
  },
};

const staff = [
  { id: 's1', name: 'Mahmoud Adel', role: 'manager', branchId: 'zayed-13', phone: '+20 100 000 1001', active: true },
  { id: 's2', name: 'Hassan Ali', role: 'detailer', branchId: 'zayed-13', phone: '+20 100 000 1002', active: true },
  { id: 's3', name: 'Ibrahim Saeed', role: 'detailer', branchId: 'zayed-13', phone: '+20 100 000 1003', active: true },
  { id: 's4', name: 'Tarek Nabil', role: 'manager', branchId: 'zayed-16', phone: '+20 100 000 1004', active: true },
  { id: 's5', name: 'Ali Mostafa', role: 'detailer', branchId: 'zayed-16', phone: '+20 100 000 1005', active: true },
  { id: 's6', name: 'Sherif Kamal', role: 'detailer', branchId: 'zayed-16', phone: '+20 100 000 1006', active: true },
  { id: 's7', name: 'Reem Fathy', role: 'front-desk', branchId: 'zayed-16', phone: '+20 100 000 1007', active: true },
];

const templates = [
  { id: 'confirmation', timing: 'instant', channels: ['sms', 'whatsapp', 'email'], body: L('تم تأكيد حجزك {code} في {branch} يوم {date} الساعة {time}. الإجمالي {total}. للتعديل: {link}', 'Booking {code} confirmed at {branch} on {date} at {time}. Total {total}. Manage: {link}') },
  { id: 'reminder-1', timing: 'before:24', channels: ['whatsapp', 'sms'], body: L('تذكير: موعدك بكرة {date} الساعة {time} في {branch}. للتغيير أو الإلغاء: {link}', 'Reminder: your wash is tomorrow {date} at {time} at {branch}. Reschedule or cancel: {link}') },
  { id: 'reminder-2', timing: 'before:1', channels: ['whatsapp', 'sms'], body: L('موعدك بعد ساعة في {branch}. المكان جاهز. كود الحجز {code}.', 'Your slot at {branch} is in one hour. The bay is ready. Booking {code}.') },
  { id: 'ready', timing: 'status:ready', channels: ['whatsapp', 'sms'], body: L('عربيتك جاهزة في {branch}! تقدر تستلمها دلوقتي.', 'Your car is ready at {branch}! You can pick it up now.') },
  { id: 'review', timing: 'status:completed', channels: ['whatsapp', 'email'], body: L('شكرًا لزيارتك! قيّم تجربتك واكسب نقاط: {link}', 'Thanks for visiting! Rate your wash and earn points: {link}') },
  { id: 'cancelled', timing: 'status:cancelled', channels: ['sms', 'email'], body: L('تم إلغاء حجزك {code}. نتمنى نشوفك قريب.', 'Booking {code} was cancelled. Hope to see you soon.') },
];

// Deterministic pseudo-random so the seed looks the same each reset.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function token() {
  return crypto.randomBytes(18).toString('base64url');
}

function sampleBookings(customers) {
  const now = zonedNow(settings.timezone);
  const rand = rng(42);
  const bookings = [];
  const payments = [];
  const names = [
    ['Karim Adel', '+201001112233'],
    ['Mona Samir', '+201002223344'],
    ['Omar Hany', '+201003334455'],
    ['Youssef Magdy', '+201004445566'],
    ['Nour Essam', '+201005556677'],
    ['Ahmed Fawzy', '+201006667788'],
    ['Salma Tamer', '+201007778899'],
    ['Hady Wael', '+201008889900'],
  ];
  const pkgIds = ['basic', 'basic', 'premium', 'premium', 'premium', 'ultimate'];
  const sizes = ['sedan', 'sedan', 'suv', 'suv', 'van', 'bike'];
  const used = {};
  let n = 0;
  for (let day = -13; day <= 2; day += 1) {
    const date = addDays(now.date, day);
    const weekday = weekdayOf(date);
    const count = day > 0 ? 3 : 4 + Math.floor(rand() * 4);
    for (let i = 0; i < count; i += 1) {
      const branch = branches[Math.floor(rand() * branches.length)];
      const hours = branch.hours[weekday];
      const open = Number(hours.open.slice(0, 2));
      const startHour = open + Math.floor(rand() * 9);
      const start = `${String(startHour).padStart(2, '0')}:${rand() > 0.5 ? '30' : '00'}`;
      const bay = 1 + Math.floor(rand() * branch.bays);
      const packageId = pkgIds[Math.floor(rand() * pkgIds.length)];
      const sizeId = sizes[Math.floor(rand() * sizes.length)];
      const pkg = packages.find((p) => p.id === packageId);
      const addonIds = rand() > 0.6 ? ['tyre-shine'] : [];
      const addonTotal = addonIds.reduce((s, id) => s + addons.find((a) => a.id === id).price, 0);
      const subtotal = pkg.prices[sizeId] + addonTotal;
      const duration = pkg.durations[sizeId] + addonIds.reduce((s, id) => s + addons.find((a) => a.id === id).duration, 0);
      const startMinutes = Number(start.slice(0, 2)) * 60 + Number(start.slice(3));
      const key = `${branch.id}|${date}|${bay}`;
      const taken = used[key] || [];
      if (taken.some(([a, b]) => startMinutes < b && a < startMinutes + duration)) continue;
      if (startMinutes + duration > Number(hours.close.slice(0, 2)) * 60) continue;
      used[key] = [...taken, [startMinutes, startMinutes + duration]];
      const [name, phone] = names[Math.floor(rand() * names.length)];
      const customer = customers.find((c) => c.phone === phone);
      let status = 'booked';
      const startMin = startMinutes;
      if (day < 0) status = rand() > 0.92 ? 'no_show' : rand() > 0.95 ? 'cancelled' : 'completed';
      if (day === 0) {
        if (startMin + duration < now.minutes) status = 'completed';
        else if (startMin <= now.minutes) status = rand() > 0.5 ? 'washing' : 'checked_in';
      }
      const method = rand() > 0.5 ? 'instapay' : 'center';
      const paid = (method === 'instapay' && day < 0) || status === 'completed';
      n += 1;
      const id = `b${String(n).padStart(3, '0')}`;
      const code = `MD-${(100000 + Math.floor(rand() * 899999)).toString(36).toUpperCase().slice(0, 6).padEnd(6, 'X')}`;
      const createdAt = `${addDays(date, -1)}T10:00:00.000Z`;
      bookings.push({
        id,
        code,
        token: token(),
        branchId: branch.id,
        mode: 'center',
        address: '',
        bay,
        sizeId,
        packageId,
        addonIds,
        date,
        start,
        duration,
        price: { subtotal, discount: 0, discountLabel: '', mobileFee: 0, total: subtotal },
        promo: null,
        payment: { method, status: status === 'cancelled' ? 'unpaid' : paid ? 'paid' : method === 'instapay' ? 'pending' : 'unpaid' },
        customer: { name, phone, plate: `${['س ص ع', 'ق ر ط', 'م ن ب'][n % 3]} ${1000 + n * 7}`, email: '' },
        customerId: customer ? customer.id : null,
        staffId: null,
        status,
        history: [{ at: createdAt, status: 'booked' }],
        rating: status === 'completed' && rand() > 0.6 ? 4 + Math.round(rand()) : null,
        reviewText: '',
        lang: rand() > 0.5 ? 'ar' : 'en',
        createdAt,
      });
      if (paid && status !== 'cancelled') {
        payments.push({ id: `p${id}`, kind: 'booking', refId: id, amount: subtotal, method: method === 'instapay' ? 'instapay' : rand() > 0.5 ? 'cash' : 'card', status: 'paid', at: createdAt });
      }
    }
  }
  return { bookings, payments };
}

export function buildSeed() {
  const now = zonedNow(settings.timezone);
  const customers = [
    {
      id: 'c1',
      name: 'Karim Adel',
      phone: '+201001112233',
      email: 'karim@example.com',
      cars: [{ id: 'car1', label: 'Toyota Corolla', plate: 'س ص ع 1234', sizeId: 'sedan' }],
      points: 320,
      notes: 'Prefers District 13, mornings.',
      createdAt: `${addDays(now.date, -60)}T09:00:00.000Z`,
    },
    {
      id: 'c2',
      name: 'Mona Samir',
      phone: '+201002223344',
      email: '',
      cars: [{ id: 'car2', label: 'Hyundai Tucson', plate: 'ق ر ط 5678', sizeId: 'suv' }],
      points: 140,
      notes: '',
      createdAt: `${addDays(now.date, -30)}T09:00:00.000Z`,
    },
    {
      id: 'c3',
      name: 'Nour Essam',
      phone: '+201005556677',
      email: 'nour@example.com',
      cars: [
        { id: 'car3', label: 'BMW X5', plate: 'م ن ب 9012', sizeId: 'suv' },
        { id: 'car4', label: 'Vespa', plate: 'د ه 334', sizeId: 'bike' },
      ],
      points: 610,
      notes: 'Two cars, usually books Fridays.',
      createdAt: `${addDays(now.date, -90)}T09:00:00.000Z`,
    },
  ];
  const { bookings, payments } = sampleBookings(customers);
  const subscriptions = [
    { id: 'sub1', customerId: 'c3', planId: 'monthly-basic', startedAt: addDays(now.date, -20), status: 'active', washesLeft: null },
  ];
  payments.push({ id: 'psub1', kind: 'subscription', refId: 'sub1', amount: 1200, method: 'instapay', status: 'paid', at: `${addDays(now.date, -20)}T12:00:00.000Z` });
  const giftCards = [
    { code: 'GIFT-DEMO-1000', amount: 1000, balance: 1000, buyerName: 'Demo', recipientName: 'Demo', message: '', createdAt: `${addDays(now.date, -5)}T12:00:00.000Z` },
  ];
  return {
    meta: { version: 1, seededAt: new Date().toISOString(), secret: crypto.randomBytes(24).toString('hex') },
    settings,
    home,
    about,
    brief,
    vehicleSizes,
    services,
    packages,
    addons,
    facilities,
    branches,
    plans,
    promos,
    giftCards,
    faqs,
    reviews,
    gallery,
    jobs,
    legal,
    staff,
    templates,
    customers,
    sessions: {},
    otp: {},
    bookings,
    subscriptions,
    payments,
    messages: [
      { id: 'm1', kind: 'fleet', name: 'Hesham Lotfy', company: 'Nile Logistics', phone: '+201009990011', email: 'fleet@nile.example', text: '12 vans, looking for a monthly plan with Friday slots.', createdAt: `${addDays(now.date, -2)}T11:20:00.000Z`, read: false },
      { id: 'm2', kind: 'contact', name: 'Dina Raafat', company: '', phone: '+201009990022', email: '', text: 'Do you do ceramic on matte paint?', createdAt: `${addDays(now.date, -1)}T16:05:00.000Z`, read: false },
    ],
    outbox: [],
  };
}

export { toHHMM };
