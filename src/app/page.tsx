import Link from "next/link"
import { Video, Sparkles, Zap, Shield, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
            Create stunning AI videos <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              powered by Google Veo
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Transform your text into high-quality, cinematic videos in minutes. 
            No subscription required—just buy credits and generate.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/app" 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Start Generating <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32 flex-grow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Professional video generation made simple
            </p>
          </div>
          
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold leading-7 text-gray-900 mb-2">State-of-the-art AI</h3>
                <p className="text-base leading-7 text-gray-600 flex-grow">
                  Powered by Google&apos;s Veo model, delivering unprecedented quality, physical accuracy, and prompt adherence.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold leading-7 text-gray-900 mb-2">Pay As You Go</h3>
                <p className="text-base leading-7 text-gray-600 flex-grow">
                  No monthly commitments. Buy credits when you need them, and they never expire. Generate videos from 4 to 60 seconds.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold leading-7 text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-base leading-7 text-gray-600 flex-grow">
                  Your generations are private to your account. We use secure authentication and robust payment processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Placeholder */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Video className="h-5 w-5" />
            <span>Vydio &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
