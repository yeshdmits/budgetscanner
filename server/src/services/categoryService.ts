import { Category } from '../models/Transaction';

interface CategoryRule {
  category: Category;
  patterns: string[];
  priority: number;
}

const categoryRules: CategoryRule[] = [
  // High priority rules (check first for specific patterns)
  {
    category: 'Cafe/Restaurants',
    patterns: ['UBER *EATS', 'UBER  *EATS'],
    priority: 100
  },
  {
    category: 'Travel',
    patterns: ['UBER *TRIP', 'UBER  *TRIP'],
    priority: 100
  },
  {
    category: 'Rent',
    patterns: ['Standing order', 'Miete', 'ALBEK AMBRA'],
    priority: 90
  },

  // Standard rules
  {
    category: 'Food',
    patterns: [
      'Migros', 'Coop', 'Denner', 'migrolino', 'Avec',
      'COOP VITALITY', 'CARREFOUR', 'MONOPRIX', 'k kiosk',
      'Filiale', 'SUPERETTE'
    ],
    priority: 50
  },
  {
    category: 'Utilities',
    patterns: ['JUMBO', 'IKEA', 'Personenmeldeamt'],
    priority: 50
  },
  {
    category: 'Cafe/Restaurants',
    patterns: [
      'Lakomka', 'SUBWAY', 'WANGKHAR', 'STARBUCKS', 'Seven Stars',
      'Suan Long', 'MCDONALDS', 'Aroy Food', 'VICAFE', 'Caffe Spettacolo',
      'Kuni & Gunde', 'Miro Bahnhof', 'Scent of Bamboo', 'K2 Express',
      'Restaurant', 'Cafe', 'Coffee', 'MINIME', 'PHIE HALWANI',
      'HIPPY MARKET', 'LE COLVERT', 'LE LUTECE', 'SAPPORO', 'GEORGIEN',
      'Oranta', 'Walkthrough Level'
    ],
    priority: 50
  },
  {
    category: 'Steam/HoYoverse',
    patterns: ['Steam', 'STEAM PURCHASE', 'HoYoverse', 'PlayStation', 'Xbox'],
    priority: 50
  },
  {
    category: 'AliExpress',
    patterns: ['aliexpress', 'Alibaba'],
    priority: 50
  },
  {
    category: 'Youtube/Spotify',
    patterns: ['Spotify', 'YouTube', 'Netflix', 'Disney'],
    priority: 50
  },
  {
    category: 'Clothes',
    patterns: [
      'H & M', 'H&M', 'Metro Boutique', 'Zara', 'C&A', 'PKZ',
      'Decathlon', 'Dr Martens', 'LARRY H', 'FJ DIFFUSION', 'MON ETOILE'
    ],
    priority: 50
  },
  {
    category: 'Swisscom',
    patterns: ['Swisscom', 'SWISSCOM BILLING'],
    priority: 50
  },
  {
    category: 'Sanitas (Med)',
    patterns: [
      'Sanitas', 'Helsana', 'CSS', 'Visana',
      'APOTHEKE', 'PHARMACIE', 'zahnarztzentrum', 'STERNEN-APOTHEKE'
    ],
    priority: 50
  },
  {
    category: 'SBB',
    patterns: ['SBB CFF FFS', 'ZVV', 'DB FERNVERKEHR', 'Bahn'],
    priority: 50
  },
  {
    category: 'Interdiscount/MediaMarkt',
    patterns: ['Interdiscount', 'MediaMarkt', 'mobilezone', 'Digitec', 'Galaxus'],
    priority: 50
  },
  {
    category: 'Cash (ATM)',
    patterns: ['Withdrawal', 'ATM', 'Bargeld', 'Bargeldbezug'],
    priority: 50
  },
  {
    category: 'Twint',
    patterns: ['TWINT'],
    priority: 30 // Lower priority so specific TWINT merchants get matched first
  },
  {
    category: 'Support',
    patterns: ['Preply', 'Udemy', 'Coursera'],
    priority: 50
  },
  {
    category: 'Travel',
    patterns: [
      'HOTEL', 'SNCF', 'RATP', 'MUSEE', 'LOUVRE', 'Booking', 'Airbnb',
      'Flug', 'flight', 'SWISS INTERNATIONAL AIR', 'SERVICE NAVIGO',
      'TICKET', 'LOUVRETICKET', 'MUSEE ORSAY', 'TICKET WEEZEVENT'
    ],
    priority: 50
  },
  {
    category: 'Invest',
    patterns: ['CLAUDE.AI'],
    priority: 50
  },
  {
    category: 'Addons',
    patterns: [
      'APPLE.COM/BILL', 'LUSH', 'L.Occitane', 'LOccitane', 'Orell Fussli',
      'PAPYRIN', 'ACTIONWORLD', 'WAL*LUSH', 'Google Play'
    ],
    priority: 50
  },
  // GOOGLE has lower priority - could be subscription or other
  {
    category: 'Youtube/Spotify',
    patterns: ['GOOGLE'],
    priority: 20
  }
];

// Sort rules by priority (highest first)
const sortedRules = [...categoryRules].sort((a, b) => b.priority - a.priority);

export function categorizeTransaction(bookingText: string, paymentPurpose: string, type: 'debit' | 'credit'): Category {
  // Skip categorization for credit (income) transactions
  if (type === 'credit') {
    return 'Uncategorized';
  }

  const textToMatch = `${bookingText} ${paymentPurpose}`.toLowerCase();

  for (const rule of sortedRules) {
    for (const pattern of rule.patterns) {
      if (textToMatch.includes(pattern.toLowerCase())) {
        return rule.category;
      }
    }
  }

  return 'Uncategorized';
}

export function getAllCategories(): Category[] {
  return [
    'Food',
    'Utilities',
    'Cafe/Restaurants',
    'Steam/HoYoverse',
    'AliExpress',
    'Youtube/Spotify',
    'Clothes',
    'Swisscom',
    'Sanitas (Med)',
    'SBB',
    'Rent',
    'Interdiscount/MediaMarkt',
    'Cash (ATM)',
    'Twint',
    'Support',
    'Travel',
    'Invest',
    'Addons',
    'Uncategorized'
  ];
}

export function getCategoryRules(): CategoryRule[] {
  return sortedRules;
}
