# Task Boilerplate

## Introduction

`unidrop` is a simple file upload service built with a modern web development stack. Below is an overview of the key technologies and tools used in the project:

---

## Stack Overview

### **Frontend**
- **React**: A JavaScript library for building user interfaces, used to create the client-side components of the application.
- **Tailwind CSS**: A utility-first CSS framework for styling, with `tailwind-merge` used to handle class merging.
- **Vite**: A fast build tool and development server, used for bundling and serving the frontend.

### **Backend**
- **Express**: A minimal and flexible Node.js web application framework, used to handle server-side logic and API endpoints.
- **Multer**: A middleware for handling file uploads in Node.js.
- **Body Parser**: Middleware for parsing incoming request bodies in a middleware chain.

### **TypeScript**
- **TypeScript**: A strongly typed programming language that builds on JavaScript, used throughout the project for type safety and better developer experience.

### **Testing**
- **Vitest**: A fast unit testing framework, used for both client-side and server-side tests.
- **Testing Library**: A set of utilities for testing React components, focusing on user interactions and DOM assertions.

### **Development Tools**
- **ESLint**: A tool for identifying and fixing problems in JavaScript/TypeScript code.
- **Prettier**: A code formatter to ensure consistent code style.
- **Nodemon**: A tool for automatically restarting the server during development when file changes are detected.


## Installation

Copy the `.env.template` file and rename it to `.env` for development purposes.

```bash
pnpm install
pnpm run dev
```

This will start a simple dev server with hot reload using vite and express for some mock API requests.

## Tests

Copy the `.env.template` file and rename it `.env.test` for testing purposes.

```bash
pnpm run test:server
pnpm run test:client
```

This will start a simple dev server with hot reload using vite and express for some mock API requests.


## API

You find the express API under `src/server`. A file upload API is provided. You can use it and/or modify it to your needs.

### List of files

```http
GET /api/files
```

### Upload a single file

```http
POST /api/upload-single
```

| Body parameter | Type   | Description                      |
| :------------- | :----- | :------------------------------- |
| `file`         | `file` | **Required**. The file to upload |

### Upload a file in chunks

```http
POST /api/upload-chunks
```

| Body parameter      | Type     | Description                                  |
| :------------------ | :------- | :------------------------------------------- |
| `file`              | `file`   | **Required**. The file to upload             |
| `currentChunkIndex` | `number` | **Required**. The current chunk index number |
| `totalChunks`       | `number` | **Required**. The total number of chunks     |

## Styling

The boilerplate provides Tailwind CSS by default. If you want to use something else, feel free to add it.

## Testing

Vitest is provided by default for testing, however you are free to use whatever you like and are familiar with.

## Room for Improvements (Rémy SABLIET)

- Enhance the UploadFile component design by adding a circular progress indicator that visually wraps around the entire component and fills according to the upload progress.

- Add a "Cancel Upload" button to allow users to interrupt an ongoing upload.

- Improve error handling:

    - Clearly differentiate between network errors, server-side errors, and chunk merge errors.

    - Display helpful messages to users.

- Implement an upload timeout mechanism for uploads taking too long (based on requirements).

- Add file extension validation to prevent unsupported formats.

- Automatically sanitize filenames to prevent unsafe or invalid file names.

- On the server side, implement:

    - More robust error handling

    - File validation: filename sanitization, antivirus scanning, max file size check, etc.

- Add end to end test (Cypress)