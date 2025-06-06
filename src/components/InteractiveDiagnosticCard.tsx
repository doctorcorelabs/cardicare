import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card components are used as a base

interface SectionItem {
  title: string;
  points: string[];
}

interface KeyFinding {
  title: string;
  text: string;
}

interface InteractiveDiagnosticCardProps {
  icon: React.ElementType;
  title: string;
  colorScheme: 'blue' | 'red' | 'green' | 'gray'; // Added gray for additional tests
  sections: SectionItem[];
  keyFinding?: KeyFinding; // Optional, as "Additional Tests" might not have a specific key finding like others
  initiallyOpen?: boolean;
}

const InteractiveDiagnosticCard: React.FC<InteractiveDiagnosticCardProps> = ({
  icon: IconComponent,
  title,
  colorScheme,
  sections,
  keyFinding,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const colorVariants = {
    blue: {
      border: 'border-blue-500',
      iconText: 'text-blue-600',
      bg: 'bg-blue-50',
      keyFindingText: 'text-blue-800',
    },
    red: {
      border: 'border-red-500',
      iconText: 'text-red-600',
      bg: 'bg-red-50',
      keyFindingText: 'text-red-800',
    },
    green: {
      border: 'border-green-500',
      iconText: 'text-green-600',
      bg: 'bg-green-50',
      keyFindingText: 'text-green-800',
    },
    gray: { // For additional tests or neutral cards
      border: 'border-gray-400',
      iconText: 'text-gray-600',
      bg: 'bg-gray-50',
      keyFindingText: 'text-gray-800',
    }
  };

  const selectedColor = colorVariants[colorScheme] || colorVariants.gray;

  return (
    <div className={`mb-6 border-l-4 ${selectedColor.border} pl-6 py-4 rounded-r-lg bg-white shadow-md`}>
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className={`text-2xl font-semibold flex items-center ${selectedColor.iconText}`}>
          <IconComponent className="mr-3 h-7 w-7" />
          {title}
        </h3>
        {isOpen ? <ChevronUp className={`h-6 w-6 ${selectedColor.iconText}`} /> : <ChevronDown className={`h-6 w-6 ${selectedColor.iconText}`} />}
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-3 text-gray-800">{section.title}</h4>
                <ul className="space-y-2 text-gray-700">
                  {section.points.map((point, pIndex) => (
                    <li key={pIndex} className="flex items-start">
                      <span className={`mr-2 mt-1 text-xs ${selectedColor.iconText}`}>●</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {keyFinding && (
            <div className={`mt-6 p-4 ${selectedColor.bg} rounded-lg`}>
              <p className={`${selectedColor.keyFindingText}`}>
                <strong>{keyFinding.title}:</strong> {keyFinding.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveDiagnosticCard;
