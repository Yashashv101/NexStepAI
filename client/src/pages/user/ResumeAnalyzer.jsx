import React, { useState } from 'react';
import {
  FileUp,
  Sparkles,
  Loader,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  Target,
  BookOpen,
  Compass,
  Download,
  ShieldCheck
} from 'lucide-react';
import { analyzeResume, generateResumeRoadmap, saveAIRoadmap, createUserGoal } from '../../services/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [requirementsText, setRequirementsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [roadmapMeta, setRoadmapMeta] = useState({ aiService: null, aiModel: null });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await analyzeResume(file, requirementsText);
      // Response shape: { success, data: { parsed, targetSkills, skillGap, recommendations, roadmap } }
      if (response.success) {
        setResult(response.data);
        setSelectedPositionIndex(null);
        setAiRoadmap(null);
      } else {
        setError(response.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (position) => {
    // Gate roadmap generation: only when a specified goal exists
    if (result?.mode !== 'specified-goal') {
      setError('Roadmap generation requires a specified career goal.');
      return;
    }
    if (!result?.parsed || !position?.title) return;
    setRoadmapLoading(true);
    try {
      const payload = {
        parsed: result.parsed,
        targetPosition: position.title,
        targetRequirements: position.typicalRequirements || (result.target || {})
      };
      const resp = await generateResumeRoadmap(payload);
      if (resp.success) {
        setAiRoadmap(resp.data.roadmap);
        setRoadmapMeta({ aiService: resp.aiService || resp.data.aiService || null, aiModel: resp.aiModel || resp.data.aiModel || null });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI roadmap.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const exportJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAnalysis = () => {
    if (!result) return;
    exportJSON(result, 'resume-analysis.json');
  };

  const handleExportRoadmap = () => {
    const roadmapData = aiRoadmap || result?.roadmapPreview || result?.roadmap;
    if (!roadmapData) return;
    exportJSON(roadmapData, 'roadmap.json');
  };

  const handleSaveRoadmap = async () => {
    const roadmapData = aiRoadmap || result?.roadmapPreview || result?.roadmap;
    if (!roadmapData) return;
    // Gate save: require specified goal
    if (result?.mode !== 'specified-goal') {
      setError('Roadmap saving requires a specified career goal.');
      return;
    }
    if (!roadmapData.steps || roadmapData.steps.length < 4) {
      setError('Roadmap incomplete: please ensure at least 4 steps before saving.');
      return;
    }
    try {
      // Auto-create a goal to attach the roadmap
      const goalName = (roadmapData.title || (result?.target?.description ? result.target.description : 'Target Role Roadmap')).slice(0, 100);
      const goalDescription = (result?.target?.description || roadmapData.description || 'Roadmap generated from resume analysis').slice(0, 500);
      const goalData = {
        name: goalName,
        description: goalDescription,
        category: 'Other',
        difficulty: (roadmapData.difficulty || 'intermediate').toLowerCase(),
        estimatedTime: roadmapData.estimatedDuration || '8-12 weeks',
        tags: roadmapData.tags || [],
        skillsRequired: (result?.targetSkills || result?.target?.skills || []),
        skillsLearned: roadmapData.skillsLearned || [],
        isAIEnhanced: false
      };
      const goalResp = await createUserGoal(goalData);
      const goalId = goalResp?.data?._id || goalResp?.data?.id || goalResp?.id || goalResp?._id;
      if (!goalId) {
        throw new Error('Failed to create goal for roadmap saving');
      }
      const saveResp = await saveAIRoadmap(goalId, roadmapData, roadmapMeta.aiService || 'gemini', roadmapMeta.aiModel || 'unknown');
      if (saveResp?.success) {
        alert('Roadmap saved to your account.');
      } else {
        setError(saveResp?.message || 'Failed to save roadmap.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save roadmap.');
    }
  };

  const renderChips = (items) => (
    <div className="flex flex-wrap gap-2">
      {(items || []).map((item, idx) => (
        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item}</span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
              <p className="text-gray-600">Upload your resume to extract skills, compare with target requirements, and get course recommendations</p>
            </div>
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              AI-powered parsing
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF, DOCX, or TXT)</label>
              <div className="flex items-center">
                <label className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">
                  <FileUp className="h-5 w-5 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">{file.name}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max size 8MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target role or requirements (optional)</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, REST APIs, SQL, Docker"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">We’ll infer target skills from this text if provided</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing resume...
                </>
              ) : (
                <>
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Parsed Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Parsed Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{result.parsed?.email || 'Not found'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{result.parsed?.phone || 'Not found'}</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Education</span>
                  </div>
                  {renderChips(result.parsed?.education || [])}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Extracted Skills</span>
                </div>
                {renderChips(result.parsed?.skills || [])}
              </div>

              {Array.isArray(result.parsed?.experience) && result.parsed.experience.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Experience Highlights</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {result.parsed.experience.slice(0, 8).map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Target Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Target Skills</h2>
              <p className="text-sm text-gray-600 mb-2">Inferred from your requirements</p>
              {renderChips(result.targetSkills || [])}
            </div>

            {/* Skill Gap */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Gap Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Matched Skills</span>
                  </div>
                  {renderChips(result.skillGap?.matched || [])}
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Missing Skills</span>
                  </div>
                  {renderChips(result.skillGap?.missing || [])}
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Irrelevant Skills</span>
                  </div>
                  {renderChips(result.skillGap?.irrelevant || [])}
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700">Gap Size</div>
                  <div className="text-2xl font-bold text-gray-900">{result.skillGap?.gapSize ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Courses</h2>
              {Array.isArray(result.recommendations?.courses) && result.recommendations.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.recommendations.courses.map((c, idx) => (
                    <a
                      key={idx}
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm font-semibold text-blue-700 mb-1">{c.title}</div>
                      <div className="text-xs text-gray-500">{new URL(c.link).hostname}</div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No specific courses found for your current target. Try refining the requirements.</p>
              )}
            </div>

            {/* Roadmap */}
            {result.roadmap && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Suggested Roadmap</h2>
              <p className="text-gray-600 mb-4">{(result.roadmap.description || result.roadmapPreview?.description || '')}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><strong>Duration:</strong> {result.roadmap.estimatedDuration}</div>
                  <div><strong>Difficulty:</strong> {result.roadmap.difficulty}</div>
                </div>
                <div className="space-y-3">
                  {(result.roadmap.steps || result.roadmapPreview?.steps || []).map((step, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">{step.order || idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{step.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{step.description}</div>
                          {step.skills && step.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {step.skills.map((skill, sidx) => (
                                <span key={sidx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inferred Positions (no goal provided) */}
            {result?.mode === 'inferred-positions' && Array.isArray(result.positions) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                  Roadmap generation is unavailable without a specified career goal.
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Suggested Positions</h2>
                  <div className="flex items-center text-xs text-gray-600"><ShieldCheck className="h-4 w-4 mr-1 text-green-600"/>Server-side AI with privacy</div>
                </div>
                <p className="text-sm text-gray-600 mb-4">We inferred roles from your resume and analyzed gaps against typical requirements.</p>
                <div className="space-y-4">
                  {result.positions.map((pos, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 ${selectedPositionIndex === idx ? 'border-blue-400' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{pos.title}</div>
                          <div className="text-xs text-gray-600">Confidence: {(pos.confidence * 100).toFixed(0)}%</div>
                        </div>
                        <button
                          disabled
                          className="flex items-center bg-gray-300 text-white text-sm px-3 py-2 rounded cursor-not-allowed"
                        >
                          <Compass className="h-4 w-4 mr-2"/> Generate AI Roadmap
                        </button>
                      </div>
                      {pos.rationale && (<p className="text-sm text-gray-600 mt-2">{pos.rationale}</p>)}
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-800 mb-1">Typical Requirements</div>
                        {renderChips(pos.typicalRequirements?.skills || [])}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                        <div className="border border-gray-200 rounded p-3">
                          <div className="text-sm font-medium text-gray-800 mb-1">Matched</div>
                          {renderChips(pos.skillGap?.matched || [])}
                        </div>
                        <div className="border border-gray-200 rounded p-3">
                          <div className="text-sm font-medium text-gray-800 mb-1">Missing</div>
                          {renderChips(pos.skillGap?.missing || [])}
                        </div>
                        <div className="border border-gray-200 rounded p-3">
                          <div className="text-sm font-medium text-gray-800 mb-1">Irrelevant</div>
                          {renderChips(pos.skillGap?.irrelevant || [])}
                        </div>
                        <div className="border border-gray-200 rounded p-3 text-sm">
                          Gap Size: <span className="font-bold">{pos.skillGap?.gapSize ?? 0}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-800 mb-2">Recommended Courses</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(pos.recommendations?.courses || []).map((c, i2) => (
                            <a key={i2} href={c.link} target="_blank" rel="noopener noreferrer" className="block border border-gray-200 rounded-lg p-3 hover:shadow">
                              <div className="text-sm font-semibold text-blue-700">{c.title}</div>
                              {typeof c.confidence === 'number' && <div className="text-xs text-gray-500">Confidence: {(c.confidence*100).toFixed(0)}%</div>}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specified goal: insights and recommendations */}
            {result?.mode === 'specified-goal' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Targeted Analysis</h2>
                  <button
                    onClick={() => handleGenerateRoadmap({ title: result.target?.description ? 'Target Role' : 'Goal', typicalRequirements: result.target })}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                  >
                    <Compass className="h-4 w-4 mr-2"/> Generate AI Roadmap
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Detailed comparison between your resume and specified requirements.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded p-3">
                    <div className="text-sm font-medium text-gray-800 mb-1">Matched</div>
                    {renderChips(result.skillGap?.matched || [])}
                  </div>
                  <div className="border border-gray-200 rounded p-3">
                    <div className="text-sm font-medium text-gray-800 mb-1">Missing</div>
                    {renderChips(result.skillGap?.missing || [])}
                  </div>
                  <div className="border border-gray-200 rounded p-3 text-sm">
                    Gap Size: <span className="font-bold">{result.skillGap?.gapSize ?? 0}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-800 mb-2">Actionable Insights</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {(result.insights?.insights || []).map((ins, idx) => (
                      <li key={idx}><span className="font-medium">{ins.action}:</span> {ins.why} {Array.isArray(ins.resources) && ins.resources.length > 0 && (<span className="text-gray-500">(Resources: {ins.resources.join(', ')})</span>)} {ins.timeline && (<span className="text-gray-500">— {ins.timeline}</span>)}</li>
                    ))}
                  </ul>
                  {typeof result.insights?.confidence === 'number' && (
                    <div className="text-xs text-gray-500 mt-2">AI Confidence: {(result.insights.confidence*100).toFixed(0)}%</div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-800 mb-2">Recommended Courses</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(result.recommendations?.courses || []).map((c, i3) => (
                      <a key={i3} href={c.link} target="_blank" rel="noopener noreferrer" className="block border border-gray-200 rounded-lg p-3 hover:shadow">
                        <div className="text-sm font-semibold text-blue-700">{c.title}</div>
                        {typeof c.confidence === 'number' && <div className="text-xs text-gray-500">Confidence: {(c.confidence*100).toFixed(0)}%</div>}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Roadmap Generated */}
            {aiRoadmap && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">AI Roadmap</h2>
                <p className="text-gray-600 mb-4">{aiRoadmap.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><strong>Duration:</strong> {aiRoadmap.estimatedDuration}</div>
                  <div><strong>Difficulty:</strong> {aiRoadmap.difficulty}</div>
                </div>
                {typeof aiRoadmap.confidence === 'number' && (
                  <div className="text-xs text-gray-500 mb-2">AI Confidence: {(aiRoadmap.confidence*100).toFixed(0)}%</div>
                )}
                {typeof aiRoadmap.personalizationScore === 'number' && (
                  <div className="text-xs text-gray-500 mb-4">Personalization: {(aiRoadmap.personalizationScore*100).toFixed(0)}%</div>
                )}
                <div className="space-y-3">
                  {aiRoadmap.steps?.map((step, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">{step.order || idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{step.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{step.description}</div>
                          {step.skills && step.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {step.skills.map((skill, sidx) => (
                                <span key={sidx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Export / Save */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExportAnalysis} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-2 rounded">
                <Download className="h-4 w-4 mr-2"/> Export Analysis JSON
              </button>
              <button onClick={handleExportRoadmap} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-2 rounded">
                <Download className="h-4 w-4 mr-2"/> Export Roadmap JSON
              </button>
              <button
                onClick={handleSaveRoadmap}
                disabled={result?.mode !== 'specified-goal' || !(aiRoadmap || result?.roadmapPreview || result?.roadmap)}
                className={`flex items-center text-sm px-3 py-2 rounded ${result?.mode !== 'specified-goal' || !(aiRoadmap || result?.roadmapPreview || result?.roadmap) ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                <CheckCircle className="h-4 w-4 mr-2"/> Save Roadmap
              </button>
              {roadmapLoading && (
                <div className="flex items-center text-sm text-gray-600"><Loader className="h-4 w-4 mr-2 animate-spin"/> Generating roadmap...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;