export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-indigo">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Vydio, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2>2. Description of Service</h2>
        <p>Vydio provides an AI-powered video generation service utilizing Google&apos;s Veo technology.</p>
        
        <h2>3. Credits and Payments</h2>
        <p>Credits purchased are non-refundable. They do not expire and remain on your account until used.</p>
        
        <h2>4. User Content</h2>
        <p>You are responsible for any prompts you submit. Do not submit prompts that violate laws or generate harmful content.</p>
      </div>
    </div>
  )
}
