// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Environment Variables Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xyvvdficauvzgavssnln.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bgKDD00e2-0XHltBTToetw_oYi19319'

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

/* -------------------------------------------------------------------------- */
/*                              AUTHENTICATION                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sign up a new user with email, password, and additional metadata.
 */
export async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw error
  return data
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current active session.
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/* -------------------------------------------------------------------------- */
/*                              LISTINGS (DESTINATIONS)                       */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all available listings.
 */
export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Fetch a single listing by ID.
 */
export async function getListingById(id) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Filter listings by location or country.
 */
export async function searchListings(query) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .or(`location.ilike.%${query}%,country.ilike.%${query}%`)

  if (error) throw error
  return data
}

/* -------------------------------------------------------------------------- */
/*                                  BOOKINGS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Create a new booking for the current user.
 */
export async function createBooking({ listingId, checkIn, checkOut, totalPrice }) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User must be logged in to create a booking.')

  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        user_id: user.id,
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        status: 'pending',
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Fetch all bookings for the authenticated user.
 */
export async function getUserBookings() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated.')

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      listings (
        title,
        location,
        country,
        images
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update the status of a booking (e.g., 'cancelled').
 */
export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()

  if (error) throw error
  return data[0]
}

/* -------------------------------------------------------------------------- */
/*                              USER PROFILES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the profile details of the current logged-in user.
 */
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

/* -------------------------------------------------------------------------- */
/*                           REALTIME SUBSCRIPTIONS                           */
/* -------------------------------------------------------------------------- */

/**
 * Subscribe to realtime updates on the bookings table for live status changes.
 */
export function subscribeToBookingUpdates(userId, onUpdate) {
  return supabase
    .channel('public:bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload)
      }
    )
    .subscribe()
}