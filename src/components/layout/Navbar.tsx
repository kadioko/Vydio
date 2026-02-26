import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Video, Coins, LogOut, LayoutDashboard, CreditCard } from "lucide-react"

export default async function Navbar() {
  const session = await getServerSession(authOptions)

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <Video className="h-6 w-6" />
              <span>Vydio</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  <Coins className="h-4 w-4" />
                  <span>{session.user.credits} Credits</span>
                </div>
                <Link href="/app" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Generator
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Buy Credits
                </Link>
                <Link href="/account" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Account
                </Link>
                <Link href="/api/auth/signin" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/api/auth/signin" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
