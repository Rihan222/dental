import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, Check, ChevronDown, Menu, Minus, Plus, Quote, Star, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useLocation } from 'wouter';
import AdminApp from './admin/AdminApp';
import { createAppointment } from './lib/appointments';
import { supabaseConfigured } from './lib/supabase';
import { clinic, whatsappUrl } from './config/clinic';

type Lang = 'ar' | 'en';
const copy = {
  ar: {
    nav: ['الرئيسية', 'العيادة', 'أطباؤنا', 'علاجاتنا', 'تجارب المرضى'],
    book: 'احجز استشارة', heroEyebrow: 'عناية بالأسنان، برؤية مختلفة',
    heroTitle: <>ابتسامتك…<br />فنّ من التفاصيل.</>,
    heroBody: 'نؤمن أن جمال الابتسامة يبدأ من العناية الدقيقة، والخبرة الطبية، والتجربة التي تستحقها.',
    discover: 'اكتشف عالمنا', aboutEyebrow: 'فلسفتنا', aboutTitle: <>العناية التي<br />تبدأ بالاهتمام.</>,
    aboutText: 'في نور، نرى طب الأسنان مساحةً يلتقي فيها العلم بالذوق الرفيع. نصغي أولاً، ثم نصمم رحلة عناية تراعي احتياجات كل شخص، وتمنح التفاصيل الصغيرة ما تستحقه من اهتمام. من التقنيات الحديثة إلى لحظة الاسترخاء في العيادة، غايتنا تجربة هادئة ونتائج طبيعية تعكس ابتسامتك كما هي.',
    aboutNote: 'مساحة صُممت لتشعري بالطمأنينة.', doctorsEyebrow: 'خبرة تلتقي بالإنسانية',
    doctorsTitle: 'أطباؤنا', doctorsIntro: 'فريق متعدد التخصصات، يجمع بين المعرفة الطبية والإنصات الحقيقي.',
    treatmentsEyebrow: 'رعاية متكاملة', treatmentsTitle: 'علاجاتنا',
    treatmentsIntro: 'خطط مدروسة تبدأ من احتياجك، وتُبنى معك خطوة بخطوة.',
    chooseEyebrow: 'لماذا نور؟', chooseTitle: 'الجودة ليست خياراً، بل معيارنا.',
    chooseItems: ['فريق طبي بخبرات متنوعة', 'تقنيات حديثة في طب الأسنان', 'اهتمام بالتعقيم والسلامة', 'خطط علاجية تراعي احتياجات كل مريض'],
    testimonialsEyebrow: 'تجارب تُروى', testimonialsTitle: 'كلمات عن التجربة',
    sample: 'محتوى تجريبي — ليس مراجعة حقيقية أو موثقة',
    rating: 'تقييم تجريبي بخمس نجوم',
    faqEyebrow: 'إجابات بهدوء', faqTitle: 'أسئلة متكررة',
    bookingEyebrow: 'موعدك يبدأ بخطوة', bookingTitle: 'خطوتك الأولى نحو ابتسامة أجمل.',
    bookingText: 'أرسلي طلبك وسنساعدك في متابعة التفاصيل. إرسال الطلب لا يعني تأكيد الموعد.',
    name: 'الاسم الكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني (اختياري)',
    treatment: 'نوع العلاج', date: 'التاريخ المفضل', notes: 'ملاحظات إضافية (اختياري)',
    selectTreatment: 'اختاري العلاج', submit: 'إرسال طلب الموعد',
    contactEyebrow: 'تواصلي معنا', contactTitle: 'نحن هنا لنستمع.',
    contactText: 'للاستفسار أو معرفة المزيد عن العيادة، يسعدنا تواصلك.',
    address: 'العنوان', hours: 'ساعات العمل', emailLabel: 'البريد الإلكتروني',
    mapPlaceholder: 'خريطة الموقع', mapNote: 'تُضاف تفاصيل الموقع عند اعتماد العنوان',
    footerLine: 'عناية دقيقة. تجربة تستحقها.', quickLinks: 'روابط سريعة',
    contact: 'التواصل', rights: 'جميع الحقوق محفوظة.',
    whatsapp: 'تواصلي عبر واتساب', prev: 'السابق', next: 'التالي',
    errors: {
      name: 'يرجى إدخال الاسم الكامل.', phone: 'يرجى إدخال رقم هاتف صحيح.',
      email: 'يرجى إدخال بريد إلكتروني صحيح.', treatment: 'يرجى اختيار نوع العلاج.',
      date: 'يرجى اختيار تاريخ اليوم أو تاريخ لاحق.',
      success: 'تم حفظ طلبك بنجاح. ستتواصل معك العيادة لتأكيد الموعد.',
      failure: 'تعذر حفظ طلبك. يرجى المحاولة لاحقاً أو التواصل مع العيادة مباشرة.',
      notConfigured: 'الحجز الإلكتروني غير متاح حالياً. يرجى التواصل مع العيادة مباشرة.',
      submitting: 'جارٍ إرسال الطلب…',
    },
  },
  en: {
    nav: ['Home', 'The atelier', 'Our doctors', 'Treatments', 'Patient stories'],
    book: 'Request a visit', heroEyebrow: 'Dental care, thoughtfully considered',
    heroTitle: <>Your smile,<br />an art of detail.</>,
    heroBody: 'We believe a beautiful smile begins with attentive care, clinical expertise, and an experience worthy of you.',
    discover: 'Discover the atelier', aboutEyebrow: 'Our philosophy', aboutTitle: <>Care that<br />begins with care.</>,
    aboutText: 'At Noor, dentistry is where science meets considered design. We listen first, then shape a care journey around each person and give small details the attention they deserve. From modern techniques to a moment of ease in the clinic, our aim is a calm experience and natural results that feel like you.',
    aboutNote: 'A space designed to put you at ease.', doctorsEyebrow: 'Expertise, with humanity',
    doctorsTitle: 'Meet the doctors', doctorsIntro: 'A multidisciplinary team bringing together clinical knowledge and genuine listening.',
    treatmentsEyebrow: 'Thoughtful, complete care', treatmentsTitle: 'Treatments',
    treatmentsIntro: 'Considered plans begin with your needs and take shape together, one step at a time.',
    chooseEyebrow: 'Why Noor', chooseTitle: 'Quality is not an option. It is our standard.',
    chooseItems: ['A team with complementary expertise', 'Modern dental technology', 'Attention to hygiene and safety', 'Care plans shaped around each patient'],
    testimonialsEyebrow: 'Stories of care', testimonialsTitle: 'A note on the experience',
    sample: 'Sample content — not a real or verified review',
    rating: 'Sample five-star rating',
    faqEyebrow: 'A few answers', faqTitle: 'Frequently asked',
    bookingEyebrow: 'Begin with a conversation', bookingTitle: 'Your first step to a more confident smile.',
    bookingText: 'Send a request and we will help with the next steps. A request does not confirm an appointment.',
    name: 'Full name', phone: 'Phone number', email: 'Email (optional)',
    treatment: 'Treatment', date: 'Preferred date', notes: 'Additional notes (optional)',
    selectTreatment: 'Select a treatment', submit: 'Submit appointment request',
    contactEyebrow: 'Get in touch', contactTitle: 'We are here to listen.',
    contactText: 'For questions or to learn more about the atelier, we would be glad to hear from you.',
    address: 'Address', hours: 'Working hours', emailLabel: 'Email',
    mapPlaceholder: 'Location map', mapNote: 'Location details will be added once confirmed',
    footerLine: 'Attentive care. An experience worthy of you.', quickLinks: 'Explore',
    contact: 'Contact', rights: 'All rights reserved.',
    whatsapp: 'Contact via WhatsApp', prev: 'Previous', next: 'Next',
    errors: {
      name: 'Please enter your full name.', phone: 'Please enter a valid phone number.',
      email: 'Please enter a valid email address.', treatment: 'Please select a treatment.',
      date: 'Please choose today or a future date.',
      success: 'Your request was saved. The clinic will contact you to confirm the appointment.',
      failure: 'Your request could not be saved. Please try again or contact the clinic directly.',
      notConfigured: 'Online booking is not available yet. Please contact the clinic directly.',
      submitting: 'Sending request…',
    },
  },
} as const;

const doctors = [
  { name: 'Dr. Ahmad Hassan', ar: 'د. أحمد حسن', specialty: 'General Dentistry', arSpec: 'طب الأسنان العام', bio: 'Focused on considered, patient-centred care and the foundations of long-term oral health.', arBio: 'يهتم بالرعاية المتأنية التي تضع المريض أولاً وبأساسيات صحة الفم على المدى الطويل.' },
  { name: 'Dr. Sarah Mohammed', ar: 'د. سارة محمد', specialty: 'Orthodontics', arSpec: 'تقويم الأسنان', bio: 'Guides orthodontic journeys with a thoughtful approach to function, comfort and confidence.', arBio: 'ترافق رحلات تقويم الأسنان باهتمام بالوظيفة والراحة والثقة.' },
  { name: 'Dr. Omar Khaled', ar: 'د. عمر خالد', specialty: 'Dental Implants', arSpec: 'زراعة الأسنان', bio: 'Works with patients to explore restorative options and create clear, individual care plans.', arBio: 'يعمل مع المرضى لاستكشاف خيارات الترميم ووضع خطط عناية واضحة ومخصصة.' },
  { name: 'Dr. Lina Ibrahim', ar: 'د. لينا إبراهيم', specialty: 'Pediatric Dentistry', arSpec: 'طب أسنان الأطفال', bio: 'Creates a gentle, reassuring environment for young patients and their families.', arBio: 'توفر أجواء لطيفة ومطمئنة للأطفال وعائلاتهم خلال الزيارة.' },
  { name: 'Dr. Youssef Ali', ar: 'د. يوسف علي', specialty: 'Endodontics', arSpec: 'علاج الجذور', bio: 'Takes a careful, detail-led approach to preserving natural teeth whenever appropriate.', arBio: 'يتبع نهجاً دقيقاً للحفاظ على الأسنان الطبيعية متى كان ذلك مناسباً.' },
  { name: 'Dr. Mariam Saleh', ar: 'د. مريم صالح', specialty: 'Cosmetic Dentistry', arSpec: 'طب الأسنان التجميلي', bio: 'Brings a balanced eye to cosmetic planning, with an emphasis on natural-looking outcomes.', arBio: 'توازن بين الرؤية الجمالية والتخطيط المدروس مع التركيز على النتائج الطبيعية.' },
];
const doctorImages = [
  '/images/doctors/ahmad.jpg',
  '/images/doctors/sarah.jpg',
  '/images/doctors/omar.jpg',
  '/images/doctors/lina.jpg',
  '/images/doctors/youssef.jpg',
  '/images/doctors/portrait-editorial.jpg',
];
const treatments = [
  ['Restorative & Cosmetic Dentistry', 'ترميم وتجميل الأسنان', 'A considered approach to restoring form, function and a natural appearance.', 'رعاية مدروسة لاستعادة الشكل والوظيفة والمظهر الطبيعي.'],
  ['Orthodontics', 'تقويم الأسنان', 'Options to help align teeth and support a balanced bite.', 'خيارات للمساعدة في ترتيب الأسنان ودعم إطباق متوازن.'],
  ['Dental Implants', 'زراعة الأسنان', 'Personalised assessment and planning for tooth replacement.', 'تقييم وتخطيط مخصص لتعويض الأسنان.'],
  ['Professional Cleaning', 'تنظيف الأسنان', 'A professional clean to support everyday oral hygiene.', 'تنظيف احترافي لدعم روتين العناية اليومي بالفم.'],
  ['Pediatric Dentistry', 'طب أسنان الأطفال', 'Gentle dental care tailored to children and their families.', 'رعاية لطيفة مصممة للأطفال وعائلاتهم.'],
  ['Nitrous Oxide Sedation', 'الغاز الضاحك (النيتروس)', 'A conversation about comfort options during selected treatments.', 'استشارة حول خيارات الراحة خلال بعض العلاجات.'],
  ['Root Canal Treatment', 'علاج الجذور', 'Care focused on treating the inside of a tooth and preserving it.', 'علاج يركز على لب السن للمساعدة في الحفاظ عليه.'],
  ['Dental Fillings', 'حشوات الأسنان', 'Repairing a tooth affected by decay or minor damage.', 'ترميم الأسنان المتأثرة بالتسوس أو التلف البسيط.'],
  ['Teeth Whitening', 'تبييض الأسنان', 'Discussing suitable whitening options for your individual needs.', 'مناقشة خيارات التبييض الملائمة لاحتياجاتك.'],
  ['Dental Crowns & Bridges', 'تركيب الأسنان', 'Restorative options planned to support strength and appearance.', 'خيارات ترميمية مدروسة لدعم المتانة والمظهر.'],
];
const faqs = [
  ['هل يجب حجز موعد مسبق؟', 'نعم، يُفضّل التواصل مسبقاً لطلب موعد ومساعدتنا في ترتيب وقت مناسب. إرسال الطلب لا يعني تأكيد الموعد.', 'Should I book an appointment in advance?', 'We recommend contacting us in advance so we can help arrange a suitable time. A request does not confirm an appointment.'],
  ['هل تقدم العيادة استشارات أولية؟', 'يمكنك إرسال استفسارك لنتحدث عن احتياجاتك والخطوة المناسبة التالية.', 'Do you offer initial consultations?', 'Send us an enquiry and we can discuss your needs and an appropriate next step.'],
  ['هل تبييض الأسنان آمن؟', 'تعتمد الملاءمة على حالة الأسنان واللثة. يحدد الطبيب الخيار المناسب بعد التقييم، ولا تناسب كل الطرق الجميع.', 'Is teeth whitening safe?', 'Suitability depends on your teeth and gums. A clinician can recommend an option after an assessment; not every approach suits everyone.'],
  ['هل علاج الجذور مؤلم؟', 'تُجرى المعالجة باستخدام التخدير الموضعي عند الحاجة. تختلف التجربة من شخص لآخر، ويمكن للطبيب شرح الخيارات قبل البدء.', 'Is root canal treatment painful?', 'Local anaesthesia is used when appropriate. Experiences vary, and your clinician can explain options before treatment.'],
  ['ما المدة اللازمة لتقويم الأسنان؟', 'تختلف المدة بحسب الحالة والخطة العلاجية. يقدّم الطبيب تقديراً بعد الفحص ومناقشة الخيارات.', 'How long does orthodontic treatment take?', 'Timing varies by case and treatment plan. Your clinician can offer an estimate after an examination and discussion.'],
  ['هل تستقبل العيادة الأطفال؟', 'نعم، تشمل قائمة العلاجات طب أسنان الأطفال، مع مراعاة احتياجات الطفل وراحته.', 'Does the clinic see children?', 'Yes. Pediatric dentistry is among the listed treatments, with attention to each child’s needs and comfort.'],
  ['ما طرق الدفع المتاحة؟', 'تُشارك تفاصيل الدفع عند التواصل مع العيادة. يرجى السؤال عن الخيارات المتاحة قبل موعدك.', 'Which payment methods are available?', 'Payment details can be shared when you contact the clinic. Please ask about available options before your visit.'],
];
const testimonials = [
  { name: 'سارة — اسم تجريبي', enName: 'Sara — sample name', ar: 'أحببت أن الفريق أخذ وقته ليستمع إلى أسئلتي، وشعرت أن الخطة واضحة منذ البداية.', en: 'I appreciated that the team took time to listen to my questions. The plan felt clear from the beginning.', treatment: 'تقويم الأسنان', enTreatment: 'Orthodontics' },
  { name: 'ليلى — اسم تجريبي', enName: 'Layla — sample name', ar: 'كانت الزيارة هادئة ومريحة، وشرح الطبيب كل خطوة بطريقة بسيطة.', en: 'The visit felt calm and comfortable, and the doctor explained each step in a simple way.', treatment: 'تنظيف الأسنان', enTreatment: 'Professional cleaning' },
  { name: 'عمر — اسم تجريبي', enName: 'Omar — sample name', ar: 'أقدّر الاهتمام بالتفاصيل والوقت الذي خُصص لمناقشة الخيارات المتاحة.', en: 'I valued the attention to detail and the time given to discuss the available options.', treatment: 'استشارة أولية', enTreatment: 'Initial consultation' },
];

function PublicSite() {
  const [lang, setLang] = useState<Lang>(() => localStorage.getItem('noor-language') === 'en' ? 'en' : 'ar');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = copy[lang];
  const rtl = lang === 'ar';
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const currentDate = new Date();
  const minimumAppointmentDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    localStorage.setItem('noor-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.body.dir = rtl ? 'rtl' : 'ltr';
    document.title = rtl ? 'نور — أتيليه طب الأسنان | عناية دقيقة' : 'Noor Dental Atelier | Thoughtful Dental Care';
    const description = rtl
      ? 'نور — أتيليه طب الأسنان. رعاية سنية متأنية، بخبرة طبية وتجربة هادئة.'
      : 'Noor Dental Atelier. Thoughtful dental care, clinical expertise and a considered experience.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [lang, rtl]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const openWhatsApp = () => window.open(whatsappUrl(rtl ? 'مرحباً، أود الاستفسار عن عيادة نور لطب الأسنان.' : 'Hello, I would like to enquire about Noor Dental Atelier.'), '_blank', 'noopener,noreferrer');

  const handleBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const treatment = String(form.get('treatment') ?? '');
    const date = String(form.get('date') ?? '');
    const notes = String(form.get('notes') ?? '').trim();
    const phoneValid = /^\+?[\d\s()\-]{7,20}$/.test(phone);
    const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const today = new Date();
    const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (name.length < 2) return setFeedback({ type: 'error', text: t.errors.name });
    if (!phoneValid) return setFeedback({ type: 'error', text: t.errors.phone });
    if (!emailValid) return setFeedback({ type: 'error', text: t.errors.email });
    if (!treatment) return setFeedback({ type: 'error', text: t.errors.treatment });
    if (!date || date < todayLocal) return setFeedback({ type: 'error', text: t.errors.date });
    if (name.length > 160 || phone.length > 32 || email.length > 254 || treatment.length > 160 || notes.length > 2000) {
      return setFeedback({ type: 'error', text: t.errors.failure });
    }
    if (!supabaseConfigured) return setFeedback({ type: 'error', text: t.errors.notConfigured });
    if (submitting) return;

    setSubmitting(true);
    try {
      await createAppointment({
        patient_name: name,
        phone,
        email: email || null,
        service: treatment,
        appointment_date: date,
        notes: notes || null,
      });
      setFeedback({ type: 'success', text: t.errors.success });
      formElement.reset();
    } catch (error) {
      console.error('Appointment request could not be saved:', error);
      setFeedback({ type: 'error', text: t.errors.failure });
    } finally {
      setSubmitting(false);
    }
  };

  const sectionNav = ['home', 'about', 'doctors', 'treatments', 'testimonials'];
  return (
    <div className="grain min-h-screen overflow-hidden">
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <nav className="nav-inner container-editorial" aria-label={rtl ? 'التنقل الرئيسي' : 'Main navigation'}>
          <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); linkTo('home'); }} aria-label={clinic.name}>
            <span className="brand-mark">N</span><span className="brand-name"><strong>{rtl ? 'نور' : 'NOOR'}</strong><small>{rtl ? 'أتيليه طب الأسنان' : 'DENTAL ATELIER'}</small></span>
          </a>
          <div className="desktop-links">{t.nav.map((label, i) => <a key={label} href={`#${sectionNav[i]}`} onClick={(e) => { e.preventDefault(); linkTo(sectionNav[i]); }}>{label}</a>)}</div>
          <div className="nav-actions">
            <button className="lang-toggle" data-testid="button-language" onClick={() => setLang(rtl ? 'en' : 'ar')} aria-label={rtl ? 'Switch to English' : 'التبديل إلى العربية'}>{rtl ? 'EN' : 'عربي'}</button>
            <button className="nav-book" onClick={() => linkTo('appointment')}>{t.book}<Arrow size={14} /></button>
            <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </nav>
        {menuOpen && <div className="mobile-menu menu-panel">{t.nav.map((label, i) => <a key={label} href={`#${sectionNav[i]}`} onClick={(e) => { e.preventDefault(); linkTo(sectionNav[i]); }}>{label}<Arrow size={15} /></a>)}<button onClick={() => linkTo('appointment')}>{t.book}<Arrow size={15} /></button></div>}
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-image image-frame"><img src="/images/hero/atelier.jpg" alt={rtl ? 'مساحة استقبال هادئة في عيادة نور' : 'A calm reception space at Noor Dental Atelier'} width="1500" height="1100" fetchPriority="high" /></div>
          <div className="hero-wash" />
          <div className="hero-copy container-editorial">
            <div className="hero-text reveal"><p className="eyebrow">{t.heroEyebrow}</p><h1>{t.heroTitle}</h1><span className="gold-rule" /><p className="hero-description">{t.heroBody}</p><div className="hero-buttons"><button className="button-primary" onClick={() => linkTo('about')}>{t.discover}<Arrow size={15} /></button><button className="button-outline" onClick={() => linkTo('appointment')}>{t.book}<ArrowUpLeft size={15} /></button></div></div>
          </div>
          <div className="hero-side-label">{rtl ? 'عناية دقيقة • منذ البداية' : 'EXCELLENCE IN DENTAL CARE'}</div>
          <button className="scroll-cue" aria-label={rtl ? 'انتقل إلى القسم التالي' : 'Scroll to next section'} onClick={() => linkTo('about')}><ArrowDown size={15} /> <span>{rtl ? 'اكتشفي' : 'DISCOVER'}</span></button>
        </section>

        <section id="about" className="about-section section-pad container-editorial">
          <div className="about-copy"><p className="eyebrow">{t.aboutEyebrow}</p><h2 className="section-title">{t.aboutTitle}</h2><span className="gold-rule" /><p className="body-copy">{t.aboutText}</p><p className="signature">{rtl ? 'نور' : 'Noor'}<span>{rtl ? 'عناية تبدأ بالإنصات' : 'care begins with listening'}</span></p></div>
          <div className="about-visual"><div className="about-main image-frame"><img src="/images/hero/atelier.jpg" alt={rtl ? 'تفاصيل هادئة من مساحة العيادة' : 'Quiet details of the clinic interior'} width="840" height="980" loading="lazy" /></div><div className="about-inset image-frame"><div className="placeholder-art"><span>NOOR</span></div></div><p className="image-caption">{t.aboutNote}</p></div>
          <div className="about-index">01 <i /> PHILOSOPHY</div>
        </section>

        <section id="doctors" className="doctors-section section-pad">
          <div className="container-editorial"><div className="section-heading-row"><div><p className="eyebrow">{t.doctorsEyebrow}</p><h2 className="section-title">{t.doctorsTitle}</h2></div><p className="section-intro">{t.doctorsIntro}</p></div>
            <div className="doctor-list">{doctors.map((doctor, i) => <article className={`doctor-row ${i % 2 ? 'reverse' : ''}`} key={doctor.name}>
              <div className="doctor-photo image-frame"><img src={doctorImages[i]} alt={rtl ? `صورة تعريفية تجريبية للطبيب ${doctor.ar}` : `Sample portrait of ${doctor.name}`} width="620" height="720" loading="lazy" /><span className="doctor-number">0{i + 1}</span></div>
              <div className="doctor-copy"><span className="doctor-kicker">{rtl ? `طبيب / ${String(i + 1).padStart(2, '0')}` : `DOCTOR / ${String(i + 1).padStart(2, '0')}`}</span><h3>{rtl ? doctor.ar : doctor.name}</h3><p className="doctor-specialty">{rtl ? doctor.arSpec : doctor.specialty}</p><span className="gold-rule" /><p>{rtl ? doctor.arBio : doctor.bio}</p></div>
            </article>)}</div>
          </div>
        </section>

        <section id="treatments" className="treatments-section section-pad container-editorial">
          <div className="treatment-heading"><div><p className="eyebrow">{t.treatmentsEyebrow}</p><h2 className="section-title">{t.treatmentsTitle}</h2></div><p className="section-intro">{t.treatmentsIntro}</p></div>
          <div className="treatment-list">{treatments.map((row, i) => <button className="treatment-row" key={row[0]} onClick={() => { const field = document.querySelector<HTMLSelectElement>('#booking-treatment'); if (field) field.value = row[rtl ? 1 : 0]; linkTo('appointment'); }}>
            <span className="treatment-no">{String(i + 1).padStart(2, '0')}</span><span className="treatment-name">{row[rtl ? 1 : 0]}</span><span className="treatment-desc">{row[rtl ? 3 : 2]}</span><span className="treatment-arrow"><Arrow size={17} /></span>
          </button>)}</div>
        </section>

        <section className="difference-section section-pad">
          <div className="container-editorial difference-inner"><div><p className="eyebrow">{t.chooseEyebrow}</p><h2 className="section-title">{t.chooseTitle}</h2></div><div className="difference-list">{t.chooseItems.map((item, i) => <div className="difference-item" key={item}><span>0{i + 1}</span><p>{item}</p><Check size={16} /></div>)}</div><div className="difference-seal">N<span>•</span>A</div></div>
        </section>

        <section id="testimonials" className="testimonials-section section-pad container-editorial">
          <div className="testimonial-head"><div><p className="eyebrow">{t.testimonialsEyebrow}</p><h2 className="section-title">{t.testimonialsTitle}</h2></div><p className="sample-label">{t.sample}</p></div>
          <div className="testimonial-content" aria-live="polite"><Quote className="quote-mark" size={50} strokeWidth={1} /><div className="quote-copy"><div className="quote-rating" role="img" aria-label={t.rating}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" />)}</div><p>“{rtl ? testimonials[testimonialIndex].ar : testimonials[testimonialIndex].en}”</p><div className="quote-meta"><strong>{rtl ? testimonials[testimonialIndex].name : testimonials[testimonialIndex].enName}</strong><span>{rtl ? testimonials[testimonialIndex].treatment : testimonials[testimonialIndex].enTreatment}</span></div></div>
            <div className="carousel-controls"><button aria-label={t.prev} onClick={() => setTestimonialIndex((testimonialIndex + testimonials.length - 1) % testimonials.length)}><ArrowLeft size={18} /></button><span>0{testimonialIndex + 1}<i />0{testimonials.length}</span><button aria-label={t.next} onClick={() => setTestimonialIndex((testimonialIndex + 1) % testimonials.length)}><ArrowRight size={18} /></button></div>
          </div>
        </section>

        <section className="faq-section section-pad">
          <div className="container-editorial faq-layout"><div className="faq-heading"><p className="eyebrow">{t.faqEyebrow}</p><h2 className="section-title">{t.faqTitle}</h2><p>{rtl ? 'إجابات واضحة تساعدك على اتخاذ الخطوة التالية.' : 'Clear answers to help you consider your next step.'}</p></div><div className="faq-list">{faqs.map((faq, i) => <article key={faq[0]} className="faq-item"><button aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span className="faq-number">0{i + 1}</span><span>{rtl ? faq[0] : faq[2]}</span>{faqOpen === i ? <Minus size={17} /> : <Plus size={17} />}</button><div className={`faq-answer ${faqOpen === i ? 'open' : ''}`}><div><p>{rtl ? faq[1] : faq[3]}</p></div></div></article>)}</div></div>
        </section>

        <section id="appointment" className="appointment-section section-pad">
          <div className="container-editorial booking-layout"><div className="booking-intro"><p className="eyebrow">{t.bookingEyebrow}</p><h2 className="section-title">{t.bookingTitle}</h2><span className="gold-rule" /><p>{t.bookingText}</p><div className="booking-caption"><span>01</span><i />{rtl ? 'طلب موعد أولي' : 'INITIAL VISIT REQUEST'}</div></div>
            <form className="booking-form" onSubmit={handleBooking} noValidate>
              <div className="form-grid"><label>{t.name}<input name="name" autoComplete="name" required minLength={2} maxLength={160} data-testid="input-name" /></label><label>{t.phone}<input name="phone" type="tel" autoComplete="tel" required maxLength={32} data-testid="input-phone" /></label><label>{t.email}<input name="email" type="email" autoComplete="email" maxLength={254} data-testid="input-email" /></label>
                <label>{t.treatment}<span className="select-wrap"><select id="booking-treatment" name="treatment" defaultValue="" required data-testid="select-treatment"><option value="" disabled>{t.selectTreatment}</option>{treatments.map((item) => <option key={item[0]} value={item[rtl ? 1 : 0]}>{item[rtl ? 1 : 0]}</option>)}</select><ChevronDown size={15} /></span></label>
                <label>{t.date}<input name="date" type="date" min={minimumAppointmentDate} required data-testid="input-date" /></label>
                <label className="notes-field">{t.notes}<textarea name="notes" rows={2} maxLength={2000} data-testid="input-notes" /></label></div>
              {feedback && <p className={`form-feedback ${feedback.type}`} role="status" aria-live="polite">{feedback.text}</p>}
              <button className="button-primary form-submit" type="submit" disabled={submitting} data-testid="button-submit-booking">{submitting ? t.errors.submitting : t.submit}<Arrow size={16} /></button>
              <p className="privacy-note">{rtl ? 'سيُحفظ طلب الموعد بأمان لدى العيادة، وسيتم التواصل معك لتأكيد التفاصيل.' : 'Your appointment request is saved securely for the clinic; the team will contact you to confirm details.'}</p>
            </form>
          </div>
        </section>

        <section id="contact" className="contact-section section-pad container-editorial">
          <div className="contact-copy"><p className="eyebrow">{t.contactEyebrow}</p><h2 className="section-title">{t.contactTitle}</h2><p className="section-intro">{t.contactText}</p>
            <dl className="contact-details"><div><dt>{t.address}</dt><dd>{clinic.address || (rtl ? 'يُضاف العنوان عند اعتماده' : 'Address to be confirmed')}</dd></div><div><dt>{t.phone}</dt><dd>{clinic.phone || (rtl ? 'يُضاف رقم الهاتف' : 'Phone number to be added')}</dd></div><div><dt>{t.emailLabel}</dt><dd>{clinic.email || (rtl ? 'يُضاف البريد الإلكتروني' : 'Email to be added')}</dd></div><div><dt>{t.hours}</dt><dd>{clinic.workingHours || (rtl ? 'تُضاف ساعات العمل' : 'Hours to be confirmed')}</dd></div></dl>
            <button className="text-link" onClick={openWhatsApp}>{t.whatsapp}<Arrow size={15} /></button>
          </div>
          <div className="map-placeholder"><div className="map-grid"><span className="map-pin">N</span><i className="map-path path-a" /><i className="map-path path-b" /><i className="map-path path-c" /><span className="map-coord">LOCATION / NOOR</span></div><div className="map-caption"><span>{t.mapPlaceholder}</span><small>{t.mapNote}</small></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-editorial footer-main"><div className="footer-brand"><a className="brand footer-logo" href="#home" onClick={(e) => { e.preventDefault(); linkTo('home'); }}><span className="brand-mark">N</span><span className="brand-name"><strong>{rtl ? 'نور' : 'NOOR'}</strong><small>{rtl ? 'أتيليه طب الأسنان' : 'DENTAL ATELIER'}</small></span></a><p>{t.footerLine}</p><div className="social-links">{[['Instagram', clinic.social.instagram], ['Facebook', clinic.social.facebook], ['LinkedIn', clinic.social.linkedin]].map(([label, href]) => <a key={label} href={href || '#contact'} onClick={href ? undefined : (e) => { e.preventDefault(); linkTo('contact'); }} aria-label={label}>{label}</a>)}</div></div>
          <div className="footer-column"><h3>{t.quickLinks}</h3>{t.nav.map((label, i) => <a key={label} href={`#${sectionNav[i]}`} onClick={(e) => { e.preventDefault(); linkTo(sectionNav[i]); }}>{label}</a>)}</div>
          <div className="footer-column"><h3>{t.contact}</h3><a href="#contact" onClick={(e) => { e.preventDefault(); linkTo('contact'); }}>{clinic.address || (rtl ? 'العنوان يُحدد لاحقاً' : 'Address to be confirmed')}</a><a href="#contact" onClick={(e) => { e.preventDefault(); linkTo('contact'); }}>{clinic.phone || (rtl ? 'الهاتف يُضاف لاحقاً' : 'Phone to be added')}</a><button onClick={openWhatsApp}>{t.whatsapp}<ArrowUpLeft size={13} /></button></div>
        </div><div className="container-editorial footer-bottom"><span>© {new Date().getFullYear()} {clinic.name}. {t.rights}</span><span>{rtl ? 'معلومات تعريفية تجريبية — تُراجع قبل النشر' : 'Fictional placeholder identity — review before publication'}</span><a href="#home" onClick={(e) => { e.preventDefault(); linkTo('home'); }}>{rtl ? 'العودة للأعلى' : 'Back to top'}<ArrowUpLeft size={13} /></a></div>
      </footer>
      <button className="floating-contact" onClick={openWhatsApp} aria-label={t.whatsapp} title={t.whatsapp}><span className="whatsapp-symbol"><SiWhatsapp aria-hidden="true" size={17} /></span><span>{t.whatsapp}</span></button>
    </div>
  );
}

function App() {
  const [path] = useLocation();
  return path === '/admin' || path.startsWith('/admin/')
    ? <AdminApp />
    : <PublicSite />;
}

export default App;
