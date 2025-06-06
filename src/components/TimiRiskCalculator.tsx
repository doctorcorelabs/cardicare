import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TimiQuestion {
  id: string;
  label: string;
  tooltip?: string;
  note?: string;
}

const timiQuestions: TimiQuestion[] = [
  { id: 'age', label: 'Age ≥ 65 years?' },
  { 
    id: 'cadRiskFactors', 
    label: 'At least 3 CAD Risk Factors?',
    tooltip: 'Family history of early CAD, current smoker, hypertension (high blood pressure), high cholesterol, diabetes.'
  },
  { id: 'knownCad', label: 'Known Coronary Artery Disease (stenosis ≥ 50%)?' },
  { id: 'aspirinUse', label: 'Aspirin use in the past 7 days (before your event)?' },
  { id: 'severeAngina', label: 'Recent severe angina (≥2 episodes in last 24 hours before event)?' },
  { 
    id: 'stDeviation', 
    label: 'ST segment deviation ≥ 0.5 mm on ECG (during event)?',
    note: 'This information is usually found in your medical report from your hospital visit.'
  },
  { 
    id: 'cardiacMarkers', 
    label: 'Elevated cardiac markers (e.g., Troponin) (during event)?',
    note: 'This information is usually found in your medical report from your hospital visit.'
  },
];

type Answers = {
  [key: string]: string | undefined;
};

const TimiRiskCalculator: React.FC = () => {
  const [answers, setAnswers] = useState<Answers>({});
  const [timiScore, setTimiScore] = useState<number | null>(null);
  const [riskPercentage, setRiskPercentage] = useState<string | null>(null);
  const [riskPercentageValue, setRiskPercentageValue] = useState<number>(0);
  const [riskCategory, setRiskCategory] = useState<string | null>(null);
  const [resultColor, setResultColor] = useState<string>("text-gray-700"); // Default color
  const [resultIcon, setResultIcon] = useState<React.ReactNode | null>(null);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
    // Reset results if inputs change
    setTimiScore(null);
    setRiskPercentage(null);
    setRiskPercentageValue(0);
    setRiskCategory(null);
    setResultColor("text-gray-700");
    setResultIcon(null);
  };

  const calculateTimiScore = () => {
    let score = 0;
    timiQuestions.forEach(q => {
      if (answers[q.id] === 'yes') {
        score += 1;
      }
    });
    setTimiScore(score);

    // TIMI Risk Stratification for UA/NSTEMI (14-day composite endpoint)
    // Source: Antman EM, et al. JAMA. 2000;284(7):835-842.
    let percentageStr = '';
    let percentageVal = 0;
    let category = '';
    let color = 'text-gray-700';
    let icon: React.ReactNode = null;

    switch (score) {
      case 0:
      case 1:
        percentageStr = '4.7%';
        percentageVal = 4.7;
        category = 'Low';
        color = 'text-green-600';
        icon = <ShieldCheck className="h-5 w-5 mr-1 inline-block" />;
        break;
      case 2:
        percentageStr = '8.3%';
        percentageVal = 8.3;
        category = 'Low';
        color = 'text-green-600';
        icon = <ShieldCheck className="h-5 w-5 mr-1 inline-block" />;
        break;
      case 3:
        percentageStr = '13.2%';
        percentageVal = 13.2;
        category = 'Intermediate';
        color = 'text-yellow-600';
        icon = <AlertTriangle className="h-5 w-5 mr-1 inline-block" />;
        break;
      case 4:
        percentageStr = '19.9%';
        percentageVal = 19.9;
        category = 'Intermediate';
        color = 'text-yellow-600';
        icon = <AlertTriangle className="h-5 w-5 mr-1 inline-block" />;
        break;
      case 5:
        percentageStr = '26.2%';
        percentageVal = 26.2;
        category = 'High';
        color = 'text-red-600';
        icon = <ShieldAlert className="h-5 w-5 mr-1 inline-block" />;
        break;
      case 6:
      case 7:
        percentageStr = '40.9%';
        percentageVal = 40.9;
        category = 'High';
        color = 'text-red-600';
        icon = <ShieldAlert className="h-5 w-5 mr-1 inline-block" />;
        break;
      default:
        percentageStr = 'N/A';
        percentageVal = 0;
        category = 'N/A';
    }
    setRiskPercentage(percentageStr);
    setRiskPercentageValue(percentageVal);
    setRiskCategory(category);
    setResultColor(color);
    setResultIcon(icon);
  };

  const allQuestionsAnswered = () => {
    return timiQuestions.every(q => answers[q.id] !== undefined);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">TIMI Risk Score Calculator</CardTitle>
        <CardDescription className="text-justify">
          For Unstable Angina / Non-ST Elevation Myocardial Infarction (UA/NSTEMI).
          This estimates the 14-day risk of major adverse cardiac events (all-cause mortality, new/recurrent MI, or severe recurrent ischemia requiring urgent revascularization).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {timiQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor={question.id} className="text-sm font-medium text-justify">
                  {question.label}
                </Label>
                {question.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-gray-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{question.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {question.note && <p className="text-xs text-gray-500 italic text-justify">{question.note}</p>}
              <RadioGroup
                id={question.id}
                value={answers[question.id]}
                onValueChange={(value) => handleInputChange(question.id, value)}
                className="flex flex-wrap gap-2" // Use gap for spacing between pills
              >
                {['yes', 'no', ...(question.id === 'stDeviation' || question.id === 'cardiacMarkers' ? ['unsure'] : [])].map(optionValue => {
                  const isSelected = answers[question.id] === optionValue;
                  return (
                    <div key={optionValue}>
                      <RadioGroupItem value={optionValue} id={`${question.id}-${optionValue}`} className="sr-only" />
                      <Label 
                        htmlFor={`${question.id}-${optionValue}`}
                        className={`
                          px-4 py-2 border rounded-full cursor-pointer text-sm font-medium
                          transition-colors duration-150 ease-in-out
                          hover:bg-slate-100
                          ${isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'bg-white text-slate-700 border-slate-300'
                          }
                        `}
                      >
                        {optionValue.charAt(0).toUpperCase() + optionValue.slice(1)}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </TooltipProvider>
        
        <Button
          onClick={calculateTimiScore} 
          className="w-full"
          disabled={!allQuestionsAnswered()}
        >
          Calculate TIMI Score
        </Button>

        {timiScore !== null && riskPercentage && riskCategory && (
          <div className="mt-6 p-6 border rounded-lg bg-slate-50 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Calculation Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-md bg-white border">
                <p className="text-sm text-gray-500 mb-1">Your TIMI Score</p>
                <p className={`text-4xl font-bold ${resultColor}`}>{timiScore} <span className="text-2xl text-gray-400">/ 7</span></p>
              </div>
              
              <div className="p-4 rounded-md bg-white border">
                <p className="text-sm text-gray-500 mb-1">Estimated 14-Day Risk</p>
                <p className={`text-2xl font-semibold ${resultColor}`}>{riskPercentage}</p>
                <Progress value={riskPercentageValue} className={`mt-2 h-2.5 ${
                  riskCategory === 'Low' ? 'bg-green-500' : riskCategory === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>

              <div className="p-4 rounded-md bg-white border">
                <p className="text-sm text-gray-500 mb-1">Risk Category</p>
                <Badge 
                  variant={riskCategory === 'Low' ? 'default' : riskCategory === 'Intermediate' ? 'secondary' : 'destructive'}
                  className={`text-lg px-4 py-1.5 ${
                    riskCategory === 'Low' ? 'bg-green-100 text-green-700 border-green-300' : 
                    riskCategory === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                    'bg-red-100 text-red-700 border-red-300'
                  }`}
                >
                  {resultIcon}
                  {riskCategory}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-600 italic text-justify">
          <strong>Disclaimer:</strong> This calculator is for educational and informational purposes only. 
          It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
          Always consult your doctor or other qualified health provider with any questions you may have regarding a medical condition or treatment.
          Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TimiRiskCalculator;
