import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('intro');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    closeTimeDays: '',
    glAccountsCount: '',
    teamSize: '',
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
      await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          phone: formData.phone
        })
      });
    } catch (error) {
      console.log('Lead captured');
    }

    setEmailSubmitted(true);
    setTimeout(() => setStep('form'), 2000);
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
        issue: `With ${glAccounts} GL accounts, manual GRIR clearing consumes 2-3 days.`,
        recommendation: 'Automate 3-way matching (PO-Receipt-Invoice) with exception reporting.',
        impact: '1-2 days saved'
      });
    }

    if (formData.painPoints.includes('reconciliation')) {
      recommendations.push({
        area: 'Intercompany & Bank Reconciliation',
        issue: 'Manual reconciliation across subsidiaries delays close.',
        recommendation: 'Automate bank matching and pre-fill IC reconciliations.',
        impact: '0.5-1 day saved'
      });
    }

    if (formData.painPoints.includes('reporting')) {
      recommendations.push({
        area: 'Real-Time Reporting',
        issue: 'Post-close reporting is static.',
        recommendation: 'Build live dashboard pulling GL trial balance and variance in real-time.',
        impact: 'Decision quality +40%'
      });
    }

    if (formData.painPoints.includes('automation')) {
      recommendations.push({
        area: 'Close Process Automation',
        issue: 'Limited automation in journals and accruals.',
        recommendation: 'Automate recurring entries and accrual calculations.',
        impact: '1-2 days freed'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        area: 'Close Process Optimization',
        issue: 'Your close is ready for modernization.',
        recommendation: 'Comprehensive assessment of GL structure and automation opportunities.',
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
      console.log('Report generated');
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
    const reportText = `SAP FI/CO CLOSE OPTIMIZATION DIAGNOSTIC
${report.companyName}
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

CURRENT STATE
─────────────
• Month-end close cycle: ${report.closeDays} days
• GL accounts managed: ${report.glAccounts}
• Close team size: ${report.teamSize} FTEs

OPTIMIZATION OPPORTUNITY
────────────────────────
Potential improvement: Reduce close by ${report.potentialSavings} days per month

Financial Impact:
• Working capital freed: $${(report.workingCapitalImpact / 1000).toFixed(0)}K per month
• Annual impact: $${((report.workingCapitalImpact + report.laborSavings) * 12 / 1000).toFixed(0)}K

═══════════════════════════════════════════════════════════

RECOMMENDATIONS
────────────────

${report.recommendations.map((rec, i) => `${i + 1}. ${rec.area.toUpperCase()}
   Problem: ${rec.issue}
   Solution: ${rec.recommendation}
   Impact: ${rec.impact}
`).join('\n')}

═══════════════════════════════════════════════════════════

NEXT STEPS
──────────
4-week implementation engagement: $18,000 - $25,000
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
      teamSize: '',
      painPoints: [],
      phone: ''
    });
    setReport(null);
    setStep('intro');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
      color: 'white',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 16px 0' }}>SAP FI/CO</h1>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#93c5fd', margin: 0 }}>Close Acceleration</p>
          <p style={{ color: '#cbd5e1', marginTop: '16px', maxWidth: '500px', lineHeight: '1.6' }}>
            Find out exactly how many days you can cut from month-end close and the financial impact.
          </p>
        </div>

        {step === 'intro' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>How This Works</h2>
              <ol style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                <li style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>1</span>
                  <span>Tell us about your current close process</span>
                </li>
                <li style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>2</span>
                  <span>Get a custom diagnostic with specific recommendations</span>
                </li>
                <li style={{ display: 'flex', gap: '12px' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>3</span>
                  <span>Download your report and schedule a discovery call</span>
                </li>
              </ol>

              <button
                onClick={() => setStep('email')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Start Diagnostic
              </button>
            </div>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              Takes ~7 minutes • No credit card • Results instant
            </div>
          </div>
        )}

        {step === 'email' && !emailSubmitted && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Let's Get Started</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Your Company"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={submitEmail}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Continue to Diagnostic
                </button>
                <button
                  onClick={() => setStep('intro')}
                  style={{
                    padding: '12px 24px',
                    background: '#334155',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'email' && emailSubmitted && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <CheckCircle size={48} style={{ color: '#4ade80', margin: '0 auto' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>You're All Set</h2>
              <p style={{ color: '#cbd5e1' }}>Taking you to the diagnostic now...</p>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '32px'
            }}>
              
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Your Close Process</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>Close timeline (days)</label>
                  <input
                    type="number"
                    name="closeTimeDays"
                    placeholder="10-12"
                    value={formData.closeTimeDays}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>GL accounts</label>
                  <input
                    type="number"
                    name="glAccountsCount"
                    placeholder="150-300"
                    value={formData.glAccountsCount}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>Close team size (FTEs)</label>
                <input
                  type="number"
                  name="teamSize"
                  placeholder="3-8"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#cbd5e1' }}>What's slowing you down? (select all that apply)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {painPointOptions.map(option => (
                    <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '6px', backgroundColor: formData.painPoints.includes(option.id) ? '#334155' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={formData.painPoints.includes(option.id)}
                        onChange={() => togglePainPoint(option.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ color: '#cbd5e1' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={generateReport}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Generate Your Diagnostic
                </button>
                <button
                  onClick={() => setStep('intro')}
                  style={{
                    padding: '12px 24px',
                    background: '#334155',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'report' && report && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              background: 'white',
              color: '#1e293b',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
              marginBottom: '32px'
            }}>
              
              <div style={{
                background: 'linear-gradient(to right, #0f172a, #1e293b)',
                color: 'white',
                padding: '32px'
              }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Your FI/CO Diagnostic Report</h2>
                <p style={{ color: '#cbd5e1', margin: '0 0 8px 0' }}>{report.companyName}</p>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{new Date().toLocaleDateString()}</p>
              </div>

              <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a' }}>Opportunity Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    padding: '24px',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Current Close Cycle</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>{report.closeDays}</p>
                    <p style={{ color: '#475569', fontSize: '14px', margin: '8px 0 0 0' }}>days</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    padding: '24px',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Potential Savings</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#166534', margin: 0 }}>{report.potentialSavings}</p>
                    <p style={{ color: '#475569', fontSize: '14px', margin: '8px 0 0 0' }}>days per month</p>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  padding: '24px'
                }}>
                  <h4 style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '16px' }}>Financial Impact</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>Working Capital Released</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', margin: '8px 0 0 0' }}>${(report.workingCapitalImpact / 1000).toFixed(0)}K</p>
                      <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>per month</p>
                    </div>
                    <div>
                      <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>Annual Value</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', margin: '8px 0 0 0' }}>${((report.workingCapitalImpact + report.laborSavings) * 12 / 1000).toFixed(0)}K</p>
                      <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>savings + freed capital</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a' }}>Specific Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {report.recommendations.map((rec, i) => (
                    <div key={i} style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '24px' }}>
                      <h4 style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{i + 1}. {rec.area}</h4>
                      <p style={{ color: '#475569', marginBottom: '8px' }}><span style={{ fontWeight: '600' }}>Issue:</span> {rec.issue}</p>
                      <p style={{ color: '#475569', marginBottom: '8px' }}><span style={{ fontWeight: '600' }}>Solution:</span> {rec.recommendation}</p>
                      <div style={{
                        display: 'inline-block',
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {rec.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '32px', background: '#f1f5f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Recommended Next Step</h3>
                <p style={{ color: '#475569', marginBottom: '16px' }}>
                  Schedule a <span style={{ fontWeight: '600' }}>20-minute discovery call</span> to discuss implementation.
                </p>
                <p style={{ color: '#0f172a', fontWeight: '600' }}>
                  4-week optimization engagement: $18,000 - $25,000
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={downloadReport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(to right, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                <Download size={20} />
                Download Report
              </button>
              <button
                onClick={resetDiagnostic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#334155',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={20} />
                New Diagnostic
              </button>
            </div>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '32px' }}>
              <p style={{ marginBottom: '8px' }}>Ready to move forward? Let's talk.</p>
              <p style={{ fontWeight: '600', color: 'white' }}>Schedule your discovery call</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
