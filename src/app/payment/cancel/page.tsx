import Link from "next/link"
import { XCircle, ArrowLeft } from "lucide-react"

export default function PaymentCancelPage() {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <div className="mb-8 flex justify-center">
        <XCircle className="h-20 w-20 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
      <p className="text-gray-600 mb-8">
        Your checkout session was cancelled. Your account has not been charged.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/pricing" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}
