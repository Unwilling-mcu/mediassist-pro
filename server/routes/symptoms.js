const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/auth');
const Groq        = require('groq-sdk');
const SymptomLog  = require('../models/SymptomLog');
const Patient     = require('../models/Patient');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/symptoms/analyze
router.post('/analyze', protect, async (req, res) => {
  try {
    const { symptoms, bodyPart } = req.body;
    if (!symptoms)
      return res.status(400).json({ success: false, message: 'Symptoms required' });

    const patient = await Patient.findOne({ user: req.user._id });
    const context = patient ? `
Patient context:
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender || 'Unknown'}
- Chronic conditions: ${(patient.chronicConditions || []).join(', ') || 'None'}
- Known allergies: ${(patient.allergies || []).join(', ') || 'None'}
- Blood group: ${patient.bloodGroup || 'Unknown'}` : '';

    const systemPrompt = `You are a medical AI symptom analyzer. Analyze symptoms and return ONLY valid JSON with no extra text, no markdown, no backticks. Use exactly this format:
{"conditions":[{"name":"Condition Name","confidence":85,"description":"Brief accurate description"},{"name":"Condition Name","confidence":60,"description":"Brief description"}],"severity":"mild","specialist":"General Physician","actions":["Action 1","Action 2","Action 3"],"redFlags":["Warning sign"],"emergency":false}

Rules:
- severity must be: mild, moderate, severe, or emergency
- confidence is integer 0-100
- Give 2-4 most likely conditions
- actions should be practical and specific
- emergency true only for life-threatening symptoms
- Return ONLY the JSON object, nothing else`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',   // ✅ Current active Groq model
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `${context}\n\nSymptoms: ${symptoms}${bodyPart ? `\nBody area: ${bodyPart}` : ''}` },
      ],
    });

    let result;
    try {
      let text = response.choices[0]?.message?.content || '{}';
      text = text.replace(/```json?|```/g, '').trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) text = match[0];
      result = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'AI returned invalid response. Please try again.' });
    }

    if (patient) {
      await SymptomLog.create({
        patient:    patient._id,
        symptoms,
        bodyPart,
        severity:   result.severity,
        conditions: result.conditions,
        specialist: result.specialist,
        actions:    result.actions,
        emergency:  result.emergency,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Symptom analyze error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/symptoms/history
router.get('/history', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.json({ success: true, data: [] });
    const logs = await SymptomLog.find({ patient: patient._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;