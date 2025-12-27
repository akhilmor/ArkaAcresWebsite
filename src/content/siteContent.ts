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

// Single source of truth for navigation - ONLY these 5 items
export const NAV_ITEMS = [
  { href: '/', label: 'Home', external: false },
  { href: GOSHALA_URL, label: 'Goshala', external: true },
  { href: '/activities', label: 'Activities', external: false },
  { href: '/farming', label: 'Farming', external: false },
  { href: '/stay', label: 'Stay', external: false },
] as const

// Home Page Content
export const HOME_PAGE: PageContent = {
  title: 'Arka Acres',
  description: 'A peaceful farm and community space where compassion meets sustainability.',
  sections: [
    {
      type: 'hero',
      heading: 'Arka Acres',
      subheading: 'A peaceful farm and community space where compassion meets sustainability.',
      supportingText: 'Rooted in care, simplicity, and a deep connection with nature.',
      primaryCta: { label: 'Explore Activities', href: '/activities' },
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
      body: 'Arka Goshala is a nonprofit sanctuary dedicated to rescuing, caring for, and protecting Gomathas. Guided by compassion and seva, we provide dignified lifelong care—nutrition, shelter, and medical support—while sharing the deeper bond between humans, animals, and the earth.',
      bullets: ['Rescue & lifelong care', 'Individual attention', 'Community education'],
      cta: { label: 'Learn about the Goshala', href: GOSHALA_URL, external: true },
      imageLabel: IMAGES.pages.home.goshala.alt,
      imageSrc: IMAGES.pages.home.goshala.src,
    },
    {
      type: 'featureGrid',
      heading: 'Farming With Nature',
      subtitle: 'Sustainable practices that work with the land, not against it.',
      items: [
        {
          title: 'Permaculture Principles',
          description: 'We design self-sustaining ecosystems that build soil health, support biodiversity, and work with nature\'s rhythms.',
          icon: 'Leaf',
        },
        {
          title: 'Traditional Cow-Based Farming',
          description: 'Cow-centered preparations like Jeevamrutham and Ganajeevamrutham help enrich soil naturally and reduce chemical dependency.',
          icon: 'Farm',
        },
        {
          title: 'Water & Ecosystem Care',
          description: 'Every decision respects water, habitat balance, and long-term regeneration.',
          icon: 'Sparkles',
        },
      ],
      cta: { label: 'Explore Farming', href: '/farming' },
      columns: 3,
    },
    {
      type: 'cards',
      heading: 'Activities',
      subtitle: 'Slow experiences, hands-on learning, and grounded community moments—rooted in nature.',
      items: [
        {
          title: 'Experiences',
          description: 'Farm visits, pick-your-own, and guided walks',
          href: '/activities/experiences',
          icon: 'Farm',
          imageLabel: 'Farm Experiences',
          imageSrc: IMAGES.pages.experiences.hero.src,
        },
        {
          title: 'Learn',
          description: 'Workshops and educational programs',
          href: '/activities/learn',
          icon: 'BookOpen',
          imageLabel: 'Learning Programs',
          imageSrc: IMAGES.pages.learn.hero.src,
        },
        {
          title: 'Yoga',
          description: 'Mindful movement in nature',
          href: '/activities/yoga',
          icon: 'Heart',
          imageLabel: 'Yoga Workshops',
          imageSrc: IMAGES.pages.yoga.hero.src,
        },
        {
          title: 'Summer Camps',
          description: 'Hands-on learning for kids',
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
      heading: 'Stay at Arka Acres',
      body: 'Slow down and reconnect. Wake to birdsong, breathe fresh air, and experience simple, intentional living. Choose from our comfortable accommodations or book Aurora Grand for your next gathering.',
      cta: { label: 'View Stays', href: '/stay' },
      reverse: true,
      imageLabel: IMAGES.pages.home.stay.alt,
      imageSrc: IMAGES.pages.home.stay.src,
    },
    {
      type: 'featureGrid',
      heading: 'What We Stand For',
      subtitle: 'Four pillars that guide everything we do.',
      items: [
        {
          title: 'Compassion',
          description: 'Kindness toward animals, the earth, and each other—care rooted in dignity.',
          icon: 'Heart',
        },
        {
          title: 'Education',
          description: 'Practical skills and cultural wisdom that empower mindful living.',
          icon: 'BookOpen',
        },
        {
          title: 'Sustainability',
          description: 'Natural systems that protect resources and thrive for generations.',
          icon: 'Leaf',
        },
        {
          title: 'Community',
          description: 'Shared values, collective learning, and connection.',
          icon: 'Users',
        },
      ],
      columns: 4,
    },
    {
      type: 'timeline',
      heading: 'A Day at Arka Acres',
      subtitle: 'Experience the rhythm of farm life.',
      items: [
        {
          time: 'Morning',
          title: 'Sunrise & Seva',
          description: 'Start the day with gentle care for the land and animals. Participate in morning seva (selfless service) activities.',
        },
        {
          time: 'Midday',
          title: 'Hands-On Learning',
          description: 'Engage in workshops, farm walks, or educational programs. Learn sustainable practices through direct experience.',
        },
        {
          time: 'Afternoon',
          title: 'Connection & Reflection',
          description: 'Take time to connect with nature, participate in community activities, or simply enjoy the peaceful surroundings.',
        },
        {
          time: 'Evening',
          title: 'Stillness & Stories',
          description: 'Wind down with quiet reflection, community gatherings, or sharing stories around the fire.',
        },
      ],
    },
    {
      type: 'faq',
      heading: 'Frequently Asked Questions',
      items: [
        {
          q: 'What makes Arka Acres unique?',
          a: 'We combine sustainable farming, animal care, and community education in a peaceful setting. Our approach is rooted in traditional practices and modern sustainability.',
        },
        {
          q: 'Can I visit the farm?',
          a: 'Yes! We offer various activities including farm visits, workshops, and stays. Check our Activities page to find the right experience for you.',
        },
        {
          q: 'Is Arka Goshala part of Arka Acres?',
          a: 'Arka Goshala is our nonprofit sanctuary for cows. While connected in mission, it operates as a separate organization. Visit arkagoshala.org to learn more.',
        },
        {
          q: 'How do I book a stay?',
          a: 'Visit our Stay page to see available accommodations and use the booking form. We\'ll confirm your reservation and provide all the details you need.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Plan Your Visit',
      body: 'Experience Arka Acres firsthand through our activities, workshops, or a peaceful stay.',
      buttons: [
        { label: 'Explore Activities', href: '/activities' },
        { label: 'Book a Stay', href: '/stay' },
        { label: 'Visit Goshala', href: GOSHALA_URL, external: true, variant: 'secondary' },
      ],
    },
  ],
}

// Activities Landing Page (Category Hub)
export const ACTIVITIES_PAGE: PageContent = {
  title: 'Activities at Arka Acres',
  description: 'Slow experiences, hands-on learning, and grounded community moments—rooted in nature.',
  sections: [
    {
      type: 'hero',
      heading: 'Activities at Arka Acres',
      subheading: 'Slow experiences, hands-on learning, and grounded community moments—rooted in nature.',
      primaryCta: { label: 'Book a Visit', href: '#' },
      imageLabel: IMAGES.pages.activities.hero.alt,
      imageSrc: IMAGES.pages.activities.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'cards',
      heading: 'Explore Our Activities',
      subtitle: 'Choose an experience that connects you with nature, community, and sustainable living.',
      items: [
        {
          title: 'Experiences',
          description: 'Farm visits, pick-your-own, and guided walks',
          href: '/activities/experiences',
          icon: 'Farm',
          imageLabel: 'Farm Experiences',
          imageSrc: IMAGES.pages.experiences.hero.src,
        },
        {
          title: 'Learn',
          description: 'Workshops and educational programs',
          href: '/activities/learn',
          icon: 'BookOpen',
          imageLabel: 'Learning Programs',
          imageSrc: IMAGES.pages.learn.hero.src,
        },
        {
          title: 'Yoga Workshops',
          description: 'Mindful movement in nature',
          href: '/activities/yoga',
          icon: 'Heart',
          imageLabel: 'Yoga Workshops',
          imageSrc: IMAGES.pages.yoga.hero.src,
        },
        {
          title: 'Summer Camps',
          description: 'Adventure, learning & fun for kids',
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
      heading: 'Ready to Experience Arka Acres?',
      body: 'Explore our activities or contact us to plan your visit.',
      buttons: [
        { label: 'Book a Visit', href: '#' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

// Activities Subpages
export const EXPERIENCES_PAGE: PageContent = {
  title: 'Farm Experiences',
  description: 'Slow moments on the land—visit, harvest, and reconnect with nature.',
  sections: [
    {
      type: 'hero',
      heading: 'Farm Experiences',
      subheading: 'Slow moments on the land—visit, harvest, and reconnect with nature.',
      primaryCta: { label: 'Book a Visit', href: '#' },
      imageLabel: IMAGES.pages.experiences.hero.alt,
      imageSrc: IMAGES.pages.experiences.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'Our Experiences',
      items: [
        {
          title: 'Farm Visits',
          description: 'Spend time on the farm with your family. Meet the cows, explore the gardens, and enjoy a day in nature. Ideal for children to learn about farming and animals.',
          icon: 'Farm',
        },
        {
          title: 'Pick Your Own',
          description: 'Harvest seasonal produce and flowers directly from our fields. Experience the joy of gathering fresh food while learning about where it comes from. Available seasonally.',
          icon: 'Leaf',
        },
        {
          title: 'Guided Farm Walks',
          description: 'Take a peaceful walk through our farm with a guide who shares the story of our practices, the animals, and the land. Perfect for individuals, families, or small groups.',
          icon: 'Sparkles',
        },
        {
          title: 'Volunteer Days',
          description: 'Join us for hands-on farm work. Help with animal care, gardening, composting, or other tasks while learning sustainable practices. A meaningful way to connect with the land.',
          icon: 'Heart',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'What to Bring',
      body: 'Come prepared for a day on the farm. We recommend comfortable clothing, closed-toe shoes, a water bottle, and an open mind. Sun protection and hats are also helpful during warmer months.',
      bullets: [
        'Comfortable clothing (may get dirty)',
        'Closed-toe shoes',
        'Water bottle',
        'Sun protection (hat, sunscreen)',
        'Camera (optional)',
      ],
      imageLabel: IMAGES.pages.experiences.whatToBring.alt,
      imageSrc: IMAGES.pages.experiences.whatToBring.src,
    },
    {
      type: 'split',
      heading: 'Ideal For',
      body: 'Our farm experiences are perfect for families, groups, students, and anyone looking to connect with nature and learn about sustainable farming. All ages are welcome.',
      bullets: [
        'Families with children',
        'School groups and students',
        'Community organizations',
        'Individuals seeking connection',
      ],
      reverse: true,
      imageLabel: IMAGES.pages.experiences.idealFor.alt,
      imageSrc: IMAGES.pages.experiences.idealFor.src,
    },
    {
      type: 'faq',
      heading: 'Experience Questions',
      items: [
        {
          q: 'How long do farm visits last?',
          a: 'Most visits last 2-3 hours, but you\'re welcome to stay longer. We can customize the experience based on your interests and schedule.',
        },
        {
          q: 'Is pick-your-own available year-round?',
          a: 'Pick-your-own is seasonal and depends on what\'s growing. Contact us to check current availability and what\'s ready to harvest.',
        },
        {
          q: 'Can we bring our own food?',
          a: 'Yes! You\'re welcome to bring a picnic. We also have designated areas for meals and rest.',
        },
        {
          q: 'Are guided walks available every day?',
          a: 'Guided walks are available by appointment. Contact us to schedule a time that works for you.',
        },
        {
          q: 'What age is appropriate for farm visits?',
          a: 'All ages are welcome! We\'ve had visitors from toddlers to seniors. Activities can be adapted to different age groups.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Ready to Visit?',
      body: 'Book a farm experience or contact us to plan your visit.',
      buttons: [
        { label: 'Book a Visit', href: '#' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

export const LEARN_PAGE: PageContent = {
  title: 'Learning Programs',
  description: 'Hands-on workshops and cultural learning rooted in sustainability.',
  sections: [
    {
      type: 'hero',
      heading: 'Learning Programs',
      subheading: 'Hands-on workshops and cultural learning rooted in sustainability.',
      primaryCta: { label: 'See Upcoming Topics', href: '#topics' },
      imageLabel: IMAGES.pages.learn.hero.alt,
      imageSrc: IMAGES.pages.learn.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'Workshop Themes',
      items: [
        {
          title: 'Natural Farming Basics',
          description: 'Learn the fundamentals of sustainable farming, from soil health to crop planning. Perfect for beginners and those new to natural methods.',
          icon: 'Leaf',
        },
        {
          title: 'Composting Systems',
          description: 'Master the art of composting. Learn different methods, what to compost, and how to create rich soil amendments for your garden.',
          icon: 'Sparkles',
        },
        {
          title: 'Seed Saving & Propagation',
          description: 'Preserve traditional varieties and learn to save seeds for future seasons. Includes hands-on practice with seed collection and storage.',
          icon: 'Leaf',
        },
        {
          title: 'Cow-Based Inputs',
          description: 'Learn to make Jeevamrutham and Ganajeevamrutham—traditional natural fertilizers that enrich soil without chemicals.',
          icon: 'Farm',
        },
        {
          title: 'Water Stewardship',
          description: 'Understand water conservation, rainwater harvesting, and efficient irrigation systems that work with natural cycles.',
          icon: 'Droplets',
        },
        {
          title: 'Permaculture Design',
          description: 'Explore permaculture principles and learn to design systems that mimic natural ecosystems for sustainable food production.',
          icon: 'Leaf',
        },
      ],
      columns: 3,
    },
    {
      type: 'split',
      heading: 'Gurukulam-Style Learning',
      body: 'Our learning programs blend traditional wisdom with practical skills. Like the gurukulam tradition, we emphasize values, hands-on experience, and deep understanding—not just information.',
      bullets: [
        'Values-based learning',
        'Hands-on practice',
        'Cultural wisdom',
        'Community connection',
      ],
      imageLabel: IMAGES.pages.learn.gurukulam.alt,
      imageSrc: IMAGES.pages.learn.gurukulam.src,
    },
    {
      type: 'split',
      heading: 'Upcoming Workshop Topics',
      body: 'Join us for hands-on learning in these areas:',
      bullets: [
        'Making Jeevamrutham and Ganajeevamrutham',
        'Permaculture Design Basics',
        'Seed Saving and Propagation',
        'Natural Pest Management',
        'Composting Systems',
        'Water Conservation Techniques',
      ],
    },
    {
      type: 'faq',
      heading: 'Learning Questions',
      items: [
        {
          q: 'Do I need prior experience?',
          a: 'No! Our workshops are designed for all levels, from complete beginners to those with some gardening experience.',
        },
        {
          q: 'What should I bring to workshops?',
          a: 'We provide all materials. Just bring comfortable clothing, closed-toe shoes, a water bottle, and a notebook if you\'d like to take notes.',
        },
        {
          q: 'How long are workshops?',
          a: 'Workshops typically last 3-4 hours, with breaks. Some intensive programs may be full-day or multi-day.',
        },
        {
          q: 'Can I bring my children?',
          a: 'Some workshops are family-friendly. Please contact us to discuss which programs are suitable for children.',
        },
        {
          q: 'Do you offer private workshops?',
          a: 'Yes! We can arrange private workshops for groups. Contact us to discuss your needs and schedule.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Ready to Learn?',
      body: 'Join a workshop or contact us to learn more about our programs.',
      buttons: [
        { label: 'See Upcoming Topics', href: '#topics' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

export const YOGA_PAGE: PageContent = {
  title: 'Yoga Workshops',
  description: 'Mindful movement in nature—breath, strength, and stillness.',
  sections: [
    {
      type: 'hero',
      heading: 'Yoga Workshops',
      subheading: 'Mindful movement in nature—breath, strength, and stillness.',
      primaryCta: { label: 'Inquire about Yoga', href: 'mailto:yoga@arkaacres.com' },
      imageLabel: IMAGES.pages.yoga.hero.alt,
      imageSrc: IMAGES.pages.yoga.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'Our Yoga Offerings',
      items: [
        {
          title: 'Weekly Sessions',
          description: 'Regular yoga classes held in our peaceful farm setting. Connect with your body and nature through traditional asanas and breathwork.',
          icon: 'Heart',
        },
        {
          title: 'Special Workshops',
          description: 'Intensive workshops focusing on specific practices, themes, or techniques. Deepen your practice in a supportive, natural environment.',
          icon: 'Sparkles',
        },
        {
          title: 'Retreats',
          description: 'Extended retreat experiences combining yoga, meditation, farm life, and community. A transformative way to reset and reconnect.',
          icon: 'Heart',
        },
      ],
      columns: 3,
    },
    {
      type: 'split',
      heading: 'What to Bring',
      body: 'Come prepared for practice in nature. We provide mats and props, but you\'re welcome to bring your own if you prefer.',
      bullets: [
        'Yoga mat (we can provide)',
        'Comfortable clothing',
        'Water bottle',
        'Open mind and heart',
        'Layers for weather',
      ],
      imageLabel: IMAGES.pages.yoga.whatToBring.alt,
      imageSrc: IMAGES.pages.yoga.whatToBring.src,
    },
    {
      type: 'split',
      heading: 'All Levels Welcome',
      body: 'Our yoga sessions are open to practitioners of all levels. Whether you\'re a beginner or experienced, you\'ll find a practice that meets you where you are. Our instructors adapt poses and provide modifications.',
      reverse: true,
      imageLabel: IMAGES.pages.yoga.allLevels.alt,
      imageSrc: IMAGES.pages.yoga.allLevels.src,
    },
    {
      type: 'faq',
      heading: 'Yoga Questions',
      items: [
        {
          q: 'Do I need yoga experience?',
          a: 'No! All levels are welcome. Our instructors provide guidance and modifications for every pose.',
        },
        {
          q: 'What style of yoga do you teach?',
          a: 'We focus on traditional asanas, breathwork (pranayama), and meditation. The style may vary by instructor, but always emphasizes connection with nature and mindful movement.',
        },
        {
          q: 'What if the weather is bad?',
          a: 'We have covered spaces for practice. Sessions continue rain or shine, and practicing in nature during different weather can be a beautiful experience.',
        },
        {
          q: 'How do I sign up?',
          a: 'Contact us to inquire about upcoming sessions, workshops, or retreats. We\'ll provide schedule and registration details.',
        },
        {
          q: 'Are mats provided?',
          a: 'Yes, we have mats available. You\'re also welcome to bring your own if you prefer.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Ready to Practice?',
      body: 'Join us for yoga in nature. Inquire about upcoming sessions or workshops.',
      buttons: [
        { label: 'Inquire about Yoga', href: 'mailto:yoga@arkaacres.com' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

export const SUMMER_CAMPS_PAGE: PageContent = {
  title: 'Summer Camps',
  description: 'Adventure, learning, and farm life—built for kids to grow with confidence.',
  sections: [
    {
      type: 'hero',
      heading: 'Summer Camps',
      subheading: 'Adventure, learning, and farm life—built for kids to grow with confidence.',
      primaryCta: { label: 'Register Interest', href: '/stay#contact' },
      imageLabel: IMAGES.pages.summerCamps.hero.alt,
      imageSrc: IMAGES.pages.summerCamps.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'featureGrid',
      heading: 'Activities',
      items: [
        {
          title: 'Animal Care',
          description: 'Kids learn to care for cows, feed animals, and understand the responsibilities of animal stewardship.',
          icon: 'Heart',
        },
        {
          title: 'Nature Walks',
          description: 'Explore the farm, identify plants and wildlife, and learn about ecosystems through guided exploration.',
          icon: 'Leaf',
        },
        {
          title: 'Gardening',
          description: 'Hands-on gardening activities—planting, watering, harvesting, and learning where food comes from.',
          icon: 'Sparkles',
        },
        {
          title: 'Crafts & Games',
          description: 'Creative activities using natural materials, traditional crafts, and farm-themed games that build community.',
          icon: 'Users',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'Skills Built',
      body: 'Summer camps at Arka Acres help kids develop important life skills while having fun and connecting with nature.',
      bullets: [
        'Responsibility through animal care',
        'Compassion for animals and nature',
        'Curiosity and learning',
        'Confidence and independence',
        'Teamwork and community',
      ],
      imageLabel: IMAGES.pages.summerCamps.skills.alt,
      imageSrc: IMAGES.pages.summerCamps.skills.src,
    },
    {
      type: 'split',
      heading: 'Sample Day Schedule',
      body: 'Each day is structured to balance learning, play, and rest. Kids stay engaged while building meaningful connections with nature and each other.',
      bullets: [
        '9:00 AM - Arrival & morning circle',
        '9:30 AM - Animal care & feeding',
        '10:30 AM - Farm exploration & learning',
        '12:00 PM - Lunch & rest',
        '1:30 PM - Hands-on activity or craft',
        '3:00 PM - Garden work or nature play',
        '4:00 PM - Closing circle & pickup',
      ],
      reverse: true,
      imageLabel: IMAGES.pages.summerCamps.schedule.alt,
      imageSrc: IMAGES.pages.summerCamps.schedule.src,
    },
    {
      type: 'faq',
      heading: 'Camp Questions',
      items: [
        {
          q: 'What ages are camps for?',
          a: 'Our summer camps are designed for children ages 6-12. We may offer programs for other age groups—contact us for details.',
        },
        {
          q: 'How long are camp sessions?',
          a: 'Camps typically run for one week, Monday through Friday, from 9 AM to 4 PM. Extended care may be available.',
        },
        {
          q: 'What should kids bring?',
          a: 'Comfortable clothing that can get dirty, closed-toe shoes, a water bottle, lunch, and sun protection. We\'ll provide a detailed list upon registration.',
        },
        {
          q: 'Is supervision provided?',
          a: 'Yes! All activities are supervised by experienced staff who prioritize safety and learning. We maintain appropriate staff-to-child ratios.',
        },
        {
          q: 'What if my child has allergies?',
          a: 'Please inform us of any allergies or special needs when registering. We can accommodate most dietary and medical needs.',
        },
        {
          q: 'How do I register?',
          a: 'Contact us to express interest and receive registration information. We\'ll provide details about dates, pricing, and required forms.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Ready to Register?',
      body: 'Express interest in our summer camps or contact us with questions.',
      buttons: [
        { label: 'Register Interest', href: '/stay#contact' },
        { label: 'Contact Us', href: '/stay#contact' },
      ],
    },
  ],
}

// Farming Page Content
export const FARMING_PAGE: PageContent = {
  title: 'Farming that Regenerates',
  description: 'Our approach to farming works with nature to build soil health, support biodiversity, and create sustainable systems.',
  sections: [
    {
      type: 'hero',
      heading: 'Farming that Regenerates',
      subheading: 'Our approach to farming works with nature to build soil health, support biodiversity, and create sustainable systems that benefit the land, the community, and future generations.',
      primaryCta: { label: 'Learn More', href: '/activities/learn' },
      imageLabel: IMAGES.pages.farming.hero.alt,
      imageSrc: IMAGES.pages.farming.hero.src,
      imagePosition: 'right',
    },
    {
      type: 'stats',
      items: [
        { value: '100%', label: 'Natural Methods', suffix: '' },
        { value: '50+', label: 'Acres Regenerated', suffix: '+' },
        { value: '0', label: 'Chemical Inputs', suffix: '' },
      ],
      backgroundColor: 'sage',
    },
    {
      type: 'split',
      heading: 'Permaculture Foundations',
      body: 'We design self-sustaining ecosystems that work with nature\'s rhythms. Our permaculture approach includes food forests, companion planting, water management, and zone planning that create resilient, productive landscapes.',
      bullets: [
        'Food forests and polycultures',
        'Companion planting',
        'Water harvesting systems',
        'Zone-based design',
      ],
      imageLabel: IMAGES.pages.farming.permaculture.alt,
      imageSrc: IMAGES.pages.farming.permaculture.src,
    },
    {
      type: 'featureGrid',
      heading: 'Our Farming Practices',
      items: [
        {
          title: 'Soil Building & Composting',
          description: 'Healthy soil is the foundation of everything we grow. We build soil through composting, natural amendments, minimal tillage, and practices that increase organic matter and microbial life.',
          icon: 'Leaf',
        },
        {
          title: 'Seed Saving',
          description: 'We preserve and propagate traditional seed varieties, maintaining biodiversity and ensuring future harvests.',
          icon: 'Sparkles',
        },
        {
          title: 'Water Stewardship',
          description: 'Every decision considers water. We harvest rainwater, use efficient irrigation, protect water quality, and design systems that work with natural water cycles.',
          icon: 'Droplets',
        },
        {
          title: 'Cow-Based Inputs',
          description: 'Traditional preparations like Jeevamrutham and Ganajeevamrutham are central to our farming. Made from cow dung, urine, and organic materials, these natural fertilizers enrich the soil.',
          icon: 'Farm',
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      heading: 'Traditional Cow-Based Farming',
      body: 'Cow-centered preparations like Jeevamrutham and Ganajeevamrutham are central to our farming practice. These traditional methods use cow dung, urine, and organic materials to create natural fertilizers and soil enhancers that bring life to the soil and support healthy crops without chemicals.',
      bullets: [
        'Jeevamrutham: Natural liquid fertilizer',
        'Ganajeevamrutham: Enhanced soil preparation',
        'Compost from cow dung',
        'Natural pest management',
      ],
      cta: { label: 'Learn in Our Workshops', href: '/activities/learn' },
      reverse: true,
      imageLabel: IMAGES.pages.farming.cowBased.alt,
      imageSrc: IMAGES.pages.farming.cowBased.src,
    },
    {
      type: 'faq',
      heading: 'Farming Questions',
      items: [
        {
          q: 'What is permaculture?',
          a: 'Permaculture is a design system that mimics natural ecosystems to create sustainable, self-maintaining agricultural systems. We use permaculture principles to design our farm layout and practices.',
        },
        {
          q: 'What are Jeevamrutham and Ganajeevamrutham?',
          a: 'These are traditional natural farming preparations made from cow dung, urine, and organic materials. They enrich the soil with beneficial microorganisms and nutrients, supporting healthy plant growth without chemicals.',
        },
        {
          q: 'Can I learn these techniques?',
          a: 'Yes! We offer workshops on natural farming, including how to make these traditional preparations. Check our Activities page for upcoming workshops.',
        },
        {
          q: 'Do you use any chemicals?',
          a: 'No. We practice completely natural farming using traditional methods, compost, and natural preparations. Our focus is on building healthy soil and working with nature.',
        },
      ],
    },
    {
      type: 'ctaBand',
      heading: 'Want Hands-On Learning?',
      body: 'Join our farming workshops and learn sustainable techniques you can apply at home.',
      buttons: [
        { label: 'View Workshops', href: '/activities/learn' },
        { label: 'Book a Farm Visit', href: '/activities' },
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
    description: 'A spacious family home perfect for larger groups. Four comfortable bedrooms provide ample space for up to 15 guests, with a welcoming atmosphere that invites connection and rest.',
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
    description: 'An elegant event hall perfect for gatherings, celebrations, and community events. Spacious and versatile, Aurora Grand provides a beautiful setting for your special occasions.',
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
    description: 'A cozy studio home offering natural serenity, close to nature and animals. Located directly above a barn, Red Roost provides a unique farm experience with simple, intentional living.',
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
    title: 'Stay at Arka Acres',
    subtitle: 'Choose a stay that fits your pace—or book Aurora Grand for your next gathering.',
  },
  contact: {
    title: 'Contact Us',
    description: 'Have questions about your stay? Want to learn more? We\'d love to hear from you.',
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

