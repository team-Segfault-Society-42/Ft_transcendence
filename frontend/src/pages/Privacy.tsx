export default function Privacy() {
    return (
        <div className="max-w-3xl mx-auto text-white p-6">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

            <p className="mb-4">
                This application collects and processes user data in order to provide its services.
            </p>

            <h2 className="text-xl font-semibold mt-4">Data collected</h2>
            <ul className="list-disc ml-6">
                <li>Username</li>
                <li>Game statistics</li>
                <li>Profile information</li>
            </ul>

            <h2 className="text-xl font-semibold mt-4">Usage</h2>
            <p>
                Data is used only for application functionality and is not shared with third parties.
            </p>

            <h2 className="text-xl font-semibold mt-4">Security</h2>
            <p>
                We take appropriate measures to protect user data.
            </p>
        </div>
    )
}