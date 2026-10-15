/*
 * Easvia account records: four corrected purchases and three fee schedules.
 * Purchase details and due/fee dates were supplied by the account owner on
 * October 15, 2026, correcting the earlier October 14 statement.
 *
 * This static GitHub Pages login does not protect this file or credentials.
 */
window.EASVIA_CONFIG = {
  brand: 'Easvia',
  currency: 'CAD',
  accountHolder: 'Jake Lee',
  login: {
    userId: 'jakelee',
    pin: '0419',
    password: null
  },
  schedule: { statementDay: 14, firstStatementMonth: '2025-01' },
  purchases: [
    {
      id: 'orchid',
      name: 'Air Jordan 4 “Orchid” (Kicks)', shortName: 'Air Jordan 4 “Orchid”',
      category: 'Kicks', purchaseDate: '2025-01-05',
      dueDate: '2025-07-05', feeGroupId: 'jan-5-shared',
      principalCents: 850, icon: 'shirt'
    },
    {
      id: 'blueberry-faygo',
      name: 'Blueberry Faygo (Jam Track)', shortName: 'Blueberry Faygo',
      category: 'Jam Track', purchaseDate: '2025-01-05',
      dueDate: '2025-07-05', feeGroupId: 'jan-5-shared',
      principalCents: 550, icon: 'music'
    },
    {
      id: 'x-force',
      name: 'X-Force (Outfit)', shortName: 'X-Force',
      category: 'Outfit', purchaseDate: '2025-01-21',
      dueDate: '2025-08-15', feeGroupId: 'x-force-fee',
      principalCents: 3000, icon: 'shirt'
    },
    {
      id: 'sugar-rush',
      name: 'Sugar Rush (Emote)', shortName: 'Sugar Rush',
      category: 'Emote', purchaseDate: '2025-01-23',
      dueDate: '2025-07-23', feeGroupId: 'sugar-rush-fee',
      principalCents: 500, icon: 'sparkles'
    }
  ],
  /* Exactly ONE monthly fee applies to the two Jan 5 purchases combined.
     Keeping it as a separate group avoids inventing a fee allocation. */
  feeGroups: [
    {
      id: 'jan-5-shared', name: 'Jan 5 purchases — shared late fee',
      purchaseIds: ['orchid', 'blueberry-faygo'],
      dueDate: '2025-07-05', lateFeeStart: '2025-08-05',
      monthlyLateFeeCents: 150
    },
    {
      id: 'x-force-fee', name: 'X-Force — late fee',
      purchaseIds: ['x-force'],
      dueDate: '2025-08-15', lateFeeStart: '2025-09-15',
      monthlyLateFeeCents: 300
    },
    {
      id: 'sugar-rush-fee', name: 'Sugar Rush — late fee',
      purchaseIds: ['sugar-rush'],
      dueDate: '2025-07-23', lateFeeStart: '2025-08-23',
      monthlyLateFeeCents: 50
    }
  ],
  /* Add only verified received payments here; save and republish the website.
     Example: {date: '2026-11-05', amountCents: 2500, note: 'Payment received'} */
  payments: []
};
