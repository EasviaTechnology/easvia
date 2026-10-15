/*
 * Easvia reference data. All original amounts and dates below are copied
 * from the Payment Due Statement dated October 14, 2026.
 *
 * NOTE: Public GitHub Pages hosting exposes this entire file and the login
 * credentials to anyone who can inspect the site. This is a convenience gate,
 * NOT secure authentication. Use a real authentication backend for privacy.
 */
window.EASVIA_CONFIG = {
  brand: 'Easvia',
  currency: 'CAD',
  accountHolder: 'Jake Lee',
  login: {
    userId: 'jakelee',
    pin: '0419',
    password: null // Set a string to enable password sign-in. Not secure on static hosting.
  },
  schedule: {
    statementDay: 14,
    firstStatementMonth: '2025-01'
  },
  purchases: [
    {
      id: 'orchid-faygo',
      name: 'Air Jordan 4 “Orchid” (Kicks) / Blueberry Faygo (Jam Track)',
      shortName: 'Orchid / Blueberry Faygo',
      category: 'Kicks + Jam Track',
      purchaseDate: '2025-01-05',
      lateFeeStart: '2025-07-05',
      principalCents: 1400,
      monthlyLateFeeCents: 150,
      icon: 'music'
    },
    {
      id: 'x-force',
      name: 'X-Force (Outfit)',
      shortName: 'X-Force',
      category: 'Outfit',
      purchaseDate: '2025-01-21',
      lateFeeStart: '2025-08-15',
      principalCents: 3000,
      monthlyLateFeeCents: 300,
      icon: 'shirt'
    },
    {
      id: 'sugar-rush',
      name: 'Sugar Rush (Emote)',
      shortName: 'Sugar Rush',
      category: 'Emote',
      purchaseDate: '2025-01-23',
      lateFeeStart: '2025-07-23',
      principalCents: 500,
      monthlyLateFeeCents: 50,
      icon: 'sparkles'
    }
  ],
  /* If an actual payment is received, the site owner must update this array
     and publish the revised repository. It does not sync automatically.
     Example: {date: '2026-11-05', amountCents: 2500, note: 'Interac transfer'} */
  payments: []
};
