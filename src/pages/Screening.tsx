
import { useState, useEffect } from "react"; // Added useEffect
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import { Calculator, Heart, Shield, Activity, Check, Brain } from "lucide-react"; // Added Brain icon
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const Screening = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    age: "",
    gender: "",
    smoking: "",
    hypertension: "",
    diabetes: "",
    cholesterol: "",
    familyHistory: "",
    exercise: ""
  });
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const questions = [
    {
      id: "age",
      question: "What is your age?",
      options: [
        { value: "under40", label: "Under 40", points: 0 },
        { value: "40-54", label: "40-54", points: 1 },
        { value: "55-64", label: "55-64", points: 2 },
        { value: "65plus", label: "65 or older", points: 3 }
      ]
    },
    {
      id: "gender",
      question: "What is your gender?",
      options: [
        { value: "female", label: "Female", points: 0 },
        { value: "male", label: "Male", points: 1 }
      ]
    },
    {
      id: "smoking",
      question: "Do you currently smoke or have you smoked in the past 5 years?",
      options: [
        { value: "never", label: "Never smoked", points: 0 },
        { value: "former", label: "Former smoker (quit >5 years ago)", points: 1 },
        { value: "recent", label: "Recent former smoker (quit <5 years ago)", points: 2 },
        { value: "current", label: "Current smoker", points: 3 }
      ]
    },
    {
      id: "hypertension",
      question: "Do you have high blood pressure?",
      options: [
        { value: "no", label: "No, normal blood pressure", points: 0 },
        { value: "borderline", label: "Borderline/pre-hypertension", points: 1 },
        { value: "yes", label: "Yes, diagnosed with hypertension", points: 2 }
      ]
    },
    {
      id: "diabetes",
      question: "Do you have diabetes?",
      options: [
        { value: "no", label: "No diabetes", points: 0 },
        { value: "prediabetes", label: "Pre-diabetes", points: 1 },
        { value: "yes", label: "Yes, I have diabetes", points: 2 }
      ]
    },
    {
      id: "cholesterol",
      question: "What about your cholesterol levels?",
      options: [
        { value: "normal", label: "Normal cholesterol levels", points: 0 },
        { value: "unknown", label: "Don't know my levels", points: 1 },
        { value: "high", label: "High cholesterol", points: 2 }
      ]
    },
    {
      id: "familyHistory",
      question: "Do you have a family history of heart disease?",
      options: [
        { value: "no", label: "No family history", points: 0 },
        { value: "distant", label: "Distant relatives (aunts, uncles, grandparents)", points: 1 },
        { value: "close", label: "Close relatives (parents, siblings)", points: 2 }
      ]
    },
    {
      id: "exercise",
      question: "How often do you exercise?",
      options: [
        { value: "regular", label: "Regular exercise (3+ times per week)", points: 0 },
        { value: "occasional", label: "Occasional exercise (1-2 times per week)", points: 1 },
        { value: "rarely", label: "Rarely exercise", points: 2 }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value });
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let totalPoints = 0;
    questions.forEach(question => {
      const answerValue = answers[question.id as keyof typeof answers];
      const option = question.options.find(opt => opt.value === answerValue);
      if (option) {
        totalPoints += option.points;
      }
    });

    // setShowResults(true); // We'll set this after AI call or if AI call fails
    fetchAiAnalysis();
  };

  const fetchAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis("");
    setShowResults(true); // Show results page structure immediately

    try {
      const formData = new FormData();
      formData.append('message', JSON.stringify(answers));

      const response = await fetch("https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev/chat", {
        method: "POST",
        // headers: { // Content-Type is set automatically by the browser for FormData
        //   "Content-Type": "application/json", 
        // },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          accumulatedText += decoder.decode(value, { stream: true });
          setAiAnalysis(accumulatedText);
        }
        // Final decode for any remaining buffer
        accumulatedText += decoder.decode();
        setAiAnalysis(accumulatedText);
      } else {
        setAiAnalysis("No response body from AI service.");
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
      setAiAnalysis(`Failed to get AI analysis. ${error instanceof Error ? error.message : "Unknown error."} Please try again later.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getRiskLevel = () => {
    let totalPoints = 0;
    questions.forEach(question => {
      const answerValue = answers[question.id as keyof typeof answers];
      const option = question.options.find(opt => opt.value === answerValue);
      if (option) {
        totalPoints += option.points;
      }
    });

    if (totalPoints <= 4) return { level: "Low", color: "green", description: "Your risk factors suggest a lower risk for cardiovascular disease." };
    if (totalPoints <= 8) return { level: "Medium", color: "yellow", description: "You have some risk factors that should be addressed." };
    return { level: "High", color: "red", description: "You have multiple risk factors that significantly increase your risk." };
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (showResults) {
    const risk = getRiskLevel();
    
    const getBgColor = (color: string) => {
      if (color === 'green') return 'bg-green-50 border border-green-200';
      if (color === 'yellow') return 'bg-yellow-50 border border-yellow-200';
      return 'bg-red-50 border border-red-200';
    };

    const getTextColor = (color: string) => {
      if (color === 'green') return 'text-green-600';
      if (color === 'yellow') return 'text-yellow-600';
      return 'text-red-600';
    };

    const getDescriptionColor = (color: string) => {
      if (color === 'green') return 'text-green-800';
      if (color === 'yellow') return 'text-yellow-800';
      return 'text-red-800';
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Your Heart Risk Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center p-8 rounded-lg mb-6 ${getBgColor(risk.color)}`}>
                <div className={`text-6xl font-bold mb-4 ${getTextColor(risk.color)}`}>
                  {risk.level}
                </div>
                <p className={`text-lg ${getDescriptionColor(risk.color)}`}>
                  {risk.description}
                </p>
              </div>
              
              {/* AI Analysis Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Brain className="mr-2 h-7 w-7 text-purple-600" />
                    AI Powered Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized analysis based on your responses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none prose-sm sm:prose-base text-justify"> {/* Added text-justify */}
                  {isAiLoading && <p>Loading AI analysis... please wait.</p>}
                  {aiAnalysis && !isAiLoading && (
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  )}
                  {!isAiLoading && !aiAnalysis && <p>No AI analysis available at the moment.</p>}
                </CardContent>
              </Card>

              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 font-medium">
                  <strong>Important Disclaimer:</strong> This result is for educational purposes only and does not constitute a medical diagnosis. Please consult a doctor for an accurate cardiovascular health evaluation.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Button 
                  onClick={() => {
                    setCurrentStep(0);
                    setShowResults(false);
                    setAnswers({
                      age: "", gender: "", smoking: "", hypertension: "",
                      diabetes: "", cholesterol: "", familyHistory: "", exercise: ""
                    });
                  }}
                  variant="outline"
                >
                  Take Assessment Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Early Screening and ACS Prevention
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Assess your risk and learn how to protect your heart health
          </p>
        </div>

        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-3xl">
                <Calculator className="mr-3 h-8 w-8 text-blue-600" />
                Interactive Heart Risk Calculator
              </CardTitle>
              <CardDescription className="text-lg">
                Answer a few questions to assess your cardiovascular risk factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm text-gray-600">{currentStep + 1} of {questions.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="min-h-[300px]">
                <h3 className="text-xl font-semibold mb-6">{questions[currentStep].question}</h3>
                
                <RadioGroup 
                  value={answers[questions[currentStep].id as keyof typeof answers]} 
                  onValueChange={handleAnswer}
                  className="space-y-4"
                >
                  {questions[currentStep].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={!answers[questions[currentStep].id as keyof typeof answers]}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === questions.length - 1 ? "Get Results" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-3xl">
                <Shield className="mr-3 h-8 w-8 text-green-600" />
                Prevention Steps for Heart Health
              </CardTitle>
              <CardDescription className="text-lg">
                Take control of your heart health with these evidence-based strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Heart-Healthy Diet</h4>
                      <p className="text-gray-600 text-justify">
                        Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit salt, saturated fats, and processed foods.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Regular Exercise</h4>
                      <p className="text-gray-600 text-justify">
                        Aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus muscle-strengthening activities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Quit Smoking</h4>
                      <p className="text-gray-600 text-justify">
                        Smoking significantly increases heart disease risk. Quitting at any age provides immediate and long-term benefits.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Manage Stress</h4>
                      <p className="text-gray-600 text-justify">
                        Practice stress-reduction techniques like meditation, yoga, deep breathing, or regular physical activity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Regular Health Check-ups</h4>
                      <p className="text-gray-600 text-justify">
                        Monitor blood pressure, cholesterol levels, and blood sugar regularly. Early detection allows for better management.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Maintain Healthy Weight</h4>
                      <p className="text-gray-600 text-justify">
                        Even modest weight loss can reduce cardiovascular risk. Focus on sustainable lifestyle changes rather than quick fixes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Limit Alcohol</h4>
                      <p className="text-gray-600 text-justify">
                        If you drink alcohol, do so in moderation. This means up to one drink per day for women and up to two for men.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Get Quality Sleep</h4>
                      <p className="text-gray-600 text-justify">
                        Aim for 7-9 hours of quality sleep per night. Poor sleep is linked to increased cardiovascular risk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">Key Numbers to Know</CardTitle>
              <CardDescription className="text-blue-700">
                Target values for optimal heart health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Blood Pressure</h4>
                  <p className="text-2xl font-bold text-blue-600">&lt; 120/80</p>
                  <p className="text-sm text-gray-600">mmHg</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Total Cholesterol</h4>
                  <p className="text-2xl font-bold text-blue-600">&lt; 200</p>
                  <p className="text-sm text-gray-600">mg/dL</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Blood Sugar (Fasting)</h4>
                  <p className="text-2xl font-bold text-blue-600">&lt; 100</p>
                  <p className="text-sm text-gray-600">mg/dL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Screening;
