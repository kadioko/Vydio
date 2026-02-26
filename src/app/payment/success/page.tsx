import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <div className="mb-8 flex justify-center">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Your credits have been added to your account. You can now start generating amazing videos with Veo.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/app" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          Go to Generator
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link 
          href="/account" 
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          View Account
        </Link>
      </div>
    </div>
  )
}
