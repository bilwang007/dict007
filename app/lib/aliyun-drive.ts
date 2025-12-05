// 阿里云盘 (Alibaba Cloud Drive) integration
// API Documentation: https://open.alipan.com/docs

interface AliyunDriveToken {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
}

interface AliyunDriveFile {
  file_id: string
  name: string
  type: 'file' | 'folder'
  size: number
  download_url?: string
  thumbnail?: string
}

class AliyunDriveClient {
  private clientId: string
  private clientSecret: string
  private refreshToken: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.clientId = process.env.ALIYUN_DRIVE_CLIENT_ID || ''
    this.clientSecret = process.env.ALIYUN_DRIVE_CLIENT_SECRET || ''
    this.refreshToken = process.env.ALIYUN_DRIVE_REFRESH_TOKEN || ''
  }

  /**
   * Get access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken
    }

    // Refresh token
    const response = await fetch('https://openapi.alipan.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`)
    }

    const data: AliyunDriveToken = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000

    return this.accessToken
  }

  /**
   * Upload file to 阿里云盘
   * @param file File to upload
   * @param folderPath Destination folder path (e.g., '/ai-dictionary/images')
   * @returns File URL
   */
  async uploadFile(file: File | Buffer, fileName: string, folderPath: string = '/ai-dictionary'): Promise<string> {
    const token = await this.getAccessToken()

    // Step 1: Get upload URL
    const createResponse = await fetch('https://openapi.alipan.com/adrive/v2/file/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        type: 'file',
        parent_file_id: 'root', // Or get folder ID first
        check_name_mode: 'auto_rename',
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create file: ${createResponse.statusText}`)
    }

    const createData = await createResponse.json()
    const fileId = createData.file_id
    const uploadUrl = createData.upload_url

    // Step 2: Upload file content
    // Convert to ArrayBuffer for fetch
    let body: BodyInit
    if (file instanceof File) {
      body = await file.arrayBuffer()
    } else if (file instanceof Buffer) {
      // Create a new ArrayBuffer from Buffer data
      const arrayBuffer = new ArrayBuffer(file.length)
      const view = new Uint8Array(arrayBuffer)
      view.set(file)
      body = arrayBuffer
    } else {
      // Should not happen, but handle it
      body = file as unknown as ArrayBuffer
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: body,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
    }

    // Step 3: Get file download URL
    const downloadUrl = await this.getFileDownloadUrl(fileId)
    
    return downloadUrl
  }

  /**
   * Get file download URL
   */
  private async getFileDownloadUrl(fileId: string): Promise<string> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://openapi.alipan.com/adrive/v2/file/get_download_url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.statusText}`)
    }

    const data = await response.json()
    return data.url
  }

  /**
   * Upload image (convenience method)
   */
  async uploadImage(imageFile: File | Buffer, fileName: string): Promise<string> {
    return this.uploadFile(imageFile, fileName, '/ai-dictionary/images')
  }

  /**
   * Upload audio (convenience method)
   */
  async uploadAudio(audioFile: File | Buffer, fileName: string): Promise<string> {
    return this.uploadFile(audioFile, fileName, '/ai-dictionary/audio')
  }
}

// Singleton instance
let clientInstance: AliyunDriveClient | null = null

export function getAliyunDriveClient(): AliyunDriveClient {
  if (!clientInstance) {
    clientInstance = new AliyunDriveClient()
  }
  return clientInstance
}

// Export types
export type { AliyunDriveFile, AliyunDriveToken }

