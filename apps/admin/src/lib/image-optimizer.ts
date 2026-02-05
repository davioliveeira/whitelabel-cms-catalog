// =============================================================================
// Image Optimizer - Sharp-based image processing
// =============================================================================
// Handles image resizing, format conversion, and optimization
// =============================================================================

import sharp from 'sharp';

// =============================================================================
// Constants
// =============================================================================

const MAX_DIMENSION = 800;
const WEBP_QUALITY = 80;

// =============================================================================
// Types
// =============================================================================

export interface OptimizedImageResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

// =============================================================================
// Image Optimization Function
// =============================================================================

/**
 * Optimizes an image by resizing and converting to WebP format
 * @param inputBuffer - Raw image buffer from upload
 * @returns Optimized image buffer with metadata
 */
export async function optimizeImage(
  inputBuffer: Buffer
): Promise<OptimizedImageResult> {
  try {
    // Process image with Sharp
    const processed = sharp(inputBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      })
      .webp({
        quality: WEBP_QUALITY,
      });

    // Get optimized buffer
    const buffer = await processed.toBuffer();

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

/**
 * Validates if a file is a valid image
 * @param buffer - File buffer to validate
 * @returns true if valid image, false otherwise
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}
