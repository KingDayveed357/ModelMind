// lib/services/datasetService.ts
import { apiRequest } from "@/lib/api-client"

export interface Dataset {
  id: string
  user_id: string
  name: string
  file_url: string
  uploaded_at: string
  rows: number
  columns: number
  has_missing: boolean
  metadata?: any
}

/**
 * Fetch all datasets belonging to the current user.
 */
export async function getUserDatasets(): Promise<Dataset[]> {
  return apiRequest<Dataset[]>("/datasets/")
}

/**
 * Upload a new dataset.
 * @param file CSV file
 */
export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<any>("/datasets/upload", {
    method: "POST",
    body: formData,
  })
}

/**
 * Delete a dataset by ID.
 */
export async function deleteDataset(datasetId: string): Promise<any> {
  return apiRequest<any>(`/datasets/${datasetId}`, {
    method: "DELETE",
  })
}
