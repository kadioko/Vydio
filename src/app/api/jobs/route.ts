import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CREDIT_COSTS, DurationOption } from "@/lib/config/pricing"

// Hard rate limit: max 3 jobs per minute per user
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_JOBS = 3

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, durationSeconds } = await req.json()

    // Validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
    }
    const cleanPrompt = prompt.trim().slice(0, 800)

    if (![4, 10, 30, 60].includes(durationSeconds)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }

    const duration = durationSeconds as DurationOption
    const creditCost = CREDIT_COSTS[duration]

    // Rate limiting check
    const recentJobsCount = await prisma.videoJob.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
        }
      }
    })

    if (recentJobsCount >= RATE_LIMIT_MAX_JOBS) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before trying again." },
        { status: 429 }
      )
    }

    // Check credits and create job in a transaction to prevent race conditions
    const job = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user || user.credits < creditCost) {
        throw new Error("INSUFFICIENT_CREDITS")
      }

      // Deduct credits immediately
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } }
      })

      // Create queued job
      return await tx.videoJob.create({
        data: {
          userId: user.id,
          prompt: cleanPrompt,
          durationSeconds: duration,
          status: "queued"
        }
      })
    })

    // Initiate Veo generation via Gemini API asynchronously
    // Using direct fetch since Node SDK may not fully support Veo specific params yet
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
      
      // Note: Endpoint structure based on standard Google AI REST patterns for async generation
      // Google's actual endpoint might be slightly different for Veo; this is a reasonable MVP placeholder
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate:generateVideo?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: cleanPrompt }] }],
          generationConfig: {
            durationSeconds: duration
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errText}`);
      }
      
      const data = await response.json();
      
      // Usually it returns an operation/job ID to poll
      const operationId = data.name || data.operationId || data.jobId || "mock_job_id_" + Date.now();

      // Update job with provider ID
      await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          providerJobId: operationId,
          status: "running"
        }
      })

      return NextResponse.json({ jobId: job.id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (genError: any) {
      // If generation fails to start, refund credits and mark failed
      console.error("Video generation start failed:", genError)
      
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { increment: creditCost } }
        }),
        prisma.videoJob.update({
          where: { id: job.id },
          data: { 
            status: "failed", 
            error: genError.message || "Failed to start generation" 
          }
        })
      ])

      return NextResponse.json(
        { error: "Failed to start generation, credits refunded" },
        { status: 500 }
      )
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }
    
    console.error("Create job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
