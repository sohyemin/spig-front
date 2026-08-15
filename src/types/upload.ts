export type ChunkUploadInitResponse = {
    uploadId: string;
    originalName: string;
    contentType: string | null;
    totalSize: number;
    chunkSize: number;
    totalChunks: number;
    status: "CREATED";
    createdAt: string;
  };