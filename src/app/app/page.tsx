"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Loader2, Video as VideoIcon, Download, AlertCircle } from "lucide-react"

type JobStatus = "queued" | "running" | "succeeded" | "failed"

interface Job {
  id: string
  status: JobStatus
  videoUrl: string | null
  error: string | null
}

const DURATION_OPTIONS = [
  { value: 4, label: "4 seconds", cost: 1 },
  { value: 10, label: "10 seconds", cost: 2 },
  { value: 30, label: "30 seconds", cost: 5 },
  { value: 60, label: "60 seconds", cost: 9 },
]

export default function GeneratorApp() {
  const { data: session } = useSession()
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentJob, setCurrentJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (currentJob && (currentJob.status === "queued" || currentJob.status === "running")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/${currentJob.id}`)
          if (res.ok) {
            const data = await res.json()
            setCurrentJob(data)
            
            // If finished, stop polling and update session to reflect potential credit refunds on failure
            if (data.status === "succeeded" || data.status === "failed") {
              clearInterval(interval)
              // Refresh page to get new credits, or trigger session update
              if (data.status === "failed") {
                setError(data.error || "Generation failed. Credits have been refunded.")
              }
            }
          }
        } catch (err) {
          console.error("Polling error:", err)
        }
      }, 3000) // Poll every 3 seconds
    }

    // Failsafe: stop polling after 5 minutes max
    const timeout = setTimeout(() => {
      if (interval) clearInterval(interval)
    }, 5 * 60 * 1000)

    return () => {
      if (interval) clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [currentJob])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    if (prompt.length > 800) {
      setError("Prompt must be 800 characters or less")
      return
    }

    const selectedDuration = DURATION_OPTIONS.find(d => d.value === duration)
    if (!selectedDuration) return

    if (!session || session.user.credits < selectedDuration.cost) {
      setError(`Insufficient credits. You need ${selectedDuration.cost} credits for this duration.`)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setCurrentJob(null)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, durationSeconds: duration }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to start generation")
      }

      setCurrentJob({
        id: data.jobId,
        status: "queued",
        videoUrl: null,
        error: null
      })

      // In a real app we might want to update the local session credits immediately for better UX
      // But NextAuth doesn't make this trivial without a full session refresh
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign in to Generate Videos</h1>
        <p className="text-gray-600 mb-8">You need an account to use the AI Video Generator.</p>
        <a href="/api/auth/signin" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">
          Sign In / Create Account
        </a>
      </div>
    )
  }

  const selectedCost = DURATION_OPTIONS.find(d => d.value === duration)?.cost || 1

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Video Generator</h1>
        <p className="text-gray-600 mt-2">Describe what you want to see, and Veo will generate it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a futuristic city..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                maxLength={800}
                disabled={isSubmitting || (currentJob !== null && (currentJob.status === 'queued' || currentJob.status === 'running'))}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {prompt.length}/800
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting || (currentJob !== null && (currentJob.status === 'queued' || currentJob.status === 'running'))}
              >
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.cost} {opt.cost === 1 ? 'credit' : 'credits'})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isSubmitting || !prompt.trim() || session.user.credits < selectedCost || (currentJob !== null && (currentJob.status === 'queued' || currentJob.status === 'running'))}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <VideoIcon className="h-5 w-5" />
                  Generate Video
                </>
              )}
            </button>
            
            <div className="text-center mt-3 text-sm text-gray-500">
              Cost: <span className="font-medium text-gray-900">{selectedCost} credits</span>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl aspect-video w-full flex flex-col items-center justify-center overflow-hidden relative shadow-lg">
            
            {!currentJob && (
              <div className="text-gray-400 flex flex-col items-center">
                <VideoIcon className="h-16 w-16 mb-4 opacity-50" />
                <p>Your generated video will appear here</p>
              </div>
            )}

            {currentJob && (currentJob.status === "queued" || currentJob.status === "running") && (
              <div className="text-white flex flex-col items-center text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-400" />
                <h3 className="text-xl font-medium mb-2">
                  {currentJob.status === "queued" ? "Waiting in queue..." : "Generating your video..."}
                </h3>
                <p className="text-gray-400 max-w-md">
                  This can take several minutes depending on the duration. We are polling the server automatically.
                </p>
              </div>
            )}

            {currentJob && currentJob.status === "failed" && (
              <div className="text-white flex flex-col items-center text-center p-6">
                <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
                <h3 className="text-xl font-medium mb-2 text-red-400">Generation Failed</h3>
                <p className="text-gray-400 max-w-md">
                  {currentJob.error || "An unknown error occurred during generation."}
                </p>
                <button 
                  onClick={() => setCurrentJob(null)}
                  className="mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {currentJob && currentJob.status === "succeeded" && currentJob.videoUrl && (
              <div className="w-full h-full group relative">
                <video 
                  src={currentJob.videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-contain bg-black"
                />
                
                {/* Overlay actions on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={currentJob.videoUrl} 
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm flex items-center gap-2 transition-colors"
                    title="Download Video"
                  >
                    <Download className="h-5 w-5" />
                    <span className="text-sm font-medium pr-1">Download</span>
                  </a>
                </div>
              </div>
            )}

          </div>
          
          {currentJob && currentJob.status === "succeeded" && (
            <div className="mt-4 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Generation Complete
              </div>
              <button 
                onClick={() => {
                  setCurrentJob(null)
                  setPrompt("")
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Create another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
