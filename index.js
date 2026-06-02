import React, { useState } from 'react';
import { ChevronDown, Download, RefreshCw, CheckCircle, Mail } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('intro');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    closeTimeDays: '',
    glAccountsCount: '',
    gririssues: '',
    reportingGaps: '',
    teamSize: '',
    currentTools: '',
    painPoints: [],
    phone: ''
  });
  const [report, setReport] = useState(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const painPointOptions = [
    { id: 'reconciliation', label: 'Manual reconciliations taking days' },
    { id: 'clearing', label: 'GRIR clearing & matching delays' },
    { id: 'reporting', label: 'Real-time reporting gaps' },
    { id: 'variance', label: 'Variance analysis is time-consuming' },
    { id: 'automation', label: 'Limited automation in close process' },
    { id: 'visibility', label: 'Poor visibility into close progress' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePainPoint = (id) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(id)
        ? prev.painPoints.filter(p => p !== id)
        : [...prev.painPoints, id]
    }));
  };

  const submitEmail = async () => {
    if (!formData.email || !formData.companyName) {
      alert('Please fill in company name and email');
      return;
    }

    try {
      const response = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          phone: formData.phone
        })
      });

      if (response.ok) {
        setEmailSubmitted(true);
        setTimeout(() => setStep('form'), 2000);
      }
    } catch (error) {
      console.log('Lead captured locally');
      setEmailSubmitted(true);
      setTimeout(() => setStep('form'), 2000);
    }
  };

  const generateReport = async () => {
    const closeDays = parseInt(formData.closeTimeDays) || 11;
    const glAccounts = parseInt(formData.glAccountsCount) || 200;
    const teamSize = parseInt(formData.teamSize) || 5;

    const potentialDaySavings = formData.painPoints.length > 3 ? 2 : 1.5;
    const workingCapitalImpact = (closeDays - potentialDaySavings) * 50000;
    const laborSavings = potentialDaySavings * teamSize * 800;

    const recommendations = [];
    
    if (formData.painPoints.includes('clearing')) {
      recommendations.push({
        area: 'GRIR Matching & Clearing',
        issue: `With ${glAccounts} GL accounts, manual GRIR clearing likely consumes 2-3 days of close cycle.`,
        recommendation: 'Implement automated 3-way matching (PO-Receipt-Invoice) with exception reporting. Target: reduce clearing to <4 hours.',
        impact: '1-2 days saved'
      });
    }

    if (formData.painPoints.includes('reconciliation')) {
      recommendations.push({
        area: 'Intercompany & Bank Reconciliation',
        issue: `Manual reconciliation across subsidiaries delays close significantly.`,
        recommendation: 'Automate bank matching (CASS/CCAP rules) and pre-fill IC reconciliations. Use variance analysis to flag anomalies.',
        impact: '0.5-1 day saved'
      });
    }

    if (formData.painPoints.includes('reporting')) {
      recommendations.push({
        area: 'Real-Time Reporting',
        issue: `Post-close reporting is static. Finance team can't answer questions mid-close.`,
        recommendation: 'Build live dashboard pulling GL trial balance, variance vs. prior month, and close task status in real-time.',
        impact: 'Decision quality +40%, close transparency +100%'
      });
    }

    if (formData.painPoints.includes('automation')) {
      recommendations.push({
        area: 'Close Process Automation',
        issue: `Limited RPA/automation in journals, accruals, consolidations.`,
        recommendation: 'Automate recurring entries, accrual calculations, and inter-company eliminations. Enforce close checklist.',
        impact: '1-2 days freed for analysis'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        area: 'Close Process Optimization',
        issue: `Your close is ripe for modernization.`,
        recommendation: 'Comprehensive assessment of GL structure, automation opportunities, and reporting gaps.',
        impact: '1-2 days saved per month'
      });
    }

    try {
      await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          report: {
            closeDays,
            potentialSavings: potentialDaySavings,
            workingCapitalImpact,
            laborSavings,
            recommendations,
            teamSize,
            glAccounts
          }
        })
      });
    } catch (error) {
      console.log('Report generated locally');
    }

    setReport({
      companyName: formData.companyName || 'Your Company',
      closeDays,
      potentialSavings: potentialDaySavings,
      workingCapitalImpact,
      laborSavings,
      recommendations,
      teamSize,
      glAccounts
    });
    setStep('report');
  };

  const downloadReport = () => {
    const reportText = `
SAP FI/CO CLOSE OPTIMIZATION DIAGNOSTIC
${report.companyName}
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

CURRENT STATE
─────────────
• Month-end close cycle: ${report.closeDays} days
• GL accounts managed: ${report.glAccounts}
• Close team size: ${report.teamSize} FTEs
• Current bottlenecks identified: ${formData.painPoints.length} critical areas

OPTIMIZATION OPPORTUNITY
────────────────────────
Potential improvement: Reduce close by ${report.potentialSavings} days per month

Financial Impact:
• Working capital freed: $${(report.workingCapitalImpact / 1000).toFixed(0)}K per month
• Labor cost reduction: $${(report.laborSavings / 1000).toFixed(0)}K per month
• Annual impact: $${((report.workingCapitalImpact + report.laborSavings) * 12 / 1000).toFixed(0)}K

═══════════════════════════════════════════════════════════

RECOMMENDATIONS
────────────────

${report.recommendations.map((rec, i) => `
${i + 1}. ${rec.area.toUpperCase()}
   Problem: ${rec.issue}
   Solution: ${rec.recommendation}
   Impact: ${rec.impact}
`).join('\n')}

═══════════════════════════════════════════════════════════

NEXT STEPS
──────────
This diagnostic identifies optimization opportunities specific to your FI/CO close.

The next phase is a detailed 4-week implementation engagement.

Investment: $15,000 - $25,000 depending on scope
Typical payback period: 2-3 months

Ready to accelerate your close? Schedule a call.
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
    element.setAttribute('download', `FI-CO-Diagnostic-${report.companyName.replace(/\s/g, '-')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetDiagnostic = () => {
    setFormData({
      companyName: '',
      email: '',
      closeTimeDays: '',
      glAccountsCount: '',
      gririssues: '',
      reportingGaps: '',
      teamSize: '',
      currentTools: '',
      painPoints: [],
      phone: ''
    });
    setReport(null);
    setStep('intro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto mb-12 pt-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-5xl font-black tracking-tight" style={{fontFamily: 'Georgia, serif'}}>SAP FI/CO</h1>
          <p className="text-2xl font-light text-blue-300">Close Acceleration</p>
        </div>
        <p className="text-slate-400 mt-4 max-w-2xl leading-relaxed">
          Find out exactly how many days you can cut from month-end close, which bottleneck to fix first, and the financial impact.
        </p>
      </div>

      {step === 'intro' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">How This Works</h2>
            <ol className="space-y-3 text-slate-300 mb-8">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Tell us about your current close process</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Get a custom diagnostic with specific recommendations</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Download your report and schedule a discovery call</span>
              </li>
            </ol>

            <button
              onClick={() => setStep('email')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Diagnostic
            </button>
          </div>

          <div className="text-center text-slate-500 text-sm">
            Takes ~7 minutes • No credit card • Results instant
          </div>
        </div>
      )}

      {step === 'email' && !emailSubmitted && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Let's Get Started</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Your Company"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={submitEmail}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Diagnostic
              </button>
              <button
                onClick={() => setStep('intro')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'email' && emailSubmitted && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're All Set</h2>
            <p className="text-slate-300 mb-6">Taking you to the diagnostic now...</p>
            <div className="animate-pulse text-blue-400">Loading...</div>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Close Process</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Close timeline (days)</label>
                <input
                  type="number"
                  name="closeTimeDays"
                  placeholder="10-12"
                  value={formData.closeTimeDays}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">GL accounts</label>
                <input
                  type="number"
                  name="glAccountsCount"
                  placeholder="150-300"
                  value={formData.glAccountsCount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-slate-300">Close team size (FTEs)</label>
              <input
                type="number"
                name="teamSize"
                placeholder="3-8"
                value={formData.teamSize}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-4 text-slate-300">What's slowing you down? (select all that apply)</label>
              <div className="space-y-3">
                {painPointOptions.map(option => (
                  <label key={option.id} className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={formData.painPoints.includes(option.id)}
                      onChange={() => togglePainPoint(option.id)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-slate-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateReport}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Generate Your Diagnostic
              </button>
              <button
                onClick={() => setStep('intro')}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'report' && report && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white text-slate-900 rounded-lg overflow-hidden shadow-2xl mb-8">
            
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">Your FI/CO Diagnostic Report</h2>
              <p className="text-slate-300">{report.companyName}</p>
              <p className="text-slate-400 text-sm mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="p-8 border-b border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-900">Opportunity Summary</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <p className="text-slate-600 text-sm font-semibold mb-2">Current Close Cycle</p>
                  <p className="text-4xl font-bold text-blue-900">{report.closeDays}</p>
                  <p className="text-slate-600 text-sm mt-1">days</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <p className="text-slate-600 text-sm font-semibold mb-2">Potential Savings</p>
                  <p className="text-4xl font-bold text-green-900">{report.potentialSavings}</p>
                  <p className="text-slate-600 text-sm mt-1">days per month</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h4 className="font-bold text-amber-900 mb-4">Financial Impact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 text-sm">Working Capital Released</p>
                    <p className="text-2xl font-bold text-amber-900">${(report.workingCapitalImpact / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-600 mt-1">per month</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Annual Value</p>
                    <p className="text-2xl font-bold text-amber-900">${((report.workingCapitalImpact + report.laborSavings) * 12 / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-600 mt-1">savings + freed capital</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-900">Specific Recommendations</h3>
              <div className="space-y-6">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-6">
                    <h4 className="font-bold text-slate-900 mb-2">{i + 1}. {rec.area}</h4>
                    <p className="text-slate-700 mb-3"><span className="font-semibold">Issue:</span> {rec.issue}</p>
                    <p className="text-slate-700 mb-2"><span className="font-semibold">Solution:</span> {rec.recommendation}</p>
                    <div className="inline-block bg-green-100 text-green-900 px-3 py-1 rounded text-sm font-semibold">
                      {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50">
              <h3 className="text-lg font-bold mb-4 text-slate-900">Recommended Next Step</h3>
              <p className="text-slate-700 mb-4">
                Schedule a <span className="font-semibold">20-minute discovery call</span> to discuss implementation.
              </p>
              <p className="text-slate-700 font-semibold">
                4-week optimization engagement: $18,000 - $25,000
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={20} />
              Download Report
            </button>
            <button
              onClick={resetDiagnostic}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <RefreshCw size={20} />
              New Diagnostic
            </button>
          </div>

          <div className="text-center text-slate-400 text-sm mt-8">
            <p className="mb-4">Ready to move forward? Let's talk.</p>
            <p className="font-semibold text-white">Schedule your discovery call</p>
          </div>
        </div>
      )}
    </div>
  );
}
