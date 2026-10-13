export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-8">Last updated: November 16, 2025</p>

                <div className="prose prose-gray max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We collect information you provide directly to us, including name, email address,
                            and any other information you choose to provide when using FanDragon services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Send you newsletters and updates about artists and events</li>
                            <li>Respond to your comments and questions</li>
                            <li>Analyze usage patterns and preferences</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We do not sell, trade, or otherwise transfer your personal information to third parties
                            without your consent, except as described in this policy or as required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We implement appropriate security measures to protect your personal information.
                            However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your information</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your experience,
                            analyze site usage, and assist in our marketing efforts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any
                            changes by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-gray-700 mt-2">
                            Email: <a href="mailto:privacy@fandragon.com" className="text-blue-600 hover:underline">privacy@fandragon.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}