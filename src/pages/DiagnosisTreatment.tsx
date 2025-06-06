import { Activity, Heart, Clock, Pill, Zap, Users, TestTube2, Stethoscope, FileText, ClipboardList } from "lucide-react"; // Added ClipboardList
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InteractiveDiagnosticCard from "@/components/InteractiveDiagnosticCard"; // Import the new component
import Chatbot from "@/components/Chatbot"; // Import the Chatbot component
import TimiRiskCalculator from "@/components/TimiRiskCalculator"; // Import the calculator
import DrugInteractionChecker from "@/components/DrugInteractionChecker"; // Import the new checker

const DiagnosisTreatment = () => {

  // Data for InteractiveDiagnosticCard components (Diagnosis Tab)
  const ecgData = {
    icon: Zap,
    title: "Electrocardiogram (ECG or EKG)",
    colorScheme: 'blue' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      {
        title: "What it does:",
        points: [
          "Records the heart's electrical activity",
          "Shows the heart's rhythm and rate",
          "Identifies areas of heart muscle damage",
          "Helps determine the type of ACS",
        ],
      },
      {
        title: "What to expect:",
        points: [
          "Quick, painless test (takes 2-3 minutes)",
          "Electrodes placed on chest, arms, and legs",
          "Results available immediately",
          "May be repeated several times",
        ],
      },
    ],
    keyFinding: {
      title: "Key Finding",
      text: "ST-segment elevation indicates STEMI (the most serious type), while other changes may suggest NSTEMI or unstable angina.",
    },
  };

  const bloodTestsData = {
    icon: TestTube2,
    title: "Blood Tests (Cardiac Enzymes)",
    colorScheme: 'red' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      {
        title: "What they measure:",
        points: [
          "Troponin: The most important marker",
          "CK-MB: Additional enzyme marker",
          "Myoglobin: Early indicator of damage",
          "Released when heart muscle is damaged",
        ],
      },
      {
        title: "Testing process:",
        points: [
          "Blood drawn through a small needle",
          "Tests repeated every 6-12 hours",
          "Results help confirm heart attack",
          "Levels peak at different times",
        ],
      },
    ],
    keyFinding: {
      title: "Important",
      text: "Elevated troponin levels indicate heart muscle damage, distinguishing heart attacks (STEMI/NSTEMI) from unstable angina.",
    },
  };

  const angiographyData = {
    icon: Heart,
    title: "Coronary Angiography (Cardiac Catheterization)",
    colorScheme: 'green' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      {
        title: "The \"Gold Standard\":",
        points: [
          "Visualizes blockages in coronary arteries",
          "Shows exact location and severity",
          "Guides treatment decisions",
          "Can be combined with treatment",
        ],
      },
      {
        title: "The procedure:",
        points: [
          "Thin tube inserted through wrist or groin",
          "Contrast dye injected to see arteries",
          "Real-time X-ray imaging",
          "Usually takes 30-60 minutes",
        ],
      },
    ],
    keyFinding: {
      title: "Advantage",
      text: "This test not only diagnoses the problem but can also be used to immediately treat blockages with angioplasty and stenting.",
    },
  };
  
  const additionalTestsData = {
    icon: Stethoscope,
    title: "Additional Diagnostic Tests",
    colorScheme: 'gray' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      {
        title: "Commonly Used:",
        points: [
          "Chest X-ray: Checks for heart enlargement or fluid in lungs",
          "Echocardiogram: Ultrasound to assess heart function",
          "CT Angiography: Non-invasive imaging of coronary arteries",
          "Stress Testing: May be done later to assess heart function",
        ]
      },
      {
        title: "Purpose:",
        points: [
          "Provide a more complete picture of heart health.",
          "Rule out other conditions.",
          "Help in planning long-term treatment.",
          "Assess overall cardiovascular risk."
        ]
      }
    ],
  };

  // Data for InteractiveDiagnosticCard components (Treatment Tab)
  const emergencyTreatmentData = {
    icon: Zap,
    title: "Immediate/Emergency Treatment",
    colorScheme: 'red' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      { title: "Initial Medications", points: ["Aspirin: Prevents further blood clotting", "Nitroglycerin: Improves blood flow to the heart", "Pain Relief: Morphine for severe chest pain", "Oxygen Therapy: If oxygen levels are low"] },
      { title: "Primary Angioplasty (PCI)", points: ["Balloon opens the blocked artery", "Stent (small metal mesh) keeps artery open", "Preferred treatment for STEMI", "Best results within 90 minutes"] },
      { title: "Fibrinolytic Therapy", points: ["\"Clot-busting\" medications", "Used when angioplasty unavailable", "Must be given within 12 hours", "Dissolves blood clots"] }
    ],
    keyFinding: {
      title: "Overview",
      text: "Life-saving interventions performed in the first hours.",
    },
  };

  const longTermManagementData = {
    icon: Heart,
    title: "Long-Term Management",
    colorScheme: 'green' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      { title: "Lifestyle Modifications", points: ["Diet: Mediterranean or DASH diet", "Exercise: Gradual increase to 150 min/week", "Smoking: Complete cessation essential", "Weight: Achieve and maintain healthy BMI", "Stress: Management techniques", "Sleep: 7-9 hours of quality sleep"] },
      { title: "Routine Medications", points: ["Antiplatelet Therapy: Aspirin + clopidogrel or similar to prevent clots", "Statins: Lower cholesterol and stabilize plaques", "ACE Inhibitors/ARBs: Lower blood pressure and protect heart", "Beta-blockers: Reduce heart rate and blood pressure"] },
      { title: "Cardiac Rehabilitation Programs", points: ["Exercise Training: Supervised, progressive exercise program", "Education: Learn about heart disease and risk factors", "Support: Emotional support and lifestyle counseling", "Key Benefit: Studies show cardiac rehab can reduce death risk by 20-30% and improve quality of life significantly."] },
      { title: "Coronary Artery Bypass Grafting (CABG)", points: ["When it's needed: Multiple severely blocked arteries", "When it's needed: Left main coronary artery blockage", "When it's needed: When angioplasty isn't suitable", "When it's needed: Poor heart function with multiple blockages", "The procedure: Blood vessels from other parts of body used as \"bypass\"", "The procedure: Creates new route around blocked arteries", "The procedure: Can be done while heart is beating", "The procedure: Recovery typically 6-8 weeks"] }
    ],
    keyFinding: {
      title: "Overview",
      text: "Comprehensive care to prevent future events and optimize heart health.",
    },
  };

  const followupCareData = {
    icon: ClipboardList,
    title: "Ongoing Follow-up Care",
    colorScheme: 'blue' as 'blue' | 'red' | 'green' | 'gray',
    sections: [
      { title: "Regular Check-ups", points: ["Every 3-6 months initially, then annually."] },
      { title: "Monitoring", points: ["Blood pressure, cholesterol, blood sugar."] },
      { title: "Heart Function Tests", points: ["Regular echocardiograms or stress tests as needed."] }
    ],
    // No keyFinding for this one
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Diagnostic Process and Treatment Options for ACS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding how doctors diagnose ACS and the comprehensive treatment approaches available
          </p>
        </div>

        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="space-y-8">
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-3xl">
                    <FileText className="mr-3 h-8 w-8 text-blue-600" />
                    How Doctors Diagnose ACS
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Medical professionals use several key tests to quickly and accurately diagnose Acute Coronary Syndrome. Click on each test to learn more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <InteractiveDiagnosticCard {...ecgData} initiallyOpen={true} />
                    <InteractiveDiagnosticCard {...bloodTestsData} />
                    <InteractiveDiagnosticCard {...angiographyData} />
                    <InteractiveDiagnosticCard {...additionalTestsData} />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="treatment" className="space-y-8">
            <section className="text-justify"> {/* Added text-justify here */}
              <Alert className="mb-8 border-red-200 bg-red-50">
                <Clock className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium text-justify"> {/* Kept text-justify for specificity */}
                  <strong>Time is Critical:</strong> ACS treatment is most effective when started quickly. "Time is muscle" - the faster treatment begins, the more heart muscle can be saved.
                </AlertDescription>
              </Alert>

              <InteractiveDiagnosticCard {...emergencyTreatmentData} initiallyOpen={true} />
              <InteractiveDiagnosticCard {...longTermManagementData} />
              <InteractiveDiagnosticCard {...followupCareData} />
            </section>
          </TabsContent>
        </Tabs>

        <section className="mt-16 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Have More Questions?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
              Ask our virtual assistant about ACS, diagnosis, and treatment.
            </p>
          </div>
          <Chatbot />
        </section>

        <section className="mt-12">
          <TimiRiskCalculator />
        </section>

        <section className="mt-12 py-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Drug Interaction Checker
          </h2>
          <DrugInteractionChecker />
        </section>
        
      </div>
    </div>
  );
};

export default DiagnosisTreatment;
