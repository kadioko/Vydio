import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const job = await prisma.videoJob.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user owns the job
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // If job is already terminal, just return it
    if (job.status === "succeeded" || job.status === "failed") {
      return NextResponse.json(job)
    }

    // Otherwise, check status with Gemini API
    if (job.providerJobId) {
      try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set")

        // Construct standard async operation polling URL
        // Endpoint structure based on standard Google AI REST patterns for async generation
        const operationUrl = job.providerJobId.startsWith('http') 
          ? `${job.providerJobId}?key=${apiKey}` // if providerJobId was stored as full URL
          : `https://generativelanguage.googleapis.com/v1beta/${job.providerJobId}?key=${apiKey}`; // if stored as operation name

        const response = await fetch(operationUrl);

        if (!response.ok) {
          const errText = await response.text();
          console.error("Gemini polling error:", response.status, errText);
          // Don't fail the job on transient network errors, just return current state
          return NextResponse.json(job)
        }

        const data = await response.json();
        
        let newStatus = job.status;
        let newVideoUrl = job.videoUrl;
        let newError = job.error;

        if (data.done) {
          if (data.error) {
            newStatus = "failed";
            newError = data.error.message || "Unknown generation error";
            
            // Refund credits on failure
            const creditCost = job.durationSeconds === 4 ? 1 : 
                               job.durationSeconds === 10 ? 2 : 
                               job.durationSeconds === 30 ? 5 : 9;
            
            await prisma.user.update({
              where: { id: session.user.id },
              data: { credits: { increment: creditCost } }
            });
            
          } else if (data.response) {
            newStatus = "succeeded";
            // Depending on Veo response structure, extract the video URL
            // This is a placeholder for where the URI would typically be in standard AI responses
            newVideoUrl = data.response.videoUri || data.response.uri || data.response.outputUrl || "";
          }

          // Update database if status changed
          if (newStatus !== job.status) {
            const updatedJob = await prisma.videoJob.update({
              where: { id: job.id },
              data: {
                status: newStatus,
                videoUrl: newVideoUrl,
                error: newError
              }
            });
            return NextResponse.json(updatedJob);
          }
        }
      } catch (pollError) {
        console.error("Error polling provider:", pollError);
        // Return current state on poll error
      }
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error("Get job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
