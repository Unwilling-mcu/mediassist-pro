import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = 'May 30, 2026';
const COMPANY      = 'MediAssist Pro';
const EMAIL        = 'support@mediassistpro.in';
const WEBSITE      = 'https://mediassist-pro-lemon.vercel.app';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 10px', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>{title}</h2>
    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ margin: '0 0 10px' }}>{children}</p>;
const Li = ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>;
const Ul = ({ children }) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>;

function PrivacyPolicy() {
  return (
    <div>
      <Section title="1. Introduction">
        <P>{COMPANY} ("we", "our", or "us") is committed to protecting your personal and health information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our AI-powered health management platform.</P>
        <P>This policy is compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India and applicable data protection regulations.</P>
      </Section>

      <Section title="2. Information We Collect">
        <P><strong style={{color:'var(--text)'}}>Personal Information:</strong></P>
        <Ul>
          <Li>Name, email address, phone number</Li>
          <Li>Date of birth, gender, blood group</Li>
          <Li>Address and location data</Li>
          <Li>Payment information (processed securely by Razorpay — we do not store card details)</Li>
        </Ul>
        <P><strong style={{color:'var(--text)'}}>Health Information:</strong></P>
        <Ul>
          <Li>Vitals (heart rate, blood pressure, SpO2, temperature, weight)</Li>
          <Li>Symptoms, medical history, allergies, chronic conditions</Li>
          <Li>Prescriptions and medication records</Li>
          <Li>Appointment history and doctor consultations</Li>
          <Li>AI chat conversations related to health queries</Li>
        </Ul>
        <P><strong style={{color:'var(--text)'}}>Technical Information:</strong></P>
        <Ul>
          <Li>Device type, browser, IP address</Li>
          <Li>Usage patterns and feature interactions</Li>
          <Li>Cookies and session tokens</Li>
        </Ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <Ul>
          <Li>Provide AI-powered health insights, symptom analysis, and recommendations</Li>
          <Li>Enable appointment booking and doctor communications</Li>
          <Li>Track and display your health vitals and trends</Li>
          <Li>Manage prescriptions and medication reminders</Li>
          <Li>Process subscription payments via Razorpay</Li>
          <Li>Send important notifications about your health or account</Li>
          <Li>Improve our AI models and platform features (using anonymised data only)</Li>
          <Li>Comply with legal obligations</Li>
        </Ul>
      </Section>

      <Section title="4. Health Data — Special Protections">
        <P>Your health data is sensitive information and receives the highest level of protection:</P>
        <Ul>
          <Li>All health data is encrypted at rest and in transit using AES-256 and TLS 1.3</Li>
          <Li>Health data is never sold to third parties, advertisers, or insurance companies</Li>
          <Li>AI processing of your health data is done solely to provide you personalised health assistance</Li>
          <Li>Organisation admins can only see data of patients within their organisation</Li>
          <Li>You may request deletion of all your health data at any time</Li>
        </Ul>
      </Section>

      <Section title="5. Data Sharing">
        <P>We do not sell your personal data. We share data only in these limited circumstances:</P>
        <Ul>
          <Li><strong style={{color:'var(--text)'}}>Healthcare providers:</strong> Doctors and staff within your organisation can access your health records to provide care</Li>
          <Li><strong style={{color:'var(--text)'}}>AI providers:</strong> Health queries are processed by Groq (Llama AI) under strict data processing agreements</Li>
          <Li><strong style={{color:'var(--text)'}}>Payment processor:</strong> Razorpay processes payments; we share only the minimum required information</Li>
          <Li><strong style={{color:'var(--text)'}}>Legal requirements:</strong> We may disclose data if required by Indian law or court order</Li>
          <Li><strong style={{color:'var(--text)'}}>Emergency situations:</strong> We may share data with emergency services if there is an immediate risk to life</Li>
        </Ul>
      </Section>

      <Section title="6. Data Retention">
        <Ul>
          <Li>Account and health data: retained for the duration of your account plus 3 years</Li>
          <Li>Payment records: retained for 7 years as required by Indian tax law</Li>
          <Li>AI chat logs: retained for 90 days then anonymised</Li>
          <Li>You may request earlier deletion by contacting us at {EMAIL}</Li>
        </Ul>
      </Section>

      <Section title="7. Your Rights (DPDP Act 2023)">
        <P>Under the Digital Personal Data Protection Act 2023, you have the right to:</P>
        <Ul>
          <Li>Access a copy of your personal data we hold</Li>
          <Li>Correct inaccurate or incomplete data</Li>
          <Li>Erase your personal data ("right to be forgotten")</Li>
          <Li>Withdraw consent for data processing</Li>
          <Li>Nominate a person to exercise your rights in case of death or incapacity</Li>
          <Li>File a complaint with the Data Protection Board of India</Li>
        </Ul>
        <P>To exercise any of these rights, email us at <strong style={{color:'var(--mint)'}}>{EMAIL}</strong></P>
      </Section>

      <Section title="8. Cookies">
        <P>We use essential cookies for authentication and session management. We do not use advertising cookies or tracking pixels. You can disable cookies in your browser settings, but this may affect functionality.</P>
      </Section>

      <Section title="9. Security">
        <P>We implement industry-standard security measures including encrypted data storage, secure HTTPS connections, JWT-based authentication, rate limiting on all API endpoints, and regular security audits. However, no system is 100% secure — please use a strong password and keep your credentials private.</P>
      </Section>

      <Section title="10. Children's Privacy">
        <P>MediAssist Pro is not intended for use by children under 18 without parental consent. We do not knowingly collect data from minors. If you believe a minor has registered without consent, please contact us immediately.</P>
      </Section>

      <Section title="11. Changes to This Policy">
        <P>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the platform after changes constitutes acceptance of the updated policy.</P>
      </Section>

      <Section title="12. Contact Us">
        <P>For privacy-related queries, requests, or complaints:</P>
        <Ul>
          <Li>Email: <strong style={{color:'var(--mint)'}}>{EMAIL}</strong></Li>
          <Li>Website: {WEBSITE}</Li>
          <Li>Response time: within 72 hours</Li>
        </Ul>
      </Section>
    </div>
  );
}

function TermsOfService() {
  return (
    <div>
      <Section title="1. Acceptance of Terms">
        <P>By accessing or using {COMPANY} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users including individual patients, doctors, organisation administrators, and healthcare providers.</P>
      </Section>

      <Section title="2. Description of Service">
        <P>{COMPANY} is an AI-powered health management SaaS platform that provides:</P>
        <Ul>
          <Li>AI-assisted symptom checking and health guidance</Li>
          <Li>Appointment booking and management</Li>
          <Li>Prescription and medication tracking</Li>
          <Li>Health vitals monitoring and analytics</Li>
          <Li>Secure doctor-patient communication</Li>
          <Li>Organisation-level health management tools</Li>
        </Ul>
      </Section>

      <Section title="3. Medical Disclaimer — Important">
        <P style={{color:'var(--coral)', fontWeight:600}}>⚠️ MediAssist Pro is NOT a substitute for professional medical advice, diagnosis, or treatment.</P>
        <Ul>
          <Li>AI responses are for informational purposes only and should not be treated as medical advice</Li>
          <Li>Always consult a qualified, licensed doctor for medical decisions</Li>
          <Li>In case of emergency, call 112 (India) or your local emergency number immediately</Li>
          <Li>We do not guarantee the accuracy of AI-generated health information</Li>
          <Li>Doctors on the platform are independent professionals — we do not employ or control them</Li>
        </Ul>
      </Section>

      <Section title="4. User Accounts">
        <Ul>
          <Li>You must be 18 or older to create an account (or have parental consent)</Li>
          <Li>You are responsible for maintaining the confidentiality of your login credentials</Li>
          <Li>You must provide accurate and truthful information</Li>
          <Li>One person may not maintain multiple accounts</Li>
          <Li>You must notify us immediately of any unauthorised account access</Li>
        </Ul>
      </Section>

      <Section title="5. Subscription Plans and Billing">
        <Ul>
          <Li>Subscription fees are charged monthly in advance via Razorpay</Li>
          <Li>All amounts are in Indian Rupees (INR) and subject to applicable GST</Li>
          <Li>A 14-day free trial is available for new organisations</Li>
          <Li>You may cancel your subscription at any time — access continues until the end of the billing period</Li>
          <Li>Refunds are provided within 7 days of charge if you have not used the service</Li>
          <Li>We reserve the right to change pricing with 30 days notice</Li>
          <Li>Overdue payments may result in suspension of service</Li>
        </Ul>
      </Section>

      <Section title="6. Acceptable Use">
        <P>You agree NOT to:</P>
        <Ul>
          <Li>Use the platform for any illegal purpose</Li>
          <Li>Attempt to access other users' data without authorisation</Li>
          <Li>Upload false, misleading, or fraudulent health information</Li>
          <Li>Attempt to reverse engineer, hack, or disrupt the platform</Li>
          <Li>Use the AI system to generate harmful or dangerous medical advice for others</Li>
          <Li>Impersonate a doctor or healthcare professional without proper credentials</Li>
          <Li>Scrape, harvest, or bulk-download data from the platform</Li>
        </Ul>
      </Section>

      <Section title="7. Organisation Accounts">
        <Ul>
          <Li>Organisation administrators are responsible for all users within their organisation</Li>
          <Li>Organisations must ensure their staff and doctors comply with these Terms</Li>
          <Li>Organisations are responsible for obtaining necessary patient consents under applicable law</Li>
          <Li>We may terminate an organisation account for repeated violations by its members</Li>
        </Ul>
      </Section>

      <Section title="8. Intellectual Property">
        <Ul>
          <Li>The platform, its design, code, and AI models are owned by {COMPANY}</Li>
          <Li>Your health data belongs to you — we process it under licence from you</Li>
          <Li>You may not copy, resell, or redistribute any part of the platform without written permission</Li>
        </Ul>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>To the maximum extent permitted by Indian law:</P>
        <Ul>
          <Li>We are not liable for any medical outcomes resulting from use of the platform</Li>
          <Li>Our total liability to you shall not exceed the amount you paid us in the last 3 months</Li>
          <Li>We are not liable for indirect, incidental, or consequential damages</Li>
          <Li>We are not responsible for third-party services (Razorpay, Groq AI, map providers)</Li>
        </Ul>
      </Section>

      <Section title="10. Termination">
        <P>We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or if required by law. You may delete your account at any time from Settings. Upon termination, your data will be deleted within 30 days except where retention is legally required.</P>
      </Section>

      <Section title="11. Governing Law">
        <P>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in West Bengal, India. We encourage resolving disputes amicably first — contact us at {EMAIL}.</P>
      </Section>

      <Section title="12. Changes to Terms">
        <P>We may update these Terms with 15 days notice for material changes. Continued use after notice constitutes acceptance. For significant changes, we will require explicit re-acceptance.</P>
      </Section>

      <Section title="13. Contact">
        <Ul>
          <Li>Email: <strong style={{color:'var(--mint)'}}>{EMAIL}</strong></Li>
          <Li>Website: {WEBSITE}</Li>
          <Li>For urgent legal matters, mark your email subject as "LEGAL — URGENT"</Li>
        </Ul>
      </Section>
    </div>
  );
}

export default function Legal() {
  const [tab, setTab] = useState('privacy');
  const navigate      = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
          {tab === 'privacy' ? '🔒 Privacy Policy' : '📋 Terms of Service'}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
          Last updated: {LAST_UPDATED} · {COMPANY}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'privacy', label: '🔒 Privacy Policy' },
          { key: 'terms',   label: '📋 Terms of Service' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)',
            color: tab === t.key ? 'var(--mint)' : 'var(--text2)',
            borderBottom: tab === t.key ? '2px solid var(--mint)' : '2px solid transparent',
            marginBottom: -1, transition: 'all .15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        {tab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => window.print()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          🖨️ Print / Save PDF
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--mint)', color: '#080E1C', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}