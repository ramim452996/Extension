import type { PageSnapshot, CompareState } from '../types'

// Herd runs automatically in the background on https://compare-backend.test (no artisan serve needed)
const API_URL = 'https://compare-backend.test/api/v1/compare'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Fetch a comparison from the backend API.
 */
export async function fetchComparison(
  installId: string,
  goal: string,
  pages: PageSnapshot[]
): Promise<any> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        installId,
        goal,
        pages,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiError(429, "Today's free comparison limit has been reached. Please try again later.")
      }
      
      let errorMsg = 'Comparison failed. Please try again.'
      try {
        const errorData = await response.json()
        if (errorData.message) errorMsg = errorData.message
      } catch {
        // Fallback to generic message
      }
      
      throw new ApiError(response.status, errorMsg)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // General network error (e.g. backend offline)
    throw new ApiError(503, 'Compare Anything is temporarily unavailable. Please ensure the backend is running.')
  }
}
