import { useState, useEffect } from 'react';
import { ChevronRight, Home, ListTodo, Calendar, Timer, Sparkles, X } from 'lucide-react';
import './Onboarding.css';

interface Slide {
  icon: JSX.Element;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: <Home size={64} />,
    title: 'Bienvenido a Todo AI',
    description: 'Tu asistente personal de productividad. Organiza tus tareas, gestiona tu tiempo y mejora tu eficiencia con la ayuda de inteligencia artificial.',
  },
  {
    icon: <ListTodo size={64} />,
    title: 'Gestiona tus Tareas',
    description: 'Crea, organiza y completa tus tareas fácilmente. Arrastra entre pendientes y completadas, y mantén todo bajo control en un solo lugar.',
  },
  {
    icon: <Calendar size={64} />,
    title: 'Planifica tu Semana',
    description: 'Arrastra tus tareas al calendario semanal y programa tu tiempo. Visualiza tu semana completa y optimiza tu agenda.',
  },
  {
    icon: <Timer size={64} />,
    title: 'Enfócate con Pomodoro',
    description: 'Usa la técnica Pomodoro para mantener tu concentración. Trabaja en bloques de tiempo enfocados y aumenta tu productividad.',
  },
  {
    icon: <Sparkles size={64} />,
    title: 'Asistente de Productividad IA',
    description: 'Pregunta a nuestra IA sobre productividad, eficiencia y optimización de tiempo. Obtén consejos personalizados y estrategias prácticas.',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      setIsVisible(false);
    }, 300);
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (!isVisible) return null;

  return (
    <div className={`onboarding-overlay ${isExiting ? 'exiting' : ''}`}>
      <div className="onboarding-container">
        <button className="onboarding-skip" onClick={handleSkip}>
          <X size={20} />
        </button>

        <div className="onboarding-content">
          <div
            className="onboarding-slide"
            key={currentSlide}
            style={{
              animation: 'slideIn 0.4s ease-out',
            }}
          >
            <div className="slide-icon">{slides[currentSlide].icon}</div>
            <h2 className="slide-title">{slides[currentSlide].title}</h2>
            <p className="slide-description">{slides[currentSlide].description}</p>
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-indicators">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <button className="onboarding-next" onClick={handleNext}>
            <span>{currentSlide === slides.length - 1 ? 'Comenzar' : 'Siguiente'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

