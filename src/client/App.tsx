import { useState } from 'react';
import { ReactElement } from 'react';

import { Modal } from 'C/components/molecules/Moldal/Modal';
import { UploadPage } from 'C/components/templates/UploadPage';

export const App = (): ReactElement => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

    return (
        <main className="relative isolate h-dvh text-white">

            <img
                src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2FjY291bnRzXC82ZVwvNDAwMDM4OFwvcHJvamVjdHNcLzk4NFwvYXNzZXRzXC9iOFwvMTE1MjY1XC8xMjYwMTU0YzFhYmVmMDVjNjZlY2Q2MDdmMTRhZTkxNS0xNjM4MjU4MjQwLmpwZyJ9:weare:_kpZgwnGPTxOhYxIyfS1MhuZmxGrFCzP6ZW6dc-F6BQ?width=2400"
                alt="background image"
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
            />

            <div className="absolute inset-0 -z-10 bg-black/60" />

            <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    Hello there
                </h1>
                <p className="mt-4 text-lg text-white sm:mt-6">
                    Everything brand starts small, let&apos;s build something great.
                </p>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded"
                >
                    Upload Files
                </button>
            </div>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <UploadPage />
            </Modal>
        </main>

    );
};

export default App;