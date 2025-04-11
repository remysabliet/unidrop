import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { app } from '../server';

const TESTING_PORT = 3001;
const TESTING_UPLOADS_DIR = 'src/server/test/uploads';
const TESTING_UPLOADS_CHUNKS_DIR = 'src/server/test/uploads-chunks';

describe('E2E', () => {
    beforeAll(() => {
        const uploadedFiles = readdirSync(TESTING_UPLOADS_DIR);
        for (const file of uploadedFiles) {
            rmSync(join(TESTING_UPLOADS_DIR, file));
        }
        const uploadedChunksFiles = readdirSync(TESTING_UPLOADS_CHUNKS_DIR);
        for (const file of uploadedChunksFiles) {
            rmSync(join(TESTING_UPLOADS_CHUNKS_DIR, file));
        }
        app.listen(TESTING_PORT);
    });

    it('should list the available files', async () => {
        const promise = await fetch(`http://localhost:${TESTING_PORT}/api/files`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await promise.json();
        expect(promise).toHaveProperty('status', 200);
        expect(data).toHaveProperty('files');
    });

    it('should upload a file', async () => {
        const filename = 'hello-single-unchunked.txt';
        const formData = new FormData();
        formData.append('file', new Blob(['Hello from Frontify!'], { type: 'text/plain' }), filename);
        const promise = await fetch(`http://localhost:${TESTING_PORT}/api/upload-single`, {
            method: 'POST',
            body: formData,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await promise.json();
        expect(promise).toHaveProperty('status', 200);
        expect(data).toHaveProperty('message', 'File uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const content = new TextDecoder().decode(
            new Uint8Array(new Uint8Array(readFileSync(`${TESTING_UPLOADS_DIR}/${filename}`)))
        );
        expect(content).toBe('Hello from Frontify!');
    });

    it('should upload a "chunked" file (only one chunk)', async () => {
        const filename = 'hello-single-chunk.txt';
        const formData = new FormData();
        formData.append('file', new Blob(['Hello from Frontify!'], { type: 'text/plain' }), filename);
        formData.append('currentChunkIndex', '0');
        formData.append('totalChunks', '1');
        formData.append('originalName', filename);
        const promise = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await promise.json();
        expect(promise).toHaveProperty('status', 200);
        expect(data).toHaveProperty('message', 'Chunked file uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const content = new TextDecoder().decode(
            new Uint8Array(new Uint8Array(readFileSync(`${TESTING_UPLOADS_DIR}/${filename}`)))
        );
        expect(content).toBe('Hello from Frontify!');
    });

    it('should upload a "chunked" file (multiple chunks)', async () => {
        const filename = 'hello-multiple-chunks.txt';
        const content = 'Hello from Frontify!';
        const file = new Blob([content], { type: 'text/plain' });

        const chunk1 = file.slice(0, content.length / 2);
        const chunk2 = file.slice(content.length / 2);

        const formData1 = new FormData();
        formData1.append('file', chunk1, filename);
        formData1.append('currentChunkIndex', '0');
        formData1.append('totalChunks', '2');
        const promise1 = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData1,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data1 = await promise1.json();
        expect(promise1).toHaveProperty('status', 200);
        expect(data1).toHaveProperty('message', 'Chunked file uploaded successfully');

        const formData2 = new FormData();
        formData2.append('file', chunk2, filename);
        formData2.append('currentChunkIndex', '1');
        formData2.append('totalChunks', '2');
        const promise2 = await fetch(`http://localhost:${TESTING_PORT}/api/upload-chunk`, {
            method: 'POST',
            body: formData2,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data2 = await promise2.json();
        expect(promise2).toHaveProperty('status', 200);
        expect(data2).toHaveProperty('message', 'Chunked file uploaded successfully');

        const files = readdirSync(TESTING_UPLOADS_DIR);
        expect(files).toContain(filename);

        const fileContent = new TextDecoder().decode(
            new Uint8Array(new Uint8Array(readFileSync(`${TESTING_UPLOADS_DIR}/${filename}`)))
        );
        expect(fileContent).toBe('Hello from Frontify!');
    });
});
