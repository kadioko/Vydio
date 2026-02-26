"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { PRICING_PACKAGES } from "@/lib/config/pricing"
import { Loader2, Check, CreditCard, Sparkles } from "lucide-react"

export default function PricingPage() {
  const { data: session } = useSession()
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (pkgId: string) => {
    if (!session) {
      window.location.href = "/api/auth/signin?callbackUrl=/pricing"
      return
    }

    setLoadingPkg(pkgId)
    setError(null)

    try {
      const res = await fetch("/api/payments/snippe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkgId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred during checkout")
      }
      setLoadingPkg(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Buy credits to generate AI videos. 1 credit = 4 seconds of video.
          No subscription required.
        </p>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRICING_PACKAGES.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`bg-white rounded-2xl shadow-sm border flex flex-col ${
              pkg.popular 
                ? 'border-indigo-500 ring-1 ring-indigo-500 relative' 
                : 'border-gray-200'
            }`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-8 flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                {pkg.price.toLocaleString()}
                <span className="ml-1 text-xl font-medium text-gray-500">{pkg.currency}</span>
              </div>
              <p className="mt-2 text-lg text-indigo-600 font-medium">
                {pkg.credits} Credits
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    ~{Math.floor(pkg.credits / 1)} short generations (4s)
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">
                    Or {Math.floor(pkg.credits / 9)} long generations (60s)
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-sm text-gray-600">Credits never expire</p>
                </li>
              </ul>
            </div>
            
            <div className="p-8 pt-0 mt-auto">
              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loadingPkg !== null}
                className={`w-full flex justify-center items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  pkg.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPkg === pkg.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {session ? 'Buy Now' : 'Sign in to Buy'}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
