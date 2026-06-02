import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('landing');
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
    setStep('landing');
  };

  // LANDING PAGE
  if (step === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Hero Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '900',
              margin: '0 0 16px 0',
              lineHeight: '1.2'
            }}>
              Cut Your Month-End Close in Half
            </h1>
            <p style={{
              fontSize: '24px',
              color: '#93c5fd',
              fontWeight: '300',
              margin: 0
            }}>
              Reduce 10-12 days to 8-10 days. Free up $50K-100K in working capital monthly.
            </p>
          </div>

          <p style={{
            fontSize: '18px',
            color: '#cbd5e1',
            maxWidth: '600px',
            margin: '32px auto',
            lineHeight: '1.6'
          }}>
            Most SAP finance teams waste 2-3 days per close on GRIR matching, manual reconciliations, and reporting delays. We show you exactly where you're losing time and how much you can save.
          </p>

          <button
            onClick={() => setStep('intro')}
            style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              padding: '16px 40px',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px'
            }}
          >
            Get Your Free Diagnostic <ArrowRight size={20} />
          </button>
        </div>

        {/* Features Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px'
        }}>
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px'
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Fast Diagnosis</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Get a custom diagnostic in 5 minutes. Identify your bottlenecks instantly.
            </p>
          </div>

          <div>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px'
            }}>
              💰
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Quantified Impact</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              See exactly how much working capital you can free up per month.
            </p>
          </div>

          <div>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '24px'
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Actionable Plan</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Get specific recommendations ranked by impact and implementation effort.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '80px 24px',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Built for SAP FI/CO Professionals
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#cbd5e1',
              lineHeight: '1.8',
              textAlign: 'center',
              margin: 0
            }}>
              With 20 years of SAP expertise, we understand the complexity of month-end close. Our diagnostic identifies the exact bottlenecks slowing you down and shows you how to fix them. No generic advice. No cookie-cutter solutions. Just specific recommendations for your FI/CO close.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            Ready to Accelerate Your Close?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#cbd5e1',
            marginBottom: '32px'
          }}>
            5-minute diagnostic. Custom report. No credit card required.
          </p>
          <button
            onClick={() => setStep('intro')}
            style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              padding: '16px 40px',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Start Your Diagnostic <ArrowRight size={20} />
          </button>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p style={{ margin: 0 }}>© 2024 dserp.ai. SAP FI/CO Close Acceleration.</p>
        </div>
      </div>
    );
  }

  // DIAGNOSTIC INTRO
  if (step === 'intro') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to br, #0f172a, #1e293b)',
        color: 'white',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 16px 0' }}>SAP FI/CO</h1>
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#93c5fd', margin: 0 }}>Close Acceleration Diagnostic</p>
          </div>

          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>How This Works</h2>
            <ol style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              <li style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>1</span>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Tell us about your close</p>
                  <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>Answer 6 quick questions</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>2</span>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Get your diagnostic</p>
                  <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>AI analyzes your situation instantly</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>3</span>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Download & discuss</p>
                  <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>Custom report with actionable steps</p>
                </div>
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
      </div>
    );
  }

  // EMAIL CAPTURE
  if (step === 'email' && !emailSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to br, #0f172a, #1e293b)',
        color: 'white',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Let's Get Started</h2>
            
            <div style={{ marginBottom: '20px' }}>
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
                  padding: '10px',
                  color: 'white',
                  fontSize:
