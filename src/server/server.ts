import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import stream from 'node:stream';
import { promisify } from 'node:util';

import bodyParser from 'body-parser';
import express, { type Express, type Request, type Response } from 'express';
import multer from 'multer';

import { getUploadedChunkIndexes } from './libs/file';
import { ChunkManager } from './libs/ChunkManager';

type CustomRequest<T> = Request<unknown, unknown, T>;

const UPLOAD_DIR = process.env.NODE_ENV !== 'test' ? 'uploads' : 'src/server/test/uploads';
const CHUNK_DIR = process.env.NODE_ENV !== 'test' ? 'uploads-chunks' : 'src/server/test/uploads-chunks';

// Create directories if they don't exist
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!existsSync(CHUNK_DIR)) {
    mkdirSync(CHUNK_DIR, { recursive: true });
}

const chunkManager = new ChunkManager({
    uploadDir: UPLOAD_DIR,
    chunkDir: CHUNK_DIR,
});


export const app: Express = express();

const pipeline = promisify(stream.pipeline);

const upload = multer({
    // Here, setting a limit of 10MB (for example)
    limits: { fileSize: Number(process.env.VITE_CHUNK_SIZE_BYTES) || 5 * 1024 * 1024 },
});



const mergeChunks = async (fileName: string, totalChunks: number) => {
    if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR);
    }

    const writeStream = createWriteStream(`${UPLOAD_DIR}/${fileName}`);
    for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = `${CHUNK_DIR}/${fileName}.part_${i}`;
        const chunkBuffer = await readFile(chunkFilePath);
        writeStream.write(chunkBuffer);
        unlinkSync(chunkFilePath);
    }

    writeStream.end();
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post('/api/upload-single', upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'Missing required `file` key in body.' });
    }

    // @ts-expect-error uncorrectly typed for v2
    const fileName = req.file.originalName as string;

    try {
        await pipeline(req.file.stream, createWriteStream(`${UPLOAD_DIR}/${fileName}`));

        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Error saving file' });
    }
});

app.post(
    '/api/upload-chunk',
    upload.single('file'),
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (req: CustomRequest<{ currentChunkIndex: number; totalChunks: number }>, res: Response) => {

        if (!req.file || !('currentChunkIndex' in req.body) || !('totalChunks' in req.body)) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // @ts-expect-error uncorrectly typed for v2 (originalName is not in the type)
        if (!req.file.originalName) {
            return res.status(400).json({
                error: "Missing filename, did you pass the filename in the FormData? (`formData.append('file', chunk, filename)`)",
            });
        }

        const currentChunkIndex = Number(req.body.currentChunkIndex);
        const totalChunks = Number(req.body.totalChunks);
        // @ts-expect-error uncorrectly typed for v2 (originalName is not in the type)
        const fileName = req.file.originalName as string;


        const chunkFilePath = `${CHUNK_DIR}/${fileName}.part_${currentChunkIndex}`;

        try {
            // Save the chunk
            await chunkManager.saveChunk(req.file.stream, fileName, currentChunkIndex);

            // Check if all chunks are uploaded
            const allChunksUploaded = await chunkManager.areAllChunksUploaded(fileName, totalChunks);

            // If all chunks are uploaded, merge them
            if (allChunksUploaded) {
                await chunkManager.mergeChunks(fileName, totalChunks);
                return res.status(200).json({
                    message: 'All chunks uploaded and merged successfully',
                    name: fileName,
                    status: 'complete'
                });
            }

            return res.status(200).json({
                message: 'Chunk uploaded successfully',
                status: 'in-progress',
                chunksReceived: await chunkManager.getUploadedChunks(fileName)
            });

        } catch (error) {
            console.error('Error saving chunk:', error);
            return res.status(500).json({ error: 'Error saving chunk' });
        }
    }
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/api/files', async (_req, res) => {
    try {
        const fileNames = await readdir(UPLOAD_DIR);
        const files: { name: string; size: number }[] = [];
        for (const fileName of fileNames) {
            if (fileName === '.gitkeep') {
                continue;
            }

            const file = await stat(join(UPLOAD_DIR, fileName));
            files.push({
                name: fileName,
                size: file.size,
            });
        }

        return res.status(200).json({ files });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        return res.status(500).json({ message });
    }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/api/upload-chunk/status', async (req, res) => {
    const fileId = req.query.fileId as string;

    if (!fileId) {
        return res.status(400).json({ error: 'Missing fileId in query params' });
    }

    try {
        const uploadedChunks = getUploadedChunkIndexes(CHUNK_DIR, fileId);
        return res.json({ uploadedChunks });
    } catch (error) {
        console.error('Error fetching uploaded chunks:', error);
        return res.status(500).json({ error: 'Could not get uploaded chunk status' });
    }
});
