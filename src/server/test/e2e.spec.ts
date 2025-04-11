import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../server';

const TESTING_PORT = 3001;
const TESTING_UPLOADS_DIR = 'src/server/test/uploads';
const TESTING_UPLOADS_CHUNKS_DIR = 'src/server/test/uploads-chunks';

describe('E2E', () => {
    beforeAll(() => {
        // Clean the upload directories before tests.
        const uploadedFiles = readdirSync(TESTING_UPLOADS_DIR);
        for (const file of uploadedFiles) {
            rmSync(join(TESTING_UPLOADS_DIR, file));
        }
        const uploadedChunksFiles = readdirSync(TESTING_UPLOADS_CHUNKS_DIR);
        for (const file of uploadedChunksFiles) {
            rmSync(join(TESTING_UPLOADS_CHUNKS_DIR, file));
        }
        console.log(`Starting server on port ${TESTING_PORT}`);
        app.listen(TESTING_PORT);
    });

    it('should list the available files', async () => {
        const response = await fetch(`http://localhost:${TESTING_PORT}/api/files`);
        const data = await response.json();
        console.log('List Files Response:', data);
        expect(response).toHaveProperty('status', 200);
        expect(data).toHaveProperty('files');
    });

    it('should upload a file', async () => {
        const filename = 'hello-single-unchunked.txt';
        const formData = new FormData();

        formData.append('file', new Blob(['Hello from Frontify!'], { type: 'text/plain' }), filename);
        const response = await fetch(`http://localhost:${TESTING_PORT}/api/upload-single`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        console.log('Upload Single Response:', data);
        expect(response).toHaveProperty('status', 200);
        expect(data).toHaveProperty('message', 'File uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const content = new TextDecoder().decode(readFileSync(join(TESTING_UPLOADS_DIR, filename)));
        expect(content).toBe('Hello from Frontify!');
    });

    it('should upload a "chunked" file (only one chunk)', async () => {
        const filename = 'hello-single-chunk.txt';
        const formData = new FormData();
        formData.append('file', new Blob(['Hello from Frontify!'], { type: 'text/plain' }), filename);
        formData.append('currentChunkIndex', '0');
        formData.append('totalChunks', '1');
        formData.append('originalName', filename);
        const response = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        console.log('Upload Single Chunk Response:', data);
        expect(response).toHaveProperty('status', 200);
        expect(data).toHaveProperty('message', 'Chunked file uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const content = new TextDecoder().decode(readFileSync(join(TESTING_UPLOADS_DIR, filename)));
        expect(content).toBe('Hello from Frontify!');
    });

    it('should upload a "chunked" file (multiple chunks)', async () => {
        const filename = 'hello-multiple-chunks.txt';
        const content = 'Hello from Frontify!';
        const file = new Blob([content], { type: 'text/plain' });

        const chunk1 = file.slice(0, content.length / 2);
        const chunk2 = file.slice(content.length / 2);

        // Upload first chunk.
        const formData1 = new FormData();
        formData1.append('file', chunk1, filename);
        formData1.append('currentChunkIndex', '0');
        formData1.append('totalChunks', '2');
        const response1 = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData1,
        });
        const data1 = await response1.json();
        console.log('Upload Multiple Chunks - Chunk 1 Response:', data1);
        expect(response1).toHaveProperty('status', 200);
        expect(data1).toHaveProperty('message', 'Chunked file uploaded successfully');

        // Upload second chunk.
        const formData2 = new FormData();
        formData2.append('file', chunk2, filename);
        formData2.append('currentChunkIndex', '1');
        formData2.append('totalChunks', '2');
        const response2 = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData2,
        });
        const data2 = await response2.json();
        console.log('Upload Multiple Chunks - Chunk 2 Response:', data2);
        expect(response2).toHaveProperty('status', 200);
        expect(data2).toHaveProperty('message', 'Chunked file uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const fileContent = new TextDecoder().decode(readFileSync(join(TESTING_UPLOADS_DIR, filename)));
        expect(fileContent).toBe('Hello from Frontify!');
    });
});
