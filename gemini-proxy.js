/**
 * gemini-proxy.js — Cloudflare Worker
 * Proxy seguro entre el frontend PCB y la API de Google Gemini.
 *
 * ── CÓMO DESPLEGAR ──────────────────────────────────────────────
 * 1. Ve a https://workers.cloudflare.com y crea una cuenta gratuita.
 * 2. Crea un nuevo Worker (botón "Create Worker").
 * 3. Pega TODO el contenido de este archivo en el editor.
 * 4. Haz clic en "Save and Deploy".
 * 5. Ve a Settings → Variables → Add variable:
 *       Nombre:  GEMINI_API_KEY
 *       Valor:   AIzaSyDMbRDCFaDHGqyryr1d3JqNxc6yDfMhqLI
 *    → Marca "Encrypt" para que nadie la vea.
 * 6. Copia la URL del Worker (ej: https://pcb-gemini.workers.dev).
 * 7. En asistente.html, reemplaza PROXY_URL con esa URL.
 *
 * ── LÍMITES DEL PLAN GRATUITO ───────────────────────────────────
 * - 100,000 solicitudes/día — suficiente para un portal escolar.
 * - Sin costo mensual.
 * ────────────────────────────────────────────────────────────────
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_API_VER = 'v1beta'; // v1beta soporta system_instruction

export default {
  async fetch(request, env) {

    // ── Preflight CORS ──────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // ── Leer cuerpo ─────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { message, history = [], systemPrompt = '' } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return json({ error: 'Missing or empty "message" field' }, 400);
    }

    // ── Verificar que la key existe en env ───────────────────────
    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Proxy no configurado: falta GEMINI_API_KEY en Variables del Worker.' }, 503);
    }

    // ── Construir contents para Gemini ───────────────────────────
    const contents = [
      ...history.filter(h => h.role && h.parts),
      { role: 'user', parts: [{ text: message.trim() }] }
    ];

    const geminiBody = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512, topP: 0.9 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    if (systemPrompt) {
      geminiBody.system_instruction = { parts: [{ text: systemPrompt }] };
    }

    // ── Llamar a Gemini ──────────────────────────────────────────
    const geminiUrl =
      `https://generativelanguage.googleapis.com/${GEMINI_API_VER}` +
      `/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    let geminiRes;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      });
    } catch (e) {
      return json({ error: 'Error de red al contactar Gemini: ' + e.message }, 502);
    }

    const data = await geminiRes.json();

    // ── Gemini devolvió un error (4xx / 5xx) ────────────────────
    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || `Error ${geminiRes.status} de Gemini`;
      const status = geminiRes.status === 429 ? 429
                   : geminiRes.status === 400 ? 400
                   : 502;
      return json({ error: errMsg }, status);
    }

    // ── Extraer texto de respuesta ───────────────────────────────
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? null;

    if (!reply) {
      // Gemini puede bloquear por safety filters sin dar texto
      const blockReason = data?.promptFeedback?.blockReason;
      const errMsg = blockReason
        ? `Respuesta bloqueada por filtros de seguridad (${blockReason}).`
        : 'Gemini no devolvió una respuesta válida.';
      return json({ error: errMsg }, 200);
    }

    // ── Éxito: devolver sólo el texto ────────────────────────────
    return json({ reply });
  },
};

// Helper
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
