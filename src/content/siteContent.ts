// Site-wide content and configuration
import type { PageContent } from './types'

// Image URLs - Easy to replace later with real photos
export const IMAGES = {
  global: {
    fallback: {
      src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
      alt: 'Farm landscape',
    },
  },
  pages: {
    home: {
      hero: {
        src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80',
        alt: 'Arka Acres farm landscape at sunrise',
      },
      goshala: {
        src: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
        alt: 'Cows in sanctuary at Arka Goshala',
      },
      stay: {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        alt: 'Peaceful farm accommodation',
      },
    },
    activities: {
      hero: {
        src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
        alt: 'Family visiting the farm',
      },
    },
    experiences: {
      hero: {
        src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
        alt: 'Visitors on the farm',
      },
      whatToBring: {
        src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
        alt: 'Farm visit essentials',
      },
      idealFor: {
        src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
        alt: 'All ages welcome at the farm',
      },
    },
    learn: {
      hero: {
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
        alt: 'Workshop participants learning',
      },
      gurukulam: {
        src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
        alt: 'Traditional learning approach',
      },
    },
    yoga: {
      hero: {
        src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
        alt: 'Yoga practice in nature',
      },
      whatToBring: {
        src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
        alt: 'Yoga essentials',
      },
      allLevels: {
        src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        alt: 'Inclusive yoga practice',
      },
    },
    summerCamps: {
      hero: {
        src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
        alt: 'Kids on the farm at summer camp',
      },
      skills: {
        src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
        alt: 'Kids learning and growing',
      },
      schedule: {
        src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
        alt: 'Daily camp activities',
      },
    },
    farming: {
      hero: {
        src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
        alt: 'Regenerative agriculture fields',
      },
      permaculture: {
        src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        alt: 'Sustainable ecosystems',
      },
      cowBased: {
        src: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
        alt: 'Traditional cow-based farming preparations',
      },
    },
    stay: {
      hero: {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
        alt: 'Stay at Arka Acres',
      },
      booking: {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        alt: 'Simple booking process',
      },
    },
  },
  units: {
    'the-white-house': {
      src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      alt: 'The White House - Spacious family home',
    },
    'aurora-grand': {
      src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
      alt: 'Aurora Grand event hall',
    },
    'red-roost': {
      src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      alt: 'Red Roost studio home above the barn',
    },
  },
} as const

export const SITE_CONFIG = {
  name: 'Arka Acres',
  tagline: 'A peaceful farm and community space where compassion meets sustainability.',
  description: 'Rooted in care, simplicity, and a deep connection with nature.',
  url: 'https://arkaacres.com',
  bookingEmail: 'bookings@arkaacres.com', // Placeholder
  donateUrl: '#',
  visitBookingUrl: '#', // Placeholder for activity bookings - set to real URL or keep '#' to use modal
  announcements: {
    enabled: false,
    message: '',
    link: '',
  },
}

// Visit request configuration
export const VISIT_CONFIG = {
  emailTo: 'arkaacres@gmail.com',
  smsTo: '+14695369020',
}

// Goshala URL constant
export const GOSHALA_URL = 'https://www.arkagoshala.org/'

// Single source of truth for navigation
export const NAV_ITEMS = [
  { href: '/', label: 'Home', external: false },
  { href: GOSHALA_URL, label: 'Goshala', external: true },
  { href: '/activities', label: 'Activities', external: false },
  { href: '/farming', label: 'Farming', external: false },
  { href: '/stay', label: 'Stay', external: false },
  { href: '/contact', label: 'Contact', external: false },
] as const

// Home Page Content
export const HOME_PAGE: PageContent = {
  title: 'Arka Acres',
  description: 'A peaceful farm where we care for the land, animals, and each other.',
  sections: [
    {
      type: 'hero',
      heading: 'Arka Acres',
      subheading: 'A peaceful farm where we care for the land, animals, and each other.',
      supportingText: 'Come visit, learn, or stay awhile. We\'re here to share what we\'ve learned about living simply and well.',
      primaryCta: { label: 'See What We Do', href: '/activities' },
      secondaryCta: { label: 'Book a Stay', href: '/stay' },
      imageLabel: IMAGES.pages.home.hero.alt,
      imageSrc: IMAGES.pages.home.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'stats',
      items: [
        { value: '12+', label: 'Farm Experiences', suffix: '+' },
        { value: '200+', label: 'Community Members', suffix: '+' },
        { value: '16', label: 'Acres of Nature', suffix: '' },
      ],
      backgroundColor: 'white',
    },
    {
      type: 'split',
      heading: 'Our Heart: Arka Goshala',
      body: 'Arka Goshala is our nonprofit sanctuary for cows (we call them Gomathas). When a cow needs help, we take them in and give them a home for life. That means good food, a safe place to live, and medical care when they need it. We also teach people about the connection between humans, animals, and the land—because it\'s all connected. (Seva just means selfless service, which is what we try to do every day.)',
      bullets: ['We rescue cows and give them a home for life', 'Each cow gets individual care', 'We teach visitors about animal care and farming'],
      cta: { label: 'Visit Arka Goshala', href: GOSHALA_URL, external: true },
      imageLabel: IMAGES.pages.home.goshala.alt,
      imageSrc: IMAGES.pages.home.goshala.src,
    },
    {
      type: 'featureGrid',
      heading: 'How We Farm',
      subtitle: 'We work with nature, not against it. Here\'s what that actually means.',
      items: [
        {
          title: 'Permaculture Basics',
          description: 'We design our farm like a natural ecosystem. Plants help each other, water flows where it should, and the soil gets better over time—not worse.',
          icon: 'Leaf',
        },
        {
          title: 'Traditional Cow-Based Farming',
          description: 'We use old methods like Jeevamrutham and Ganajeevamrutham (natural fertilizers made from cow dung and organic materials). They feed the soil without chemicals.',
          icon: 'Farm',
        },
        {
          title: 'Water & Wildlife',
          description: 'Every choice we make considers water, wildlife, and what happens next year—not just this season.',
          icon: 'Sparkles',
        },
      ],
      cta: { label: 'Learn More About Our Farming', href: '/farming' },
      columns: 3,
    },
    {
      type: 'cards',
      heading: 'What You Can Do Here',
      subtitle: 'Visit the farm, learn something new, or just slow down for a bit.',
      items: [
        {
          title: 'Farm Visits',
          description: 'Come see the farm, pick some produce, or take a guided walk',
          href: '/activities/experiences',
          icon: 'Farm',
          imageLabel: 'Farm Experiences',
          imageSrc: IMAGES.pages.experiences.hero.src,
        },
        {
          title: 'Workshops',
          description: 'Learn natural farming, composting, and other hands-on skills',
          href: '/activities/learn',
          icon: 'BookOpen',
          imageLabel: 'Learning Programs',
          imageSrc: IMAGES.pages.learn.hero.src,
        },
        {
          title: 'Yoga',
          description: 'Practice yoga outside, surrounded by nature',
          href: '/activities/yoga',
          icon: 'Heart',
          imageLabel: 'Yoga Workshops',
          imageSrc: IMAGES.pages.yoga.hero.src,
        },
        {
          title: 'Summer Camps',
          description: 'Kids learn about farming, animals, and nature while having fun',
          href: '/activities/summer-camps',
          icon: 'Users',
          imageLabel: 'Summer Camps',
          imageSrc: IMAGES.pages.summerCamps.hero.src,
        },
      ],
      columns: 4,
    },
    {
      type: 'split',
      heading: 'Stay With Us',
      body: 'Wake up to birdsong instead of traffic. Spend a few days (or more) in a place where life moves slower. We have a few places to stay, plus an event hall if you\'re planning something bigger.',
      cta: { label: 'See Our Places', href: '/stay' },
      reverse: true,
      imageLabel: IMAGES.pages.home.stay.alt,
      imageSrc: IMAGES.pages.home.stay.src,
    },
    {
      type: 'featureGrid',
      heading: 'What Matters to Us',
      subtitle: 'These four things guide everything we do.',
      items: [
        {
          title: 'Compassion',
          description: 'We try to be kind—to animals, the land, and each other. Simple as that.',
          icon: 'Heart',
        },
        {
          title: 'Learning',
          description: 'We teach practical skills and share what we\'ve learned. No gatekeeping, just sharing.',
          icon: 'BookOpen',
        },
        {
          title: 'Sustainability',
          description: 'We farm in ways that make the land better over time, not worse. Future generations matter.',
          icon: 'Leaf',
        },
        {
          title: 'Community',
          description: 'We\'re better together. Shared work, shared meals, shared stories.',
          icon: 'Users',
        },
      ],
      columns: 4,
    },
    {
      type: 'timeline',
      heading: 'A Day at Arka Acres',
      subtitle: 'Here\'s what a typical day looks like around here.',
      items: [
        {
          time: 'Morning',
          title: 'Sunrise & Morning Chores',
          description: 'We start early, taking care of the animals and the land. If you\'re here, you can help—or just watch. (Seva means selfless service, which is what we\'re doing.)',
        },
        {
          time: 'Midday',
          title: 'Workshops & Farm Walks',
          description: 'This is when we teach and learn. Maybe it\'s a workshop on composting, or a walk through the fields to see what\'s growing.',
        },
        {
          time: 'Afternoon',
          title: 'Time to Slow Down',
          description: 'After lunch, things quiet down. You might help in the garden, read under a tree, or just sit and watch the clouds.',
        },
        {
          time: 'Evening',
          title: 'Stories & Rest',
          description: 'As the day winds down, we gather. Sometimes there\'s a fire, sometimes just quiet conversation. Then rest.',
        },
      ],
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'What makes Arka Acres different?',
          a: 'We\'re a working farm that also rescues cows, teaches people, and welcomes visitors. We try to do everything with care—for the land, the animals, and each other.',
        },
        {
          q: 'Can I just come visit?',
          a: 'Yes! Check out our Activities page. You can visit for a few hours, join a workshop, or stay overnight. Whatever works for you.',
        },
        {
          q: 'Is Arka Goshala the same as Arka Acres?',
          a: 'They\'re connected but separate. Arka Goshala is the cow sanctuary (it\'s a nonprofit). Arka Acres is the farm. We work together, but they have their own website at arkagoshala.org.',
        },
        {
          q: 'How do I book a stay?',
          a: 'Go to our Stay page, pick a place, and fill out the booking form. We\'ll check availability and get back to you with details.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Ready to Visit?',
      body: 'Come see what we\'re up to. Book a stay, join a workshop, or just come for a walk.',
      buttons: [
        { label: 'See Activities', href: '/activities' },
        { label: 'Book a Stay', href: '/stay' },
        { label: 'Visit Goshala', href: GOSHALA_URL, external: true, variant: 'secondary' },
      ],
    },
  ],
}

// Activities Landing Page (Category Hub)
export const ACTIVITIES_PAGE: PageContent = {
  title: 'Activities at Arka Acres',
  description: 'Visit the farm, learn something new, or just slow down for a bit.',
  sections: [
    {
      type: 'hero',
      heading: 'What You Can Do Here',
      subheading: 'Visit the farm, learn something new, or just slow down for a bit.',
      primaryCta: { label: 'Plan Your Visit', href: '/stay#contact' },
      imageLabel: IMAGES.pages.activities.hero.alt,
      imageSrc: IMAGES.pages.activities.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'cards',
      heading: 'Pick Your Experience',
      subtitle: 'Here\'s what we offer. Pick what sounds good to you.',
      items: [
        {
          title: 'Farm Visits',
          description: 'Come see the farm, pick some produce, or take a walk with us',
          href: '/activities/experiences',
          icon: 'Farm',
          imageLabel: 'Farm Experiences',
          imageSrc: IMAGES.pages.experiences.hero.src,
        },
        {
          title: 'Workshops',
          description: 'Learn natural farming, composting, and other hands-on skills',
          href: '/activities/learn',
          icon: 'BookOpen',
          imageLabel: 'Learning Programs',
          imageSrc: IMAGES.pages.learn.hero.src,
        },
        {
          title: 'Yoga',
          description: 'Practice yoga outside, surrounded by nature',
          href: '/activities/yoga',
          icon: 'Heart',
          imageLabel: 'Yoga Workshops',
          imageSrc: IMAGES.pages.yoga.hero.src,
        },
        {
          title: 'Summer Camps',
          description: 'Kids learn about farming, animals, and nature while having fun',
          href: '/activities/summer-camps',
          icon: 'Users',
          imageLabel: 'Summer Camps',
          imageSrc: IMAGES.pages.summerCamps.hero.src,
        },
      ],
      columns: 4,
    },
    {
      type: 'ctaBand',
      heading: 'Want to Visit?',
      body: 'Pick an activity or just reach out. We\'ll help you plan something that works.',
      buttons: [
        { label: 'Contact Us', href: '/stay#contact' },
        { label: 'Book a Stay', href: '/stay' },
      ],
    },
  ],
}

// Activities Subpages
export const EXPERIENCES_PAGE: PageContent = {
  title: 'Farm Visits',
  description: 'Come see the farm, pick some produce, or just take a walk.',
  sections: [
    {
      type: 'hero',
      heading: 'Farm Visits',
      subheading: 'Come see the farm, pick some produce, or just take a walk.',
      primaryCta: { label: 'Plan Your Visit', href: '/stay#contact' },
      imageLabel: IMAGES.pages.experiences.hero.alt,
      imageSrc: IMAGES.pages.experiences.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'What You Can Do',
      items: [
        {
          title: 'Family Visits',
          description: 'Bring the kids (or come solo). Meet the cows, walk through the gardens, and spend a few hours in nature. Great for kids who want to see where food comes from.',
          icon: 'Farm',
        },
        {
          title: 'Pick Your Own',
          description: 'Harvest what\'s in season—vegetables, fruits, or flowers. We\'ll show you what\'s ready and how to pick it. Available when things are actually growing (so not in the dead of winter).',
          icon: 'Leaf',
        },
        {
          title: 'Guided Walks',
          description: 'Take a walk with one of us. We\'ll show you around, explain what we\'re doing, and answer questions. Good for small groups or individuals who want to learn.',
          icon: 'Sparkles',
        },
        {
          title: 'Volunteer Days',
          description: 'Want to get your hands dirty? Help us feed animals, work in the garden, or turn compost. You\'ll learn while you work, and we\'ll appreciate the help.',
          icon: 'Heart',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'What to Bring',
      body: 'Wear clothes you don\'t mind getting dirty. Closed-toe shoes are a must (cow pies are real). Bring water, and if it\'s sunny, bring a hat. That\'s about it.',
      bullets: [
        'Clothes that can get dirty',
        'Closed-toe shoes (seriously)',
        'Water bottle',
        'Hat and sunscreen (if it\'s sunny)',
        'Camera if you want (optional)',
      ],
      imageLabel: IMAGES.pages.experiences.whatToBring.alt,
      imageSrc: IMAGES.pages.experiences.whatToBring.src,
    },
    {
      type: 'split',
      heading: 'Who This Is For',
      body: 'Families, school groups, individuals—anyone who wants to see a working farm up close. All ages welcome. If you can walk, you can visit.',
      bullets: [
        'Families (kids love the animals)',
        'School groups',
        'Anyone curious about farming',
        'People who just want to be outside',
      ],
      reverse: true,
      imageLabel: IMAGES.pages.experiences.idealFor.alt,
      imageSrc: IMAGES.pages.experiences.idealFor.src,
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'How long do visits last?',
          a: 'Usually 2-3 hours, but you can stay longer if you want. We\'ll work with your schedule.',
        },
        {
          q: 'Can we pick produce year-round?',
          a: 'Nope—only when things are actually growing. Spring through fall, basically. Ask us what\'s ready when you want to come.',
        },
        {
          q: 'Can we bring food?',
          a: 'Yes! Bring a picnic if you want. We have spots where you can eat.',
        },
        {
          q: 'Do you do guided walks every day?',
          a: 'By appointment. Just contact us and we\'ll find a time that works.',
        },
        {
          q: 'What ages can visit?',
          a: 'All ages. We\'ve had toddlers and grandparents. We\'ll adjust what we show you based on who\'s there.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Want to Visit?',
      body: 'Contact us to plan your visit. We\'ll figure out what works for you.',
      buttons: [
        { label: 'Contact Us', href: '/stay#contact' },
        { label: 'Book a Stay', href: '/stay' },
      ],
    },
  ],
}

export const LEARN_PAGE: PageContent = {
  title: 'Workshops',
  description: 'Learn natural farming, composting, and other hands-on skills.',
  sections: [
    {
      type: 'hero',
      heading: 'Workshops',
      subheading: 'Learn natural farming, composting, and other hands-on skills.',
      primaryCta: { label: 'See What We Teach', href: '#topics' },
      imageLabel: IMAGES.pages.learn.hero.alt,
      imageSrc: IMAGES.pages.learn.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'What We Teach',
      items: [
        {
          title: 'Natural Farming Basics',
          description: 'Start here if you\'re new to this. We\'ll cover soil health, crop planning, and the basics of growing without chemicals.',
          icon: 'Leaf',
        },
        {
          title: 'Composting',
          description: 'Learn how to turn kitchen scraps and yard waste into good soil. We\'ll show you different methods and what actually works.',
          icon: 'Sparkles',
        },
        {
          title: 'Saving Seeds',
          description: 'Learn to save seeds from this year\'s crops for next year. It\'s not hard, and it keeps old varieties alive.',
          icon: 'Leaf',
        },
        {
          title: 'Making Natural Fertilizers',
          description: 'We\'ll teach you to make Jeevamrutham and Ganajeevamrutham—natural fertilizers from cow dung and organic materials. Sounds weird, works great.',
          icon: 'Farm',
        },
        {
          title: 'Water Management',
          description: 'How to catch rainwater, use it wisely, and design systems that don\'t waste it. Important stuff.',
          icon: 'Droplets',
        },
        {
          title: 'Permaculture Basics',
          description: 'Learn to design your space like a natural ecosystem. Plants help each other, water flows right, and everything works together.',
          icon: 'Leaf',
        },
      ],
      columns: 3,
    },
    {
      type: 'split',
      heading: 'How We Teach',
      body: 'We teach like the old gurukulam tradition—hands-on, values-based, and practical. You\'ll do the work, not just hear about it. We also share why these methods matter, not just how to do them.',
      bullets: [
        'You\'ll actually do it, not just watch',
        'We explain the why, not just the how',
        'We share old wisdom that still works',
        'You\'ll learn with other people, not alone',
      ],
      imageLabel: IMAGES.pages.learn.gurukulam.alt,
      imageSrc: IMAGES.pages.learn.gurukulam.src,
    },
    {
      type: 'split',
      heading: 'What We Cover',
      body: 'Here\'s what we teach. Contact us to see what\'s coming up next:',
      bullets: [
        'Making Jeevamrutham and Ganajeevamrutham',
        'Permaculture basics',
        'Saving seeds',
        'Natural pest control',
        'Composting',
        'Water conservation',
      ],
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'Do I need experience?',
          a: 'Nope. We start from the beginning. If you\'ve never gardened before, that\'s fine.',
        },
        {
          q: 'What should I bring?',
          a: 'Wear clothes you can work in and closed-toe shoes. Bring water. We\'ll have everything else. A notebook helps if you want to take notes.',
        },
        {
          q: 'How long are workshops?',
          a: 'Usually 3-4 hours, with breaks. Some are full-day. We\'ll tell you when you sign up.',
        },
        {
          q: 'Can kids come?',
          a: 'Depends on the workshop. Some are fine for families, others are adults-only. Ask us.',
        },
        {
          q: 'Can you do a private workshop?',
          a: 'Yes. If you have a group, we can schedule something just for you. Contact us.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Want to Learn?',
      body: 'See what workshops are coming up, or contact us to plan something.',
      buttons: [
        { label: 'See Topics', href: '#topics' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

export const YOGA_PAGE: PageContent = {
  title: 'Yoga',
  description: 'Practice yoga outside, surrounded by nature.',
  sections: [
    {
      type: 'hero',
      heading: 'Yoga',
      subheading: 'Practice yoga outside, surrounded by nature.',
      primaryCta: { label: 'Ask About Sessions', href: '/stay#contact' },
      imageLabel: IMAGES.pages.yoga.hero.alt,
      imageSrc: IMAGES.pages.yoga.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'What We Offer',
      items: [
        {
          title: 'Regular Classes',
          description: 'Weekly yoga sessions outside (or in a covered space if it\'s raining). Traditional poses, breathing exercises, and time to slow down.',
          icon: 'Heart',
        },
        {
          title: 'Workshops',
          description: 'Deeper dives into specific practices or themes. Good if you want to focus on something particular or learn more.',
          icon: 'Sparkles',
        },
        {
          title: 'Retreats',
          description: 'Multi-day experiences that combine yoga, meditation, farm life, and community. A good way to really unplug and reset.',
          icon: 'Heart',
        },
      ],
      columns: 3,
    },
    {
      type: 'split',
      heading: 'What to Bring',
      body: 'We have mats if you need one, but bring your own if you prefer. Wear comfortable clothes, bring water, and maybe a layer in case it gets cool.',
      bullets: [
        'Yoga mat (we have some if you need)',
        'Comfortable clothes',
        'Water bottle',
        'A layer for weather',
      ],
      imageLabel: IMAGES.pages.yoga.whatToBring.alt,
      imageSrc: IMAGES.pages.yoga.whatToBring.src,
    },
    {
      type: 'split',
      heading: 'All Levels Welcome',
      body: 'Never done yoga? That\'s fine. Been doing it for years? Also fine. Our instructors will show you modifications and help you find what works for your body.',
      reverse: true,
      imageLabel: IMAGES.pages.yoga.allLevels.alt,
      imageSrc: IMAGES.pages.yoga.allLevels.src,
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'Do I need experience?',
          a: 'Nope. We\'ll show you what to do. All levels welcome.',
        },
        {
          q: 'What style of yoga?',
          a: 'Traditional poses, breathing exercises, and meditation. We focus on connecting with your body and nature. Style varies a bit by instructor.',
        },
        {
          q: 'What if it rains?',
          a: 'We have covered spaces. We practice rain or shine. Sometimes practicing in different weather is actually nice.',
        },
        {
          q: 'How do I sign up?',
          a: 'Contact us to ask about upcoming sessions. We\'ll tell you the schedule and how to register.',
        },
        {
          q: 'Do you have mats?',
          a: 'Yes, we have mats. Bring your own if you prefer.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Want to Practice?',
      body: 'Contact us to ask about upcoming sessions or workshops.',
      buttons: [
        { label: 'Contact Us', href: '/stay#contact' },
        { label: 'Book a Stay', href: '/stay' },
      ],
    },
  ],
}

export const SUMMER_CAMPS_PAGE: PageContent = {
  title: 'Summer Camps',
  description: 'Kids learn about farming, animals, and nature while having fun.',
  sections: [
    {
      type: 'hero',
      heading: 'Summer Camps',
      subheading: 'Kids learn about farming, animals, and nature while having fun.',
      primaryCta: { label: 'Ask About Camps', href: '/stay#contact' },
      imageLabel: IMAGES.pages.summerCamps.hero.alt,
      imageSrc: IMAGES.pages.summerCamps.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'What Kids Do',
      items: [
        {
          title: 'Take Care of Animals',
          description: 'Kids help feed the cows, learn about animal care, and understand that animals need us to be responsible.',
          icon: 'Heart',
        },
        {
          title: 'Explore the Farm',
          description: 'We walk around, identify plants and animals, and talk about how everything connects.',
          icon: 'Leaf',
        },
        {
          title: 'Work in the Garden',
          description: 'Plant, water, harvest—kids see where food actually comes from and help grow it.',
          icon: 'Sparkles',
        },
        {
          title: 'Make Things & Play',
          description: 'Crafts with natural materials, games, and activities that are fun and teach something too.',
          icon: 'Users',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'What Kids Learn',
      body: 'Beyond the fun stuff, kids learn responsibility, compassion, and how to work together. They also get more confident and curious.',
      bullets: [
        'Responsibility (animals depend on us)',
        'Compassion (for animals and nature)',
        'Curiosity (asking questions is good)',
        'Confidence (they can do real work)',
        'Teamwork (we help each other)',
      ],
      imageLabel: IMAGES.pages.summerCamps.skills.alt,
      imageSrc: IMAGES.pages.summerCamps.skills.src,
    },
    {
      type: 'split',
      heading: 'A Typical Day',
      body: 'Here\'s what a day looks like. We balance learning, playing, and resting so kids stay engaged but not overwhelmed.',
      bullets: [
        '9:00 AM - Arrive, morning circle',
        '9:30 AM - Feed animals',
        '10:30 AM - Explore the farm',
        '12:00 PM - Lunch & rest',
        '1:30 PM - Activity or craft',
        '3:00 PM - Garden work or play',
        '4:00 PM - Closing circle, pickup',
      ],
      reverse: true,
      imageLabel: IMAGES.pages.summerCamps.schedule.alt,
      imageSrc: IMAGES.pages.summerCamps.schedule.src,
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'What ages?',
          a: 'Ages 6-12, usually. We might do other age groups too—just ask.',
        },
        {
          q: 'How long are camps?',
          a: 'One week, Monday through Friday, 9 AM to 4 PM. We might offer extended care—ask when you register.',
        },
        {
          q: 'What should kids bring?',
          a: 'Clothes that can get dirty, closed-toe shoes, water bottle, lunch, and sun protection. We\'ll send a full list when you register.',
        },
        {
          q: 'Are kids supervised?',
          a: 'Yes. All activities are supervised by experienced staff. Safety comes first.',
        },
        {
          q: 'What about allergies?',
          a: 'Tell us when you register. We can work with most dietary and medical needs.',
        },
        {
          q: 'How do I register?',
          a: 'Contact us. We\'ll tell you dates, pricing, and what forms we need.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Interested?',
      body: 'Contact us to ask about camps or get on the list for next summer.',
      buttons: [
        { label: 'Contact Us', href: '/stay#contact' },
        { label: 'Book a Stay', href: '/stay' },
      ],
    },
  ],
}

// Farming Page Content
export const FARMING_PAGE: PageContent = {
  title: 'How We Farm',
  description: 'We work with nature, not against it. The land gets better over time, not worse.',
  sections: [
    {
      type: 'hero',
      heading: 'How We Farm',
      subheading: 'We work with nature, not against it. The land gets better over time, not worse.',
      primaryCta: { label: 'Learn in Our Workshops', href: '/activities/learn' },
      imageLabel: IMAGES.pages.farming.hero.alt,
      imageSrc: IMAGES.pages.farming.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'stats',
      items: [
        { value: '100%', label: 'Natural Methods', suffix: '' },
        { value: '16', label: 'Acres We Farm', suffix: '' },
        { value: '0', label: 'Chemicals Used', suffix: '' },
      ],
      backgroundColor: 'sage',
    },
    {
      type: 'split',
      heading: 'Permaculture Basics',
      body: 'We design our farm like a natural ecosystem. Plants help each other, water flows where it should, and we work with nature\'s patterns instead of fighting them. That means food forests, companion planting, catching rainwater, and organizing things in zones that make sense.',
      bullets: [
        'Food forests (plants work together)',
        'Companion planting (some plants help others)',
        'Catching and using rainwater',
        'Organizing in zones (what needs what)',
      ],
      imageLabel: IMAGES.pages.farming.permaculture.alt,
      imageSrc: IMAGES.pages.farming.permaculture.src,
    },
    {
      type: 'featureGrid',
      heading: 'What We Do',
      items: [
        {
          title: 'Building Good Soil',
          description: 'Everything starts with the soil. We compost, add natural amendments, and disturb the soil as little as possible. Healthy soil = healthy plants.',
          icon: 'Leaf',
        },
        {
          title: 'Saving Seeds',
          description: 'We save seeds from this year\'s crops for next year. It keeps old varieties alive and means we don\'t have to buy seeds every season.',
          icon: 'Sparkles',
        },
        {
          title: 'Managing Water',
          description: 'We catch rainwater, use it wisely, and design systems that don\'t waste it. Water matters, especially here.',
          icon: 'Droplets',
        },
        {
          title: 'Natural Fertilizers',
          description: 'We make Jeevamrutham and Ganajeevamrutham from cow dung, urine, and organic materials. Sounds gross, works great. No chemicals needed.',
          icon: 'Farm',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'Traditional Cow-Based Farming',
      body: 'We use old methods that work. Jeevamrutham and Ganajeevamrutham are natural fertilizers made from cow dung, urine, and organic stuff. They feed the soil without chemicals. We\'ll teach you how to make them in our workshops.',
      bullets: [
        'Jeevamrutham: Liquid fertilizer (sounds fancy, it\'s not)',
        'Ganajeevamrutham: Soil prep that really works',
        'Compost from cow dung',
        'Natural ways to deal with pests',
      ],
      cta: { label: 'Learn How to Make Them', href: '/activities/learn' },
      reverse: true,
      imageLabel: IMAGES.pages.farming.cowBased.alt,
      imageSrc: IMAGES.pages.farming.cowBased.src,
    },
    {
      type: 'faq',
      heading: 'Common Questions',
      items: [
        {
          q: 'What\'s permaculture?',
          a: 'It\'s a way of designing systems that work like nature. Plants help each other, water flows right, and everything supports everything else. We use these ideas to design our farm.',
        },
        {
          q: 'What are Jeevamrutham and Ganajeevamrutham?',
          a: 'Natural fertilizers made from cow dung, urine, and organic materials. They feed the soil with good microbes and nutrients. No chemicals, just what works.',
        },
        {
          q: 'Can I learn this?',
          a: 'Yes. We teach workshops on natural farming, including how to make these preparations. Check our Activities page.',
        },
        {
          q: 'Do you use chemicals?',
          a: 'No. Zero chemicals. We use traditional methods, compost, and natural preparations. That\'s it.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Want to Learn?',
      body: 'Join a workshop or come visit the farm. We\'ll show you how we do things.',
      buttons: [
        { label: 'See Workshops', href: '/activities/learn' },
        { label: 'Visit the Farm', href: '/activities' },
      ],
    },
  ],
}

// Stay Page Content - Units (kept separate for booking system)
export const STAY_UNITS = [
  {
    slug: 'the-white-house',
    name: 'The White House',
    type: 'stay',
    bedrooms: 4,
    sleepsUpTo: 15,
    description: 'Big enough for the whole family (or a big group). Four bedrooms, sleeps up to 15. Full kitchen, plenty of space to spread out, and views of the farm.',
    imageLabel: 'The White House exterior and living spaces',
    amenities: [
      '4 bedrooms',
      'Sleeps up to 15',
      'Full kitchen',
      'Living areas',
      'Farm views',
    ],
  },
  {
    slug: 'aurora-grand',
    name: 'Aurora Grand',
    type: 'event',
    bedrooms: 0,
    sleepsUpTo: 0,
    description: 'A big, flexible space for gatherings, celebrations, or events. No sleeping here—just a nice place to bring people together.',
    imageLabel: 'Aurora Grand event hall interior',
    amenities: [
      'Event hall',
      'Spacious venue',
      'Versatile setup',
      'Perfect for gatherings',
      'Celebrations & events',
    ],
  },
  {
    slug: 'red-roost',
    name: 'Red Roost',
    type: 'stay',
    bedrooms: 1,
    sleepsUpTo: 2,
    description: 'A small studio right above the barn. Sleeps two. You\'ll hear the animals, smell the hay, and feel like you\'re really on a farm. Simple and peaceful.',
    imageLabel: 'Red Roost studio home above the barn',
    amenities: [
      'Studio home',
      'Sleeps 2',
      'Above barn location',
      'Close to animals',
      'Natural serenity',
    ],
  },
] as const

// Stay Page Content (custom page with booking modal, but keeping content structure)
export const STAY_CONTENT = {
  hero: {
    title: 'Stay With Us',
    subtitle: 'Pick a place to stay, or book Aurora Grand for your event.',
  },
  contact: {
    title: 'Questions?',
    description: 'Have questions? Want to learn more? Just ask.',
  },
}

// Page content lookup
export const PAGES: Record<string, PageContent> = {
  home: HOME_PAGE,
  activities: ACTIVITIES_PAGE,
  'activities/experiences': EXPERIENCES_PAGE,
  'activities/learn': LEARN_PAGE,
  'activities/yoga': YOGA_PAGE,
  'activities/summer-camps': SUMMER_CAMPS_PAGE,
  farming: FARMING_PAGE,
}

