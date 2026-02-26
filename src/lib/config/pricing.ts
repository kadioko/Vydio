export const PRICING_PACKAGES = [
  {
    id: "pkg_20",
    name: "Starter Pack",
    credits: 2,
    price: 10000, // in TZS
    currency: "TZS",
  },
  {
    id: "pkg_60",
    name: "Creator Pack",
    credits: 10,
    price: 45000,
    currency: "TZS",
    popular: true,
  },
  {
    id: "pkg_150",
    name: "Pro Pack",
    credits: 25,
    price: 100000,
    currency: "TZS",
  },
]

export const CREDIT_COSTS = {
  4: 1,
  10: 2,
  30: 5,
  60: 9,
} as const

export type DurationOption = keyof typeof CREDIT_COSTS
