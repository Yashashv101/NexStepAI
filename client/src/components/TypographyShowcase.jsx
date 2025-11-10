import React from 'react';

const TypographyShowcase = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Space Grotesk Typography Showcase</h1>
        
        {/* Headings Hierarchy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Heading Hierarchy</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <h1>H1 - Main Heading (2.5rem, 600 weight)</h1>
            <h2>H2 - Section Heading (2rem, 600 weight)</h2>
            <h3>H3 - Subsection Heading (1.5rem, 500 weight)</h3>
            <h4>H4 - Card Title (1.25rem, 500 weight)</h4>
            <h5>H5 - Small Heading (1.125rem, 500 weight)</h5>
            <h6>H6 - Minor Heading (1rem, 500 weight)</h6>
          </div>
        </section>

        {/* Body Text Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Body Text & Weights</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <p className="font-light">Light weight (300) - Perfect for subtle text and captions</p>
            <p className="font-normal">Normal weight (400) - Default body text and paragraphs</p>
            <p className="font-medium">Medium weight (500) - Emphasized text and buttons</p>
            <p className="font-semibold">Semibold weight (600) - Important highlights and strong emphasis</p>
            <p className="font-bold">Bold weight (700) - Critical information and primary actions</p>
          </div>
        </section>

        {/* Text Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Text Size Hierarchy</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xs">Extra Small Text (0.75rem) - Labels and fine print</p>
            <p className="text-sm">Small Text (0.875rem) - Secondary information</p>
            <p className="text-base">Base Text (1rem) - Default body text</p>
            <p className="text-lg">Large Text (1.125rem) - Emphasized content</p>
            <p className="text-xl">Extra Large Text (1.25rem) - Important announcements</p>
          </div>
        </section>

        {/* Real World Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Real World Examples</h2>
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            {/* Card Example */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Recommendation Card</h3>
              <p className="text-gray-600 mb-3">This is how course descriptions will appear with the new Space Grotesk font family.</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="font-medium">Intermediate Level</span>
                <span>•</span>
                <span>12 hours</span>
                <span>•</span>
                <span className="font-semibold">4.8/5</span>
              </div>
            </div>

            {/* Button Example */}
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Primary Action
              </button>
              <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Secondary Action
              </button>
            </div>

            {/* Status Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Success Message</p>
              <p className="text-green-700 text-sm mt-1">This is how success messages will appear with proper typography.</p>
            </div>
          </div>
        </section>

        {/* Font Characteristics */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Font Characteristics</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">
              Space Grotesk is a contemporary sans-serif typeface that combines geometric precision with 
              humanist warmth. It's designed for excellent readability across all screen sizes and provides 
              a modern, professional appearance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Best Used For:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Headings and titles (500-700 weight)</li>
                  <li>• Body text and paragraphs (400 weight)</li>
                  <li>• User interface elements</li>
                  <li>• Technical documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Excellent legibility at small sizes</li>
                  <li>• Balanced character proportions</li>
                  <li>• Modern geometric construction</li>
                  <li>• Wide weight range (300-700)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TypographyShowcase;