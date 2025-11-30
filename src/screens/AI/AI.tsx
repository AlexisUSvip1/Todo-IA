import { useState } from 'react';
import { Sparkles, Send, AlertCircle } from 'lucide-react';
import './AI.css';

// Configura tu API Key de Gemini aquí
const GEMINI_API_KEY = 'AIzaSyAkKDPQLYWOldKXsnvN2Chq7HmQkRZcWeY';

interface TipCard {
  title: string;
  description: string;
  category?: string;
}

export default function AI() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<TipCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validar si la pregunta es sobre productividad
  const isProductivityRelated = (text: string): boolean => {
    const productivityKeywords = [
      'productividad',
      'productivo',
      'eficiente',
      'eficiencia',
      'optimizar',
      'optimización',
      'tiempo',
      'organizar',
      'organización',
      'tareas',
      'gestión',
      'gestionar',
      'planificar',
      'planificación',
      'priorizar',
      'prioridad',
      'hábitos',
      'rutina',
      'enfocado',
      'enfoque',
      'concentración',
      'concentrado',
      'distracción',
      'distraido',
      'procastinar',
      'procastinación',
      'metas',
      'objetivos',
      'rendimiento',
      'mejorar',
      'mejorado',
      'domir',
      'sueño',
      'técnica',
      'método',
      'estrategia',
      'trabajo',
      'estudio',
      'aprender',
      'aprendizaje',
    ];

    const lowerText = text.toLowerCase();
    return productivityKeywords.some((keyword) => lowerText.includes(keyword));
  };

  // Llamar a Gemini API
  const askAI = async () => {
    if (!question.trim()) return;

    // Validar tema
    if (!isProductivityRelated(question)) {
      setError('Solo puedo ayudarte con temas relacionados a productividad, eficiencia y optimización de tiempo. Por favor, haz una pregunta sobre estos temas.');
      setCards([]);
      return;
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY.length < 20) {
      setError('Por favor, configura tu API Key de Gemini en el código.');
      return;
    }

    setLoading(true);
    setError(null);
    setCards([]);

    try {
      // Llamar a Gemini API
      const response = await fetch(
        
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,

        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Eres un asistente experto en productividad, eficiencia y optimización de tiempo. El usuario pregunta: "${question}"

IMPORTANTE: Responde SOLO con una lista de consejos prácticos y accionables. Cada consejo debe seguir este formato exacto:

- [Título del consejo en máximo 8 palabras] - [Descripción breve y práctica en 1-2 oraciones]

Ejemplo:
- Técnica Pomodoro - Trabaja en bloques de 25 minutos seguidos de 5 minutos de descanso para mantener el enfoque.

Reglas:
- Máximo 6 consejos
- Cada consejo debe ser específico y accionable
- Usa formato: "- [Título] - [Descripción]"
- Sé conciso y práctico
- Enfócate en técnicas probadas de productividad`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al conectar con Gemini API');
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Parsear respuesta y crear cards
      const parsedCards = parseResponseToCards(text);
      setCards(parsedCards);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la pregunta. Verifica tu API Key.');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Parsear respuesta de Gemini a cards
  const parseResponseToCards = (text: string): TipCard[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const cards: TipCard[] = [];

    lines.forEach((line) => {
      // Buscar patrones como "- Título - Descripción" (formato esperado)
      const dashMatch = line.match(/[-•]\s*(.+?)\s*-\s*(.+)/);
      if (dashMatch) {
        cards.push({
          title: dashMatch[1].trim(),
          description: dashMatch[2].trim(),
        });
        return;
      }

      // Buscar patrones como "- Título: Descripción"
      const colonMatch = line.match(/[-•]\s*(.+?):\s*(.+)/);
      if (colonMatch) {
        cards.push({
          title: colonMatch[1].trim(),
          description: colonMatch[2].trim(),
        });
        return;
      }

      // Si solo hay un guion, intentar dividir por el primer " - " o ":"
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const content = line.replace(/^[-•]\s*/, '').trim();
        if (content) {
          // Intentar dividir por " - " primero
          const dashSplit = content.split(/\s*-\s*(.+)/);
          if (dashSplit.length >= 2 && dashSplit[1]) {
            cards.push({
              title: dashSplit[0].trim(),
              description: dashSplit[1].trim(),
            });
            return;
          }

          // Si no, dividir por ":"
          const colonSplit = content.split(':');
          if (colonSplit.length >= 2) {
            cards.push({
              title: colonSplit[0].trim(),
              description: colonSplit.slice(1).join(':').trim(),
            });
            return;
          }

          // Si no hay separador claro, usar las primeras palabras como título
          const words = content.split(' ');
          if (words.length > 5) {
            cards.push({
              title: words.slice(0, 5).join(' '),
              description: words.slice(5).join(' '),
            });
          } else {
            cards.push({
              title: content,
              description: 'Consejo práctico de productividad',
            });
          }
        }
      }
    });

    // Si no se pudieron parsear cards, intentar dividir por oraciones
    if (cards.length === 0 && text.trim()) {
      const sentences = text
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 20)
        .slice(0, 6);

      sentences.forEach((sentence) => {
        const trimmed = sentence.trim();
        const words = trimmed.split(' ');
        if (words.length > 3) {
          const titleWords = Math.min(6, Math.floor(words.length / 2));
          cards.push({
            title: words.slice(0, titleWords).join(' '),
            description: words.slice(titleWords).join(' '),
          });
        }
      });
    }

    // Si aún no hay cards, crear una con toda la respuesta
    if (cards.length === 0 && text.trim()) {
      const firstLine = text.split('\n')[0].trim();
      cards.push({
        title: 'Consejo de Productividad',
        description: firstLine || text.substring(0, 200),
      });
    }

    return cards;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <Sparkles size={24} className="ai-icon" />
        <h2 className="ai-title">Asistente de Productividad</h2>
      </div>

      <p className="ai-subtitle">Pregúntame sobre productividad, eficiencia y optimización de tiempo</p>

      {/* Input de pregunta */}
      <div className="ai-input-section">
        <div className="ai-input-wrapper">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: ¿Cómo puedo ser más productivo?"
            className="ai-input"
            disabled={loading}
          />
          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            className="ai-send-btn"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="ai-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Skeleton Loading */}
      {loading && (
        <div className="ai-cards-container">
          <h3 className="ai-cards-title">Consejos y Estrategias</h3>
          <div className="ai-cards-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="ai-card-skeleton">
                <div className="ai-card-skeleton-header">
                  <div className="ai-card-skeleton-number"></div>
                  <div className="ai-card-skeleton-title"></div>
                </div>
                <div className="ai-card-skeleton-description">
                  <div className="ai-card-skeleton-line"></div>
                  <div className="ai-card-skeleton-line"></div>
                  <div className="ai-card-skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards de respuestas */}
      {!loading && cards.length > 0 && (
        <div className="ai-cards-container">
          <h3 className="ai-cards-title">Consejos y Estrategias</h3>
          <div className="ai-cards-grid">
            {cards.map((card, index) => (
              <div key={index} className="ai-card">
                <div className="ai-card-header">
                  <span className="ai-card-number">{index + 1}</span>
                  <h4 className="ai-card-title">{card.title}</h4>
                </div>
                <p className="ai-card-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && cards.length === 0 && !error && (
        <div className="ai-empty">
          <Sparkles size={48} className="ai-empty-icon" />
          <p>Haz una pregunta sobre productividad para comenzar</p>
        </div>
      )}
    </div>
  );
}

