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
        area: 'GRIR Matching &
