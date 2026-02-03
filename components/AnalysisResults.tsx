'use client';

const AnalysisResults = ({ data }) => {
  const {
    sentiment,
    tone,
    confidenceScore,
    conflictTriggers,
    professionalReply,
  } = data;

  // Color coding for sentiment
  const sentimentColor = {
    Positive: 'text-green-700',
    Neutral: 'text-gray-700',
    Negative: 'text-red-700',
  };

  const sentimentBgColor = {
    Positive: 'bg-green-50 border-green-200',
    Neutral: 'bg-gray-50 border-gray-200',
    Negative: 'bg-red-50 border-red-200',
  };

  return (
    <div className="border-t pt-6 mt-6 space-y-6 animate-fadeIn">
      {/* Sentiment Section */}
      <div className={`p-4 border rounded-lg ${sentimentBgColor[sentiment]}`}>
        <p className="text-sm font-medium text-gray-600 mb-1">Sentiment</p>
        <p className={`text-2xl font-bold ${sentimentColor[sentiment]}`}>
          {sentiment}
        </p>
      </div>

      {/* Tone Section */}
      <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
        <p className="text-sm font-medium text-gray-600 mb-2">Tone</p>
        <p className="text-xl font-semibold text-blue-700">{tone}</p>
      </div>

      {/* Confidence Score Section */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-3">Confidence Score</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>
          <span className="text-lg font-bold text-gray-900 min-w-fit">
            {confidenceScore}%
          </span>
        </div>
      </div>

      {/* Conflict Triggers Section */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-sm font-medium text-gray-600 mb-3">Conflict Triggers</p>
        <ul className="space-y-2">
          {conflictTriggers && conflictTriggers.length >= 2 ? (
            conflictTriggers.slice(0, 2).map((trigger, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 text-xs font-bold">
                  •
                </span>
                <span className="text-gray-700">{trigger}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">No conflict triggers detected</li>
          )}
        </ul>
      </div>

      {/* Professional Reply Section */}
      <div className="p-4 border-2 border-green-300 rounded-lg bg-green-50">
        <p className="text-sm font-medium text-gray-600 mb-2">Professional Reply</p>
        <div className="bg-white p-3 rounded border border-green-200">
          <p className="text-gray-800 leading-relaxed">{professionalReply}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
