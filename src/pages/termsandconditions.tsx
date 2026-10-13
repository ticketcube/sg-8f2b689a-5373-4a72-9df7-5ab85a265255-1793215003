export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-8">Last updated: November 16, 2025</p>

                <div className="prose prose-gray max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            By accessing and using FanDragon services, you accept and agree to be bound by
                            these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                        <p className="text-gray-700 leading-relaxed">
                            FanDragon provides a platform for discovering emerging artists, rating music,
                            viewing events, and participating in our community. We reserve the right to modify,
                            suspend, or discontinue any aspect of our service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            When creating an account, you agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            You agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Use the service for any illegal or unauthorized purpose</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Upload malicious code or attempt to disrupt the service</li>
                            <li>Impersonate others or misrepresent your affiliation</li>
                            <li>Scrape, collect, or harvest data from our platform without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Ratings</h2>
                        <p className="text-gray-700 leading-relaxed">
                            When submitting ratings, reviews, or other content, you grant FanDragon a
                            non-exclusive, worldwide, royalty-free license to use, display, and distribute
                            your content in connection with our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Points and Rewards</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our points and rewards system is subject to change without notice. Points have
                            no cash value and cannot be transferred. We reserve the right to modify, suspend,
                            or terminate the rewards program at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                        <p className="text-gray-700 leading-relaxed">
                            All content on FanDragon, including text, graphics, logos, and software, is
                            owned by FanDragon or its licensors and protected by copyright and other
                            intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
                        <p className="text-gray-700 leading-relaxed">
                            FanDragon is provided "as is" without warranties of any kind. We do not guarantee
                            uninterrupted or error-free service. Event information is provided by third parties
                            and we are not responsible for accuracy or changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed">
                            FanDragon shall not be liable for any indirect, incidental, special, or
                            consequential damages arising from your use of our services. Our total liability
                            shall not exceed the amount you paid to us, if any, in the past twelve months.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may terminate or suspend your account and access to our services at any time,
                            with or without notice, for conduct that violates these terms or is harmful to
                            other users or our business.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. Continued use
                            of our services after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have questions about these Terms of Service, please contact us at:
                        </p>
                        <p className="text-gray-700 mt-2">
                            Email: <a href="mailto:legal@fandragon.com" className="text-blue-600 hover:underline">legal@fandragon.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}