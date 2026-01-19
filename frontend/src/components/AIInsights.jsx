import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Loader2, DollarSign, Target, Users, Tag, Zap, Rocket, Trophy, Clock, Star } from "lucide-react";

const iconMap = {
    recommendation: Lightbulb,
    trend: TrendingUp,
    alert: AlertTriangle,
    success: CheckCircle,
    sales: DollarSign,
    marketing: Target,
    customer: Users,
    pricing: Tag,
    urgent: Zap,
    breakthrough: Rocket,
    achievement: Trophy,
    timeline: Clock,
    premium: Star,
};

const colorMap = {
    recommendation: "text-blue-600",
    trend: "text-purple-600",
    alert: "text-amber-600",
    success: "text-green-600",
    sales: "text-green-600",
    marketing: "text-indigo-600",
    customer: "text-purple-600",
    pricing: "text-orange-600",
    urgent: "text-red-600",
    breakthrough: "text-indigo-600",
    achievement: "text-yellow-600",
    timeline: "text-cyan-600",
    premium: "text-pink-600",
};

export function AIInsights({ userId }) {
    const [insights, setInsights] = useState([]);
    const [salesSuggestions, setSalesSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchInsights = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/analyze/ai-insights', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        query: "Provide key insights and recommendations for supply chain optimization based on current data"
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    // Parse the response into insights
                    const parsedInsights = parseAIResponse(data.data.response);
                    setInsights(parsedInsights);

                    // Set sales suggestions if available
                    if (data.data.salesSuggestions) {
                        setSalesSuggestions(data.data.salesSuggestions);
                    }
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch AI insights');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [userId]);

    const parseAIResponse = (response) => {
        // Enhanced parsing for rich markdown format
        const sections = [];
        const lines = response.split('\n').filter(line => line.trim());

        let currentSection = null;
        let currentItems = [];

        lines.forEach(line => {
            // Detect section headers
            if (line.startsWith('# ')) {
                // Save previous section if exists
                if (currentSection) {
                    sections.push({ ...currentSection, items: currentItems });
                }
                // Start new section
                currentSection = {
                    title: line.replace('# ', '').replace(/^[🚀💰⚡🎯📈🔥💡⚡🎯]/, '').trim(),
                    type: 'header',
                    emoji: line.match(/^[🚀💰⚡🎯📈🔥💡⚡🎯]/)?.[0] || '💡',
                    items: []
                };
                currentItems = [];
            } else if (line.startsWith('## ')) {
                // Subsection
                if (currentSection) {
                    sections.push({ ...currentSection, items: currentItems });
                }
                currentSection = {
                    title: line.replace('## ', '').replace(/^[🚀💰⚡🎯📈🔥💡⚡🎯]/, '').trim(),
                    type: 'subsection',
                    emoji: line.match(/^[🚀💰⚡🎯📈🔥💡⚡🎯]/)?.[0] || '📊',
                    items: []
                };
                currentItems = [];
            } else if (line.startsWith('### ')) {
                // Recommendation item
                const title = line.replace('### ', '').trim();
                const nextLines = [];
                let i = lines.indexOf(line) + 1;

                // Collect description lines until next ### or empty line
                while (i < lines.length && !lines[i].startsWith('###') && lines[i].trim()) {
                    nextLines.push(lines[i]);
                    i++;
                }

                const description = nextLines.join(' ').replace(/\*\*Impact:\*\*|\*\*Effort:\*\*|\*\*Timeline:\*\*|\*\*Expected Result:\*\*/g, '').trim();

                currentItems.push({
                    title,
                    description,
                    type: 'recommendation',
                    impact: nextLines.find(l => l.includes('Impact:'))?.split('Impact:')[1]?.split('|')[0]?.trim(),
                    effort: nextLines.find(l => l.includes('Effort:'))?.split('Effort:')[1]?.split('|')[0]?.trim(),
                    timeline: nextLines.find(l => l.includes('Timeline:'))?.split('Timeline:')[1]?.trim(),
                    expectedResult: nextLines.find(l => l.includes('Expected Result:'))?.replace('**Expected Result:**', '').trim()
                });
            } else if (line.includes('**') && !line.startsWith('###')) {
                // Bold text items
                const cleanText = line.replace(/\*\*/g, '').trim();
                if (cleanText) {
                    currentItems.push({
                        text: cleanText,
                        type: 'insight'
                    });
                }
            } else if (line.match(/^\d+\./) && !line.startsWith('###')) {
                // Numbered list items
                currentItems.push({
                    text: line.replace(/^\d+\.\s*/, '').trim(),
                    type: 'action'
                });
            }
        });

        // Add final section
        if (currentSection) {
            sections.push({ ...currentSection, items: currentItems });
        }

        return sections;
    };

    if (loading) {
        return (
            <Card className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-600 dark:text-slate-400">Generating AI insights...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="text-center py-8">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-slate-400">{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced AI Insights Display */}
            {insights.map((section, sectionIndex) => {
                const Icon = iconMap[section.type === 'header' ? 'breakthrough' : section.type === 'subsection' ? 'urgent' : 'recommendation'] || Lightbulb;
                const color = colorMap[section.type === 'header' ? 'breakthrough' : section.type === 'subsection' ? 'urgent' : 'recommendation'] || "text-blue-600";

                return (
                    <Card
                        key={sectionIndex}
                        className={`p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-indigo-500/10 transition-all duration-300 animate-in fade-in duration-700 ${section.type === 'header' ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700' : ''
                            }`}
                        style={{ animationDelay: `${sectionIndex * 150}ms` }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${section.type === 'header' ? 'bg-indigo-100 dark:bg-indigo-900/50' :
                                section.type === 'subsection' ? 'bg-amber-100 dark:bg-amber-900/50' :
                                    'bg-blue-100 dark:bg-blue-900/50'
                                }`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <h3 className={`font-semibold text-gray-900 dark:text-white ${section.type === 'header' ? 'text-xl' : 'text-lg'
                                }`}>
                                {section.emoji} {section.title}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {section.items.map((item, itemIndex) => {
                                if (item.type === 'recommendation') {
                                    return (
                                        <div
                                            key={itemIndex}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200 dark:border-blue-700/30 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200 group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                                                    {item.title}
                                                </h4>
                                                <div className="flex gap-2 ml-4">
                                                    {item.impact && (
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.impact.includes('High') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            item.impact.includes('Medium') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            }`}>
                                                            {item.impact}
                                                        </span>
                                                    )}
                                                    {item.effort && (
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.effort.includes('Low') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            item.effort.includes('Medium') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {item.effort}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-2">
                                                {item.description}
                                            </p>
                                            {item.expectedResult && (
                                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700/30">
                                                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                                                        🎯 Expected Result: {item.expectedResult}
                                                    </p>
                                                </div>
                                            )}
                                            {item.timeline && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-cyan-600" />
                                                    <span className="text-xs text-cyan-600 font-medium">
                                                        Timeline: {item.timeline}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                } else if (item.type === 'insight') {
                                    return (
                                        <div
                                            key={itemIndex}
                                            className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200 group"
                                        >
                                            <div className="flex-shrink-0">
                                                <Star className="w-4 h-4 text-yellow-600 group-hover:drop-shadow-[0_0_4px_currentColor] transition-all duration-200" />
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    );
                                } else if (item.type === 'action') {
                                    return (
                                        <div
                                            key={itemIndex}
                                            className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-700/30 hover:border-amber-200 dark:hover:border-amber-500/50 transition-all duration-200 group"
                                        >
                                            <div className="flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-amber-600 group-hover:drop-shadow-[0_0_4px_currentColor] transition-all duration-200" />
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </Card>
                );
            })}

            {/* Sales Improvement Suggestions */}
            {salesSuggestions.length > 0 && (
                <Card className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-green-500/10 transition-all duration-300 animate-in fade-in duration-700 delay-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        Sales Improvement Suggestions
                    </h3>
                    <div className="space-y-4">
                        {salesSuggestions.map((suggestion, index) => {
                            const Icon = iconMap[suggestion.type] || DollarSign;
                            const color = colorMap[suggestion.type] || "text-green-600";
                            return (
                                <div
                                    key={index}
                                    className="flex gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-700/30 hover:border-green-200 dark:hover:border-green-500/50 transition-all duration-200 group animate-in fade-in slide-in-from-bottom-2"
                                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                                >
                                    <div className="flex-shrink-0">
                                        <Icon className={`w-5 h-5 ${color} group-hover:drop-shadow-[0_0_4px_currentColor] transition-all duration-200`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {suggestion.title}
                                            </h4>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${suggestion.impact === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    suggestion.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {suggestion.impact} Impact
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${suggestion.effort === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    suggestion.effort === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {suggestion.effort} Effort
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}