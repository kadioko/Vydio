import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PRICING_PACKAGES } from "@/lib/config/pricing"

const SNIPPE_API_URL = "https://api.snippe.sh"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageId } = await req.json()
    const pkg = PRICING_PACKAGES.find(p => p.id === packageId)
    
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    // Create a pending payment record
    const idempotencyKey = crypto.randomUUID()
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: pkg.price,
        currency: pkg.currency,
        creditsBought: pkg.credits,
        idempotencyKey,
      }
    })

    const appUrl = process.env.APP_URL || "http://localhost:3000"

    // Call Snippe to create a checkout session
    const response = await fetch(`${SNIPPE_API_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SNIPPE_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        amount: pkg.price,
        currency: pkg.currency,
        reference: payment.id, // We use our payment ID as reference
        webhook_url: `${appUrl}/api/payments/snippe/webhook`,
        success_url: `${appUrl}/payment/success`,
        cancel_url: `${appUrl}/payment/cancel`,
        customer: {
          email: session.user.email,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Snippe API Error:", errorData)
      throw new Error("Failed to create payment session")
    }

    const data = await response.json()
    
    // Update payment with provider reference if returned
    if (data.id) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerRef: data.id }
      })
    }

    return NextResponse.json({ 
      checkout_url: data.checkout_url || data.payment_url 
    })

  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
