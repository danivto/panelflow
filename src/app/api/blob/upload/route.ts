import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

/**
 * Authorizes browser-direct uploads to Vercel Blob for files too large for
 * the serverless request-body limit (~4.5 MB). The blob is a short-lived
 * transit buffer: the conversion endpoint downloads it into memory and
 * deletes it immediately, so nothing outlives the conversion.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 300 * 1024 * 1024,
        allowedContentTypes: ["application/*", "image/*"],
      }),
      onUploadCompleted: async () => {
        // Stateless by design: nothing to record. The convert endpoint
        // deletes the blob as soon as it has read the bytes.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
