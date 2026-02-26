import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-snippe-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const payload = await req.text()
    
    // Verify signature
    const secret = process.env.SNIPPE_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)
    
    // Event idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id }
    })

    if (existingEvent) {
      return NextResponse.json({ message: "Already processed" })
    }

    // Process event based on type
    if (event.type === "payment.succeeded") {
      const paymentData = event.data
      
      // Use transaction to ensure both operations succeed or fail together
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentData.reference }
        })

        if (!payment || payment.status === "paid") return

        // Mark payment as paid
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "paid", providerRef: paymentData.id }
        })

        // Credit user
        await tx.user.update({
          where: { id: payment.userId },
          data: { credits: { increment: payment.creditsBought } }
        })

        // Record event
        await tx.webhookEvent.create({
          data: {
            provider: "snippe",
            eventId: event.id,
          }
        })
      })
    } else if (event.type === "payment.failed") {
      const paymentData = event.data
      await prisma.payment.update({
        where: { id: paymentData.reference },
        data: { status: "failed" }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
