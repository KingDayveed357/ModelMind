// supabase/functions/launch-notifications/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('NEXT_PUBLIC_RESEND_API_KEY')! // Add this to your Supabase secrets

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get launch config
    const { data: config, error: configError } = await supabase
      .from('launch_config')
      .select('*')
      .limit(1)
      .single()
    
    if (configError) throw configError
    
    const launchDate = new Date(config.launch_date)
    const now = new Date()
    const daysUntilLaunch = Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log(`Days until launch: ${daysUntilLaunch}`)
    
    // Check if it's 15 days before launch and reminder not sent
    if (daysUntilLaunch === 15 && !config.reminder_sent) {
      console.log('Sending 15-day reminder to developer...')
      
      await sendEmail(
        'davidaniago@gmail.com',
        '🚨 15 Days Until Dashboard AI Launch!',
        `
        <h2>Launch Reminder</h2>
        <p>Hey David!</p>
        <p>Just a heads up - the Dashboard AI Assistant launches in <strong>15 days</strong>!</p>
        <p><strong>Launch Date:</strong> ${launchDate.toLocaleDateString()}</p>
        <p>Time to finalize:</p>
        <ul>
          <li>Final testing and QA</li>
          <li>Documentation updates</li>
          <li>Marketing materials</li>
          <li>Email templates for launch day</li>
        </ul>
        <p>You've got this! 💪</p>
        `
      )
      
      // Mark reminder as sent
      await supabase
        .from('launch_config')
        .update({ reminder_sent: true })
        .eq('id', config.id)
      
      console.log('✅ Reminder sent successfully')
    }
    
    // Check if it's launch day and emails not sent
    if (daysUntilLaunch <= 0 && !config.launch_email_sent) {
      console.log('🚀 Launch day! Sending notifications...')
      
      // Get all waitlist emails
      const { data: waitlist, error: waitlistError } = await supabase
        .from('waitlist')
        .select('email, user_id')
        .eq('notified', false)
      
      if (waitlistError) throw waitlistError
      
      console.log(`Found ${waitlist.length} subscribers to notify`)
      
      // Send launch emails (batch to avoid rate limits)
      const batchSize = 50
      for (let i = 0; i < waitlist.length; i += batchSize) {
        const batch = waitlist.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (subscriber) => {
          try {
            await sendEmail(
              subscriber.email,
              '🎉 Dashboard AI Assistant is Live!',
              `
              <h2>We're Live! 🚀</h2>
              <p>The wait is over! The Dashboard AI Assistant is now available.</p>
              <p>Start supercharging your analytics workflow today:</p>
              <a href="https://modelmind.ai/dashboard-ai" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Get Started Now
              </a>
              <p>Thank you for being an early supporter!</p>
              <p>- The ModelMind Team</p>
              `
            )
            
            // Mark as notified
            await supabase
              .from('waitlist')
              .update({ notified: true })
              .eq('email', subscriber.email)
            
          } catch (error) {
            console.error(`Failed to send to ${subscriber.email}:`, error)
          }
        }))
        
        // Rate limit delay between batches
        if (i + batchSize < waitlist.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // Mark launch emails as sent
      await supabase
        .from('launch_config')
        .update({ launch_email_sent: true })
        .eq('id', config.id)
      
      console.log('✅ Launch notifications sent successfully')
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        daysUntilLaunch,
        reminderSent: config.reminder_sent,
        launchEmailsSent: config.launch_email_sent
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to send emails via Resend
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: 'ModelMind <noreply@modelmind.ai>',
      to: [to],
      subject: subject,
      html: html
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }
  
  return response.json()
}

