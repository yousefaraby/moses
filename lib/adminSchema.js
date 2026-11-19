// Field definitions for the admin editors. Every collection and setting the
// public site reads is listed here, so staff can edit anything without code.
//
// Field types: text, textarea, number, bool, select, multi, i18n, i18nArea,
// i18nList, sizeMap, hours, blocked, channels, date.

const L = (en, ar) => ({ en, ar });

export const COLLECTIONS = {
  packages: {
    title: L('Packages', 'الباقات'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID (used in links)', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'tagline', type: 'i18n', label: L('Tagline', 'وصف قصير') },
      { path: 'prices', type: 'sizeMap', label: L('Price per car size (EGP)', 'السعر لكل حجم (ج.م)') },
      { path: 'durations', type: 'sizeMap', label: L('Wash time per car size (min)', 'المدة لكل حجم (دقيقة)') },
      { path: 'includes', type: 'i18nList', label: L('Includes', 'يشمل') },
      { path: 'popular', type: 'bool', label: L('Highlight as most booked', 'تمييز كالأكثر حجزًا') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ id: `pkg-${Date.now().toString(36)}`, name: { ar: '', en: '' }, tagline: { ar: '', en: '' }, prices: {}, durations: {}, includes: [], popular: false, active: true }),
  },
  addons: {
    title: L('Add-ons', 'الإضافات'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'description', type: 'i18n', label: L('Description', 'الوصف') },
      { path: 'price', type: 'number', label: L('Price (EGP)', 'السعر (ج.م)') },
      { path: 'duration', type: 'number', label: L('Extra time (min)', 'وقت إضافي (دقيقة)') },
      {
        path: 'zone',
        type: 'select',
        label: L('Car zone (booking diagram)', 'منطقة العربية'),
        options: [
          ['wheels', L('Wheels', 'الجنوط')],
          ['cabin', L('Cabin', 'الكابينة')],
          ['seats', L('Seats', 'الفرش')],
          ['lights', L('Lights', 'الفوانيس')],
          ['body', L('Paint & body', 'الطلاء')],
          ['engine', L('Engine', 'الموتور')],
        ],
      },
      { path: 'includedIn', type: 'multi', optionsFrom: 'packages', label: L('Already included in', 'مشمولة في') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ id: `addon-${Date.now().toString(36)}`, zone: 'body', name: { ar: '', en: '' }, description: { ar: '', en: '' }, price: 0, duration: 15, includedIn: [], active: true }),
  },
  services: {
    title: L('Services', 'الخدمات'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID (page anchor)', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'short', type: 'i18n', label: L('Short line', 'سطر قصير') },
      { path: 'description', type: 'i18nArea', label: L('Description', 'الوصف') },
      { path: 'includes', type: 'i18nList', label: L('Includes', 'يشمل') },
      { path: 'bookWith.packageId', type: 'select', optionsFrom: 'packages', allowEmpty: true, label: L('Books as package', 'تُحجز كباقة') },
      { path: 'bookWith.addonId', type: 'select', optionsFrom: 'addons', allowEmpty: true, label: L('…or as add-on', 'أو كإضافة') },
      {
        path: 'art',
        type: 'select',
        label: L('Illustration', 'الرسم'),
        options: [
          ['exterior', L('Exterior', 'خارجي')],
          ['interior', L('Interior', 'داخلي')],
          ['detailing', L('Detailing', 'تفصيل')],
          ['polish', L('Polish', 'تلميع')],
          ['engine', L('Engine', 'موتور')],
        ],
      },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ id: `svc-${Date.now().toString(36)}`, art: 'exterior', name: { ar: '', en: '' }, short: { ar: '', en: '' }, description: { ar: '', en: '' }, includes: [], bookWith: { packageId: 'basic' }, active: true }),
  },
  vehicleSizes: {
    title: L('Vehicle sizes', 'أحجام العربيات'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'hint', type: 'i18n', label: L('Examples', 'أمثلة') },
      {
        path: 'icon',
        type: 'select',
        label: L('Icon', 'الأيقونة'),
        options: [
          ['sedan', L('Sedan', 'سيدان')],
          ['suv', L('SUV', 'SUV')],
          ['van', L('Van', 'فان')],
          ['bike', L('Bike', 'موتوسيكل')],
        ],
      },
    ],
    blank: () => ({ id: `size-${Date.now().toString(36)}`, name: { ar: '', en: '' }, hint: { ar: '', en: '' }, icon: 'sedan' }),
  },
  promos: {
    title: L('Promo codes', 'أكواد الخصم'),
    key: 'code',
    label: (x) => x.code,
    fields: [
      { path: 'code', type: 'text', label: L('Code', 'الكود'), upper: true },
      { path: 'description', type: 'i18n', label: L('Description', 'الوصف') },
      {
        path: 'type',
        type: 'select',
        label: L('Type', 'النوع'),
        options: [
          ['percent', L('Percent', 'نسبة')],
          ['fixed', L('Fixed amount', 'مبلغ ثابت')],
        ],
      },
      { path: 'value', type: 'number', label: L('Value', 'القيمة') },
      { path: 'expires', type: 'date', label: L('Expires (optional)', 'ينتهي (اختياري)') },
      { path: 'firstBookingOnly', type: 'bool', label: L('First booking only', 'لأول حجز فقط') },
      { path: 'singleUse', type: 'bool', label: L('Single use', 'استخدام مرة واحدة') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ code: `NEW${Date.now().toString(36).slice(-4).toUpperCase()}`, type: 'percent', value: 10, description: { ar: '', en: '' }, firstBookingOnly: false, expires: null, active: true, uses: 0 }),
  },
  giftCards: {
    title: L('Gift cards', 'كروت الهدايا'),
    key: 'code',
    label: (x) => `${x.code} · ${x.balance}/${x.amount}`,
    fields: [
      { path: 'code', type: 'text', label: L('Code', 'الكود'), upper: true },
      { path: 'amount', type: 'number', label: L('Amount', 'المبلغ') },
      { path: 'balance', type: 'number', label: L('Balance left', 'الرصيد المتبقي') },
      { path: 'buyerName', type: 'text', label: L('Buyer', 'المشتري') },
      { path: 'recipientName', type: 'text', label: L('Recipient', 'المُهدى إليه') },
      { path: 'message', type: 'text', label: L('Message', 'الرسالة') },
    ],
    blank: () => ({ code: `GIFT-${Date.now().toString(36).toUpperCase()}`, amount: 500, balance: 500, buyerName: '', recipientName: '', message: '', createdAt: new Date().toISOString() }),
  },
  plans: {
    title: L('Membership plans', 'خطط الاشتراك'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      {
        path: 'type',
        type: 'select',
        label: L('Type', 'النوع'),
        options: [
          ['monthly', L('Monthly', 'شهري')],
          ['bundle', L('Bundle', 'باقة غسلات')],
        ],
      },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'description', type: 'i18n', label: L('Description', 'الوصف') },
      { path: 'price', type: 'number', label: L('Price (EGP)', 'السعر') },
      { path: 'washes', type: 'number', label: L('Washes (empty = unlimited)', 'عدد الغسلات (فاضي = غير محدود)'), nullable: true },
      { path: 'packageId', type: 'select', optionsFrom: 'packages', label: L('Package', 'الباقة') },
      { path: 'perks', type: 'i18nList', label: L('Perks', 'المزايا') },
      { path: 'note', type: 'i18n', label: L('Small print', 'ملاحظة') },
      { path: 'featured', type: 'bool', label: L('Featured', 'مميز') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ id: `plan-${Date.now().toString(36)}`, type: 'monthly', name: { ar: '', en: '' }, description: { ar: '', en: '' }, price: 0, period: 'month', washes: null, packageId: 'basic', perks: [], note: { ar: '', en: '' }, featured: false, active: true }),
  },
  branches: {
    title: L('Branches', 'الفروع'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      { path: 'area', type: 'i18n', label: L('Area', 'المنطقة') },
      { path: 'address', type: 'i18n', label: L('Address', 'العنوان') },
      { path: 'phone', type: 'text', label: L('Phone', 'التليفون') },
      { path: 'mapUrl', type: 'text', label: L('Google Maps link', 'رابط الخريطة') },
      { path: 'map.x', type: 'number', label: L('Map pin X (0–100)', 'موضع الدبوس X') },
      { path: 'map.y', type: 'number', label: L('Map pin Y (0–100)', 'موضع الدبوس Y') },
      { path: 'bays', type: 'number', label: L('Wash bays', 'أماكن الغسيل') },
      { path: 'waitOverride', type: 'number', nullable: true, label: L('Wait override (min, empty = automatic)', 'انتظار يدوي (فاضي = تلقائي)') },
      { path: 'hours', type: 'hours', label: L('Opening hours', 'مواعيد العمل') },
      { path: 'blocked', type: 'blocked', label: L('Blocked times', 'أوقات مقفولة') },
      { path: 'facilities', type: 'multi', optionsFrom: 'facilities', label: L('Facilities', 'الخدمات المتاحة') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({
      id: `branch-${Date.now().toString(36)}`,
      name: { ar: '', en: '' },
      area: { ar: '', en: '' },
      address: { ar: '', en: '' },
      phone: '',
      mapUrl: '',
      map: { x: 50, y: 50 },
      bays: 2,
      mobileUnits: 0,
      mobileWash: false,
      hours: Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, { open: '09:00', close: '22:00' }])),
      facilities: [],
      waitOverride: null,
      blocked: [],
      active: true,
    }),
  },
  facilities: {
    title: L('Facilities', 'الخدمات المتاحة'),
    key: 'id',
    label: (x, lang) => x.name?.[lang] || x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      { path: 'name', type: 'i18n', label: L('Name', 'الاسم') },
      {
        path: 'icon',
        type: 'select',
        label: L('Icon', 'الأيقونة'),
        options: ['sofa', 'wifi', 'coffee', 'parking', 'recycle', 'shield', 'car'].map((x) => [x, L(x, x)]),
      },
    ],
    blank: () => ({ id: `fac-${Date.now().toString(36)}`, icon: 'sofa', name: { ar: '', en: '' } }),
  },
  staff: {
    title: L('Staff', 'الفريق'),
    key: 'id',
    label: (x) => x.name,
    fields: [
      { path: 'name', type: 'text', label: L('Name', 'الاسم') },
      {
        path: 'role',
        type: 'select',
        label: L('Role', 'الدور'),
        options: [
          ['manager', L('Manager', 'مدير')],
          ['detailer', L('Detailer', 'فني')],
          ['front-desk', L('Front desk', 'استقبال')],
        ],
      },
      { path: 'branchId', type: 'select', optionsFrom: 'branches', label: L('Branch', 'الفرع') },
      { path: 'phone', type: 'text', label: L('Phone', 'الموبايل') },
      { path: 'active', type: 'bool', label: L('Active', 'نشط') },
    ],
    blank: () => ({ id: `s${Date.now().toString(36)}`, name: '', role: 'detailer', branchId: 'zayed-13', phone: '', active: true }),
  },
  templates: {
    title: L('Message templates', 'قوالب الرسائل'),
    key: 'id',
    label: (x) => x.id,
    fields: [
      { path: 'id', type: 'text', label: L('ID', 'المعرّف'), lockOnEdit: true },
      {
        path: 'timing',
        type: 'select',
        label: L('Sent when', 'يُرسل عند'),
        options: [
          ['instant', L('Booking confirmed / moved', 'تأكيد أو نقل الحجز')],
          ['before:24', L('24 h before', 'قبلها بـ 24 ساعة')],
          ['before:1', L('1 h before', 'قبلها بساعة')],
          ['status:ready', L('Car is ready', 'العربية جاهزة')],
          ['status:completed', L('Completed (review request)', 'بعد الانتهاء')],
          ['status:cancelled', L('Cancelled', 'الإلغاء')],
        ],
      },
      { path: 'channels', type: 'channels', label: L('Channels', 'القنوات') },
      { path: 'body', type: 'i18nArea', label: L('Text — {code} {branch} {date} {time} {total} {name} {link}', 'النص') },
    ],
    blank: () => ({ id: `tpl-${Date.now().toString(36)}`, timing: 'instant', channels: ['sms'], body: { ar: '', en: '' } }),
  },
  faqs: {
    title: L('FAQ', 'الأسئلة الشائعة'),
    key: 'id',
    label: (x, lang) => x.q?.[lang] || x.id,
    fields: [
      {
        path: 'category',
        type: 'select',
        label: L('Category', 'التصنيف'),
        options: [
          ['dryice', L('Dry ice', 'الثلج الجاف')],
          ['booking', L('Booking', 'الحجز')],
          ['payment', L('Payment', 'الدفع')],
          ['membership', L('Memberships', 'الاشتراكات')],
        ],
      },
      { path: 'q', type: 'i18n', label: L('Question', 'السؤال') },
      { path: 'a', type: 'i18nArea', label: L('Answer', 'الإجابة') },
    ],
    blank: () => ({ id: `f${Date.now().toString(36)}`, category: 'booking', q: { ar: '', en: '' }, a: { ar: '', en: '' } }),
  },
  reviews: {
    title: L('Reviews', 'الآراء'),
    key: 'id',
    label: (x, lang) => `${x.name} · ${x.rating}/5${x.approved ? '' : lang === 'ar' ? ' · بانتظار الاعتماد' : ' · awaiting approval'}`,
    fields: [
      { path: 'name', type: 'text', label: L('Name', 'الاسم') },
      { path: 'rating', type: 'number', label: L('Rating (1–5)', 'التقييم') },
      {
        path: 'lang',
        type: 'select',
        label: L('Language', 'اللغة'),
        options: [
          ['ar', L('Arabic', 'عربي')],
          ['en', L('English', 'إنجليزي')],
        ],
      },
      { path: 'text', type: 'textarea', label: L('Review', 'الرأي') },
      { path: 'branchId', type: 'select', optionsFrom: 'branches', label: L('Branch', 'الفرع') },
      { path: 'date', type: 'date', label: L('Date', 'التاريخ') },
      { path: 'approved', type: 'bool', label: L('Approved (shown on site)', 'معتمد (يظهر في الموقع)') },
    ],
    blank: () => ({ id: `r${Date.now().toString(36)}`, name: '', rating: 5, lang: 'ar', text: '', branchId: 'zayed-13', approved: false, date: new Date().toISOString().slice(0, 10) }),
  },
  gallery: {
    title: L('Before / after gallery', 'معرض قبل وبعد'),
    key: 'id',
    label: (x, lang) => x.title?.[lang] || x.id,
    fields: [
      { path: 'title', type: 'i18n', label: L('Caption', 'التعليق') },
      {
        path: 'vehicle',
        type: 'select',
        label: L('Vehicle drawing', 'رسم العربية'),
        options: [
          ['suv', L('SUV', 'SUV')],
          ['sedan', L('Sedan', 'سيدان')],
          ['van', L('Van', 'فان')],
          ['bike', L('Bike', 'موتوسيكل')],
        ],
      },
      {
        path: 'tone',
        type: 'select',
        label: L('Paint', 'اللون'),
        options: [
          ['graphite', L('Graphite', 'رمادي غامق')],
          ['pearl', L('Pearl', 'لؤلؤي')],
          ['copper', L('Copper', 'نحاسي')],
        ],
      },
      { path: 'service', type: 'select', optionsFrom: 'services', label: L('Service', 'الخدمة') },
    ],
    blank: () => ({ id: `g${Date.now().toString(36)}`, vehicle: 'sedan', tone: 'graphite', title: { ar: '', en: '' }, service: 'exterior' }),
  },
  jobs: {
    title: L('Careers', 'الوظائف'),
    key: 'id',
    label: (x, lang) => x.title?.[lang] || x.id,
    fields: [
      { path: 'title', type: 'i18n', label: L('Role', 'الوظيفة') },
      { path: 'type', type: 'i18n', label: L('Type', 'النوع') },
      { path: 'branchId', type: 'select', optionsFrom: 'branches', label: L('Branch', 'الفرع') },
      { path: 'description', type: 'i18nArea', label: L('Description', 'الوصف') },
      { path: 'active', type: 'bool', label: L('Open', 'متاحة') },
    ],
    blank: () => ({ id: `j${Date.now().toString(36)}`, title: { ar: '', en: '' }, type: { ar: 'دوام كامل', en: 'Full time' }, branchId: 'zayed-13', description: { ar: '', en: '' }, active: true }),
  },
  legal: {
    title: L('Legal pages', 'الصفحات القانونية'),
    key: 'slug',
    label: (x, lang) => x.title?.[lang] || x.slug,
    fields: [
      { path: 'slug', type: 'text', label: L('URL slug', 'الرابط'), lockOnEdit: true },
      { path: 'title', type: 'i18n', label: L('Title', 'العنوان') },
      { path: 'body', type: 'i18nArea', rows: 12, label: L('Text (blank line = new paragraph)', 'النص') },
    ],
    blank: () => ({ slug: `page-${Date.now().toString(36)}`, title: { ar: '', en: '' }, body: { ar: '', en: '' } }),
  },
};

export const OBJECTS = {
  settings: {
    title: L('General settings', 'الإعدادات العامة'),
    fields: [
      { path: 'brand', type: 'i18n', label: L('Brand name', 'اسم البراند') },
      { path: 'tagline', type: 'i18n', label: L('Tagline', 'الشعار') },
      { path: 'phone', type: 'text', label: L('Phone', 'التليفون') },
      { path: 'whatsapp', type: 'text', label: L('WhatsApp number', 'رقم الواتساب') },
      { path: 'email', type: 'text', label: L('Email', 'الإيميل') },
      { path: 'social.instagram', type: 'text', label: L('Instagram URL', 'إنستجرام') },
      { path: 'social.facebook', type: 'text', label: L('Facebook URL', 'فيسبوك') },
      { path: 'social.tiktok', type: 'text', label: L('TikTok URL', 'تيك توك') },
      { path: 'currency', type: 'i18n', label: L('Currency label', 'العملة') },
      { path: 'payment.instapay', type: 'text', label: L('InstaPay address (IPA)', 'عنوان إنستاباي') },
      { path: 'payment.wallet', type: 'text', label: L('Mobile wallet number', 'رقم المحفظة') },
      { path: 'payment.walletName', type: 'i18n', label: L('Wallet name', 'اسم المحفظة') },
      { path: 'demoNotice', type: 'bool', label: L('Show "demo site" banner', 'إظهار شريط الموقع التجريبي') },
      { path: 'loyalty.pointsPer100', type: 'number', label: L('Points per 100 EGP', 'نقاط لكل 100 ج.م') },
      { path: 'loyalty.redeemPoints', type: 'number', label: L('Points for a free wash', 'نقاط الغسلة المجانية') },
      { path: 'loyalty.rewardPackageId', type: 'select', optionsFrom: 'packages', label: L('Free wash package', 'باقة الغسلة المجانية') },
    ],
  },
  bookingRules: {
    title: L('Slot rules', 'قواعد المواعيد'),
    root: 'settings',
    fields: [
      { path: 'booking.slotStep', type: 'number', label: L('Slot length (min)', 'طول الميعاد (دقيقة)') },
      { path: 'booking.leadMinutes', type: 'number', label: L('Earliest booking from now (min)', 'أقل وقت قبل الحجز (دقيقة)') },
      { path: 'booking.maxDaysAhead', type: 'number', label: L('Book up to (days ahead)', 'الحجز حتى (يوم)') },
      { path: 'booking.cancelHours', type: 'number', label: L('Free cancel until (hours before)', 'الإلغاء المجاني حتى (ساعة قبل)') },
      { path: 'booking.quiet.days', type: 'weekdays', label: L('Quiet-hour days', 'أيام الأوقات الهادية') },
      { path: 'booking.quiet.from', type: 'time', label: L('Quiet hours from', 'من') },
      { path: 'booking.quiet.to', type: 'time', label: L('Quiet hours to', 'إلى') },
      { path: 'booking.quiet.percent', type: 'number', label: L('Quiet-hour discount (%)', 'خصم الأوقات الهادية (%)') },
    ],
  },
  reminders: {
    title: L('Reminder timing', 'توقيت التذكير'),
    root: 'settings',
    fields: [
      { path: 'reminders.firstHours', type: 'number', label: L('First reminder (hours before)', 'التذكير الأول (ساعة قبل)') },
      { path: 'reminders.secondHours', type: 'number', label: L('Second reminder (hours before)', 'التذكير الثاني (ساعة قبل)') },
    ],
  },
  home: {
    title: L('Home page', 'الصفحة الرئيسية'),
    fields: [
      { path: 'heroTitle', type: 'i18n', label: L('Hero headline', 'العنوان الرئيسي') },
      { path: 'heroSub', type: 'i18n', label: L('Hero subtitle', 'العنوان الفرعي') },
      { path: 'heroText', type: 'i18nArea', label: L('Hero text', 'نص الافتتاحية') },
      { path: 'features', type: 'steps', label: L('Hero feature row', 'مزايا أسفل الافتتاحية') },
      { path: 'howTitle', type: 'i18n', label: L('"How dry ice works" title', 'عنوان طريقة العمل') },
      { path: 'howSteps', type: 'steps', label: L('Steps', 'الخطوات') },
      { path: 'pricingTitle', type: 'i18n', label: L('Packages title', 'عنوان الباقات') },
      { path: 'servicesTitle', type: 'i18n', label: L('Services title', 'عنوان الخدمات') },
      { path: 'galleryTitle', type: 'i18n', label: L('Gallery title', 'عنوان المعرض') },
      { path: 'reviewsTitle', type: 'i18n', label: L('Reviews title', 'عنوان الآراء') },
      { path: 'locationsTitle', type: 'i18n', label: L('Branches title', 'عنوان الفروع') },
      { path: 'ctaTitle', type: 'i18n', label: L('Closing headline', 'العنوان الختامي') },
      { path: 'ctaText', type: 'i18n', label: L('Closing text', 'النص الختامي') },
    ],
  },
  about: {
    title: L('About page', 'صفحة من نحن'),
    fields: [
      { path: 'storyTitle', type: 'i18n', label: L('Story title', 'عنوان القصة') },
      { path: 'story', type: 'i18nArea', rows: 8, label: L('Story', 'القصة') },
      { path: 'ecoTitle', type: 'i18n', label: L('Eco title', 'عنوان البيئة') },
      { path: 'eco', type: 'i18nArea', label: L('Eco & water care', 'الماء والبيئة') },
      { path: 'guaranteeTitle', type: 'i18n', label: L('Guarantee title', 'عنوان الضمان') },
      { path: 'guarantee', type: 'i18nArea', label: L('Guarantee', 'الضمان') },
      { path: 'careersTitle', type: 'i18n', label: L('Careers title', 'عنوان الوظائف') },
      { path: 'careersText', type: 'i18nArea', label: L('Careers intro', 'مقدمة الوظائف') },
    ],
  },
  brief: {
    title: L('Project brief', 'ملف المشروع'),
    fields: [
      { path: 'goals', type: 'steps', label: L('Business goals', 'أهداف البيزنس') },
      { path: 'audiences', type: 'steps', label: L('Who uses it', 'مين بيستخدمه') },
      { path: 'moscow.must', type: 'i18nList', label: L('Must have', 'أساسي') },
      { path: 'moscow.should', type: 'i18nList', label: L('Should have', 'مهم') },
      { path: 'moscow.could', type: 'i18nList', label: L('Could have', 'إضافي') },
      { path: 'moscow.wont', type: 'i18nList', label: L("Won't have (v1)", 'مش في النسخة الأولى') },
    ],
  },
};

export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), obj);
}

export function setPath(obj, path, value) {
  const keys = path.split('.');
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = copy;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    cur[k] = cur[k] && typeof cur[k] === 'object' ? (Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] }) : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return copy;
}
