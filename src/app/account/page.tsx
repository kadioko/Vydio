import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Coins, Video, Clock, CheckCircle, XCircle } from "lucide-react"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/account")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true, email: true, name: true }
  })

  const recentJobs = await prisma.videoJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  })

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Account</h1>
        <p className="text-gray-600 mt-2">Manage your credits and view past generations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Coins className="h-6 w-6" />
            <h2 className="text-xl font-semibold text-gray-900">Credit Balance</h2>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            {user?.credits || 0}
          </div>
          <a 
            href="/pricing" 
            className="block w-full text-center bg-indigo-50 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
          >
            Buy More Credits
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Info</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name</span>
              <p className="text-gray-900">{user?.name || "Not set"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email</span>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Recent Generations</h2>
        </div>
        
        {recentJobs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven&apos;t generated any videos yet.</p>
            <a href="/app" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
              Go to Generator
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentJobs.map((job: { id: string; prompt: string; createdAt: Date; durationSeconds: number; status: string; videoUrl: string | null }) => (
              <li key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {job.prompt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span>{job.durationSeconds}s duration</span>
                      
                      <span className="flex items-center gap-1 font-medium capitalize">
                        {job.status === "succeeded" && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {job.status === "failed" && <XCircle className="h-3 w-3 text-red-500" />}
                        {(job.status === "queued" || job.status === "running") && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        <span className={
                          job.status === "succeeded" ? "text-green-600" :
                          job.status === "failed" ? "text-red-600" : "text-blue-600"
                        }>
                          {job.status}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {job.status === "succeeded" && job.videoUrl && (
                    <a 
                      href={job.videoUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md"
                    >
                      View
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
