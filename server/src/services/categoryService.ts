import { Category } from '../models/Transaction';

interface CategoryRule {
  category: Category;
  patterns: string[];
  priority: number;
}

const categoryRules: CategoryRule[] = [
  // ============================================
  // HIGH PRIORITY RULES (specific patterns first)
  // ============================================

  // Rideshare - Uber trips (not food delivery)
  {
    category: 'Rideshare',
    patterns: ['UBER *TRIP', 'UBER  *TRIP', 'UBER   *TRIP', 'Bolt', 'Taxi', 'LYFT'],
    priority: 100
  },
  // Dining Out - Uber Eats food delivery
  {
    category: 'Dining Out',
    patterns: ['UBER *EATS', 'UBER  *EATS'],
    priority: 100
  },
  // Rent - fixed costs
  {
    category: 'Rent',
    patterns: ['Standing order', 'Miete', 'ALBEK AMBRA'],
    priority: 90
  },

  // ============================================
  // STANDARD PRIORITY RULES
  // ============================================

  // Essential/Fixed Costs
  {
    category: 'Health Insurance',
    patterns: ['Sanitas', 'Helsana', 'CSS', 'Visana', 'Krankenkasse', 'Grundversicherung'],
    priority: 50
  },
  {
    category: 'Mobile & Internet',
    patterns: ['Swisscom', 'SWISSCOM BILLING', 'Sunrise', 'Salt', 'UPC', 'Quickline'],
    priority: 50
  },
  {
    category: 'Bank Fees',
    patterns: ['Payment transaction prices', 'Interest on amount overdrawn', 'Interest on credit', 'Kontoführung', 'Bankgebühr'],
    priority: 50
  },

  // Daily Living
  {
    category: 'Groceries',
    patterns: [
      'Migros', 'Coop', 'Denner', 'migrolino', 'Avec', 'Aldi', 'Lidl',
      'COOP VITALITY', 'CARREFOUR', 'MONOPRIX', 'k kiosk',
      'Filiale', 'SUPERETTE', 'Spar', 'Volg'
    ],
    priority: 50
  },
  {
    category: 'Dining Out',
    patterns: [
      'Lakomka', 'SUBWAY', 'WANGKHAR', 'STARBUCKS', 'Seven Stars',
      'Suan Long', 'MCDONALDS', 'Aroy Food', 'VICAFE', 'Caffe Spettacolo',
      'Kuni & Gunde', 'Miro Bahnhof', 'Scent of Bamboo', 'K2 Express',
      'Restaurant', 'Cafe', 'Coffee', 'MINIME', 'PHIE HALWANI',
      'HIPPY MARKET', 'LE COLVERT', 'LE LUTECE', 'SAPPORO', 'GEORGIEN',
      'Oranta', 'Walkthrough Level', 'Burger King', 'KFC', 'Pizza',
      'Tamarind Hill', 'Rice Up!'
    ],
    priority: 50
  },
  {
    category: 'Cash Withdrawal',
    patterns: ['Withdrawal', 'ATM', 'Bargeld', 'Bargeldbezug'],
    priority: 50
  },

  // Transportation
  {
    category: 'Public Transport',
    patterns: ['SBB CFF FFS', 'ZVV', 'DB FERNVERKEHR', 'Bahn', 'VERKEHRSVERBUND', 'BLS', 'Tram', 'Bus AG'],
    priority: 50
  },
  {
    category: 'Travel',
    patterns: [
      'HOTEL', 'SNCF', 'RATP', 'MUSEE', 'LOUVRE', 'Booking', 'Airbnb',
      'Flug', 'flight', 'SWISS INTERNATIONAL AIR', 'SERVICE NAVIGO',
      'TICKET', 'LOUVRETICKET', 'MUSEE ORSAY', 'TICKET WEEZEVENT',
      'ORSAY', 'TGV', 'Eurostar', 'Ryanair', 'Easyjet'
    ],
    priority: 50
  },

  // Shopping
  {
    category: 'Electronics',
    patterns: [
      'Interdiscount', 'MediaMarkt', 'MEDIA MARKT', 'mobilezone', 'Digitec', 'Galaxus',
      'Apple Store', 'Apple Zurich', 'APPLE.COM/BILL', 'Google Play'
    ],
    priority: 50
  },
  {
    category: 'Home & Furnishing',
    patterns: ['IKEA', 'JUMBO', 'Möbel', 'Pfister', 'Micasa', 'Lumimart', 'Personenmeldeamt'],
    priority: 50
  },
  {
    category: 'Clothing',
    patterns: [
      'H & M', 'H&M', 'Metro Boutique', 'Zara', 'C&A', 'PKZ',
      'Decathlon', 'Dr Martens', 'LARRY H', 'FJ DIFFUSION', 'MON ETOILE',
      'Uniqlo', 'Mango', 'Reserved', 'Snipes', 'Foot Locker'
    ],
    priority: 50
  },
  {
    category: 'Online Shopping',
    patterns: ['aliexpress', 'Alibaba', 'Amazon', 'AMZN', 'eBay', 'Wish', 'Temu'],
    priority: 50
  },

  // Entertainment & Subscriptions
  {
    category: 'Streaming',
    patterns: ['Spotify', 'YouTube', 'Netflix', 'Disney', 'HBO', 'Twitch', 'Crunchyroll'],
    priority: 50
  },
  {
    category: 'Gaming',
    patterns: ['Steam', 'STEAM PURCHASE', 'STEAMGAMES', 'HoYoverse', 'HOYOVERSE', 'PlayStation', 'Xbox', 'Nintendo', 'Epic Games'],
    priority: 50
  },
  {
    category: 'AI Tools',
    patterns: ['CLAUDE.AI', 'ChatGPT', 'OpenAI', 'Cursor', 'Copilot', 'Anthropic'],
    priority: 50
  },

  // Health & Wellness
  {
    category: 'Medical & Pharmacy',
    patterns: [
      'ODONTO', 'APOTHEKE', 'PHARMACIE', 'zahnarztzentrum', 'STERNEN-APOTHEKE',
      'Dentist', 'Zahnarzt', 'Arzt', 'Praxis', 'Klinik', 'Spital', 'DOUAT'
    ],
    priority: 50
  },
  {
    category: 'Fitness',
    patterns: ['NonStop Gym', 'Gym', 'Fitnesscenter', 'ACTIV FITNESS', 'Migros Fitness', 'Holmes Place', 'Kieser', 'Crossfit'],
    priority: 50
  },
  {
    category: 'Personal Care',
    patterns: [
      'LUSH', 'L.Occitane', 'LOccitane', 'FADECUT', 'Coiffeur', 'Haircut',
      'Friseur', 'Barber', 'Salon', 'WAL*LUSH', 'WEST FADECUT', 'Sephora', 'Douglas'
    ],
    priority: 50
  },

  // Other
  {
    category: 'Education',
    patterns: ['Preply', 'Udemy', 'Coursera', 'Orell Fussli', 'Buchhandlung', 'Books', 'PAPYRIN', 'Ex Libris', 'Thalia'],
    priority: 50
  },
  {
    category: 'Insurance',
    patterns: ['AXA', 'Mobiliar', 'VERSICHERUNG', 'Zurich Insurance', 'Allianz', 'Generali', 'Baloise'],
    priority: 50
  },

  // ============================================
  // LOWER PRIORITY RULES (catch-all patterns)
  // ============================================

  // GOOGLE - likely YouTube/Streaming
  {
    category: 'Streaming',
    patterns: ['GOOGLE'],
    priority: 20
  }
];

// Sort rules by priority (highest first)
const sortedRules = [...categoryRules].sort((a, b) => b.priority - a.priority);

export function categorizeTransaction(
  bookingText: string,
  paymentPurpose: string,
  type: 'debit' | 'credit',
  userFullName?: string
): Category {
  const textToMatch = `${bookingText} ${paymentPurpose}`.toLowerCase();

  // Check for savings transfer first (applies to both credit and debit)
  // Only check if userFullName is provided and not empty
  if (userFullName && userFullName.trim()) {
    const savingsPattern = `account transfer: ${userFullName.toLowerCase()}`;
    if (textToMatch.includes(savingsPattern)) {
      return 'Savings Transfer';
    }
  }

  // Skip categorization for other credit (income) transactions
  if (type === 'credit') {
    return 'Uncategorized';
  }

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
    // Essential/Fixed Costs
    'Rent',
    'Health Insurance',
    'Mobile & Internet',
    'Bank Fees',
    // Daily Living
    'Groceries',
    'Dining Out',
    'Cash Withdrawal',
    // Transportation
    'Public Transport',
    'Rideshare',
    'Travel',
    // Shopping
    'Electronics',
    'Home & Furnishing',
    'Clothing',
    'Online Shopping',
    // Entertainment & Subscriptions
    'Streaming',
    'Gaming',
    'AI Tools',
    // Health & Wellness
    'Medical & Pharmacy',
    'Fitness',
    'Personal Care',
    // Other
    'Education',
    'Insurance',
    'Savings Transfer',
    'Uncategorized'
  ];
}

export function getCategoryRules(): CategoryRule[] {
  return sortedRules;
}
