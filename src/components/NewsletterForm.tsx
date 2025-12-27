'use client'

import { useState, FormEvent } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Store in localStorage as placeholder
    // Only access localStorage in browser
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    
    try {
      const stored = localStorage.getItem('newsletterSubscribers')
      const subscribers = stored ? JSON.parse(stored) : []
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers))
      }
      setSubscribed(true)
      setEmail('')
    } catch (err) {
      // Ignore localStorage errors
      console.warn('[NewsletterForm] Failed to save to localStorage', err)
    }
  }

  if (subscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-semibold">
          Thank you for subscribing!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
        >
          Subscribe
        </button>
      </div>
    </form>
  )
}

