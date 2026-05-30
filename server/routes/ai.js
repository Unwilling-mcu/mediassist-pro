const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const Patient      = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Vital        = require('../models/Vital');
const Groq         = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Rate limit: 20 AI requests per user per 10 minutes ──────────────────────
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  // Use user ID when available — avoids IPv6 issues entirely
  // Falls back to nothing (express-rate-limit handles IP internally)
  keyGenerator: (req) => req.user?._id?.toString() ?? req.socket.remoteAddress,
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many AI requests. Please wait a few minutes before trying again.',
    });
  },
});

// POST /api/ai/chat
router.post('/chat', protect, aiLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length)
      return res.status(400).json({ success: false, message: 'Messages required' });

    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name');
    const prescriptions = patient
      ? await Prescription.find({ patient: patient._id, status: 'active' })
      : [];
    const latestVital = patient
      ? await Vital.findOne({ patient: patient._id }).sort({ recordedAt: -1 })
      : null;

    const meds = prescriptions.map(p => `${p.medicineName} ${p.dosage} (${p.frequency})`).join(', ');

    const systemPrompt = `You are MediAssist AI, a warm, helpful, and empathetic medical AI assistant.

Patient: ${patient?.user?.name || 'Unknown'}, ${patient?.age || '?'} years old, ${patient?.gender || 'Unknown'}, ${patient?.city || 'Asansol, West Bengal, India'}.
Blood Group: ${patient?.bloodGroup || 'Unknown'}.
BMI: ${patient?.bmi || 'Unknown'} (Height: ${patient?.heightCm || '?'}cm, Weight: ${patient?.weightKg || '?'}kg).
Chronic Conditions: ${(patient?.chronicConditions || []).join(', ') || 'None'}.
Allergies: ${(patient?.allergies || []).join(', ') || 'None'}.
Active Medications: ${meds || 'None recorded'}.
Latest Vitals: HR ${latestVital?.heartRate || '?'} bpm, SpO2 ${latestVital?.spo2 || '?'}%.

Guidelines:
- Be warm, clear, and concise. Use bullet points when helpful.
- Always recommend consulting a real doctor for diagnosis and treatment.
- Never diagnose definitively.
- If symptoms sound serious, clearly say to seek immediate care.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    res.json({
      success: true,
      message: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
    });
  } catch (err) {
    console.error('AI Chat error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;