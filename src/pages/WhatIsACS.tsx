
import { AlertTriangle, Heart, Users, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WhatIsACS = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Is Acute Coronary Syndrome?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding the emergency conditions that affect your heart
          </p>
        </div>

        {/* Definition Section */}
        <section className="mb-12">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Heart className="mr-3 h-8 w-8 text-red-600" />
                Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 leading-relaxed text-justify">
                Acute Coronary Syndrome (ACS) is an umbrella term for emergency conditions where blood flow to the heart is suddenly and severely reduced. This happens when the arteries that supply blood to your heart muscle become blocked or significantly narrowed, preventing your heart from getting the oxygen and nutrients it needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Activity className="mr-3 h-8 w-8 text-blue-600" />
                Main Cause: Atherosclerosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 text-justify">
                  The main cause of ACS is <strong>atherosclerosis</strong> - a condition where fatty deposits called plaque build up inside your coronary arteries over time.
                </p>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3">How ACS Develops:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Plaque gradually builds up in coronary arteries</li>
                    <li>The plaque can become unstable and rupture</li>
                    <li>A blood clot forms at the rupture site</li>
                    <li>The clot blocks or severely narrows the artery</li>
                    <li>Heart muscle is deprived of oxygen-rich blood</li>
                  </ol>
                </div>
                
                <img 
                  src="/acs dev.png" 
                  alt="ACS development illustration" 
                  className="mx-auto w-full max-w-md rounded-lg shadow-lg"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Symptoms Section */}
        <section id="symptoms" className="mb-12">
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium text-justify">
              <strong>Emergency Symptoms:</strong> If you experience any of these symptoms, call emergency services immediately. Do not wait or drive yourself to the hospital.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Common Symptoms to Watch For</CardTitle>
              <CardDescription className="text-justify">
                ACS symptoms can vary, but these are the most common warning signs:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Chest Pain or Discomfort</h4>
                      <p className="text-gray-600 text-justify">Pressure, squeezing, or heaviness that may spread to your left arm, neck, jaw, or back</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Shortness of Breath</h4>
                      <p className="text-gray-600 text-justify">Difficulty breathing, especially with minimal exertion</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Cold Sweat</h4>
                      <p className="text-gray-600 text-justify">Sudden, profuse sweating without obvious cause</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Nausea or Vomiting</h4>
                      <p className="text-gray-600 text-justify">Feeling sick to your stomach, especially women</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Dizziness or Fainting</h4>
                      <p className="text-gray-600 text-justify">Feeling lightheaded or losing consciousness</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Unusual Fatigue</h4>
                      <p className="text-gray-600 text-justify">Extreme tiredness, especially in women</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Risk Factors Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-3 h-8 w-8 text-orange-600" />
                Risk Factors for ACS
              </CardTitle>
              <CardDescription className="text-justify">
                Understanding what increases your risk can help with prevention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-red-600">Modifiable Risk Factors</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Smoking or tobacco use</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>High blood pressure (hypertension)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>High cholesterol levels</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Diabetes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Obesity</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Lack of physical activity</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Unhealthy diet</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-blue-600">Non-Modifiable Risk Factors</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Age (men over 45, women over 55)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Gender (men at higher risk at younger age)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Family history of heart disease</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Ethnicity (some groups at higher risk)</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 text-justify">
                      <strong>Good News:</strong> Even if you have non-modifiable risk factors, addressing the modifiable ones can significantly reduce your overall risk.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default WhatIsACS;
